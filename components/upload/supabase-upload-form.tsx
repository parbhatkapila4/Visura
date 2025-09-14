"use client";

import { generatePdfSummaryFromText, generateFallbackSummary } from "@/actions/supabase-upload-actions";
import UploadFormInput from "@/components/upload/upload-form-input";
import { uploadToSupabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  file: z
    .instanceof(File, { message: "Invalid file" })
    .refine(
      (file) => file.size <= 32 * 1024 * 1024,
      "File size must be less than 32MB"
    )
    .refine(
      (file) => file.type.startsWith("application/pdf"),
      "File must be a PDF"
    ),
});

interface UploadResult {
  success: boolean;
  message: string;
  data: any;
}

export default function SupabaseUploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { user } = useUser();

  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      
      if (!isClient || typeof window === 'undefined') {
        throw new Error('PDF processing only available on client-side');
      }

      console.log('Starting client-side PDF text extraction...')
      
      
      const pdfjsLib = await import('pdfjs-dist');
      
      
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      
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
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to upload files");
      return;
    }

    if (!isClient) {
      toast.error("Please wait for the page to load completely");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;
    
    if (!file || file.size === 0) {
      toast.error("Please select a PDF file");
      return;
    }
    
    
    const validation = schema.safeParse({ file });
    if (!validation.success) {
      toast.error("Invalid file", {
        description: validation.error.issues[0]?.message,
      });
      return;
    }

    setIsLoading(true);
    toast.info("Processing PDF...", {
      description: "Extracting text and uploading to Supabase"
    });

    try {
      
      console.log("Step 1: Extracting text from PDF...");
      const extractedText = await extractTextFromPDF(file);
      console.log("Text extraction completed, length:", extractedText.length);

      
      console.log("Step 2: Uploading to Supabase Storage...");
      const supabaseResult = await uploadToSupabase(file, user.id);
      
      if (!supabaseResult.success || !supabaseResult.data) {
        throw new Error(supabaseResult.error || "Upload failed");
      }

      console.log("Upload successful:", supabaseResult.data);
      toast.success("File uploaded successfully!", {
        description: "Generating AI summary..."
      });

      
      console.log("Step 3: Generating AI summary...");
      let summaryResult;
      
      if (extractedText && extractedText.length > 100) {
        
        summaryResult = await generatePdfSummaryFromText(
          extractedText,
          supabaseResult.data.fileName,
          supabaseResult.data.publicUrl
        );
      } else {
        
        summaryResult = await generateFallbackSummary(
          supabaseResult.data.fileName,
          supabaseResult.data.publicUrl,
          "Text extraction returned minimal content"
        );
      }

      if (summaryResult.success) {
        toast.success("PDF analysis complete!", {
          description: "Summary generated successfully"
        });
        setResult(summaryResult);
      } else {
        throw new Error(summaryResult.message);
      }

    } catch (error) {
      console.error("Upload/processing error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      toast.error("Processing failed", {
        description: errorMessage
      });

      
      try {
        const fallbackResult = await generateFallbackSummary(
          file.name,
          "",
          errorMessage
        );
        if (fallbackResult.success) {
          setResult(fallbackResult);
        }
      } catch (fallbackError) {
        console.error("Fallback generation failed:", fallbackError);
      }
    } finally {
      setIsLoading(false);
      if (formRef.current) {
        formRef.current.reset();
      }
    }
  };

  
  if (!isClient) {
    return (
      <div className="mx-auto w-full max-w-4xl p-8 text-center">
        <div className="animate-pulse">Loading PDF processor...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      
      <UploadFormInput 
        ref={formRef}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      
     
    </div>
  );
}