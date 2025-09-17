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

  // Calculate current limit status based on current summaries count
  const currentHasReachedLimit = summaries.length >= uploadLimit;
  const currentUploadCount = summaries.length;

  const handleDelete = (deletedSummaryId: string) => {
    setSummaries((prevSummaries) =>
      prevSummaries.filter((summary) => summary.id !== deletedSummaryId)
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Your Summaries
          </h1>
          <p className="text-muted-foreground text-lg">
            Transform your PDFs into concise summaries with AI
          </p>
        </div>
        <div className="flex items-center gap-3">
          {userPlan === "basic" && (
            <div className="text-sm text-muted-foreground">
              {currentUploadCount}/{uploadLimit} summaries
            </div>
          )}
          <Button
            disabled={currentHasReachedLimit}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            title={
              currentHasReachedLimit
                ? "You have reached the maximum limit for your Basic plan. Upgrade to Pro to continue."
                : "Create a new PDF summary"
            }
          >
            {currentHasReachedLimit ? (
              <div className="flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                Limit Reached
              </div>
            ) : (
              <Link href="/upload" className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                New Summary
              </Link>
            )}
          </Button>
        </div>
      </div>

      {/* Plan Information */}
      {userPlan === "basic" && !currentHasReachedLimit && (
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
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
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                Upgrade to Pro →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Limit Reached Warning */}
      {currentHasReachedLimit && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Maximum Limit Reached
              </h3>
              <p className="text-muted-foreground mb-4">
                You have reached the maximum limit of{" "}
                <span className="font-semibold text-foreground">{uploadLimit} summaries</span> for
                your <span className="font-semibold text-foreground">Basic</span> plan. To
                continue creating new summaries, please upgrade to our{" "}
                <span className="font-semibold text-foreground">Pro</span> plan.
              </p>
              <Link
                href="/#pricing"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                Upgrade to Pro Plan
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Summaries Grid */}
      {summaries.length === 0 ? (
        <EmptySummaryState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
