"use client";

import Link from "next/link";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";

export type PipelineStepStatus = "pending" | "active" | "completed" | "error";

export type PipelineStep = {
  id: string;
  label: string;
  status: PipelineStepStatus;
};

export const PIPELINE_STEP_DEFINITIONS: Omit<PipelineStep, "status">[] = [
  { id: "upload", label: "Uploading" },
  { id: "extract", label: "Extracting text" },
  { id: "chunk", label: "Chunking document" },
  { id: "embed", label: "Generating embeddings" },
  { id: "sections", label: "Detecting sections" },
  { id: "insights", label: "Extracting insights" },
  { id: "graph", label: "Building knowledge graph" },
  { id: "finalize", label: "Finalizing" },
];

export function createInitialPipelineSteps(): PipelineStep[] {
  return PIPELINE_STEP_DEFINITIONS.map((d) => ({ ...d, status: "pending" as const }));
}

function clampEstimateMs(ms: number): number {
  return Math.max(45_000, Math.min(60 * 60_000, ms));
}

function formatRemaining(ms: number | null): string {
  if (ms == null) return "—";
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export type ProcessingPipelineProps = {
  steps: PipelineStep[];
  errorMessage?: string | null;
  onRetry?: () => void;
  isComplete?: boolean;
  summaryHref?: string | null;
  startedAtMs?: number | null;
  initialEstimateMs?: number | null;
  chunkProgress?: { completed: number; total: number } | null;
};

export function ProcessingPipeline({
  steps,
  errorMessage,
  onRetry,
  isComplete,
  summaryHref,
  startedAtMs,
  initialEstimateMs,
  chunkProgress,
}: ProcessingPipelineProps) {
  const hasError = steps.some((s) => s.status === "error") || Boolean(errorMessage);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [lockedEstimateMs, setLockedEstimateMs] = useState<number | null>(() => {
    if (!initialEstimateMs) return null;
    return clampEstimateMs(initialEstimateMs);
  });
  const runStartedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (isComplete || hasError) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [hasError, isComplete]);

  useEffect(() => {
    if (!startedAtMs) {
      setLockedEstimateMs(null);
      runStartedAtRef.current = null;
      return;
    }

    const isNewRun = runStartedAtRef.current !== startedAtMs;
    runStartedAtRef.current = startedAtMs;

    const base = initialEstimateMs ?? 120_000;
    const clamped = clampEstimateMs(base);

    if (isNewRun) {
      setLockedEstimateMs(clamped);
    } else {
      setLockedEstimateMs((prev) => Math.max(prev ?? 0, clamped));
    }
  }, [startedAtMs, initialEstimateMs]);

  const finalizeIndex = useMemo(() => steps.findIndex((s) => s.id === "finalize"), [steps]);

  const progress = useMemo(() => {
    const n = steps.length || 8;
    const finalizeActive = finalizeIndex >= 0 && steps[finalizeIndex]?.status === "active";
    const chunks = chunkProgress?.total
      ? Math.min(1, Math.max(0, chunkProgress.completed / chunkProgress.total))
      : null;

    if (finalizeActive && chunks != null) {
      const doneBeforeFinalize = Math.max(0, finalizeIndex);
      return (doneBeforeFinalize + chunks) / n;
    }

    const per: number[] = steps.map((s) => {
      if (s.status === "completed") return 1;
      if (s.status === "active") return 0.55;
      if (s.status === "error") return 0.55;
      return 0;
    });
    const sum = per.reduce((a, b) => a + b, 0);
    return steps.length ? sum / steps.length : 0;
  }, [chunkProgress, finalizeIndex, steps]);

  const showChunkDetail =
    Boolean(chunkProgress && chunkProgress.total > 0) &&
    finalizeIndex >= 0 &&
    steps[finalizeIndex]?.status === "active" &&
    !isComplete &&
    !hasError;

  const eta = useMemo(() => {
    const started = startedAtMs ?? null;
    const total = lockedEstimateMs;
    if (!started) {
      return {
        remainingMs: null as number | null,
        totalMs: total,
        elapsedMs: null as number | null,
      };
    }

    const elapsedMs = Math.max(0, nowMs - started);
    if (isComplete) {
      return { remainingMs: 0, totalMs: elapsedMs, elapsedMs };
    }
    if (hasError) {
      return { remainingMs: null, totalMs: null, elapsedMs };
    }

    const totalMs = total ?? 120_000;
    let remainingMs = Math.max(0, totalMs - elapsedMs);
    if (remainingMs < 15_000 && !isComplete && progress > 0.04 && progress < 0.995) {
      const implied = Math.round((elapsedMs * (1 - progress)) / Math.max(progress, 0.08));
      remainingMs = Math.max(remainingMs, Math.min(implied, 50 * 60_000));
    }
    return { remainingMs, totalMs, elapsedMs };
  }, [hasError, isComplete, lockedEstimateMs, nowMs, progress, startedAtMs]);

  const activeLabel = useMemo(
    () => steps.find((s) => s.status === "active")?.label ?? null,
    [steps]
  );
  const percent = Math.round(progress * 100);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="rounded-xl border border-[#1f1f1f] bg-[#0a0a0a] p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-wider text-[#666] mb-6">
          AI processing pipeline
        </p>

        <div className="grid gap-6 sm:grid-cols-[1fr_220px]">
          <ol className="space-y-0">
            {steps.map((step, index) => (
              <li
                key={step.id}
                className={cn(
                  "flex gap-4 pb-6 last:pb-0 relative",
                  index < steps.length - 1 &&
                    "before:absolute before:left-[18px] before:top-9 before:bottom-0 before:w-px before:-translate-x-1/2 before:bg-[#252525]"
                )}
              >
                <div className="relative z-[1] flex h-9 w-9 flex-shrink-0 items-center justify-center">
                  <StepCircle index={index + 1} status={step.status} />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <span
                    className={cn(
                      "text-sm font-medium block",
                      step.status === "pending" && "text-[#666]",
                      step.status === "active" && "text-white",
                      step.status === "completed" && "text-[#888]",
                      step.status === "error" && "text-red-400"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              </li>
            ))}
          </ol>

          <aside className="sm:pl-6 sm:border-l sm:border-[#1f1f1f]">
            <div className="rounded-xl border border-[#1f1f1f] bg-[#0b0b0b] p-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#666]">
                Estimated time
              </p>

              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-2xl font-semibold text-white tabular-nums">
                    {formatRemaining(eta.remainingMs)}
                  </p>
                  <p className="mt-1 text-xs text-[#888]">
                    {hasError
                      ? "Paused due to an error"
                      : isComplete
                        ? "Completed"
                        : showChunkDetail && chunkProgress
                          ? `${chunkProgress.completed} of ${chunkProgress.total} AI chunks done`
                          : activeLabel
                            ? `Working on: ${activeLabel}`
                            : "Calibrating…"}
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      hasError ? "bg-red-400/80" : isComplete ? "bg-emerald-400/80" : "bg-white/70"
                    )}
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] text-[#666]">
                  <span>Progress</span>
                  <span className="tabular-nums">{hasError ? "—" : `${percent}%`}</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-[#151515] overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-500",
                      hasError ? "bg-red-500/50" : "bg-white/70"
                    )}
                    style={{ width: `${hasError ? 100 : Math.max(2, Math.min(100, percent))}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-[#666]">
                  Estimate may increase once when chunk count is known; then it only counts down.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {hasError && errorMessage && (
          <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-sm text-red-300">{errorMessage}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 h-9 px-4 rounded-lg bg-white text-black text-sm font-medium hover:bg-[#e5e5e5] transition-colors"
              >
                Try again
              </button>
            )}
          </div>
        )}

        {isComplete && !hasError && (
          <div className="mt-8 pt-6 border-t border-[#1f1f1f]">
            <p className="text-sm font-medium text-white mb-4">Processing complete</p>
            {summaryHref ? (
              <Link
                href={summaryHref}
                prefetch={false}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.assign(summaryHref);
                }}
                className="flex h-11 w-full items-center justify-center rounded-lg bg-white text-sm font-semibold text-black transition-colors hover:bg-[#e5e5e5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
              >
                View summary
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function StepCircle({ index, status }: { index: number; status: PipelineStepStatus }) {
  if (status === "active") {
    return (
      <div className="relative h-9 w-9" aria-hidden>
        <div
          className="pointer-events-none absolute inset-0 rounded-full border-2 border-white/[0.12]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-white/75 border-r-white/25"
          style={{ animationDuration: "0.85s" }}
          aria-hidden
        />
        <div className="absolute inset-[5px] flex items-center justify-center rounded-full border border-white/20 bg-[#121212] text-[11px] font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]">
          <span className="tabular-nums">{index}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
        status === "pending" && "border-[#333] bg-[#111] text-[#666]",
        status === "completed" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
        status === "error" && "border-red-500/40 bg-red-500/10 text-red-400"
      )}
      aria-hidden
    >
      {status === "completed" ? (
        <Check className="h-4 w-4" strokeWidth={2.5} />
      ) : status === "error" ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        <span className="tabular-nums">{index}</span>
      )}
    </div>
  );
}
