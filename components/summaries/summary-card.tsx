import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DeleteButton from "./delete-button";
import Link from "next/link";
import { FileText, Hash, Lightbulb, MessageCircle } from "lucide-react";
import { cn, formatFileName } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const SummaryHeader = ({
  fileUrl,
  title,
  createdAt,
}: {
  fileUrl: string;
  title: string | null;
  createdAt: string;
}) => {
  return (
    <div className="flex items-start gap-3">
      <FileText className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold text-white truncate">
          {title || formatFileName(fileUrl)}
        </h3>
        <p className="text-sm text-white/60 mt-1">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  return (
    <span
      className={cn(
        "px-2 py-1 text-xs font-medium rounded-full text-white",
        status === "completed"
          ? "bg-green-500"
          : "bg-yellow-500"
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
  return (
    <Card className="relative h-full bg-white/10 backdrop-blur-md border-0 shadow-sm hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden">
      {/* Delete button in top right */}
      <div className="absolute top-3 right-3 z-10">
        <DeleteButton summaryId={summary.id} onDelete={onDelete} />
      </div>
      
      <Link href={`/summaries/${summary.id}`} className="block p-5">
        <div className="flex flex-col gap-4 h-full">
          <SummaryHeader
            fileUrl={summary.original_file_url}
            title={summary.title}
            createdAt={summary.created_at}
          />

          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Hash className="w-4 h-4 text-white/60" />
              <span className="truncate">The Ultimate Guide to Our Menu</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span className="truncate">
                Options • Dive into the world of exquisite...
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center mt-auto pt-2">
            <StatusBadge status={summary.status || "completed"} />
            <Link href={`/chatbot/${summary.id}`} onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 py-2 text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Chat
              </Button>
            </Link>
          </div>
        </div>
      </Link>
    </Card>
  );
}
