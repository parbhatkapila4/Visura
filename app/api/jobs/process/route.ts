import { NextRequest, NextResponse } from "next/server";
import { claimJob, markJobCompleted, markJobFailed, updateJobHeartbeat } from "@/lib/jobs";
import { generateSummaryFromText } from "@/lib/openai";
import { getDbConnection } from "@/lib/db";
import { savePdfStore } from "@/lib/chatbot";
import { sendAlert } from "@/lib/alerting";
import { logger, generateRequestId } from "@/lib/logger";
import { requireInternalAuth } from "@/lib/internal-api-auth";

export const maxDuration = 60;


const HEARTBEAT_INTERVAL_MS = 10000;

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  let heartbeatInterval: NodeJS.Timeout | null = null;

  try {

    const isAuthorized = await requireInternalAuth(request);
    if (!isAuthorized) {
      logger.warn("Unauthorized internal API access attempt", { requestId });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json({ error: "jobId required" }, { status: 400 });
    }

    logger.info("Job processing started", { requestId, jobId });

    const job = await claimJob(jobId);

    if (!job) {
      logger.warn("Job already claimed or not found", { requestId, jobId });
      return NextResponse.json({
        success: false,
        message: "Job already claimed or not found"
      }, { status: 409 });
    }


    heartbeatInterval = setInterval(async () => {
      try {
        await updateJobHeartbeat(jobId);
      } catch (err) {
        logger.error("Heartbeat update failed", err, { requestId, jobId });
      }
    }, HEARTBEAT_INTERVAL_MS);

    try {

      const summary = await generateSummaryFromText(job.extracted_text);


      const sql = await getDbConnection();
      const [savedSummary] = await sql`
        INSERT INTO pdf_summaries (
          user_id, original_file_url, summary_text, title, file_name, status, job_id
        ) VALUES (
          ${job.user_id}, ${job.file_url}, ${summary}, ${job.title}, 
          ${job.file_name}, 'completed', ${jobId}
        )
        RETURNING id
      `;


      try {
        await savePdfStore({
          pdfSummaryId: savedSummary.id,
          userId: job.user_id,
          fullTextContent: job.extracted_text,
        });
      } catch (chatbotError) {
        logger.warn("Chatbot store failed (non-fatal)", {
          requestId,
          jobId,
          userId: job.user_id,
          error: chatbotError instanceof Error ? chatbotError.message : String(chatbotError),
        });

      }

      await markJobCompleted(jobId, savedSummary.id);

      logger.info("Job processing completed", { requestId, jobId, userId: job.user_id, summaryId: savedSummary.id });

      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }

      return NextResponse.json({
        success: true,
        summaryId: savedSummary.id
      });

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      await markJobFailed(jobId, err);

      logger.error("Job processing failed", err, { requestId, jobId, userId: job.user_id });

      sendAlert({
        severity: "critical",
        type: "job_processing_failed",
        message: `Job processing failed: ${err.message}`,
        context: {
          jobId,
          userId: job.user_id,
          errorMessage: err.message,
        },
      }).catch(() => { });

      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }

      throw err;
    }

  } catch (error) {
    logger.error("Job processing error", error, { requestId });
    return NextResponse.json(
      { error: "Processing failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
