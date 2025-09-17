"use client";

import SummaryCard from "@/components/summaries/summary-card";
import EmptySummaryState from "@/components/dashboard/empty-summary-state";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus, FileText, AlertTriangle, Lock } from "lucide-react";
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
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Your Summaries
          </h1>
          <p className="text-gray-300">
            Transform your PDFs into concise summaries with AI
          </p>
        </div>
        <Button
          variant={"link"}
          disabled={hasReachedLimit}
          className={`bg-gradient-to-r from-[#04724D] to-[#059669] hover:from-[#059669] hover:to-[#04724D] hover:scale-105 transition-all duration-300 group hover:no-underline ${
            hasReachedLimit
              ? "opacity-50 cursor-not-allowed hover:scale-100 hover:from-[#04724D] hover:to-[#059669] bg-gray-400"
              : ""
          }`}
          title={
            hasReachedLimit
              ? "You have reached the maximum limit for your Basic plan. Upgrade to Pro to continue."
              : "Create a new PDF summary"
          }
        >
          {hasReachedLimit ? (
            <div className="flex items-center text-white">
              <Lock className="w-5 h-5 mr-2" />
              Limit Reached
            </div>
          ) : (
            <Link href="/upload" className="flex items-center text-white">
              <Plus className="w-5 h-5 mr-2" />
              New Summary
            </Link>
          )}
        </Button>
      </div>

      {/* Plan Information */}
      {userPlan === "basic" && (
        <div className="mb-6">
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 font-medium text-sm">
                Basic Plan
              </span>
            </div>
            <p className="text-blue-200 text-sm">
              You can create up to{" "}
              <span className="font-semibold">{uploadLimit} PDF summaries</span>
              . Currently using:{" "}
              <span className="font-semibold">
                {summaries.length}/{uploadLimit}
              </span>
            </p>
            {summaries.length >= uploadLimit * 0.8 && (
              <p className="text-orange-400 text-xs mt-1">
                ⚠️ You're approaching your limit. Consider upgrading to Pro for
                unlimited summaries.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Limit Reached Warning */}
      {hasReachedLimit && (
        <div className="mb-6">
          <div className="bg-red-900/20 border-2 border-red-700/50 rounded-lg p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-red-300 font-semibold text-lg mb-2">
                  Maximum Limit Reached
                </h3>
                <p className="text-red-200 text-sm mb-4">
                  You have reached the maximum limit of{" "}
                  <span className="font-bold">{uploadLimit} summaries</span> for
                  your <span className="font-bold">Basic</span> plan. To
                  continue creating new summaries, please upgrade to our{" "}
                  <span className="font-bold">Pro</span> plan.
                </p>
                <Link
                  href="/#pricing"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  Upgrade to Pro Plan
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
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
