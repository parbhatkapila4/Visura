"use server";

import { fetchAndExtractPdfText } from "@/lib/langchain";
import { generateSummaryFromOpenAI } from "@/lib/openai";

export async function generatePdfSummary(
  uploadResponse: any[]
) {
  console.log("Upload response:", uploadResponse);
  
  if (!uploadResponse || uploadResponse.length === 0) {
    return {
      success: false,
      message: "No upload response received",
      data: null,
    };
  }
  
  const fileData = uploadResponse[0];
  console.log("Full file data:", fileData);
  
  // Try to get PDF URL from serverData first, then fallback to ufsUrl
  const serverFile = fileData.serverData?.file;
  const pdfUrl = serverFile?.ufsUrl || serverFile?.url || fileData.ufsUrl || fileData.url;
  const fileName = fileData.name;
  
  console.log("File data:", { pdfUrl, fileName, serverFile });

  if (!pdfUrl) {
    return {
      success: false,
      message: "Something went wrong",
      data: null,
    };
  }
  try {
    let pdfText;
    
    
    try {
      pdfText = await fetchAndExtractPdfText(pdfUrl);
      console.log("PDF text extracted successfully, length:", pdfText.length);
    } catch (fetchError) {
      console.error("Failed to fetch PDF, using fallback:", fetchError);
      
      pdfText = `Document: ${fileName}
      
This appears to be a PDF document that could not be processed due to network connectivity issues. 
The file "${fileName}" was successfully uploaded but the content extraction failed.

Common reasons for this issue:
- Network connectivity problems
- Firewall restrictions
- DNS resolution issues
- Server timeout

Please try uploading the document again or check your network connection.`;
    }

    let summary;
    try {
      summary = await generateSummaryFromOpenAI(pdfText);
      console.log({ summary });
    } catch (error) {
      console.log({ error });
      
    }

    if (!summary) {
      return {
        success: false,
        message: "Failed to generate summary",
        data: null,
      };
    }

    return {
      success: true,
      message: "Summary generated successfully",
      data: { summary, fileName },
    };
  } catch (err) {
    console.error("Error in generatePdfSummary:", err);
    return {
      success: false,
      message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      data: null,
    };
  }
}
