"use server";

import { getDbConnection } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { savePdfStore } from "@/lib/chatbot";
import { extractTextFromDocumentUrl } from "@/lib/document-text-extractor";

interface PdfSummaryType {
  userId?: string;
  fileUrl: string;
  summary: string;
  title: string;
  fileName: string;
  extractedText?: string;
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

/**
 * @deprecated This synchronous path is deprecated. The versioned pipeline (createVersionedDocumentJob) 
 * automatically creates pdf_summaries and pdf_stores on completion. This function is kept for backward 
 * compatibility only.
 */
export async function storePdfSummaryAction({ fileUrl, summary, title, fileName, extractedText }: PdfSummaryType) {
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

    try {
      console.log("Initializing document chat functionality...");
      console.log("Summary ID:", savedSummary.id);
      console.log("User ID:", userId);
      console.log("File URL:", fileUrl);
      console.log("File Name:", fileName);

      let fullTextContent: string;
      
      if (extractedText && extractedText.trim().length > 0) {
        console.log("Using pre-extracted text from client");
        fullTextContent = extractedText;
      } else {
        console.log("Extracting text from document URL...");
        fullTextContent = await extractTextFromDocumentUrl(fileUrl, fileName);
      }
      
      console.log("Extracted text length:", fullTextContent?.length || 0);

      if (fullTextContent && fullTextContent.trim().length > 0) {
        console.log("Saving document store for chatbot...");
        const pdfStoreResult = await savePdfStore({
          pdfSummaryId: savedSummary.id,
          userId,
          fullTextContent,
        });
        console.log("Document store saved successfully:", pdfStoreResult);
        console.log("Document chat functionality initialized successfully");
      } else {
        console.warn("No text content extracted, skipping document store creation");
      }
    } catch (chatbotError) {
      console.error("Error initializing document chat functionality:", chatbotError);
      console.error("Error details:", {
        message: chatbotError instanceof Error ? chatbotError.message : "Unknown error",
        stack: chatbotError instanceof Error ? chatbotError.stack : undefined,
      });
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error saving Pdf's summary",
    };
  }

  revalidatePath(`/summaries/${savedSummary.id}`);
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Pdf's summary saved successfully with document chat support",
    id: savedSummary.id,
  };
}
