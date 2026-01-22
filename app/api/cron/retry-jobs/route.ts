import { NextRequest, NextResponse } from "next/server";
import { getRetryableJobs, getStuckJobs, resetStuckJob, resetFailedJobForRetry, getJobById } from "@/lib/jobs";
import { sendAlert } from "@/lib/alerting";
import { logger, generateRequestId } from "@/lib/logger";

export const maxDuration = 60;


const PROCESSING_TIMEOUT_MINUTES = 10;

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    logger.info("Retry cron job started", { requestId });

    const stuckJobs = await getStuckJobs(PROCESSING_TIMEOUT_MINUTES, 50);
    const stuckRecovered = await Promise.allSettled(
      stuckJobs.map(async (job) => {
        await resetStuckJob(job.id);
        return job.id;
      })
    );


    const failedJobs = await getRetryableJobs(20);
    const failedReset = await Promise.allSettled(
      failedJobs.map(async (job) => {
        if (job.retry_count >= job.max_retries - 1) {
          sendAlert({
            severity: "critical",
            type: "job_retry_exhausted",
            message: `Job on final retry attempt (${job.retry_count + 1}/${job.max_retries}) - will be permanently failed if this retry fails`,
            context: {
              jobId: job.id,
              retryCount: job.retry_count,
              maxRetries: job.max_retries,
            },
          }).catch(() => { });
        }
        await resetFailedJobForRetry(job.id);
        return job.id;
      })
    );


    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const allJobsToProcess = [
      ...stuckJobs.map(j => j.id),
      ...failedJobs.map(j => j.id)
    ];

    const processResults = await Promise.allSettled(
      allJobsToProcess.map(async (jobId) => {
        const response = await fetch(`${baseUrl}/api/jobs/process`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        });
        return { jobId, success: response.ok };
      })
    );

    const succeeded = processResults.filter((r) =>
      r.status === "fulfilled" && r.value.success
    ).length;

    const result = {
      stuckJobsFound: stuckJobs.length,
      stuckJobsRecovered: stuckRecovered.filter(r => r.status === "fulfilled").length,
      failedJobsFound: failedJobs.length,
      failedJobsReset: failedReset.filter(r => r.status === "fulfilled").length,
      totalProcessed: allJobsToProcess.length,
      succeeded,
      failed: allJobsToProcess.length - succeeded,
    };

    logger.info("Retry cron job completed", { requestId, ...result });

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Retry cron error", error, { requestId });
    return NextResponse.json(
      { error: "Retry failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
