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
  console.log("📄 Generating fallback summary for:", fileName);
  console.log("Reason:", errorMessage || "No text content available");

  const fileExtension = fileName.toLowerCase();
  let documentType = "document";
  let possibleContent = "";
  let documentCategory = "";

  if (fileExtension.includes("invoice")) {
    documentType = "invoice";
    documentCategory = "Financial Document";
    possibleContent = `This document appears to be an invoice based on the filename "${fileName}".

**Typical Invoice Content:**
• Invoice number and date
• Billing and shipping addresses  
• Itemized list of products/services
• Quantities, unit prices, and totals
• Tax calculations
• Payment terms and due date
• Company contact information

**Note:** This is a scanned or image-based document. The file has been successfully uploaded and stored securely.`;
  } else if (fileExtension.includes("receipt")) {
    documentType = "receipt";
    documentCategory = "Financial Document";
    possibleContent = `This document appears to be a receipt based on the filename "${fileName}".

**Typical Receipt Content:**
• Transaction date and time
• Merchant information
• Items purchased with prices
• Payment method
• Total amount paid
• Tax information

**Note:** This is a scanned or image-based document. The file has been successfully uploaded and stored securely.`;
  } else if (fileExtension.includes("statement") || fileExtension.includes("stmt")) {
    documentType = "statement";
    documentCategory = "Financial Document";
    possibleContent = `This document appears to be a financial statement based on the filename "${fileName}".

**Typical Statement Content:**
• Account information
• Statement period
• Transaction history
• Beginning and ending balances
• Fees and charges
• Summary information

**Note:** This is a scanned or image-based document. The file has been successfully uploaded and stored securely.`;
  } else if (fileExtension.includes("notes") || fileExtension.includes("class")) {
    documentType = "notes";
    documentCategory = "Educational Document";
    possibleContent = `This document appears to be class notes or educational content based on the filename "${fileName}".

**Typical Educational Content:**
• Course topics and concepts
• Key learning objectives
• Examples and explanations
• Study materials and references
• Important definitions
• Practice problems or exercises

**Note:** This is a scanned or image-based document. The file has been successfully uploaded and stored securely.`;
  } else if (
    fileExtension.includes("presentation") ||
    fileExtension.includes("ppt") ||
    fileExtension.includes("pptx")
  ) {
    documentType = "presentation";
    documentCategory = "Presentation Document";
    possibleContent = `This document appears to be a presentation (PowerPoint) based on the filename "${fileName}".

**Typical Presentation Content:**
• Slides with titles and bullet points
• Visual content and graphics
• Key talking points
• Summary or conclusion slides

**Note:** This is a scanned or image-based presentation. The file has been successfully uploaded and stored securely.`;
  } else if (
    fileExtension.includes("spreadsheet") ||
    fileExtension.includes("xls") ||
    fileExtension.includes("xlsx")
  ) {
    documentType = "spreadsheet";
    documentCategory = "Data Document";
    possibleContent = `This document appears to be a spreadsheet (Excel) based on the filename "${fileName}".

**Typical Spreadsheet Content:**
• Data tables and calculations
• Charts and graphs
• Formulas and functions
• Organized rows and columns

**Note:** This is a scanned or image-based spreadsheet. The file has been successfully uploaded and stored securely.`;
  } else {
    documentCategory = "Document";
    possibleContent = `This document has been successfully uploaded and stored securely.

**Document Details:**
- Filename: ${fileName}
- File Type: ${fileExtension.split(".").pop()?.toUpperCase() || "Unknown"}
- Storage: Secure cloud storage
- Status: Uploaded successfully

**Note:** This appears to be a scanned or image-based document. While text extraction was not possible, the file is safely stored and accessible.`;
  }

  const fallbackSummary = `# ${fileName}

## Document Information

**📄 File Details:**
- **Filename:** ${fileName}
- **Document Type:** ${documentCategory}
- **Storage:** Secure cloud storage (Supabase)
- **Status:** ✅ Successfully uploaded and stored
- **Access:** File is accessible via secure URL

${possibleContent}

## Processing Status

**Text Extraction:** ⚠️ Limited
- This document appears to be a scanned or image-based file
- Text extraction was not possible due to the document format
- The file has been successfully uploaded and is securely stored

${errorMessage ? `\n**Technical Note:** ${errorMessage}` : ""}

## Available Features

✅ **File Storage** - Document is safely stored
✅ **Secure Access** - File accessible via secure URL
⚠️ **AI Chat** - Limited (requires text content)
⚠️ **Full Summary** - Basic summary from file metadata

## Next Steps

Your document has been successfully processed and saved. While full AI-powered features require text content, the file is accessible and stored securely.`;

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
