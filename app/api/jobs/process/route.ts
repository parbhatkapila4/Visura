import { NextRequest, NextResponse } from "next/server";
import { claimJob, markJobCompleted, markJobFailed, updateJobHeartbeat } from "@/lib/jobs";
import { generateSummaryFromText } from "@/lib/openai";
import { getDbConnection } from "@/lib/db";
import { savePdfStore } from "@/lib/chatbot";
import { sendAlert } from "@/lib/alerting";

export const maxDuration = 60;


const HEARTBEAT_INTERVAL_MS = 10000;

export async function POST(request: NextRequest) {
  let heartbeatInterval: NodeJS.Timeout | null = null;

  try {
    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json({ error: "jobId required" }, { status: 400 });
    }

    const job = await claimJob(jobId);

    if (!job) {

      return NextResponse.json({
        success: false,
        message: "Job already claimed or not found"
      }, { status: 409 });
    }


    heartbeatInterval = setInterval(async () => {
      try {
        await updateJobHeartbeat(jobId);
      } catch (err) {
        console.error("Heartbeat update failed:", err);
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
        console.error("Chatbot store failed (non-fatal):", chatbotError);

      }


      await markJobCompleted(jobId, savedSummary.id);


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
    console.error("Job processing error:", error);
    return NextResponse.json(
      { error: "Processing failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
