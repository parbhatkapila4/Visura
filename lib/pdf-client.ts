"use client";

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    
    if (typeof window === 'undefined') {
      throw new Error('PDF processing only available on client-side');
    }

    console.log('Starting client-side PDF text extraction...')
    
    
    const pdfjsLib = await import('pdfjs-dist');
    
    
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array })
    const pdf = await loadingTask.promise
    
    console.log(`PDF loaded with ${pdf.numPages} pages`)
    
    let fullText = ''
    
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      
      fullText += `Page ${pageNum}:\n${pageText}\n\n`
    }
    
    console.log(`Extracted ${fullText.length} characters from PDF`)
    return fullText.trim()
    
  } catch (error) {
    console.error('PDF text extraction failed:', error)
    
    
    const fallbackText = `PDF Document: ${file.name}

File Information:
- Size: ${Math.round(file.size / 1024)} KB
- Type: ${file.type}
- Last Modified: ${new Date(file.lastModified).toLocaleDateString()}

Note: Automatic text extraction failed, but the document has been uploaded successfully.
This may be due to the PDF being image-based, encrypted, or having complex formatting.`

    return fallbackText
  }
}