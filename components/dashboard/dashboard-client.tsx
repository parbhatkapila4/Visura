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

  const currentHasReachedLimit = summaries.length >= uploadLimit;
  const currentUploadCount = summaries.length;

  const handleDelete = (deletedSummaryId: string) => {
    setSummaries((prevSummaries) =>
      prevSummaries.filter((summary) => summary.id !== deletedSummaryId)
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-white/80">
            Your Summaries
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Transform your PDFs into concise summaries with AI
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {userPlan === "basic" && (
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              {currentUploadCount}/{uploadLimit} summaries
            </div>
          )}
          <div className="order-1 sm:order-2 w-full sm:w-auto">
            {currentHasReachedLimit ? (
              <button
                disabled
                title="You have reached the maximum limit for your Basic plan. Upgrade to Pro to continue."
                className="p-[3px] relative w-full sm:w-auto opacity-60 cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
                <div className="px-4 py-2 bg-black rounded-[6px] relative group transition duration-200 text-white flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  Limit Reached
                </div>
              </button>
            ) : (
              <Link href="/upload" title="Create a new PDF summary" className="inline-block w-full sm:w-auto">
                <button className="p-[3px] relative w-full sm:w-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
                  <div className="px-6 py-2 bg-black rounded-[6px] relative group transition duration-200 text-white hover:bg-transparent flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Summary
                  </div>
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {userPlan === "basic" && !currentHasReachedLimit && (
        <div className="bg-gradient-to-r from-gray-900/70 via-gray-800/70 to-gray-900/70 border border-white/10 rounded-2xl p-3 sm:p-4 md:p-5 shadow-[0_18px_45px_-25px_rgba(0,0,0,0.75)] relative overflow-hidden">
          {/* subtle glow */}
          <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.30),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.25),transparent_60%)]" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-black/40 border border-white/15 flex items-center justify-center shadow-inner shadow-black/40">
                <FileText className="w-5 h-5 text-orange-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Basic Plan
                </p>
                <p className="text-xs sm:text-sm text-gray-300">
                  <span className="font-medium text-orange-300">
                    {currentUploadCount}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-orange-300">
                    {uploadLimit}
                  </span>{" "}
                  summaries used
                </p>
              </div>
            </div>
            {currentUploadCount >= uploadLimit * 0.8 && (
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-400 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 hover:scale-[1.02] active:scale-95 border border-orange-300/50 transition-all duration-200 whitespace-nowrap"
              >
                <span>Upgrade to Pro</span>
                <span className="ml-1.5 text-base leading-none">↗</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {currentHasReachedLimit && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5 mx-auto sm:mx-0" />
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-semibold text-white/80 mb-2">
                Maximum Limit Reached
              </h3>
              <p className="text-white/80 mb-4 text-sm sm:text-base">
                You have reached the maximum limit of{" "}
                <span className="font-semibold text-white/80">
                  {uploadLimit} summaries
                </span>{" "}
                for your{" "}
                <span className="font-semibold text-white/80">Basic</span> plan.
                To continue creating new summaries, please upgrade to our{" "}
                <span className="font-semibold text-white/80">Pro</span> plan.
              </p>
              <Link
                href="/#pricing"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm transition-colors w-full sm:w-auto"
              >
                Upgrade to Pro Plan
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {summaries.length === 0 ? (
        <EmptySummaryState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {summaries.map((summary, index) => (
            <SummaryCard
              key={index}
              summary={summary}
              onDelete={() => handleDelete(summary.id)}
              userPlan={userPlan}
            />
          ))}
        </div>
      )}
    </div>
  );
}
