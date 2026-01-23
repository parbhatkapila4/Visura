"use client";

import { createVersionedDocumentJob } from "@/actions/versioned-upload-actions";
import UploadFormInput from "@/components/upload/upload-form-input";
import { uploadToSupabase } from "@/lib/supabase";
import {
  extractTextFromDocument,
  isFileTypeSupported,
  getFileTypeLabel,
} from "@/lib/document-extractor";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  file: z
    .instanceof(File, { message: "Invalid file" })
    .refine((file) => file.size <= 32 * 1024 * 1024, "File size must be less than 32MB")
    .refine(
      (file) => isFileTypeSupported(file),
      "Unsupported file type. Supported: PDF, Word, Text, Markdown, Excel, PowerPoint"
    ),
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

  const pollForSummaryCompletion = async (versionId: string, maxAttempts = 120) => {
    let attempts = 0;
    const pollInterval = 2000;

    console.log("🔍 Starting to poll for summary completion", { versionId });

    const poll = async () => {
      try {
        attempts++;
        console.log(`Polling attempt ${attempts}/${maxAttempts}`, { versionId });

        const response = await fetch(`/api/versions/${versionId}/status`);
        if (!response.ok) {
          console.error("Status check failed", { status: response.status, versionId });
          throw new Error(`Failed to check status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Status response", {
          versionId,
          isComplete: data.isComplete,
          pdfSummaryId: data.pdfSummaryId,
          completedChunks: data.completedChunks,
          totalChunks: data.totalChunks,
          incompleteChunks: data.incompleteChunks,
        });

        if (data.isComplete && data.pdfSummaryId) {
          setIsLoading(false);
          toast.dismiss();
          console.log("Summary ready!", { versionId, pdfSummaryId: data.pdfSummaryId });
          toast.success("Summary ready!", {
            description: "Redirecting to your summary...",
          });

          setTimeout(() => {
            router.push(`/summaries/${data.pdfSummaryId}`);
          }, 500);
          return;
        }

        const progress = data.totalChunks > 0
          ? Math.round((data.completedChunks / data.totalChunks) * 100)
          : 0;

        toast.info(`Processing... ${progress}%`, {
          description: `Completed ${data.completedChunks} of ${data.totalChunks} chunks`,
          id: "processing-status",
          duration: Infinity,
        });

        if (attempts >= maxAttempts) {
          setIsLoading(false);
          toast.dismiss("processing-status");
          console.warn("Polling timeout", { versionId, attempts });
          toast.error("Processing is taking longer than expected", {
            description: "Your summary will be available on the dashboard when ready.",
          });
          router.push("/dashboard");
          return;
        }

        setTimeout(poll, pollInterval);
      } catch (error) {
        console.error("Polling error", error, { versionId, attempts });
        setIsLoading(false);
        toast.dismiss("processing-status");
        toast.error("Error checking status", {
          description: "Check the dashboard for your summary.",
        });
        router.push("/dashboard");
      }
    };

    poll();
  };

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.length === 0 || supabaseAnonKey.length === 0) {
      toast.error("Configuration Error", {
        description: "Missing or invalid Supabase configuration. Please check your environment variables.",
      });
      return;
    }

    if (!supabaseUrl.startsWith("http://") && !supabaseUrl.startsWith("https://")) {
      toast.error("Configuration Error", {
        description: "Invalid Supabase URL format. Must be a valid HTTP/HTTPS URL.",
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
      }
    }

    if (!file || file.size === 0) {
      toast.error("Please select a file", {
        description: "No file found in form. Please try selecting the file again.",
      });
      return;
    }

    if (!isFileTypeSupported(file)) {
      toast.error("Unsupported file type", {
        description:
          "Supported formats: PDF, Word (DOCX/DOC), Text (TXT), Markdown (MD), Excel (XLSX/XLS), PowerPoint (PPTX/PPT)",
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
    let extractionErrorMsg = "";

    try {
      console.log(`Step 1: Extracting text from ${fileTypeLabel}...`);
      extractedText = await extractTextFromDocument(file);
      console.log("✅ Text extraction completed, length:", extractedText.length);
      if (extractedText.length > 0) {
        console.log("First 300 characters:", extractedText.substring(0, 300));
      }
    } catch (extractError: any) {
      console.error("❌ Extraction error:", extractError);
      hadExtractionError = true;
      extractionErrorMsg = extractError.message || "Unknown extraction error";

      if (
        extractionErrorMsg.includes("password-protected") ||
        extractionErrorMsg.includes("encrypted")
      ) {
        toast.warning("Password-Protected Document", {
          description: "Text extraction limited. Proceeding with file upload and basic summary.",
        });
        extractedText = "";
      } else if (extractionErrorMsg.includes("corrupted")) {
        toast.warning("File may be corrupted", {
          description: "Proceeding with upload. Some features may be limited.",
        });
        extractedText = "";
      } else if (
        extractionErrorMsg.includes("Scanned document") ||
        extractionErrorMsg.includes("No text found") ||
        extractionErrorMsg.includes("OCR also failed")
      ) {
        console.log("🖼️ Scanned/image-based document - OCR will be attempted automatically");
        toast.info("Scanned document detected", {
          description: "Running OCR to extract text from images...",
        });
        extractedText = "";
      } else {
        console.log("⚠️ Extraction error - continuing with fallback:", extractionErrorMsg);
        extractedText = "";
      }
    }

    let versionResult: any = null;
    try {
      console.log("Step 2: Uploading to Supabase Storage...");
      const supabaseResult = await uploadToSupabase(file, user.id);

      if (!supabaseResult.success || !supabaseResult.data) {
        throw new Error(supabaseResult.error || "Upload failed");
      }

      console.log("✅ Upload successful:", supabaseResult.data.fileName);

      if (!extractedText || extractedText.trim().length < 50) {
        toast.error("Text extraction failed", {
          description: "Unable to extract sufficient text from document. Please try a different file.",
        });
        return;
      }

      console.log("Step 3: Creating versioned document job...");
      console.log("📊 Extracted text length:", extractedText.length);

      toast.info("Processing document...", {
        description: "Creating document version and enqueuing AI processing",
      });

      try {
        versionResult = await createVersionedDocumentJob(
          extractedText,
          supabaseResult.data.fileName,
          supabaseResult.data.publicUrl
        );
        console.log("Version result:", versionResult);
      } catch (error) {
        console.error("ERROR in createVersionedDocumentJob:", error);
        throw error;
      }

      if (!versionResult || !versionResult.success) {
        console.error("Version creation failed:", versionResult);
        if (versionResult?.data?.costLimitExceeded) {
          toast.error("Cost limit exceeded", {
            description: versionResult.message || "You have exceeded your processing limits. Please try again tomorrow.",
          });
          setIsLoading(false);
          return;
        } else {
          const errorMsg = versionResult?.message || "Failed to create document version";
          console.error("Version creation error:", errorMsg);
          toast.error("Failed to create document", {
            description: errorMsg,
          });
          setIsLoading(false);
          return;
        }
      }

      console.log("Version created successfully:", {
        versionId: versionResult.data?.versionId,
        documentId: versionResult.data?.documentId,
        chunksTotal: versionResult.data?.chunksTotal,
        chunksToProcess: versionResult.data?.chunksToProcess,
      });

      if (versionResult.data?.unchanged) {
        toast.success("Document already processed!", {
          description: "Using existing version",
        });
        if (versionResult.data.pdfSummaryId) {
          formRef.current?.reset();
          router.push(`/summaries/${versionResult.data.pdfSummaryId}`);
        } else {
          formRef.current?.reset();
          router.push("/dashboard");
        }
        return;
      }

      toast.success("Document uploaded successfully!", {
        description: "Generating summary... Please wait.",
      });

      setResult({
        success: true,
        message: "Document version created",
        data: versionResult.data,
      });

      formRef.current?.reset();

      if (!versionResult.data?.versionId) {
        console.error("NO VERSION ID RETURNED!", versionResult);
        toast.error("Failed to create version", {
          description: "Version ID was not returned. Please try again.",
        });
        setIsLoading(false);
        router.push("/dashboard");
        return;
      }

      console.log("Starting polling for version:", versionResult.data.versionId);
      setIsLoading(true);
      toast.info("Processing your document...", {
        description: "AI is generating your summary. This may take a moment.",
        duration: 10000,
      });
      pollForSummaryCompletion(versionResult.data.versionId);
    } catch (error) {
      console.error("UPLOAD/PROCESSING ERROR:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
      console.error("Version result at error:", versionResult);

      setIsLoading(false);
      const rawMessage = error instanceof Error ? error.message : String(error);
      const friendlyMessage = /\b402\b|Payment Required/i.test(rawMessage)
        ? "AI summary generation failed due to billing/credits. Please check your LLM provider billing status or API key quota."
        : rawMessage;

      toast.error("Processing failed", {
        description: friendlyMessage,
        action: {
          label: "Close",
          onClick: () => { },
        },
        duration: 10000,
      });

      router.push("/dashboard");
    } finally {
      if (!versionResult?.data?.versionId) {
        setIsLoading(false);
      }
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
