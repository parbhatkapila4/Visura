import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbConnection } from "@/lib/db";
import { extractTextFromDocumentUrl } from "@/lib/document-text-extractor";
import { savePdfStore, getPdfStoreBySummaryId } from "@/lib/chatbot";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pdfSummaryId } = await request.json();

    if (!pdfSummaryId) {
      return NextResponse.json({ error: "PDF Summary ID is required" }, { status: 400 });
    }

    const existingStore = await getPdfStoreBySummaryId(pdfSummaryId, userId);
    if (existingStore) {
      return NextResponse.json({
        message: "Chatbot already initialized for this document",
        pdfStoreId: existingStore.id,
      });
    }

    const sql = await getDbConnection();
    const [summary] = await sql`
      SELECT * FROM pdf_summaries 
      WHERE id = ${pdfSummaryId} AND user_id = ${userId}
    `;

    if (!summary) {
      return NextResponse.json({ error: "Document summary not found" }, { status: 404 });
    }

    console.log("Extracting full text for chatbot initialization...");
    console.log("File URL:", summary.original_file_url);
    console.log("File Name:", summary.file_name);
    
    const fullTextContent = await extractTextFromDocumentUrl(
      summary.original_file_url,
      summary.file_name || undefined
    );

    if (!fullTextContent || fullTextContent.trim().length === 0) {
      return NextResponse.json({ 
        error: "Could not extract text from document. The document may be empty, corrupted, or in an unsupported format." 
      }, { status: 400 });
    }

    const pdfStore = await savePdfStore({
      pdfSummaryId,
      userId,
      fullTextContent,
    });

    return NextResponse.json({
      success: true,
      pdfStoreId: pdfStore.id,
      message: "Chatbot initialized successfully",
    });
  } catch (error) {
    console.error("Error initializing chatbot:", error);
    return NextResponse.json({ error: "Failed to initialize chatbot" }, { status: 500 });
  }
}
