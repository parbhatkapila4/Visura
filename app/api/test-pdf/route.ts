import { NextRequest, NextResponse } from "next/server";
import { fetchAndExtractPdfText } from "@/lib/langchain";

export async function POST(request: NextRequest) {
  try {
    const { fileUrl } = await request.json();
    
    if (!fileUrl) {
      return NextResponse.json({
        success: false,
        message: "File URL is required"
      }, { status: 400 });
    }

    console.log("Testing PDF extraction for:", fileUrl);
    
    const extractedText = await fetchAndExtractPdfText(fileUrl);
    
    return NextResponse.json({
      success: true,
      textLength: extractedText.length,
      preview: extractedText.substring(0, 500) + (extractedText.length > 500 ? "..." : ""),
      message: "PDF extraction successful"
    });
  } catch (error) {
    console.error("PDF test failed:", error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    }, { status: 500 });
  }
}
