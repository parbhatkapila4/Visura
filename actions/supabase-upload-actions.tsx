"use server";

import { generateSummaryFromOpenAI } from "@/lib/openai";

export async function generatePdfSummaryFromText(
  pdfText: string,
  fileName: string,
  fileUrl: string
) {
  console.log("Generating summary from extracted PDF text");
  console.log("Text length:", pdfText.length);

  if (!pdfText || pdfText.trim().length === 0) {
    return {
      success: false,
      message: "No text content found in PDF",
      data: null,
    };
  }

  try {
    const summary = await generateSummaryFromOpenAI(pdfText);
    console.log("Summary generated successfully");

    if (!summary) {
      return {
        success: false,
        message: "Failed to generate summary",
        data: null,
      };
    }

    return {
      success: true,
      message: "PDF processed successfully with real content from Supabase",
      data: {
        summary,
        fileName,
        pdfUrl: fileUrl,
        textLength: pdfText.length,
        processingMethod: "client-side-extraction",
      },
    };
  } catch (err) {
    console.error("Error in generatePdfSummaryFromText:", err);
    return {
      success: false,
      message: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      data: null,
    };
  }
}

export async function generateFallbackSummary(
  fileName: string,
  fileUrl: string,
  errorMessage?: string
) {
  console.log("Generating fallback summary for:", fileName);

  const fileExtension = fileName.toLowerCase();
  let documentType = "document";
  let possibleContent = "";

  if (fileExtension.includes("invoice")) {
    documentType = "invoice";
    possibleContent = `This appears to be an invoice document based on the filename "${fileName}".

Typical invoice elements that would be analyzed:
• Invoice number and date
• Billing and shipping addresses  
• Itemized list of products/services
• Quantities, unit prices, and totals
• Tax calculations
• Payment terms and due date
• Company contact information

`;
  } else if (fileExtension.includes("receipt")) {
    documentType = "receipt";
    possibleContent = `This appears to be a receipt document based on the filename "${fileName}".

Typical receipt elements that would be analyzed:
• Transaction date and time
• Merchant information
• Items purchased with prices
• Payment method
• Total amount paid
• Tax information

`;
  } else if (
    fileExtension.includes("statement") ||
    fileExtension.includes("stmt")
  ) {
    documentType = "statement";
    possibleContent = `This appears to be a financial statement based on the filename "${fileName}".

Typical statement elements that would be analyzed:
• Account information
• Statement period
• Transaction history
• Beginning and ending balances
• Fees and charges
• Summary information

`;
  } else if (
    fileExtension.includes("notes") ||
    fileExtension.includes("class")
  ) {
    documentType = "notes";
    possibleContent = `This appears to be class notes or educational content based on the filename "${fileName}".

Typical educational content that would be analyzed:
• Course topics and concepts
• Key learning objectives
• Examples and explanations
• Study materials and references
• Important definitions
• Practice problems or exercises

`;
  }

  const fallbackText = `Document Analysis: ${fileName}

${possibleContent}**File Status:**
The ${documentType} "${fileName}" was successfully uploaded to Supabase Storage${
    errorMessage
      ? `, but content extraction encountered an issue: ${errorMessage}`
      : ""
  }.

**Upload Details:**
• Storage: ✅ Supabase Storage (pdf bucket)
• File Access: ✅ Available via secure URL
• Processing: ⚠️ Using intelligent fallback analysis

**Next Steps:**
1. The file is safely stored and accessible
2. Manual review may provide additional insights
3. Re-upload may resolve extraction issues if needed

**Technical Note:**
This analysis is generated using intelligent fallback processing when direct PDF text extraction is not available.`;

  try {
    const summary = await generateSummaryFromOpenAI(fallbackText);
    console.log("Fallback summary generated successfully");

    return {
      success: true,
      message:
        "Document uploaded successfully. Used intelligent fallback analysis.",
      data: {
        summary,
        fileName,
        pdfUrl: fileUrl,
        fallbackUsed: true,
        processingMethod: "intelligent-fallback",
      },
    };
  } catch (err) {
    console.error("Error generating fallback summary:", err);
    return {
      success: false,
      message: `Fallback processing error: ${
        err instanceof Error ? err.message : "Unknown error"
      }`,
      data: null,
    };
  }
}
