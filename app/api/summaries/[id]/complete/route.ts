import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbConnection } from "@/lib/db";
import { getChunksForVersion } from "@/lib/versioned-documents";
import { logger } from "@/lib/logger";

function buildReadableOverview(fullText: string): string {
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  const excerptLen = Math.min(fullText.length, 25000);
  const excerpt = fullText.slice(0, excerptLen);
  const paragraphs = excerpt
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .slice(0, 80);
  const readable = paragraphs.join("\n\n");
  const more = fullText.length > excerptLen;
  return `### Document overview\n\nThis document has **${wordCount}** words. You can read the content below and use **Chat** to ask questions.\n\n---\n\n${readable}${more ? "\n\n---\n\n*[... rest of document available in chat ...]*" : ""}`;
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await props.params;
    const summaryId = params.id;
    if (!summaryId) {
      return NextResponse.json({ error: "Summary ID required" }, { status: 400 });
    }

    const sql = await getDbConnection();

    const [summary] = await sql`
      SELECT id, user_id, summary_text, status, title
      FROM pdf_summaries
      WHERE id = ${summaryId} AND user_id = ${userId}
    `;
    if (!summary) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 });
    }

    if (summary.status === "completed" && summary.summary_text && summary.summary_text.trim().length > 100) {
      const isError = summary.summary_text.includes("Summary generation failed") || summary.summary_text.includes("could not be linked");
      if (!isError) {
        return NextResponse.json({ ok: true, message: "Already has summary" });
      }
    }

    const [versionRow] = await sql`
      SELECT id FROM document_versions
      WHERE pdf_summary_id = ${summaryId}
      LIMIT 1
    `;

    let finalSummary: string;
    if (!versionRow) {
      finalSummary = "### Document summary\n\nThis document could not be linked to stored content. Please re-upload the file from the upload page to generate a readable overview.";
    } else {
      const chunks = await getChunksForVersion(versionRow.id);
      const sortedChunks = chunks.sort((a, b) => a.chunk_index - b.chunk_index);
      const fullText = sortedChunks.map((c) => c.text).join("\n\n").trim();

      if (fullText.length > 0) {
        finalSummary = buildReadableOverview(fullText);
      } else {
        finalSummary = "### Document summary\n\nThis document has no extractable text. You can still use chat if content is added later.";
      }
    }

    await sql`
      UPDATE pdf_summaries
      SET summary_text = ${finalSummary},
          status = 'completed'
      WHERE id = ${summaryId} AND user_id = ${userId}
    `;

    logger.info("Summary completed via /complete API", { summaryId, length: finalSummary.length });
    return NextResponse.json({ ok: true, completed: true });
  } catch (error) {
    logger.error("Complete summary API error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete summary" },
      { status: 500 }
    );
  }
}
