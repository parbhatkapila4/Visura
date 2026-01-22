"use server";

import { createSummaryJob } from "@/lib/jobs";
import { formatFileNameAsTitle } from "@/utils/format-utils";

export async function createSummaryJobAction(
  pdfText: string,
  fileName: string,
  fileUrl: string,
  userId: string
) {
  try {
    if (!pdfText || pdfText.trim().length < 50) {
      return {
        success: false,
        message: "No text content found in PDF",
        data: null,
      };
    }

    const title = formatFileNameAsTitle(fileName);
    const jobId = await createSummaryJob({
      userId,
      extractedText: pdfText,
      fileName,
      fileUrl,
      title,
    });


    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    fetch(`${baseUrl}/api/jobs/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    }).catch((err) => {
      console.error("Failed to trigger job processing:", err);

    });

    return {
      success: true,
      message: "Document queued for processing",
      data: {
        jobId,
        fileName,
        pdfUrl: fileUrl,
        processingMethod: "async-job",
      },
    };
  } catch (err) {
    console.error("Error creating job:", err);
    return {
      success: false,
      message: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      data: null,
    };
  }
}
