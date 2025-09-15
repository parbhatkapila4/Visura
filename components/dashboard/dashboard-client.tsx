"use client";

import SummaryCard from "@/components/summaries/summary-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Summary {
  id: string;
  title: string | null;
  summary_text: string;
  original_file_url: string | null;
  created_at: string;
  status?: string;
}

interface DashboardClientProps {
  summaries: Summary[];
  uploadLimit: number;
}

export default function DashboardClient({
  summaries: initialSummaries,
  uploadLimit,
}: DashboardClientProps) {
  const [summaries, setSummaries] = useState(initialSummaries);
  const router = useRouter();

  const handleDelete = (deletedSummaryId: string) => {
    setSummaries((prevSummaries) =>
      prevSummaries.filter((summary) => summary.id !== deletedSummaryId)
    );
  };

  return (
    <>
      <div className="flex gap-4 mb-8 justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-gray-600 to-gray-900 text-transparent bg-clip-text">
            Your Summaries
          </h1>
          <p className="text-gray-600">
            Transform your PDFs into concise summaries with AI
          </p>
        </div>
        <Button
          variant={"link"}
          className="bg-linear-to-r from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 hover:scale-105 transition-all duration-300 group hover:no-underline"
        >
          <Link href="/upload" className="flex items-center text-white">
            <Plus className="w-5 h-5 mr-2" />
            New Summary
          </Link>
        </Button>
      </div>

      {summaries.length >= uploadLimit && (
        <div className="mb-6">
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-rose-800">
            <p className="text-sm">
              You have reached the limit of your{" "}
              <span className="font-bold text-black">Basic</span> plan. Please
              upgrade to a <span className="font-bold text-black">Pro</span>{" "}
              plan to continue using the service.
              <Link
                href="/#pricing"
                className="text-black font-bold pl-1 inline-flex items-center gap-1 underline underline-offset-2"
              >
                Upgrade to Pro
                <ArrowRight className="w-4 h-4" />
              </Link>
            </p>
          </div>
        </div>
      )}

      {summaries.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 sm:px-0">
          {summaries.map((summary, index) => (
            <SummaryCard
              key={summary.id}
              summary={summary}
              onDelete={() => handleDelete(summary.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
