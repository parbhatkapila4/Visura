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
        "px-2.5 py-1 text-xs font-medium rounded-full",
        status === "completed"
          ? "bg-orange-500/15 text-orange-300 border border-orange-500/30"
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
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <DeleteButton summaryId={summary.id} onDelete={onDelete} />
      </div>

      <Card
        className={`h-full ${getDocumentTypeColor(
          preview.documentType
        )} hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] border backdrop-blur-sm cursor-pointer`}
        onClick={() => {
          window.location.href = `/summaries/${summary.id}`;
        }}
      >
          <div className="p-4 sm:p-6 h-full flex flex-col">
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
              <div className="text-xl sm:text-2xl flex-shrink-0">
                {getDocumentTypeIcon(
                  preview.documentType,
                  summary.title || preview.title
                )}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-orange-300 transition-colors break-words">
                  {summary.title || preview.title}
                </h3>
                <div className="flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                    <span className="truncate font-medium">
                      {preview.documentType}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                    <span className="whitespace-nowrap">
                      {formatDistanceToNow(new Date(summary.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3 sm:space-y-4 min-h-0">
              <div className="bg-gray-700/30 rounded-lg p-3 sm:p-4 border border-gray-600/30 group-hover:bg-gray-700/40 transition-colors">
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
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 font-medium">
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
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-orange-400 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
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

            <div className="flex flex-col gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-600/30">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <StatusBadge status={summary.status || "completed"} />
                <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
                  {Math.ceil((summary.summary_text?.length || 0) / 200)} min
                  read
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 sm:h-8 px-2 sm:px-3 text-xs font-medium transition-all duration-200 hover:scale-105 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white flex-1 sm:flex-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/summaries/${summary.id}`;
                  }}
                >
                  <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                  View
                </Button>
                <Button
                  size="sm"
                  className="h-7 sm:h-8 px-2 sm:px-3 text-xs font-medium transition-all duration-200 hover:scale-105 bg-orange-500 hover:bg-orange-600 hover:animate-pulse text-white/80 flex-1 sm:flex-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/chatbot/${summary.id}`;
                  }}
                >
                  <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                  Chat
                </Button>
              </div>
            </div>
          </div>
        </Card>
    </div>
  );
}
