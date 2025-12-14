import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export async function fetchAndExtractPdfText(fileUrl: string, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Loading PDF from URL (attempt ${attempt}/${maxRetries}):`, fileUrl);

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, 120000);

      const response = await fetch(fileUrl, {
        signal: abortController.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/pdf,application/octet-stream,*/*",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      console.log("PDF file size:", blob.size);

      const arrayBuffer = await blob.arrayBuffer();
      console.log("File buffer size:", arrayBuffer.byteLength);

      const loader = new PDFLoader(new Blob([arrayBuffer]));

      const docs = await loader.load();
      console.log("Processed pages:", docs.length);

      if (docs.length === 0) {
        throw new Error("No pages could be processed from PDF");
      }

      const extractedText = docs.map((doc) => doc.pageContent).join("\n");
      console.log("Extracted text length:", extractedText.length);

      if (extractedText.trim().length === 0) {
        throw new Error("No text content could be extracted from PDF");
      }

      return extractedText;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error);

      if (error instanceof Error) {
        console.error(`Attempt ${attempt} error details:`, {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }

      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  console.error("All retry attempts failed. Last error:", lastError);
  throw lastError;
}

export async function extractPdfTextFromBuffer(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    console.log("Processing PDF from buffer, size:", arrayBuffer.byteLength);

    const blob = new Blob([arrayBuffer], { type: "application/pdf" });

    const loader = new PDFLoader(blob);
    const docs = await loader.load();

    console.log("Successfully processed pages:", docs.length);

    const text = docs.map((doc) => doc.pageContent).join("\n");
    console.log("Text content length:", text.length);

    return text;
  } catch (error) {
    console.error("Error processing PDF from buffer:", error);
    throw error;
  }
}
