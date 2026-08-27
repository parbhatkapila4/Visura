"use client";

import { createVersionedDocumentJob } from "@/actions/versioned-upload-actions";
import UploadFormInput from "@/components/upload/upload-form-input";
import {
  ProcessingPipeline,
  createInitialPipelineSteps,
  type PipelineStep,
  type PipelineStepStatus,
} from "@/components/upload/processing-pipeline";
import { uploadToSupabase } from "@/lib/supabase";
import {
  extractTextFromDocument,
  isFileTypeSupported,
  getFileTypeLabel,
} from "@/lib/document-extractor";
import { useUser } from "@clerk/nextjs";
import { useCallback, useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { clientLogger } from "@/lib/client-logger";

const schema = z.object({
  file: z
    .instanceof(File, { message: "Invalid file" })
    .refine((file) => file.size <= 32 * 1024 * 1024, "File size must be less than 32MB")
    .refine(
      (file) => isFileTypeSupported(file),
      "Unsupported file type. Supported: PDF, Word, Text, Markdown, Excel, PowerPoint"
    ),
});

interface SupabaseUploadFormProps {
  hasReachedLimit: boolean;
  uploadLimit: number;
}

const STEP_UPLOAD = 0;
const STEP_EXTRACT = 1;
const STEP_CHUNK = 2;
const STEP_EMBED = 3;
const STEP_FINALIZE = 7;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function toUserFriendlyProcessingError(message?: string | null): string {
  const msg = (message || "").trim();
  const lower = msg.toLowerCase();

  if (!msg) return "Something went wrong while processing your document. Please try again.";

  if (lower.includes("exceeds per-version limit") || lower.includes("new chunks")) {
    return "This document is too large to process in one go. Please split it into smaller files and upload again.";
  }
  if (lower.includes("daily token limit") || lower.includes("processing limit")) {
    return "You've reached today's processing limit. Please try again later.";
  }
  if (
    lower.includes("estimated cost") ||
    lower.includes("cost limit") ||
    lower.includes("budget")
  ) {
    return "You've reached today's AI processing budget. Please try again later.";
  }
  if (/\b402\b|payment required|billing|credits|quota/i.test(msg)) {
    return "AI processing could not start because billing or API credits are unavailable.";
  }

  return msg;
}

async function ensureMinimumStepDuration(startedAt: number, minMs: number): Promise<void> {
  const elapsed = Date.now() - startedAt;
  if (elapsed < minMs) {
    await sleep(minMs - elapsed);
  }
}

type VersionStatusSnapshot = {
  completedChunks: number;
  totalChunks: number;
  incompleteChunks: number;
  isComplete: boolean;
  pdfSummaryId: string | null;
};

async function pollForSummary(
  versionId: string,
  options?: {
    maxAttempts?: number;
    pollIntervalMs?: number;
    onProgress?: (snapshot: VersionStatusSnapshot) => void;
  }
): Promise<
  | { ok: true; pdfSummaryId: string }
  | { ok: false; kind: "timeout" | "http" | "network"; message: string }
> {
  const maxAttempts = options?.maxAttempts ?? 120;
  const pollIntervalMs = options?.pollIntervalMs ?? 2000;
  const onProgress = options?.onProgress;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`/api/versions/${versionId}/status`);
      if (!response.ok) {
        return {
          ok: false,
          kind: "http",
          message: `Couldn't verify processing status (${response.status}). Try again.`,
        };
      }
      const data = (await response.json()) as {
        isComplete?: boolean;
        pdfSummaryId?: string | null;
        completedChunks?: number;
        totalChunks?: number;
        incompleteChunks?: number;
      };
      const snapshot: VersionStatusSnapshot = {
        completedChunks: Number(data.completedChunks ?? 0),
        totalChunks: Number(data.totalChunks ?? 0),
        incompleteChunks: Number(data.incompleteChunks ?? 0),
        isComplete: Boolean(data.isComplete),
        pdfSummaryId: data.pdfSummaryId != null ? String(data.pdfSummaryId) : null,
      };
      onProgress?.(snapshot);

      if (snapshot.isComplete && snapshot.pdfSummaryId) {
        return { ok: true, pdfSummaryId: snapshot.pdfSummaryId };
      }
    } catch (e) {
      clientLogger.error("Polling error", e, { versionId, attempt });
      return {
        ok: false,
        kind: "network",
        message: e instanceof Error ? e.message : "Network error while checking status. Try again.",
      };
    }
    await sleep(pollIntervalMs);
  }
  return {
    ok: false,
    kind: "timeout",
    message:
      "Processing is taking longer than expected. You can try again or check the dashboard later.",
  };
}

export default function SupabaseUploadForm({
  hasReachedLimit,
  uploadLimit,
}: SupabaseUploadFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showPipeline, setShowPipeline] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(() =>
    createInitialPipelineSteps()
  );
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [pipelineComplete, setPipelineComplete] = useState(false);
  const [pipelinePdfSummaryId, setPipelinePdfSummaryId] = useState<string | null>(null);
  const [pipelineStartedAtMs, setPipelineStartedAtMs] = useState<number | null>(null);
  const [pipelineInitialEstimateMs, setPipelineInitialEstimateMs] = useState<number | null>(null);
  const [pipelineChunkProgress, setPipelineChunkProgress] = useState<{
    completed: number;
    total: number;
  } | null>(null);

  const { user } = useUser();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const updateStep = useCallback((idx: number, status: PipelineStepStatus) => {
    setPipelineSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, status } : s)));
  }, []);

  const activateStep = useCallback(
    async (idx: number) => {
      updateStep(idx, "active");
      await waitForNextPaint();
      return Date.now();
    },
    [updateStep]
  );

  const completeStep = useCallback(
    async (idx: number, startedAt: number, minMs: number) => {
      await ensureMinimumStepDuration(startedAt, minMs);
      updateStep(idx, "completed");
      await waitForNextPaint();
    },
    [updateStep]
  );

  const simulateRemainingSteps = useCallback(
    async (startIdx: number, baseMs: number) => {
      for (let i = startIdx; i <= 6; i++) {
        const startedAt = await activateStep(i);
        await sleep(baseMs + Math.random() * Math.max(100, baseMs * 0.35));
        await completeStep(i, startedAt, baseMs);
      }
    },
    [activateStep, completeStep]
  );

  const handlePipelineRetry = useCallback(() => {
    setShowPipeline(false);
    setPipelineSteps(createInitialPipelineSteps());
    setPipelineError(null);
    setPipelineComplete(false);
    setPipelinePdfSummaryId(null);
    setIsLoading(false);
    setPipelineStartedAtMs(null);
    setPipelineInitialEstimateMs(null);
    setPipelineChunkProgress(null);
    formRef.current?.reset();
  }, []);

  const estimateMsFromFile = useCallback((file: File) => {
    const sizeMb = file.size / (1024 * 1024);
    const seconds = Math.min(
      50 * 60,
      Math.max(90, 45 + sizeMb * 14 + (sizeMb > 25 ? (sizeMb - 25) * 6 : 0))
    );
    return Math.round(seconds * 1000);
  }, []);

  const estimateMsFromWorkload = useCallback(
    (file: File, workload?: { chunksToProcess?: number | null; chunksTotal?: number | null }) => {
      const sizeMb = file.size / (1024 * 1024);
      const chunks = Math.max(
        0,
        Number(workload?.chunksToProcess ?? workload?.chunksTotal ?? 0) || 0
      );
      const baseSec = 75 + Math.min(220, sizeMb * 4);
      const chunkSec = chunks > 0 ? Math.min(42 * 60, chunks * 18) : 0;
      const seconds = Math.min(55 * 60, Math.max(90, baseSec + chunkSec));
      return Math.round(seconds * 1000);
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    clientLogger.info("Form submit triggered", { user: !!user, isClient, isLoading });

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

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      supabaseUrl.length === 0 ||
      supabaseAnonKey.length === 0
    ) {
      toast.error("Configuration Error", {
        description:
          "Missing or invalid Supabase configuration. Please check your environment variables.",
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
      if (fileInput?.files?.length) {
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
      clientLogger.error("Validation error", undefined, { issues: validation.error.issues });
      toast.error("Invalid file", {
        description: validation.error.issues[0]?.message || "File validation failed",
      });
      return;
    }

    clientLogger.info("File validation passed");

    const fileTypeLabel = getFileTypeLabel(file);
    toast.dismiss();
    setShowPipeline(true);
    setPipelineSteps(createInitialPipelineSteps());
    setPipelineError(null);
    setPipelineComplete(false);
    setPipelinePdfSummaryId(null);
    const startedAt = Date.now();
    setPipelineStartedAtMs(startedAt);
    setPipelineInitialEstimateMs(estimateMsFromFile(file));
    setPipelineChunkProgress(null);
    setIsLoading(true);

    let extractedText = "";
    let storageUploadComplete = false;

    try {
      const extractStartedAt = await activateStep(STEP_EXTRACT);
      clientLogger.info(`Step 1: Extracting text from ${fileTypeLabel}`);
      try {
        extractedText = await extractTextFromDocument(file);
        clientLogger.info("Text extraction completed", { length: extractedText.length });
      } catch (extractError: unknown) {
        clientLogger.error("Extraction error", extractError);
        const extractionErrorMsg =
          extractError instanceof Error ? extractError.message : String(extractError);

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
          clientLogger.info("Scanned/image-based document detected");
          toast.info("Scanned document detected", {
            description: "Running OCR to extract text from images...",
          });
          extractedText = "";
        } else {
          clientLogger.warn("Extraction error - continuing with fallback", {
            error: extractionErrorMsg,
          });
          extractedText = "";
        }
      }
      await completeStep(STEP_EXTRACT, extractStartedAt, 700);

      const uploadStartedAt = await activateStep(STEP_UPLOAD);
      clientLogger.info("Step 2: Uploading to Supabase Storage");
      const supabaseResult = await uploadToSupabase(file, user.id);

      if (!supabaseResult.success || !supabaseResult.data) {
        updateStep(STEP_UPLOAD, "error");
        setPipelineError(
          supabaseResult.error || "Upload failed. Check your connection and try again."
        );
        setIsLoading(false);
        return;
      }
      clientLogger.info("Upload successful", { fileName: supabaseResult.data.fileName });
      await completeStep(STEP_UPLOAD, uploadStartedAt, 700);
      storageUploadComplete = true;

      if (!extractedText || extractedText.trim().length < 50) {
        clientLogger.warn("Initial text extraction thin, trying URL extraction", {
          extractedTextLength: extractedText?.length ?? 0,
        });
        const retryExtractStartedAt = await activateStep(STEP_EXTRACT);
        try {
          const { extractTextFromDocumentUrl } = await import("@/lib/document-text-extractor");
          extractedText = await extractTextFromDocumentUrl(
            supabaseResult.data.publicUrl,
            supabaseResult.data.fileName
          );
          if (!extractedText || extractedText.trim().length < 50) {
            throw new Error("Text extraction from URL also failed");
          }
          clientLogger.info("Text extraction from URL succeeded", { length: extractedText.length });
        } catch (urlExtractError: unknown) {
          clientLogger.error("Text extraction from URL failed", urlExtractError);
          updateStep(STEP_EXTRACT, "error");
          setPipelineError(
            "Unable to extract text from this document. It may be scanned, corrupted, or password-protected. Try a different file."
          );
          setIsLoading(false);
          return;
        }
        await completeStep(STEP_EXTRACT, retryExtractStartedAt, 650);
      }

      clientLogger.info("Step 3: Creating versioned document job", {
        extractedTextLength: extractedText.length,
      });
      const chunkStartedAt = await activateStep(STEP_CHUNK);

      let versionResult: Awaited<ReturnType<typeof createVersionedDocumentJob>>;
      try {
        versionResult = await createVersionedDocumentJob(
          extractedText,
          supabaseResult.data.fileName,
          supabaseResult.data.publicUrl,
          "ENGLISH"
        );
        clientLogger.info("Version result received", { success: versionResult?.success });
      } catch (jobError: unknown) {
        clientLogger.error("createVersionedDocumentJob threw", jobError);
        updateStep(STEP_CHUNK, "error");
        const msg =
          jobError instanceof Error ? jobError.message : "Failed to start document processing.";
        setPipelineError(toUserFriendlyProcessingError(msg));
        setIsLoading(false);
        return;
      }

      if (!versionResult?.success) {
        clientLogger.error("Version creation failed", undefined, { versionResult });
        updateStep(STEP_CHUNK, "error");
        const data = versionResult?.data as { costLimitExceeded?: boolean } | undefined;
        if (data?.costLimitExceeded) {
          setPipelineError(toUserFriendlyProcessingError(versionResult.message));
        } else {
          setPipelineError(
            toUserFriendlyProcessingError(
              versionResult?.message || "Failed to create document version. Try again."
            )
          );
        }
        setIsLoading(false);
        return;
      }

      clientLogger.info("Version created successfully", {
        versionId: versionResult.data?.versionId,
        documentId: versionResult.data?.documentId,
        unchanged: versionResult.data?.unchanged,
      });
      await completeStep(STEP_CHUNK, chunkStartedAt, 850);

      const vWorkload = versionResult.data as {
        chunksTotal?: number | null;
        chunksToProcess?: number | null;
      };
      setPipelineInitialEstimateMs(estimateMsFromWorkload(file, vWorkload));

      const vData = versionResult.data as {
        versionId?: string;
        pdfSummaryId?: string;
        unchanged?: boolean;
      };

      if (vData.unchanged && vData.pdfSummaryId) {
        await simulateRemainingSteps(STEP_EMBED, 250);
        const finalizeStartedAt = await activateStep(STEP_FINALIZE);
        await completeStep(STEP_FINALIZE, finalizeStartedAt, 700);
        setPipelinePdfSummaryId(vData.pdfSummaryId != null ? String(vData.pdfSummaryId) : null);
        setPipelineComplete(true);
        setIsLoading(false);
        formRef.current?.reset();
        return;
      }

      if (vData.unchanged && vData.versionId) {
        await simulateRemainingSteps(STEP_EMBED, 180);
        const finalizeStartedAt = await activateStep(STEP_FINALIZE);
        clientLogger.info("Polling for unchanged version", { versionId: vData.versionId });
        const pollResult = await pollForSummary(vData.versionId, {
          onProgress: (s) => {
            if (s.totalChunks > 0) {
              setPipelineChunkProgress({
                completed: s.completedChunks,
                total: s.totalChunks,
              });
            }
          },
        });
        if (pollResult.ok) {
          await completeStep(STEP_FINALIZE, finalizeStartedAt, 700);
          setPipelinePdfSummaryId(String(pollResult.pdfSummaryId));
          setPipelineComplete(true);
          setPipelineChunkProgress(null);
        } else {
          updateStep(STEP_FINALIZE, "error");
          setPipelineError(pollResult.message);
          setPipelineChunkProgress(null);
        }
        setIsLoading(false);
        formRef.current?.reset();
        return;
      }

      if (vData.unchanged && !vData.versionId && !vData.pdfSummaryId) {
        updateStep(STEP_FINALIZE, "error");
        setPipelineError("Could not resume this document. Try uploading again.");
        setIsLoading(false);
        formRef.current?.reset();
        return;
      }

      await simulateRemainingSteps(STEP_EMBED, 750);

      const versionId = vData.versionId;
      if (!versionId) {
        updateStep(STEP_FINALIZE, "error");
        setPipelineError("No version ID returned. Please try again.");
        setIsLoading(false);
        return;
      }

      const finalizeStartedAt = await activateStep(STEP_FINALIZE);
      clientLogger.info("Polling for summary", { versionId });
      const pollResult = await pollForSummary(versionId, {
        onProgress: (s) => {
          if (s.totalChunks > 0) {
            setPipelineChunkProgress({
              completed: s.completedChunks,
              total: s.totalChunks,
            });
          }
        },
      });
      if (pollResult.ok) {
        await completeStep(STEP_FINALIZE, finalizeStartedAt, 700);
        setPipelinePdfSummaryId(String(pollResult.pdfSummaryId));
        setPipelineComplete(true);
        setPipelineChunkProgress(null);
      } else {
        updateStep(STEP_FINALIZE, "error");
        setPipelineError(pollResult.message);
        setPipelineChunkProgress(null);
      }

      formRef.current?.reset();
    } catch (error: unknown) {
      clientLogger.error("UPLOAD/PROCESSING ERROR", error);
      const rawMessage = error instanceof Error ? error.message : String(error);
      const friendly = toUserFriendlyProcessingError(rawMessage);

      if (storageUploadComplete) {
        updateStep(STEP_FINALIZE, "error");
      } else {
        updateStep(STEP_UPLOAD, "error");
      }
      setPipelineError(friendly);
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
    <div className="mx-auto w-full max-w-xl px-4 sm:px-0">
      {showPipeline ? (
        <ProcessingPipeline
          steps={pipelineSteps}
          errorMessage={pipelineError}
          onRetry={handlePipelineRetry}
          isComplete={pipelineComplete}
          summaryHref={
            pipelinePdfSummaryId ? `/summaries/${encodeURIComponent(pipelinePdfSummaryId)}` : null
          }
          startedAtMs={pipelineStartedAtMs}
          initialEstimateMs={pipelineInitialEstimateMs}
          chunkProgress={pipelineChunkProgress}
        />
      ) : (
        <UploadFormInput
          ref={formRef}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          hasReachedLimit={hasReachedLimit}
          uploadLimit={uploadLimit}
          hideInlineProcessing
        />
      )}
    </div>
  );
}
