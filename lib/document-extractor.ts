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

async function extractTextFromPDFWithOCR(file: File, pdf: any, pageNum: number): Promise<string> {
  console.log(`🖼️ Running OCR on page ${pageNum}...`);

  try {
    const Tesseract = (await import("tesseract.js")).default;
    const page = await pdf.getPage(pageNum);

    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not get canvas context");
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    const imageData = canvas.toDataURL("image/png");

    const {
      data: { text },
    } = await Tesseract.recognize(imageData, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    return text.trim();
  } catch (ocrError) {
    console.error(`OCR error on page ${pageNum}:`, ocrError);
    return "";
  }
}

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

  const MAX_PAGES_TO_PROCESS = 50;
  const BATCH_SIZE = 10;
  const BATCH_DELAY_MS = 10;

  const pagesToProcess = Math.min(totalPages, MAX_PAGES_TO_PROCESS);
  const willTruncate = totalPages > MAX_PAGES_TO_PROCESS;

  let fullText = "";
  let pagesWithText = 0;
  let pagesNeedingOCR: number[] = [];

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
        } else {
          pagesNeedingOCR.push(pageNum);
        }
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
        pagesNeedingOCR.push(pageNum);
      }
    }

    if (batchEnd < pagesToProcess) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  if (pagesNeedingOCR.length > 0 && fullText.trim().length === 0) {
    console.log(`📄 No text found in PDF. Running OCR on ${pagesNeedingOCR.length} page(s)...`);

    try {
      const ocrPagesToProcess = Math.min(pagesNeedingOCR.length, 10);

      for (let i = 0; i < ocrPagesToProcess; i++) {
        const pageNum = pagesNeedingOCR[i];
        try {
          const ocrText = await extractTextFromPDFWithOCR(file, pdf, pageNum);
          if (ocrText.length > 0) {
            fullText += ocrText + " ";
            pagesWithText++;
            console.log(`✅ OCR extracted ${ocrText.length} characters from page ${pageNum}`);
          }
        } catch (ocrError) {
          console.error(`Failed OCR on page ${pageNum}:`, ocrError);
        }
      }

      if (ocrPagesToProcess < pagesNeedingOCR.length) {
        console.log(
          `⚠️ Processed first ${ocrPagesToProcess} pages with OCR. Remaining pages skipped for performance.`
        );
      }
    } catch (ocrInitError) {
      console.error("OCR initialization failed:", ocrInitError);
      throw new Error("No text found in PDF - OCR also failed to extract text");
    }
  }

  if (willTruncate) {
    fullText += `\n\n[Note: This PDF has ${totalPages} pages. Only the first ${MAX_PAGES_TO_PROCESS} pages were processed to ensure system stability.]`;
  }

  if (fullText.trim().length === 0) {
    throw new Error("No text found in PDF - OCR also failed to extract text");
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
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".ppt") && !fileName.endsWith(".pptx")) {
    throw new Error(
      "Old PowerPoint format (.ppt) is not supported. " +
        "Please convert your file to the newer .pptx format (PowerPoint 2007 or later) and try again. " +
        "The .pptx format is a ZIP archive that can be processed, while .ppt is a binary format that requires specialized libraries."
    );
  }

  const JSZip = (await import("jszip")).default;
  const arrayBuffer = await file.arrayBuffer();

  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    let fullText = "";

    const slideFiles = Object.keys(zip.files).filter((name) =>
      name.match(/ppt\/slides\/slide\d+\.xml/)
    );

    if (slideFiles.length === 0) {
      throw new Error(
        "No slides found in PowerPoint file. The file may be corrupted or in an unsupported format."
      );
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
  } catch (error: any) {
    if (
      error.message?.includes("Can't find end of central directory") ||
      error.message?.includes("zip file")
    ) {
      throw new Error(
        "This PowerPoint file cannot be processed. " +
          "It may be in the old .ppt format (not supported) or corrupted. " +
          "Please ensure you're using a .pptx file (PowerPoint 2007 or later format)."
      );
    }
    throw error;
  }
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
      fileName.endsWith(".pptx")
    ) {
      return await extractTextFromPowerPoint(file);
    } else if (detectedType === "application/vnd.ms-powerpoint" || fileName.endsWith(".ppt")) {
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
