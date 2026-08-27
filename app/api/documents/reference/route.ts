import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbConnection } from "@/lib/db";
import { truncateSnippet } from "@/lib/document-chunk-embeddings";
import type { DocumentReference } from "@/lib/document-reference";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const insightId = searchParams.get("insight_id");
    const chunkId = searchParams.get("chunk_id");

    if (insightId && chunkId) {
      return NextResponse.json(
        { error: "Provide either insight_id or chunk_id, not both" },
        { status: 400 }
      );
    }
    if (!insightId && !chunkId) {
      return NextResponse.json({ error: "Provide insight_id or chunk_id" }, { status: 400 });
    }

    const sql = await getDbConnection();

    if (insightId) {
      const [row] = await sql`
        SELECT di.id, di.document_version_id, di.page, di.source_text, dv.pdf_summary_id
        FROM document_insights di
        JOIN document_versions dv ON dv.id = di.document_version_id
        JOIN documents d ON d.id = dv.document_id
        WHERE di.id = ${insightId} AND d.user_id = ${userId}
      `;
      if (!row) {
        return NextResponse.json({ error: "Insight not found or access denied" }, { status: 404 });
      }
      const r = row as {
        document_version_id: string;
        page: number | null;
        source_text: string | null;
        pdf_summary_id: string | null;
      };
      const ref: DocumentReference = {
        document_version_id: r.document_version_id,
        page: r.page != null ? Number(r.page) : null,
        snippet: (r.source_text && truncateSnippet(r.source_text)) || "",
        pdf_summary_id: r.pdf_summary_id ?? null,
        chunk_id: null,
      };
      return NextResponse.json(ref);
    }

    const [row] = await sql`
      SELECT dc.id AS chunk_id, dc.document_version_id, dc.text, dc.start_page, dc.end_page, dv.pdf_summary_id
      FROM document_chunks dc
      JOIN document_versions dv ON dv.id = dc.document_version_id
      JOIN documents d ON d.id = dv.document_id
      WHERE dc.id = ${chunkId} AND d.user_id = ${userId}
    `;
    if (!row) {
      return NextResponse.json({ error: "Chunk not found or access denied" }, { status: 404 });
    }
    const r = row as {
      chunk_id: string;
      document_version_id: string;
      text: string;
      start_page: number | null;
      end_page: number | null;
      pdf_summary_id: string | null;
    };
    const page =
      r.start_page != null && r.end_page != null
        ? Math.round((r.start_page + r.end_page) / 2)
        : (r.start_page ?? r.end_page ?? null);
    const ref: DocumentReference = {
      document_version_id: r.document_version_id,
      page: page != null ? Number(page) : null,
      snippet: truncateSnippet(r.text ?? ""),
      pdf_summary_id: r.pdf_summary_id ?? null,
      chunk_id: r.chunk_id,
    };
    return NextResponse.json(ref);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Documents reference resolve error", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
