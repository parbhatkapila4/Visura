import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbConnection } from "@/lib/db";
import { logger } from "@/lib/logger";
import type { DocumentInsightType } from "@/lib/document-insights";

export interface ContentInsightItem {
  id: string;
  type: DocumentInsightType;
  title: string;
  description: string;
  confidence: number;
  page: number | null;
  source_text: string | null;
  document_version_id: string;
  pdf_summary_id?: string | null;
}

export interface ContentInsightsResponse {
  insights: ContentInsightItem[];
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: documentId, versionId } = await params;
    const sql = await getDbConnection();

    const [versionRow] = await sql`
      SELECT dv.id, dv.pdf_summary_id
      FROM document_versions dv
      JOIN documents d ON dv.document_id = d.id
      WHERE dv.id = ${versionId}
        AND dv.document_id = ${documentId}
        AND d.user_id = ${userId}
    `;

    if (!versionRow) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    const pdfSummaryId = (versionRow as { pdf_summary_id?: string | null }).pdf_summary_id ?? null;

    const rows = await sql`
      SELECT id, type, title, description, confidence, page, source_text
      FROM document_insights
      WHERE document_version_id = ${versionId}
      ORDER BY type ASC, created_at ASC
    `;

    const insights: ContentInsightItem[] = (rows as Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      confidence: number | string;
      page: number | null;
      source_text: string | null;
    }>).map((r) => ({
      id: r.id,
      type: r.type as DocumentInsightType,
      title: r.title,
      description: r.description,
      confidence: Number(r.confidence),
      page: r.page != null ? Number(r.page) : null,
      source_text: r.source_text,
      document_version_id: versionId,
      pdf_summary_id: pdfSummaryId,
    }));

    return NextResponse.json({ insights });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Content insights API error", err, { versionId: (await params).versionId });
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
