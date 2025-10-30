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
          <Button
            disabled={currentHasReachedLimit}
            className="relative overflow-hidden p-0 text-white/90 w-full sm:w-auto order-1 sm:order-2 rounded-xl"
            title={
              currentHasReachedLimit
                ? "You have reached the maximum limit for your Basic plan. Upgrade to Pro to continue."
                : "Create a new PDF summary"
            }
          >
            {/* animated gradient ring */}
            <span className="pointer-events-none absolute inset-[-1000%] animate-[spin_2.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#fb923c_0%,#f97316_50%,#fb923c_100%)]" />
            {/* inner button */}
            <span className="relative flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-500 px-4 py-2 rounded-xl">
              {currentHasReachedLimit ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Limit Reached</span>
                </>
              ) : (
                <Link href="/upload" className="flex items-center gap-2">
                  <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/20 shadow-sm">
                    <span className="absolute -inset-1 rounded-md bg-orange-400/20 blur-sm" />
                    <Plus className="relative w-3.5 h-3.5 text-white transition-transform duration-300 group-hover:scale-110" />
                  </span>
                  <span>New Summary</span>
                </Link>
              )}
            </span>
          </Button>
        </div>
      </div>

      {userPlan === "basic" && !currentHasReachedLimit && (
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Basic Plan
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentUploadCount} of {uploadLimit} summaries used
                </p>
              </div>
            </div>
            {currentUploadCount >= uploadLimit * 0.8 && (
              <Link
                href="/#pricing"
                className="text-sm text-primary hover:text-primary/80 font-medium text-center sm:text-right"
              >
                Upgrade to Pro →
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {summaries.map((summary, index) => (
            <SummaryCard
              key={index}
              summary={summary}
              onDelete={() => handleDelete(summary.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
