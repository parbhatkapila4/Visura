"use server";

import { getDbConnection } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

interface PdfSummaryType {
  userId?: string;
  fileUrl: string;
  summary: string;
  title: string;
  fileName: string;
}

async function savePdfSummary({
  userId,
  fileUrl,
  summary,
  title,
  fileName,
}: {
  userId: string;
  fileUrl: string;
  summary: string;
  title: string;
  fileName: string;
}) {
  try {
    const sql = await getDbConnection();
    const result =
      await sql`INSERT INTO pdf_summaries(user_id, original_file_url, summary_text, title, file_name
    ) VALUES(
      ${userId},
      ${fileUrl},
      ${summary},
      ${title},
      ${fileName}
    ) RETURNING id`;

    console.log("PDF summary saved successfully with ID:", result[0]?.id);
    return result[0];
  } catch (error) {
    console.error("Error in saving Pdf Summary:", error);
    throw error;
  }
}

export async function storePdfSummaryAction({
  fileUrl,
  summary,
  title,
  fileName,
}: PdfSummaryType) {
  let savedSummary: any;
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: "User not found",
      };
    }
    savedSummary = await savePdfSummary({
      userId,
      fileUrl,
      summary,
      title,
      fileName,
    });

    if (!savedSummary) {
      return {
        success: false,
        message: "Error saving Pdf's summary, please try again",
      };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Error saving Pdf's summary",
    };
  }

  revalidatePath(`/summaries/${savedSummary.id}`)

  return {
    success: true,
    message: "Pdf's summary saved successfully",
    id: savedSummary.id,
  };
}
