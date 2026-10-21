"use client";

import Link from "next/link";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

export type PipelineStepStatus = "pending" | "active" | "completed" | "error";

export type PipelineStep = {
  id: string;
  label: string;
  status: PipelineStepStatus;
};
export const PIPELINE_STEP_DEFINITIONS: Omit<PipelineStep, "status">[] = [
  { id: "upload", label: "Uploading" },
  { id: "extract", label: "Extracting text" },
  { id: "chunk", label: "Summarizing new chunks" },
  { id: "embed", label: "Generating embeddings" },
  { id: "sections", label: "Detecting sections" },
  { id: "insights", label: "Extracting insights" },
  { id: "graph", label: "Building knowledge graph" },
  { id: "finalize", label: "Finalizing" },
];

const VISIBLE_STEP_ORDER = ["extract", "upload", "chunk", "finalize"];

export function createInitialPipelineSteps(): PipelineStep[] {
  return PIPELINE_STEP_DEFINITIONS.map((d) => ({ ...d, status: "pending" as const }));
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
  chunkProgress,
}: ProcessingPipelineProps) {
  const hasError = steps.some((s) => s.status === "error") || Boolean(errorMessage);

  const visibleSteps = useMemo(
    () =>
      VISIBLE_STEP_ORDER.map((id) => steps.find((s) => s.id === id)).filter(
        (s): s is PipelineStep => s != null
      ),
    [steps]
  );

  const finalizeIndex = useMemo(() => steps.findIndex((s) => s.id === "finalize"), [steps]);

  const showChunkDetail =
    Boolean(chunkProgress && chunkProgress.total > 0) &&
    finalizeIndex >= 0 &&
    steps[finalizeIndex]?.status === "active" &&
    !isComplete &&
    !hasError;

  const activeLabel = useMemo(
    () => visibleSteps.find((s) => s.status === "active")?.label ?? null,
    [visibleSteps]
  );

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="rounded-xl border border-[#1f1f1f] bg-[#0a0a0a] p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-wider text-[#666] mb-6">
          AI processing pipeline
        </p>

        <div className="grid gap-6 sm:grid-cols-[1fr_220px]">
          <ol className="space-y-0">
            {visibleSteps.map((step, index) => (
              <li
                key={step.id}
                className={cn(
                  "flex gap-4 pb-6 last:pb-0 relative",
                  index < visibleSteps.length - 1 &&
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
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#666]">Status</p>

              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="mt-1 text-xs text-[#888]">
                    {hasError
                      ? "Ran into an error"
                      : isComplete
                        ? "Completed"
                        : showChunkDetail && chunkProgress
                          ? `${chunkProgress.completed} of ${chunkProgress.total} chunks have a summary`
                          : activeLabel
                            ? `Working on: ${activeLabel}`
                            : "Working…"}
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
                Start over
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
