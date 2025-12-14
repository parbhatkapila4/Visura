"use client";
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    if (typeof window === "undefined") {
      throw new Error("PDF processing only available on client-side");
    }

    if (!file || !(file instanceof File)) {
      throw new Error("Invalid file provided");
    }

    if (!file.type.includes("pdf")) {
      throw new Error("File is not a PDF");
    }

    console.log("Starting PDF text extraction...");

    if (!window.pdfjsLib) {
      console.log("Loading PDF.js from CDN...");
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

      console.log("PDF.js loaded successfully");
    }

    const pdfjsLib = window.pdfjsLib;
    const arrayBuffer = await file.arrayBuffer();

    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
    });
    const pdf = await loadingTask.promise;

    console.log(`PDF loaded with ${pdf.numPages} pages`);

    if (!pdf || !pdf.numPages || pdf.numPages < 1) {
      throw new Error("Invalid PDF structure");
    }

    let fullText = "";
    let pagesWithText = 0;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);

        if (!page) {
          console.warn(`Page ${pageNum} could not be loaded`);
          continue;
        }

        const textContent = await page.getTextContent();

        if (!textContent || !textContent.items || !Array.isArray(textContent.items)) {
          console.warn(`Page ${pageNum} has invalid text content`);
          continue;
        }

        const pageText = textContent.items
          .filter((item: any) => {
            return item && typeof item === "object" && item.str !== undefined && item.str !== null;
          })
          .map((item: any) => {
            const str = item.str;
            return typeof str === "string" ? str : String(str);
          })
          .join(" ")
          .trim();

        if (pageText.length > 0) {
          pagesWithText++;
          fullText += pageText + " ";
          console.log(`Page ${pageNum}: ${pageText.length} chars extracted`);
        } else {
          console.log(`Page ${pageNum}: No text`);
        }
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
      }
    }

    console.log(
      `Extracted ${fullText.length} characters from ${pagesWithText}/${pdf.numPages} pages`
    );

    if (fullText.trim().length === 0) {
      throw new Error("No text found in PDF - this may be a scanned/image-based document");
    }

    if (pagesWithText < pdf.numPages) {
      console.warn(`⚠️ Partial extraction: ${pagesWithText}/${pdf.numPages} pages had text`);
    }

    return fullText.trim();
  } catch (error: any) {
    console.error("PDF text extraction failed:", error);

    let errorMessage = "Text extraction failed";

    if (error.message) {
      if (error.message.includes("password") || error.message.includes("encrypted")) {
        errorMessage = "PDF is password-protected";
      } else if (error.message.includes("No text found")) {
        errorMessage = "Scanned document detected - no text layer";
      } else if (error.message.includes("Invalid PDF")) {
        errorMessage = "PDF file appears to be corrupted";
      } else {
        errorMessage = error.message;
      }
    }

    throw new Error(`Extraction Error: ${errorMessage}`);
  }
}
