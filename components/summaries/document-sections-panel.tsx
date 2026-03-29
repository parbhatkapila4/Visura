"use client";

import Link from "next/link";
import { ChevronLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DocumentReference } from "@/lib/document-reference";
import { DOCUMENT_VIEWER_GO_TO_EVENT } from "@/lib/document-reference";

export interface SectionItem {
  id: string;
  title: string;
  start_page: number;
  end_page: number;
  sort_order?: number;
}

export interface DocumentSectionsPanelProps {
  sections: SectionItem[];
  summaryId: string;
  summaryTitle: string;
  documentVersionId: string;
  pdfSummaryId: string;
  onSelectReference?: (ref: DocumentReference) => void;
}

function sectionToReference(
  section: SectionItem,
  documentVersionId: string,
  pdfSummaryId: string
): DocumentReference {
  return {
    document_version_id: documentVersionId,
    pdf_summary_id: pdfSummaryId,
    page: section.start_page,
    snippet: "",
    chunk_id: null,
  };
}

function formatPageRange(start: number, end: number): string {
  if (start === end) return `Page ${start}`;
  return `Pages ${start}–${end}`;
}

export function DocumentSectionsPanel({
  sections,
  summaryId,
  summaryTitle,
  documentVersionId,
  pdfSummaryId,
  onSelectReference,
}: DocumentSectionsPanelProps) {
  const sorted = [...sections].sort((a, b) => {
    const orderA = a.sort_order ?? a.start_page;
    const orderB = b.sort_order ?? b.start_page;
    if (orderA !== orderB) return orderA - orderB;
    return a.start_page - b.start_page;
  });

  const hasSections = sorted.length > 0;

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
            <p className="text-xs text-[#666]">Sections</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {!hasSections ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center px-4">
            <p className="text-[#888] text-center mb-4">No sections detected for this document.</p>
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
          <div className="space-y-2">
            {sorted.map((section) => {
              const ref = sectionToReference(section, documentVersionId, pdfSummaryId);
              const handleGoTo = () => {
                if (onSelectReference) {
                  onSelectReference(ref);
                } else {
                  window.dispatchEvent(
                    new CustomEvent(DOCUMENT_VIEWER_GO_TO_EVENT, { detail: ref })
                  );
                }
              };

              return (
                <div
                  key={section.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-[#111] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0a0a0a] border border-[#1f1f1f]">
                    <FileText className="h-4 w-4 text-[#666]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">{section.title}</h3>
                    <p className="text-xs text-[#666] mt-0.5">
                      {formatPageRange(section.start_page, section.end_page)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#333] text-[#888] hover:bg-[#1a1a1a] hover:text-white text-xs shrink-0"
                    onClick={handleGoTo}
                  >
                    Go to
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
