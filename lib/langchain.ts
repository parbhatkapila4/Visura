import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export async function fetchAndExtractPdfText(fileUrl: string, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Fetching PDF from URL (attempt ${attempt}/${maxRetries}):`, fileUrl);
      
      // Use AbortController for better timeout control with longer timeout
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, 120000); // 2 minutes timeout (increased from 60s)
      
      const response = await fetch(fileUrl, {
        signal: abortController.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/pdf,application/octet-stream,*/*',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'cross-site',
          'Upgrade-Insecure-Requests': '1',
        },
      });
      
      clearTimeout(timeoutId); // Clear timeout if fetch succeeds
    
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log("PDF blob size:", blob.size);

      const arrayBuffer = await blob.arrayBuffer();
      console.log("Array buffer size:", arrayBuffer.byteLength);

      const loader = new PDFLoader(new Blob([arrayBuffer]));

      const docs = await loader.load();
      console.log("Extracted pages:", docs.length);

      return docs.map((doc) => doc.pageContent).join("\n");
      
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error);
      
      // Enhanced error reporting
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('Request was aborted due to timeout (60s)');
        } else if (error.message.includes('ECONNRESET')) {
          console.error('Connection was reset by server');
        } else if (error.message.includes('ENOTFOUND')) {
          console.error('DNS resolution failed - domain not found');
        } else if (error.message.includes('ECONNREFUSED')) {
          console.error('Connection refused - server not responding');
        } else if (error.message.includes('ETIMEDOUT')) {
          console.error('Connection timed out');
        }
      }
      
      if (attempt < maxRetries) {
        // Enhanced exponential backoff with jitter
        const baseWaitTime = Math.pow(2, attempt) * 1000;
        const jitter = Math.random() * 1000; // Add up to 1 second of jitter
        const waitTime = baseWaitTime + jitter;
        console.log(`Waiting ${Math.round(waitTime)}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  console.error("All retry attempts failed. Last error:", lastError);
  throw lastError;
}

// Alternative PDF processing function that works with Buffer/ArrayBuffer directly
export async function extractPdfTextFromBuffer(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    console.log("Processing PDF from buffer, size:", arrayBuffer.byteLength);
    
    // Create a Blob from the ArrayBuffer
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    
    // Use PDFLoader with the blob
    const loader = new PDFLoader(blob);
    const docs = await loader.load();
    
    console.log("Successfully extracted pages:", docs.length);
    
    const text = docs.map((doc) => doc.pageContent).join("\n");
    console.log("Extracted text length:", text.length);
    
    return text;
  } catch (error) {
    console.error("Error processing PDF from buffer:", error);
    throw error;
  }
}
