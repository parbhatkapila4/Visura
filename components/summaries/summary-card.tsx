import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DeleteButton from "./delete-button";
import {
  FileText,
  Hash,
  Lightbulb,
  MessageCircle,
  Clock,
  Tag,
  ArrowRight,
  Eye,
} from "lucide-react";
import { cn, formatFileName } from "@/lib/utils";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { extractSummaryPreview } from "@/utils/summary-helpers";

const SummaryHeader = ({
  fileUrl,
  title,
  createdAt,
  documentType,
}: {
  fileUrl: string;
  title: string | null;
  createdAt: string;
  documentType: string;
}) => {
  return (
    <div className="flex items-start gap-3">
      <FileText className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold text-white truncate">
          {title || formatFileName(fileUrl)}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <Tag className="w-3 h-3 text-white/40" />
          <span className="text-xs text-white/60 truncate">{documentType}</span>
          <Clock className="w-3 h-3 text-white/40 ml-2" />
          <span className="text-xs text-white/60">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center rounded-full px-3 text-xs font-medium border transition-colors duration-200 focus:outline-none ring-0 outline-none",
        status === "Completed"
          ? "bg-slate-800/70 text-slate-200 border-slate-700" // subtle neutral for completed
          : status === "failed"
          ? "bg-red-500/15 text-red-300 border-red-500/40"
          : "bg-amber-500/15 text-amber-300 border-amber-500/30"
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function SummaryCard({
  summary,
  onDelete,
}: {
  summary: any;
  onDelete?: (deletedSummaryId: string) => void;
}) {
  const preview = extractSummaryPreview(summary.summary_text);
  const [showError, setShowError] = useState(false);

  // Derive a user-friendly status based on summary content when not provided
  const derivedStatus = (() => {
    const raw = (summary.summary_text || "").toLowerCase();
    const hasError = raw.includes("error") || raw.includes("failed") || raw.includes("unable to") || raw.trim() === "";
    const processing =
      preview.executiveSummary.includes("being processed") ||
      raw.includes("processing") ||
      raw.includes("in progress");

    if (hasError) return "failed";
    if (processing) return "processing";
    return "completed";
  })();

  // Prefer derived status when content indicates processing/failed
  const statusToShow: string = derivedStatus !== "completed" ? derivedStatus : (summary.status || "completed");

  const errorReason: string = (() => {
    if (summary.error_message) return String(summary.error_message);
    const text = (summary.summary_text || "").trim();
    const line = text
      .split(/\n|\. /)
      .find((l: string) => /error|failed|unable to|cannot/i.test(l));
    if (line) return line.trim();
    return "We couldn't generate a summary for this document. Please try re-uploading the file or generating again.";
  })();

  const getDocumentTypeIcon = (type: string, title: string) => {
    const combinedText = `${type} ${title}`.toLowerCase();

    if (combinedText.includes("invoice")) return "🧾";
    if (combinedText.includes("receipt")) return "🧾";
    if (combinedText.includes("statement")) return "📊";
    if (combinedText.includes("notes") || combinedText.includes("class"))
      return "📚";
    if (combinedText.includes("report")) return "📋";
    if (combinedText.includes("contract")) return "📄";
    if (combinedText.includes("manual")) return "📖";
    if (combinedText.includes("profile")) return "👤";
    if (combinedText.includes("resume") || combinedText.includes("cv"))
      return "📝";
    if (combinedText.includes("letter")) return "✉️";
    if (
      combinedText.includes("presentation") ||
      combinedText.includes("slides")
    )
      return "📊";
    if (combinedText.includes("spreadsheet") || combinedText.includes("excel"))
      return "📈";
    if (combinedText.includes("image") || combinedText.includes("photo"))
      return "🖼️";
    if (combinedText.includes("form")) return "📋";
    if (combinedText.includes("certificate")) return "🏆";
    if (combinedText.includes("diploma") || combinedText.includes("degree"))
      return "🎓";
    if (combinedText.includes("medical") || combinedText.includes("health"))
      return "🏥";
    if (combinedText.includes("legal") || combinedText.includes("law"))
      return "⚖️";
    if (combinedText.includes("financial") || combinedText.includes("bank"))
      return "💰";
    if (combinedText.includes("technical") || combinedText.includes("manual"))
      return "🔧";
    if (combinedText.includes("academic") || combinedText.includes("research"))
      return "🎓";
    if (combinedText.includes("business") || combinedText.includes("corporate"))
      return "🏢";
    if (combinedText.includes("personal")) return "👤";
    if (combinedText.includes("lnkd")) return "💼";

    return "📄";
  };

  const getDocumentTypeColor = (type: string) => {
    if (type.toLowerCase().includes("invoice"))
      return "bg-gray-800/80 border-gray-700/50 hover:bg-gray-800/90";
    if (type.toLowerCase().includes("receipt"))
      return "bg-gray-800/80 border-gray-700/50 hover:bg-gray-800/90";
    if (type.toLowerCase().includes("statement"))
      return "bg-gray-800/80 border-gray-700/50 hover:bg-gray-800/90";
    if (
      type.toLowerCase().includes("notes") ||
      type.toLowerCase().includes("class")
    )
      return "bg-gray-800/80 border-gray-700/50 hover:bg-gray-800/90";
    if (type.toLowerCase().includes("report"))
      return "bg-gray-800/80 border-gray-700/50 hover:bg-gray-800/90";
    if (type.toLowerCase().includes("contract"))
      return "bg-gray-800/80 border-gray-700/50 hover:bg-gray-800/90";
    if (type.toLowerCase().includes("manual"))
      return "bg-gray-800/80 border-gray-700/50 hover:bg-gray-800/90";
    return "bg-gray-800/80 border-gray-700/50 hover:bg-gray-800/90";
  };

  return (
    <div className="relative h-full group">
      {/* floating deletion control */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <DeleteButton summaryId={summary.id} onDelete={onDelete} />
      </div>

      <Card
        className={`h-full ${getDocumentTypeColor(
          preview.documentType
        )} border-gray-700/60 bg-gradient-to-br from-gray-900/80 via-black/80 to-gray-900/70 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 group-hover:scale-[1.015] border backdrop-blur-md cursor-pointer relative overflow-hidden rounded-2xl`}
        onClick={() => {
          window.location.href = `/summaries/${summary.id}`;
        }}
      >
          {/* soft glow on hover */}
          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent blur-xl" />
          </div>

          <div className="p-4 sm:p-6 h-full flex flex-col">
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
              <div className="text-2xl sm:text-3xl flex-shrink-0 select-none">
                {getDocumentTypeIcon(
                  preview.documentType,
                  summary.title || preview.title
                )}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-white via-orange-100 to-amber-100 bg-clip-text text-transparent mb-2 line-clamp-2 break-words">
                  {summary.title || preview.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-[13px] text-gray-300 min-w-0">
                  <span className="inline-flex items-center gap-1.5 bg-gray-800/60 border border-gray-700/50 px-2 py-1 rounded-full min-w-0 max-w-[180px] sm:max-w-[260px]">
                    <Tag className="w-3 h-3" />
                    <span className="truncate font-medium">{preview.documentType}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-gray-800/60 border border-gray-700/50 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    <span className="whitespace-nowrap">
                      {formatDistanceToNow(new Date(summary.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3 sm:space-y-4 min-h-0">
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-3 sm:p-4 border border-gray-700/40 group-hover:border-orange-500/30 transition-all duration-300">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed line-clamp-3 break-words overflow-hidden">
                    {preview.executiveSummary === "Summary not available" ||
                    preview.executiveSummary === "No summary available"
                      ? "Summary is being processed. Please check back in a few moments or click View to see the full document."
                      : preview.executiveSummary}
                  </p>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 font-semibold">
                  <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>Key Insights</span>
                </div>
                {preview.keyPoints.length > 0 ? (
                  <div className="space-y-1.5 sm:space-y-2">
                    {preview.keyPoints.slice(0, 2).map((point, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-gray-300 min-w-0"
                      >
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
                        <span className="line-clamp-1 break-words overflow-hidden">
                          {point}
                        </span>
                      </div>
                    ))}
                    {preview.keyPoints.length > 2 && (
                      <div className="text-xs sm:text-sm text-gray-500 italic">
                        +{preview.keyPoints.length - 2} more insights...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm text-gray-500 italic">
                    Key insights will be available once processing is complete.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-700/40">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                {/* Left: status + read time chips */}
                <div className="flex items-center gap-2 min-w-0">
                  {statusToShow === "failed" ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowError(true);
                      }}
                      className="focus:outline-none"
                    >
                      <StatusBadge status={statusToShow} />
                    </button>
                  ) : (
                    <StatusBadge status={statusToShow} />
                  )}
                  <span className="inline-flex h-8 items-center gap-1.5 px-3 rounded-full bg-slate-800/70 border border-slate-700 text-xs text-slate-200 leading-none">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="whitespace-nowrap">
                      {Math.ceil((summary.summary_text?.length || 0) / 200)} min read
                    </span>
                  </span>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-2 px-4 text-xs font-medium rounded-full transition-all duration-200 hover:scale-[1.03] border-slate-600/70 text-slate-200 hover:bg-slate-700/70 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/summaries/${summary.id}`;
                    }}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    className="h-2 px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 hover:scale-[1.03] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-md hover:shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/chatbot/${summary.id}`;
                    }}
                  >
                    <span className="relative mr-1">
                      <span className="absolute inset-0 rounded-full bg-white/40 blur-[3px] opacity-60"></span>
                      <span className="relative inline-flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-br from-white/30 to-white/10 ring-1 ring-white/30">
                        <MessageCircle className="w-2.5 h-2.5 text-white" />
                      </span>
                    </span>
                    Chat
                  </Button>
                </div>
              </div>
            </div>
          </div>
          {/* Error Dialog */}
          {showError && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
              onClick={(e) => {
                e.stopPropagation();
                setShowError(false);
              }}
            >
              <div
                className="w-full max-w-md rounded-2xl border border-red-500/30 bg-gray-900/95 p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20 ring-1 ring-red-400/40">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                  </span>
                  <h3 className="text-white font-semibold">Summary failed</h3>
                </div>
                <p className="text-sm text-red-200/90 mb-4 break-words">{errorReason}</p>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="rounded-full bg-red-500 hover:bg-red-600 text-white px-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowError(false);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
    </div>
  );
}
