"use client";

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export type SupportedFileType =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/msword"
  | "text/plain"
  | "text/markdown"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/vnd.ms-excel"
  | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  | "application/vnd.ms-powerpoint";

export const SUPPORTED_FILE_TYPES: SupportedFileType[] = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "text/markdown",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
];

export const SUPPORTED_FILE_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".doc",
  ".txt",
  ".md",
  ".xlsx",
  ".xls",
  ".pptx",
  ".ppt",
];

async function extractTextFromPDF(file: File): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("PDF processing only available on client-side");
  }

  if (!window.pdfjsLib) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
  }

  const pdfjsLib = window.pdfjsLib;
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;

  const MAX_PAGES_TO_PROCESS = 500;
  const BATCH_SIZE = 50;
  const BATCH_DELAY_MS = 10;

  const pagesToProcess = Math.min(totalPages, MAX_PAGES_TO_PROCESS);
  const willTruncate = totalPages > MAX_PAGES_TO_PROCESS;

  let fullText = "";
  let pagesWithText = 0;

  for (let batchStart = 1; batchStart <= pagesToProcess; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, pagesToProcess);

    for (let pageNum = batchStart; pageNum <= batchEnd; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .filter((item: any) => item && typeof item === "object" && "str" in item)
          .map((item: any) => {
            const str = item.str;
            return typeof str === "string" ? str : String(str);
          })
          .join(" ")
          .trim();

        if (pageText.length > 0) {
          pagesWithText++;
          fullText += pageText + " ";
        }
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
      }
    }

    if (batchEnd < pagesToProcess) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  if (willTruncate) {
    fullText += `\n\n[Note: This PDF has ${totalPages} pages. Only the first ${MAX_PAGES_TO_PROCESS} pages were processed to ensure system stability.]`;
  }

  if (fullText.trim().length === 0) {
    throw new Error("No text found in PDF - this may be a scanned/image-based document");
  }

  return fullText.trim();
}

async function extractTextFromDOCX(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();

  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value;

  if (!text || text.trim().length === 0) {
    throw new Error("No text found in DOCX document");
  }

  return text.trim();
}

async function extractTextFromPlainText(file: File): Promise<string> {
  const text = await file.text();
  if (!text || text.trim().length === 0) {
    throw new Error("File appears to be empty");
  }
  return text.trim();
}

async function extractTextFromExcel(file: File): Promise<string> {
  const XLSX = await import("xlsx");
  const arrayBuffer = await file.arrayBuffer();

  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  let fullText = "";

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

    fullText += `\n\n--- Sheet: ${sheetName} ---\n\n`;

    sheetData.forEach((row: any) => {
      if (Array.isArray(row)) {
        const rowText = row
          .filter((cell) => cell !== null && cell !== undefined && cell !== "")
          .map((cell) => String(cell))
          .join(" | ");
        if (rowText.trim()) {
          fullText += rowText + "\n";
        }
      }
    });
  });

  if (!fullText || fullText.trim().length === 0) {
    throw new Error("No data found in Excel file");
  }

  return fullText.trim();
}

async function extractTextFromPowerPoint(file: File): Promise<string> {
  const JSZip = (await import("jszip")).default;
  const arrayBuffer = await file.arrayBuffer();

  const zip = await JSZip.loadAsync(arrayBuffer);
  let fullText = "";

  const slideFiles = Object.keys(zip.files).filter((name) =>
    name.match(/ppt\/slides\/slide\d+\.xml/)
  );

  if (slideFiles.length === 0) {
    throw new Error("No slides found in PowerPoint file");
  }

  for (const slideFile of slideFiles) {
    const slideContent = await zip.files[slideFile].async("string");

    const textMatches = slideContent.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
    const slideText = textMatches
      .map((match) => {
        const textMatch = match.match(/<a:t[^>]*>([^<]*)<\/a:t>/);
        return textMatch ? textMatch[1] : "";
      })
      .filter((text) => text.trim().length > 0)
      .join(" ");

    if (slideText.trim()) {
      fullText += slideText + "\n\n";
    }
  }

  if (!fullText || fullText.trim().length === 0) {
    throw new Error("No text found in PowerPoint file");
  }

  return fullText.trim();
}

export async function extractTextFromDocument(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  let detectedType: string = fileType;

  if (!fileType || fileType === "application/octet-stream") {
    if (fileName.endsWith(".pdf")) detectedType = "application/pdf";
    else if (fileName.endsWith(".docx"))
      detectedType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    else if (fileName.endsWith(".doc")) detectedType = "application/msword";
    else if (fileName.endsWith(".txt")) detectedType = "text/plain";
    else if (fileName.endsWith(".md")) detectedType = "text/markdown";
    else if (fileName.endsWith(".xlsx"))
      detectedType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    else if (fileName.endsWith(".xls")) detectedType = "application/vnd.ms-excel";
    else if (fileName.endsWith(".pptx"))
      detectedType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    else if (fileName.endsWith(".ppt")) detectedType = "application/vnd.ms-powerpoint";
  }

  try {
    if (detectedType === "application/pdf" || fileName.endsWith(".pdf")) {
      return await extractTextFromPDF(file);
    } else if (
      detectedType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      detectedType === "application/msword" ||
      fileName.endsWith(".docx") ||
      fileName.endsWith(".doc")
    ) {
      return await extractTextFromDOCX(file);
    } else if (
      detectedType === "text/plain" ||
      detectedType === "text/markdown" ||
      fileName.endsWith(".txt") ||
      fileName.endsWith(".md")
    ) {
      return await extractTextFromPlainText(file);
    } else if (
      detectedType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      detectedType === "application/vnd.ms-excel" ||
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls")
    ) {
      return await extractTextFromExcel(file);
    } else if (
      detectedType ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      detectedType === "application/vnd.ms-powerpoint" ||
      fileName.endsWith(".pptx") ||
      fileName.endsWith(".ppt")
    ) {
      return await extractTextFromPowerPoint(file);
    } else {
      throw new Error(`Unsupported file type: ${detectedType || "unknown"}`);
    }
  } catch (error: any) {
    console.error("Text extraction error:", error);
    throw new Error(error.message || `Failed to extract text from ${file.name}`);
  }
}

export function isFileTypeSupported(file: File): boolean {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (SUPPORTED_FILE_TYPES.includes(fileType as SupportedFileType)) {
    return true;
  }

  return SUPPORTED_FILE_EXTENSIONS.some((ext) => fileName.endsWith(ext));
}

export function getFileTypeLabel(file: File): string {
  const fileName = file.name.toLowerCase();
  const fileType = file.type;

  if (fileName.endsWith(".pdf") || fileType === "application/pdf") return "PDF";
  if (fileName.endsWith(".docx") || fileType.includes("wordprocessingml")) return "Word";
  if (fileName.endsWith(".doc") || fileType === "application/msword") return "Word";
  if (fileName.endsWith(".txt") || fileType === "text/plain") return "Text";
  if (fileName.endsWith(".md") || fileType === "text/markdown") return "Markdown";
  if (
    fileName.endsWith(".xlsx") ||
    fileName.endsWith(".xls") ||
    fileType.includes("spreadsheetml") ||
    fileType.includes("ms-excel")
  )
    return "Excel";
  if (
    fileName.endsWith(".pptx") ||
    fileName.endsWith(".ppt") ||
    fileType.includes("presentationml") ||
    fileType.includes("ms-powerpoint")
  )
    return "PowerPoint";

  return "Document";
}
