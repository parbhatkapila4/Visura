"use client";

import SummaryCard from "@/components/summaries/summary-card";
import EmptySummaryState from "@/components/dashboard/empty-summary-state";
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
  userPlan: string;
  hasReachedLimit: boolean;
}

export default function DashboardClient({
  summaries: initialSummaries,
  uploadLimit,
  userPlan,
  hasReachedLimit,
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
          disabled={hasReachedLimit}
          className={`bg-linear-to-r from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 hover:scale-105 transition-all duration-300 group hover:no-underline ${
            hasReachedLimit
              ? "opacity-50 cursor-not-allowed hover:scale-100 hover:from-rose-500 hover:to-rose-700"
              : ""
          }`}
        >
          {hasReachedLimit ? (
            <div className="flex items-center text-white">
              <Plus className="w-5 h-5 mr-2" />
              New Summary
            </div>
          ) : (
            <Link href="/upload" className="flex items-center text-white">
              <Plus className="w-5 h-5 mr-2" />
              New Summary
            </Link>
          )}
        </Button>
      </div>

      {userPlan === "basic" && (
        <div className="mb-6">
          <p className="text-gray-600 text-sm">
            You can have access to {uploadLimit} PDF summaries. For more,
            upgrade to Pro plan.
          </p>
        </div>
      )}

      {hasReachedLimit && (
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
        <EmptySummaryState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 sm:px-0">
          {summaries.map((summary, index) => (
            <SummaryCard
              key={index}
              summary={summary}
              onDelete={() => handleDelete(summary.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
