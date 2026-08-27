import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDbConnection } from "@/lib/db";
import { findSummaryById } from "@/lib/summaries";
import { SummaryPageWrapper } from "@/components/summaries/summary-page-wrapper";
import { DocumentSectionsPanel } from "@/components/summaries/document-sections-panel";
import type { SectionsResponse } from "@/app/api/documents/[id]/versions/[versionId]/sections/route";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default async function SummarySectionsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const summaryId = params.id;

  const summary = await findSummaryById(summaryId);
  if (!summary) {
    notFound();
  }

  const sql = await getDbConnection();
  const [versionRow] = await sql`
    SELECT id AS version_id, document_id
    FROM document_versions
    WHERE pdf_summary_id = ${summaryId}
    LIMIT 1
  `;

  if (!versionRow) {
    return (
      <SummaryPageWrapper>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
          <p className="text-[#888] text-center mb-4">No version data for this summary.</p>
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
      </SummaryPageWrapper>
    );
  }

  const documentId = versionRow.document_id as string;
  const versionId = versionRow.version_id as string;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/api/documents/${documentId}/versions/${versionId}/sections`, {
    cache: "no-store",
    headers: { Cookie: h.get("cookie") ?? "" },
  });

  if (!res.ok) {
    return (
      <SummaryPageWrapper>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
          <p className="text-[#888] text-center mb-4">
            {res.status === 404 ? "Version not found." : "Failed to load sections."}
          </p>
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
      </SummaryPageWrapper>
    );
  }

  const data: SectionsResponse = await res.json();

  return (
    <SummaryPageWrapper>
      <DocumentSectionsPanel
        sections={data.sections}
        summaryId={summaryId}
        summaryTitle={summary.title || "Untitled Document"}
        documentVersionId={versionId}
        pdfSummaryId={summaryId}
      />
    </SummaryPageWrapper>
  );
}
