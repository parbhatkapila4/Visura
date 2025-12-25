"use server";

import { fetchAndExtractPdfText } from "./langchain";
export async function extractTextFromDocumentUrl(
  fileUrl: string,
  fileName?: string
): Promise<string> {
  try {
    console.log("Extracting text from document URL:", fileUrl);
    console.log("File name:", fileName);

    const urlLower = fileUrl.toLowerCase();
    const fileNameLower = fileName?.toLowerCase() || "";

    if (urlLower.includes(".pdf") || fileNameLower.endsWith(".pdf")) {
      return await fetchAndExtractPdfText(fileUrl);
    }

    const response = await fetch(fileUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    if (fileNameLower.endsWith(".docx") || fileNameLower.endsWith(".doc")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value.trim();
    } else if (fileNameLower.endsWith(".txt") || fileNameLower.endsWith(".md")) {
      extractedText = buffer.toString("utf-8").trim();
    } else if (fileNameLower.endsWith(".xlsx") || fileNameLower.endsWith(".xls")) {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(buffer, { type: "buffer" });
      let fullText = "";
      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        sheetData.forEach((row: any) => {
          if (Array.isArray(row)) {
            fullText += row.join(" ") + "\n";
          }
        });
      });
      extractedText = fullText.trim();
    } else if (fileNameLower.endsWith(".pptx")) {
      const JSZip = (await import("jszip")).default;
      let zip;
      try {
        zip = await JSZip.loadAsync(buffer);
      } catch (zipError: any) {
        if (
          zipError.message?.includes("Can't find end of central directory") ||
          zipError.message?.includes("zip file")
        ) {
          throw new Error(
            "This PowerPoint file cannot be processed. " +
              "It may be in the old .ppt format (not supported) or corrupted. " +
              "Please ensure you're using a .pptx file (PowerPoint 2007 or later format)."
          );
        }
        throw zipError;
      }

      let fullText = "";

      const slideFiles = Object.keys(zip.files).filter(
        (name) => name.startsWith("ppt/slides/slide") && name.endsWith(".xml")
      );

      if (slideFiles.length === 0) {
        throw new Error(
          "No slides found in PowerPoint file. The file may be corrupted or in an unsupported format."
        );
      }

      for (const slideFile of slideFiles) {
        const slideContent = await zip.files[slideFile].async("string");
        const textMatches = slideContent.match(/<a:t[^>]*>([^<]*)<\/a:t>/g);
        if (textMatches) {
          textMatches.forEach((match) => {
            const text = match.replace(/<[^>]*>/g, "");
            if (text.trim()) {
              fullText += text.trim() + "\n";
            }
          });
        }
      }
      extractedText = fullText.trim();
    } else if (fileNameLower.endsWith(".ppt")) {
      throw new Error(
        "Old PowerPoint format (.ppt) is not supported. " +
          "Please convert your file to the newer .pptx format (PowerPoint 2007 or later) and try again. " +
          "The .pptx format is a ZIP archive that can be processed, while .ppt is a binary format that requires specialized libraries."
      );
    } else {
      throw new Error(`Unsupported file type: ${fileName || "unknown"}`);
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error("No text content could be extracted from document");
    }

    console.log("Successfully extracted text, length:", extractedText.length);
    return extractedText;
  } catch (error) {
    console.error("Error extracting text from document URL:", error);
    throw error;
  }
}
