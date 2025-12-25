"use client";

import {
  generatePdfSummaryFromText,
  generateFallbackSummary,
} from "@/actions/supabase-upload-actions";
import { storePdfSummaryAction } from "@/actions/upload-actions";
import UploadFormInput from "@/components/upload/upload-form-input";
import { uploadToSupabase } from "@/lib/supabase";
import { formatFileNameAsTitle } from "@/utils/format-utils";
import { extractTextFromDocument, isFileTypeSupported, getFileTypeLabel } from "@/lib/document-extractor";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  file: z
    .instanceof(File, { message: "Invalid file" })
    .refine((file) => file.size <= 32 * 1024 * 1024, "File size must be less than 32MB")
    .refine((file) => isFileTypeSupported(file), "Unsupported file type. Supported: PDF, Word, Text, Markdown, Excel, PowerPoint"),
});

interface UploadResult {
  success: boolean;
  message: string;
  data: any;
}

interface SupabaseUploadFormProps {
  hasReachedLimit: boolean;
  uploadLimit: number;
}

export default function SupabaseUploadForm({
  hasReachedLimit,
  uploadLimit,
}: SupabaseUploadFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Form submit triggered", { user: !!user, isClient, isLoading });

    if (!user) {
      toast.error("Please sign in to upload files");
      return;
    }

    if (!isClient) {
      toast.error("Please wait for the page to load completely");
      return;
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      toast.error("Configuration Error", {
        description: "Missing Supabase configuration. Please check your environment variables.",
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    let file = formData.get("file") as File;
    
    
    if (!file || file.size === 0) {
      const formElement = e.currentTarget;
      const fileInput = formElement.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        file = fileInput.files[0];
        console.log("File retrieved from input element directly");
      }
    }
    
    console.log("File from form:", file ? { name: file.name, size: file.size, type: file.type } : "null");

    if (!file || file.size === 0) {
      toast.error("Please select a file", {
        description: "No file found in form. Please try selecting the file again.",
      });
      return;
    }

    if (!isFileTypeSupported(file)) {
      toast.error("Unsupported file type", {
        description: "Supported formats: PDF, Word (DOCX/DOC), Text (TXT), Markdown (MD), Excel (XLSX/XLS), PowerPoint (PPTX/PPT)",
      });
      return;
    }

    const validation = schema.safeParse({ file });
    if (!validation.success) {
      console.error("Validation error:", validation.error.issues);
      toast.error("Invalid file", {
        description: validation.error.issues[0]?.message || "File validation failed",
      });
      return;
    }
    
    console.log("✅ File validation passed");

    const fileTypeLabel = getFileTypeLabel(file);
    setIsLoading(true);
    toast.info(`Processing ${fileTypeLabel}...`, {
      description: "Extracting text and uploading to Supabase",
    });

    let extractedText = "";
    let hadExtractionError = false;

    try {
      console.log(`Step 1: Extracting text from ${fileTypeLabel}...`);
      extractedText = await extractTextFromDocument(file);
      console.log("✅ Text extraction completed, length:", extractedText.length);
      console.log("First 300 characters:", extractedText.substring(0, 300));
    } catch (extractError: any) {
      console.error("❌ Extraction error:", extractError);

      const errorMsg = extractError.message || "Unknown extraction error";

      if (errorMsg.includes("password-protected") || errorMsg.includes("encrypted")) {
        toast.error("Password-Protected Document", {
          description: "This document is encrypted. Please unlock it and try again.",
        });
        setIsLoading(false);
        return;
      }

      if (errorMsg.includes("corrupted")) {
        toast.error("Corrupted File", {
          description: "This file appears to be damaged. Please try a different file.",
        });
        setIsLoading(false);
        return;
      }

      if (errorMsg.includes("Scanned document") || errorMsg.includes("No text found")) {
        console.log("🖼️ Scanned document detected - will use fallback");
        hadExtractionError = true;
        toast.error("Scanned Document - Cannot Process", {
          description: "This document has no text layer. OCR support coming soon. Upload failed.",
        });
        setIsLoading(false);
        return;
      }

      console.error("⚠️ Unexpected extraction error:", errorMsg);
      toast.error("Text Extraction Failed", {
        description: errorMsg,
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log("Step 2: Uploading to Supabase Storage...");
      const supabaseResult = await uploadToSupabase(file, user.id);

      if (!supabaseResult.success || !supabaseResult.data) {
        throw new Error(supabaseResult.error || "Upload failed");
      }

      console.log("✅ Upload successful:", supabaseResult.data.fileName);
      toast.success("File uploaded successfully!", {
        description: "Generating AI summary...",
      });

      console.log("Step 3: Generating AI summary...");
      console.log("📊 Extracted text length:", extractedText.length);
      console.log("📊 First 500 chars:", extractedText.substring(0, 500));

      if (!extractedText || extractedText.trim().length < 100) {
        console.error("❌ CRITICAL: No text extracted! Length:", extractedText.length);
        toast.error("Cannot Generate Summary", {
          description: `No text content found in ${fileTypeLabel}. Please try a different file.`,
        });
        setIsLoading(false);
        return;
      }

      console.log("✅ Using extracted text for summary generation");

      const summaryResult = await generatePdfSummaryFromText(
        extractedText,
        supabaseResult.data.fileName,
        supabaseResult.data.publicUrl
      );

      if (summaryResult.success) {
        toast.success(`${fileTypeLabel} analysis complete!`, {
          description: "Summary generated successfully",
        });
        setResult(summaryResult);

        if (summaryResult.data?.summary) {
          console.log("Saving summary to database...");
          console.log("Summary data:", {
            summaryLength: summaryResult.data.summary.length,
            fileUrl: supabaseResult.data.publicUrl,
            fileName: file.name,
            title: formatFileNameAsTitle(summaryResult.data.fileName || file.name),
          });

          const storeResult = await storePdfSummaryAction({
            summary: summaryResult.data.summary,
            fileUrl: supabaseResult.data.publicUrl,
            title: formatFileNameAsTitle(summaryResult.data.fileName || file.name),
            fileName: file.name,
            extractedText: extractedText, 
          });

          console.log("Database save result:", storeResult);

          if (storeResult.success) {
            toast.success("Summary saved to database!", {
              description: "Your PDF summary has been stored successfully",
            });

            formRef.current?.reset();
            router.push(`/summaries/${storeResult.id}`);
          } else {
            console.error("Failed to save summary to database:", storeResult.message);
            toast.error("Summary generated but not saved", {
              description: `Database error: ${storeResult.message}`,
            });
          }
        }
      } else {
        throw new Error(summaryResult.message);
      }
    } catch (error) {
      console.error("Upload/processing error:", error);
      const rawMessage = error instanceof Error ? error.message : "Unknown error";
      const friendlyMessage = /\b402\b|Payment Required/i.test(rawMessage)
        ? "AI summary generation failed due to billing/credits. Please check your LLM provider billing status or API key quota."
        : rawMessage;

      toast.error("Processing failed", {
        description: friendlyMessage,
        action: {
          label: "Close",
          onClick: () => {},
        },
        duration: 8000,
      });

      try {
        router.push("/dashboard");
      } catch {}

      try {
        const fallbackResult = await generateFallbackSummary(file.name, "", friendlyMessage);
        if (fallbackResult.success) {
          setResult(fallbackResult);

          if (fallbackResult.data?.summary) {
            console.log("Saving fallback summary to database...");
            const storeResult = await storePdfSummaryAction({
              summary: fallbackResult.data.summary,
              fileUrl: "",
              title: formatFileNameAsTitle(fallbackResult.data.fileName || file.name),
              fileName: file.name,
            });

            if (storeResult.success) {
              toast.success("Fallback summary saved to database!", {
                description: "Your document summary has been stored successfully",
              });

              formRef.current?.reset();
              router.push(`/summaries/${storeResult.id}`);
            } else {
              console.error("Failed to save fallback summary to database:", storeResult.message);
            }
          }
        }
      } catch (fallbackError) {
        console.error("Fallback generation failed:", fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return (
      <div className="mx-auto w-full max-w-4xl p-8 text-center">
        <div className="animate-pulse">Loading document processor...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-0">
      <UploadFormInput
        ref={formRef}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        hasReachedLimit={hasReachedLimit}
        uploadLimit={uploadLimit}
      />
    </div>
  );
}
