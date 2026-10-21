"use client";

import Link from "next/link";
import {
  Upload,
  FileText,
  Hash,
  RefreshCw,
  Cpu,
  Database,
  CheckCircle,
  XCircle,
  ChevronLeft,
  Clock,
  Layers,
  Timer,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  InsightsResponse,
  InsightsEvent,
} from "@/app/api/documents/[id]/versions/[versionId]/insights/route";

const EVENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  upload_started: Upload,
  chunking_started: FileText,
  chunking_completed: FileText,
  hash_diff_started: Hash,
  reuse_calculated: RefreshCw,
  llm_processing_started: Cpu,
  embeddings_started: Database,
  indexing_started: Database,
  version_completed: CheckCircle,
  version_failed: XCircle,
};

const EVENT_LABELS: Record<string, string> = {
  upload_started: "Version created",
  chunking_started: "Text split into chunks",
  hash_diff_started: "Chunks hashed",
  llm_processing_started: "Summarizing new chunks",
  embeddings_started: "Chat context started",
  indexing_started: "Chat text stored",
};
const STALE_MESSAGE_TYPES = new Set(["chunking_started", "hash_diff_started"]);

function eventLabel(eventType: string): string {
  if (EVENT_LABELS[eventType]) return EVENT_LABELS[eventType];
  const words = eventType.split("_").join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function formatDuration(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

interface ProcessingInsightsViewProps {
  summaryId: string;
  summaryTitle: string;
  data: InsightsResponse;
}

export function ProcessingInsightsView({
  summaryId,
  summaryTitle,
  data,
}: ProcessingInsightsViewProps) {
  const { version, events, metrics } = data;
  const status = events.some((e) => e.event_type === "version_completed")
    ? "Completed"
    : events.some((e) => e.event_type === "version_failed")
      ? "Failed"
      : "No finish recorded";
  const caveats = version.coverage_caveats ?? [];
  const reuseIsCoverage = caveats.length === 0;

  const statusColor =
    status === "Completed"
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      : status === "Failed"
        ? "text-red-400 bg-red-500/10 border-red-500/20"
        : "text-amber-400 bg-amber-500/10 border-amber-500/20";

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10 space-y-10">
        <section>
          <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider mb-5">
            Version overview
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-[#111] border border-[#1f1f1f]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <p className="text-[11px] text-[#555] uppercase tracking-wider mb-1">Status</p>
              <span
                className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md border ${statusColor}`}
              >
                {status}
              </span>
            </div>
            <div className="p-5 rounded-xl bg-[#111] border border-[#1f1f1f]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-400" />
                </div>
              </div>
              <p className="text-[11px] text-[#555] uppercase tracking-wider mb-1">Created</p>
              <p className="text-sm font-medium text-white">{formatDate(version.created_at)}</p>
            </div>
            <div className="p-5 rounded-xl bg-[#111] border border-[#1f1f1f]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-violet-400" />
                </div>
              </div>
              <p className="text-[11px] text-[#555] uppercase tracking-wider mb-1">Chunks</p>
              <p className="text-sm font-medium text-white">{version.total_chunks} total</p>
              {reuseIsCoverage ? (
                <p className="text-xs text-[#666] mt-0.5">
                  {version.reused_chunks} reused · {version.new_chunks} new
                </p>
              ) : (
                <p className="text-xs text-[#666] mt-0.5">of the text we could read</p>
              )}
            </div>
            <div className="p-5 rounded-xl bg-[#111] border border-[#1f1f1f]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Timer className="w-4 h-4 text-orange-400" />
                </div>
              </div>
              <p className="text-[11px] text-[#555] uppercase tracking-wider mb-1">
                Created to last event
              </p>
              <p className="text-sm font-medium text-white">
                {formatDuration(metrics.processingDurationMs)}
              </p>
            </div>
          </div>

          {caveats.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-5">
              <div className="flex gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-amber-300 leading-tight">
                    Reuse figures are left out of the overview and Efficiency sections for this
                    version
                  </p>
                  <ul className="mt-2 space-y-1">
                    {caveats.map((caveat) => (
                      <li key={caveat} className="text-sm text-[#999] leading-relaxed">
                        {caveat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider mb-5">
            Processing timeline
          </h2>
          <div className="rounded-xl bg-[#111] border border-[#1f1f1f] p-6">
            {events.length === 0 ? (
              <p className="text-[#666] text-sm py-6 text-center">No events recorded.</p>
            ) : (
              <ul className="relative space-y-0">
                {events.map((event, i) => (
                  <TimelineItem key={event.id} event={event} isLast={i === events.length - 1} />
                ))}
              </ul>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider mb-5">
            Efficiency
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatBlock
              icon={<RefreshCw className="w-4 h-4 text-emerald-400" />}
              iconBg="bg-emerald-500/10"
              label="Reuse"
              value={
                reuseIsCoverage && metrics.totalChunks > 0
                  ? `${metrics.reusePercent.toFixed(0)}%`
                  : "—"
              }
            />
            <StatBlock
              icon={<Layers className="w-4 h-4 text-violet-400" />}
              iconBg="bg-violet-500/10"
              label="Total chunks"
              value={String(metrics.totalChunks)}
            />
            <StatBlock
              icon={<Timer className="w-4 h-4 text-blue-400" />}
              iconBg="bg-blue-500/10"
              label="Created to last event"
              value={formatDuration(metrics.processingDurationMs)}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatBlock({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <div className="p-5 rounded-xl bg-[#111] border border-[#1f1f1f]">
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-[11px] text-[#555] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}

function TimelineItem({ event, isLast }: { event: InsightsEvent; isLast: boolean }) {
  const Icon = EVENT_ICONS[event.event_type] ?? FileText;
  const meta = event.metadata && typeof event.metadata === "object" ? event.metadata : {};
  const badgeKeys = ["chunk_count", "reused", "new", "total", "duration_ms", "error"].filter(
    (k) => meta[k] !== undefined && meta[k] !== null
  );

  const isCompleted = event.event_type === "version_completed";
  const isFailed = event.event_type === "version_failed";
  const iconRingColor = isCompleted
    ? "border-emerald-500/40 bg-emerald-500/10"
    : isFailed
      ? "border-red-500/40 bg-red-500/10"
      : "border-[#333] bg-[#161616]";
  const iconColor = isCompleted ? "text-emerald-400" : isFailed ? "text-red-400" : "text-[#888]";

  return (
    <li className="relative flex gap-5 pb-8 last:pb-0">
      {!isLast && (
        <span
          className="absolute left-[13px] top-8 bottom-0 w-px bg-gradient-to-b from-[#333] to-[#1f1f1f]"
          aria-hidden
        />
      )}
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${iconRingColor}`}
      >
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-medium text-white leading-tight">
          {eventLabel(event.event_type)}
        </p>
        {event.message && !STALE_MESSAGE_TYPES.has(event.event_type) && (
          <p className="text-sm text-[#888] mt-1 leading-relaxed">{event.message}</p>
        )}
        <p className="text-xs text-[#555] mt-1.5">{formatDate(event.created_at)}</p>
        {badgeKeys.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {badgeKeys.map((k) => (
              <Badge
                key={k}
                variant="outline"
                className="text-[10px] border-[#2a2a2a] text-[#888] bg-[#0a0a0a] px-2.5 py-1"
              >
                {k}: {String(meta[k])}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
