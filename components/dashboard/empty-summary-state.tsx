import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";

export default function EmptySummaryState() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <FileText className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No summaries yet
      </h3>
      <p className="text-gray-500 mb-6">
        Upload your first PDF to get started with AI-powered summaries
      </p>
      <Link href="/upload">
        <Button className="bg-rose-500 hover:bg-rose-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Upload PDF
        </Button>
      </Link>
    </div>
  );
}
