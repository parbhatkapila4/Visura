import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DeleteButton from "./delete-button";
import Link from "next/link";
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
      <FileText className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
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
        "px-2.5 py-1 text-xs font-medium rounded-full",
        status === "completed"
          ? "bg-green-600/20 text-green-400 border border-green-500/30"
          : "bg-yellow-600/20 text-yellow-400 border border-yellow-500/30"
      )}
    >
      {status}
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

  const getDocumentTypeIcon = (type: string, title: string) => {
    const combinedText = `${type} ${title}`.toLowerCase();

    // Check for specific document types
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
    if (combinedText.includes("lnkd")) return "💼"; // LinkedIn related documents

    // Default fallback
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
      {/* Delete button in top right */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <DeleteButton summaryId={summary.id} onDelete={onDelete} />
      </div>

      <Link href={`/summaries/${summary.id}`} className="block h-full">
        <Card
          className={`h-full ${getDocumentTypeColor(
            preview.documentType
          )} hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] border backdrop-blur-sm`}
        >
          <div className="p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
              <div className="text-2xl flex-shrink-0">
                {getDocumentTypeIcon(
                  preview.documentType,
                  summary.title || preview.title
                )}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors break-words">
                  {summary.title || preview.title}
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Tag className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate font-medium">
                      {preview.documentType}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="whitespace-nowrap">
                      {formatDistanceToNow(new Date(summary.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Executive Summary Preview */}
            <div className="flex-1 space-y-4 min-h-0">
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30 group-hover:bg-gray-700/40 transition-colors">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-200 leading-relaxed line-clamp-3 break-words overflow-hidden">
                    {preview.executiveSummary === "Summary not available" ||
                    preview.executiveSummary === "No summary available"
                      ? "Summary is being processed. Please check back in a few moments or click View to see the full document."
                      : preview.executiveSummary}
                  </p>
                </div>
              </div>

              {/* Key Points Preview */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                  <Hash className="w-4 h-4 flex-shrink-0" />
                  <span>Key Insights</span>
                </div>
                {preview.keyPoints.length > 0 ? (
                  <div className="space-y-2">
                    {preview.keyPoints.slice(0, 2).map((point, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 text-sm text-gray-300 min-w-0"
                      >
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="line-clamp-1 break-words overflow-hidden">
                          {point}
                        </span>
                      </div>
                    ))}
                    {preview.keyPoints.length > 2 && (
                      <div className="text-sm text-gray-500 italic">
                        +{preview.keyPoints.length - 2} more insights...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    Key insights will be available once processing is complete.
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-6 pt-4 border-t border-gray-600/30">
              <div className="flex items-center gap-3 min-w-0">
                <StatusBadge status={summary.status || "completed"} />
                <span className="text-sm text-gray-400 whitespace-nowrap">
                  {Math.ceil((summary.summary_text?.length || 0) / 200)} min
                  read
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs font-medium transition-all duration-200 hover:scale-105 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/summaries/${summary.id}`;
                  }}
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  View
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-3 text-xs font-medium transition-all duration-200 hover:scale-105 bg-[#625EC3] hover:bg-[#4A46A0] hover:animate-pulse text-white/70"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/chatbot/${summary.id}`;
                  }}
                >
                  <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                  Chat
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}
