"use server";

import { generateSummaryFromText } from "@/lib/openai";

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
    const summary = await generateSummaryFromText(pdfText);
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
  console.log("⚠️ WARNING: Using fallback summary for:", fileName);
  console.log("⚠️ This means text extraction failed!");
  console.log("Error reason:", errorMessage);

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

  const fallbackSummary = `# ${fileName}

## Document Upload Status

**📄 File Information:**
- Filename: ${fileName}
- Storage: Supabase Storage (pdf bucket)
- Access: Secure URL available
- Status: ⚠️ Text extraction failed

## Issue Encountered

The PDF file was uploaded successfully, but we couldn't extract readable text content. This typically happens with:

- 🖼️ **Scanned documents** - PDFs created from scanned images
- 🔒 **Password-protected files** - Encrypted PDFs
- 📸 **Image-based PDFs** - Screenshots or photos saved as PDF
${errorMessage ? `\n**Error:** ${errorMessage}` : ''}

## Recommendations

1. **If this is a scanned document:**
   - OCR (Optical Character Recognition) support is in development
   - Consider re-scanning with text recognition enabled
   
2. **If this is a normal PDF:**
   - Try re-uploading the file
   - Ensure the PDF is not corrupted
   - Check if it's password-protected

3. **Alternative:**
   - Upload a different version of the document
   - Use a text-based PDF instead of scanned images

## Next Steps

The file is safely stored and accessible. However, AI-powered features like summarization and chat will be limited without text content. Please try uploading a text-based PDF for full functionality.`;

  try {
    console.log("Returning direct fallback summary (not using AI)");
    return {
      success: true,
      message: "Document uploaded but text extraction failed. Using fallback summary.",
      data: {
        summary: fallbackSummary,
        fileName,
        pdfUrl: fileUrl,
        fallbackUsed: true,
        processingMethod: "fallback-no-text",
      },
    };
  } catch (err) {
    console.error("Error creating fallback summary:", err);
    return {
      success: false,
      message: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      data: null,
    };
  }
}
