"use client";

import Link from "next/link";
import { ChevronLeft, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ContentInsightItem } from "@/app/api/documents/[id]/versions/[versionId]/insights/content/route";
import type { DocumentReference } from "@/lib/document-reference";
import { DOCUMENT_VIEWER_GO_TO_EVENT } from "@/lib/document-reference";

const INSIGHT_TYPE_ORDER = [
  "key_insight",
  "risk",
  "financial_highlight",
  "actionable_point",
  "important_fact",
] as const;

const TYPE_LABELS: Record<string, string> = {
  key_insight: "Key insight",
  risk: "Risk",
  financial_highlight: "Financial highlight",
  actionable_point: "Actionable point",
  important_fact: "Important fact",
};

export interface AiInsightsPanelProps {
  insights: ContentInsightItem[];
  summaryId: string;
  summaryTitle: string;
  onSelectReference?: (ref: DocumentReference) => void;
}

function insightToReference(insight: ContentInsightItem): DocumentReference {
  return {
    document_version_id: insight.document_version_id,
    pdf_summary_id: insight.pdf_summary_id ?? null,
    page: insight.page,
    snippet: insight.source_text ?? "",
    chunk_id: null,
  };
}

function formatPage(page: number | null): string {
  if (page == null) return "";
  return `Page ${page}`;
}

function formatConfidence(confidence: number): string {
  const pct = Math.round(confidence * 100);
  return `${pct}%`;
}

export function AiInsightsPanel({
  insights,
  summaryId,
  summaryTitle,
  onSelectReference,
}: AiInsightsPanelProps) {
  const grouped = INSIGHT_TYPE_ORDER.reduce<Record<string, ContentInsightItem[]>>((acc, type) => {
    const items = insights.filter((i) => i.type === type);
    if (items.length > 0) acc[type] = items;
    return acc;
  }, {});

  const hasInsights = insights.length > 0;

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white">
      <header className="sticky top-0 z-10 border-b border-[#1f1f1f] bg-[#0a0a0a]/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-[#888] hover:text-white hover:bg-[#1a1a1a]"
          >
            <Link href={`/summaries/${summaryId}`}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">{summaryTitle}</h1>
            <p className="text-xs text-[#666]">AI insights</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {!hasInsights ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center px-4">
            <p className="text-[#888] text-center mb-4">No AI insights for this document yet.</p>
            <Button
              variant="outline"
              asChild
              className="border-[#333] text-[#888] hover:bg-[#1a1a1a]"
            >
              <Link href={`/summaries/${summaryId}`}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to summary
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {INSIGHT_TYPE_ORDER.map((type) => {
              const items = grouped[type];
              if (!items || items.length === 0) return null;
              const label = TYPE_LABELS[type] ?? type;

              return (
                <Card key={type} className="bg-[#111] border-[#1f1f1f]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-white">{label}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {items.map((insight) => (
                      <InsightCard
                        key={insight.id}
                        insight={insight}
                        onGoToPage={() => {
                          const ref = insightToReference(insight);
                          if (onSelectReference) {
                            onSelectReference(ref);
                          } else {
                            window.dispatchEvent(
                              new CustomEvent(DOCUMENT_VIEWER_GO_TO_EVENT, { detail: ref })
                            );
                          }
                        }}
                      />
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InsightCard({
  insight,
  onGoToPage,
}: {
  insight: ContentInsightItem;
  onGoToPage: () => void;
}) {
  const pageLabel = formatPage(insight.page);
  const confidenceLabel = formatConfidence(insight.confidence);
  const canGoToPage = insight.page != null;

  return (
    <div className="p-4 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f]">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {pageLabel ? (
          <span className="text-xs text-[#666] flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {pageLabel}
          </span>
        ) : null}
        <span className="text-xs text-[#555]">Confidence: {confidenceLabel}</span>
      </div>
      <h3 className="text-sm font-medium text-white mb-1">{insight.title}</h3>
      <p className="text-sm text-[#888] leading-relaxed mb-3">{insight.description}</p>
      {canGoToPage && (
        <Button
          variant="outline"
          size="sm"
          className="border-[#333] text-[#888] hover:bg-[#1a1a1a] hover:text-white text-xs"
          onClick={onGoToPage}
        >
          View in document
        </Button>
      )}
    </div>
  );
}
