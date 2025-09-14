import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export async function fetchAndExtractPdfText(fileUrl: string) {
  try {
    console.log("Fetching PDF from URL:", fileUrl);
    
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 30000);
    });
    
    
    const fetchPromise = fetch(fileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/pdf,application/octet-stream,*/*',
      },
    });
    
    const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
    
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
    console.error("Error in fetchAndExtractPdfText:", error);
    throw error;
  }
}
