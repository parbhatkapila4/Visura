import { Card } from "@/components/ui/card";
import DeleteButton from "./delete-button";
import Link from "next/link";
import { FileText, Hash, Lightbulb, Wine } from "lucide-react";
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
      <FileText className="w-6 h-6 text-rose-500 mt-1 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {title || formatFileName(fileUrl)}
        </h3>
        <p className="text-sm text-gray-500">
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
        "px-3 py-1 text-xs font-medium rounded-full capitalize",
        status === "completed"
          ? "bg-emerald-100 text-emerald-800"
          : "bg-yellow-100 text-yellow-800"
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
    <Card className="relative h-full border border-gray-200 hover:shadow-md transition-shadow">
      <div className="absolute top-3 right-3 z-10">
        <DeleteButton summaryId={summary.id} onDelete={onDelete} />
      </div>
      <Link href={`/summaries/${summary.id}`} className="block p-5">
        <div className="flex flex-col gap-4">
          <SummaryHeader
            fileUrl={summary.original_file_url}
            title={summary.title}
            createdAt={summary.created_at}
          />

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Hash className="w-4 h-4 text-gray-400" />
              <span className="truncate">The Ultimate Guide to Our Menu</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <Wine className="w-4 h-4 text-amber-500" />
              <span className="truncate">
                Options • Dive into the world of exquisite...
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <StatusBadge status={summary.status || "completed"} />
          </div>
        </div>
      </Link>
    </Card>
  );
}
