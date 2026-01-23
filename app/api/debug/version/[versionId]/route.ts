import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbConnection } from "@/lib/db";
import { isVersionComplete } from "@/lib/versioned-documents";

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
        dv.version_number,
        dv.total_chunks,
        dv.new_chunks,
        dv.reused_chunks,
        d.user_id,
        d.title
      FROM document_versions dv
      JOIN documents d ON dv.document_id = d.id
      WHERE dv.id = ${versionId}
        AND d.user_id = ${userId}
    `;

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    const chunks = await sql`
      SELECT 
        id,
        chunk_index,
        summary IS NOT NULL as has_summary,
        reused_from_chunk_id IS NOT NULL as is_reused,
        reused_from_chunk_id,
        LENGTH(summary) as summary_length,
        created_at,
        updated_at
      FROM document_chunks
      WHERE document_version_id = ${versionId}
      ORDER BY chunk_index ASC
    `;

    const complete = await isVersionComplete(versionId);

    return NextResponse.json({
      version: {
        id: version.id,
        documentId: version.document_id,
        versionNumber: version.version_number,
        pdfSummaryId: version.pdf_summary_id,
        totalChunks: version.total_chunks,
        newChunks: version.new_chunks,
        reusedChunks: version.reused_chunks,
        isComplete: complete,
        hasSummary: version.pdf_summary_id !== null,
      },
      chunks: chunks.map(c => ({
        id: c.id,
        index: c.chunk_index,
        hasSummary: c.has_summary,
        isReused: c.is_reused,
        reusedFrom: c.reused_from_chunk_id,
        summaryLength: Number(c.summary_length || 0),
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })),
      summary: {
        totalChunks: chunks.length,
        chunksWithSummary: chunks.filter(c => c.has_summary).length,
        chunksWithoutSummary: chunks.filter(c => !c.has_summary).length,
        reusedChunks: chunks.filter(c => c.is_reused).length,
        newChunks: chunks.filter(c => !c.is_reused).length,
      },
    });
  } catch (error) {
    console.error("Debug version error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
