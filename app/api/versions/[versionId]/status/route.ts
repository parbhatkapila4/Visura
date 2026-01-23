import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbConnection } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { versionId } = await params;
    const sql = await getDbConnection();

    const [version] = await sql`
      SELECT 
        dv.id,
        dv.pdf_summary_id,
        dv.document_id,
        d.user_id,
        COUNT(dc.id) FILTER (WHERE dc.summary IS NULL AND dc.reused_from_chunk_id IS NULL) as incomplete_chunks,
        COUNT(dc.id) as total_chunks,
        COUNT(dc.id) FILTER (WHERE dc.summary IS NOT NULL) as completed_chunks
      FROM document_versions dv
      JOIN documents d ON dv.document_id = d.id
      LEFT JOIN document_chunks dc ON dv.id = dc.document_version_id
      WHERE dv.id = ${versionId}
        AND d.user_id = ${userId}
      GROUP BY dv.id, dv.pdf_summary_id, dv.document_id, d.user_id
    `;

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    return NextResponse.json({
      versionId: version.id,
      documentId: version.document_id,
      pdfSummaryId: version.pdf_summary_id,
      isComplete: version.pdf_summary_id !== null,
      incompleteChunks: Number(version.incomplete_chunks || 0),
      totalChunks: Number(version.total_chunks || 0),
      completedChunks: Number(version.completed_chunks || 0),
    });
  } catch (error) {
    console.error("Get version status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
