import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbConnection } from "@/lib/db";
import { logger } from "@/lib/logger";
import type { DocumentSection } from "@/lib/document-sections";

export interface SectionsResponse {
  sections: Array<{
    id: string;
    title: string;
    start_page: number;
    end_page: number;
    sort_order: number;
  }>;
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
      SELECT dv.id
      FROM document_versions dv
      JOIN documents d ON dv.document_id = d.id
      WHERE dv.id = ${versionId}
        AND dv.document_id = ${documentId}
        AND d.user_id = ${userId}
    `;

    if (!versionRow) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    const rows = await sql`
      SELECT id, title, start_page, end_page, sort_order
      FROM document_sections
      WHERE document_version_id = ${versionId}
      ORDER BY sort_order ASC, start_page ASC
    `;

    const sections: SectionsResponse["sections"] = (rows as DocumentSection[]).map((r) => ({
      id: r.id,
      title: r.title,
      start_page: Number(r.start_page),
      end_page: Number(r.end_page),
      sort_order: Number(r.sort_order),
    }));

    return NextResponse.json({ sections });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Sections API error", err, { versionId: (await params).versionId });
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
