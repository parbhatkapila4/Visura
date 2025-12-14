import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, MessageCircle } from "lucide-react";
import DownloadSummaryButton from "./download-summary-button";
import Link from "next/link";

export default function SourceInfo({
  fileName,
  originalFileUrl,
  title,
  summaryText,
  createdAt,
  summaryId,
}: {
  fileName: string;
  originalFileUrl: string;
  title: string;
  summaryText: string;
  createdAt: string;
  summaryId: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="flex items-center justify-center gap-2">
        <FileText className="h-4 w-4 text-white" />
        <span className="text-white">Source: {fileName}</span>
      </div>
      <div className="flex gap-2">
        <Link href={`/chatbot/${summaryId}`}>
          <Button size="sm" className="h-8 px-3 bg-[#4C4899] hover:bg-[#4C4899]/80 text-white">
            <MessageCircle className="h-4 w-4 mr-1" />
            Chat with Document
          </Button>
        </Link>
        <Button variant="ghost" size="sm" className="h-8 px-3 text-white hover:bg-rose-50" asChild>
          <a href={originalFileUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-1" />
            View Original
          </a>
        </Button>
        <DownloadSummaryButton
          title={title}
          summaryText={summaryText}
          fileName={fileName}
          createdAt={createdAt}
        />
      </div>
    </div>
  );
}
