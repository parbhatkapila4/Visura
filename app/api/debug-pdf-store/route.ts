import { NextRequest, NextResponse } from "next/server";
import { getPdfStoreBySummaryId } from "@/lib/chatbot";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pdfSummaryId = searchParams.get("pdfSummaryId");
    const userId = searchParams.get("userId");

    if (!pdfSummaryId || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing pdfSummaryId or userId parameter",
        },
        { status: 400 }
      );
    }

    const pdfStore = await getPdfStoreBySummaryId(pdfSummaryId, userId);

    return NextResponse.json({
      success: true,
      pdfStore,
      hasStore: !!pdfStore,
      message: pdfStore ? "PDF store found" : "No PDF store found for this document",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
