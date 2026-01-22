import { NextRequest, NextResponse } from "next/server";
import { getDbConnection } from "@/lib/db";
import {
  getChunksForVersion,
  updateChunkSummary,
  linkVersionToSummary,
} from "@/lib/versioned-documents";
import { generateSummaryFromText } from "@/lib/openai";
import { sendAlert } from "@/lib/alerting";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { chunkId, versionId } = await request.json();

    if (!chunkId || !versionId) {
      return NextResponse.json({ error: "chunkId and versionId required" }, { status: 400 });
    }

    const sql = await getDbConnection();
    const [chunk] = await sql`
      SELECT * FROM document_chunks WHERE id = ${chunkId}
    `;

    if (!chunk) {
      return NextResponse.json({ error: "Chunk not found" }, { status: 404 });
    }

    if (chunk.summary) {
      return NextResponse.json({ success: true, message: "Chunk already processed", skipped: true });
    }

    if (chunk.reused_from_chunk_id) {
      if (chunk.summary) {
        return NextResponse.json({ success: true, message: "Reused chunk already processed", skipped: true });
      }

      const [reusedChunk] = await sql`
        SELECT summary FROM document_chunks WHERE id = ${chunk.reused_from_chunk_id}
      `;

      if (!reusedChunk?.summary) {
        sendAlert({
          severity: "warning",
          type: "chunk_processing_failed",
          message: "Reused chunk missing source summary",
          context: {
            chunkId,
            versionId,
            reusedFromChunkId: chunk.reused_from_chunk_id,
          },
        }).catch(() => { });
        return NextResponse.json({
          success: false,
          message: "Reused chunk missing source summary",
          skipped: true
        }, { status: 400 });
      }

      const updated = await updateChunkSummary(chunkId, reusedChunk.summary, null);
      if (updated) {
        await checkVersionCompletion(versionId);
      }
      return NextResponse.json({ success: true, message: "Reused summary", skipped: !updated });
    }

    try {
      const summary = await generateSummaryFromText(chunk.text);
      const updated = await updateChunkSummary(chunkId, summary, null);

      if (!updated) {
        return NextResponse.json({
          success: true,
          message: "Chunk already processed (race condition)",
          skipped: true
        });
      }

      await checkVersionCompletion(versionId);

      return NextResponse.json({ success: true, summary });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error("Chunk processing error:", err);
      sendAlert({
        severity: "warning",
        type: "chunk_processing_failed",
        message: `Chunk processing failed: ${err.message}`,
        context: {
          chunkId,
          versionId,
          errorMessage: err.message,
        },
      }).catch(() => { });
      return NextResponse.json(
        { error: "Processing failed", details: err.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Process chunk error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function checkVersionCompletion(versionId: string): Promise<void> {
  const { isVersionComplete, getChunksForVersion, linkVersionToSummary } = await import("@/lib/versioned-documents");

  const complete = await isVersionComplete(versionId);
  if (!complete) {
    return;
  }

  const sql = await getDbConnection();
  const [version] = await sql`
    SELECT document_id, pdf_summary_id FROM document_versions WHERE id = ${versionId}
  `;

  if (version?.pdf_summary_id) {
    return;
  }

  const allChunks = await getChunksForVersion(versionId);
  const sortedChunks = allChunks.sort((a, b) => a.chunk_index - b.chunk_index);
  const finalSummary = sortedChunks
    .map((chunk) => chunk.summary)
    .filter((s): s is string => s !== null)
    .join("\n\n");

  if (finalSummary) {
    const [pdfSummary] = await sql`
      INSERT INTO pdf_summaries (
        user_id, original_file_url, summary_text, title, file_name, status
      )
      SELECT 
        d.user_id,
        '',
        ${finalSummary},
        d.title,
        '',
        'completed'
      FROM documents d
      WHERE d.id = ${version.document_id}
      RETURNING id
    `;

    await linkVersionToSummary(versionId, pdfSummary.id);
  }
}
