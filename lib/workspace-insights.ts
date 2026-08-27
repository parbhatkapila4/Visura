import { getDbConnection } from "./db";
import { getChunksForVersion } from "./versioned-documents";
import { getVersionIdByPdfSummaryId } from "./versioned-documents";
import { openrouterChatCompletion } from "./openrouter";
import { logger } from "./logger";

export const WORKSPACE_INSIGHT_TYPES = ["comparison", "conflict", "aggregate"] as const;
export type WorkspaceInsightType = (typeof WORKSPACE_INSIGHT_TYPES)[number];

export interface WorkspaceInsightRow {
  id: string;
  workspace_id: string;
  type: string;
  title: string;
  description: string;
  source_summary_ids: string[];
  metadata: Record<string, unknown>;
  created_at: string;
}

const MAX_DOCS_FOR_ANALYSIS = 15;
const CHARS_PER_DOC = 8000;

function coerceType(s: unknown): WorkspaceInsightType {
  const t = String(s).toLowerCase();
  if (WORKSPACE_INSIGHT_TYPES.includes(t as WorkspaceInsightType)) return t as WorkspaceInsightType;
  if (/comparison|compare/.test(t)) return "comparison";
  if (/conflict|contradict|discrepancy/.test(t)) return "conflict";
  return "aggregate";
}
async function loadWorkspaceDocumentContents(
  workspaceId: string
): Promise<Array<{ pdf_summary_id: string; title: string; text: string }>> {
  const sql = await getDbConnection();
  const shareRows = await sql`
    SELECT ds.pdf_summary_id, ps.title
    FROM document_shares ds
    INNER JOIN pdf_summaries ps ON ps.id = ds.pdf_summary_id
    WHERE ds.workspace_id = ${workspaceId}
    ORDER BY ds.created_at DESC
  `;

  const out: Array<{ pdf_summary_id: string; title: string; text: string }> = [];
  for (const row of shareRows as { pdf_summary_id: string; title: string | null }[]) {
    const versionId = await getVersionIdByPdfSummaryId(row.pdf_summary_id);
    if (!versionId) continue;
    const chunks = await getChunksForVersion(versionId);
    const sorted = [...chunks].sort((a, b) => a.chunk_index - b.chunk_index);
    const text = sorted
      .map((c) => c.text)
      .join("\n\n")
      .trim();
    if (text.length < 50) continue;
    out.push({
      pdf_summary_id: row.pdf_summary_id,
      title: row.title ?? "Untitled",
      text: text.slice(0, CHARS_PER_DOC),
    });
    if (out.length >= MAX_DOCS_FOR_ANALYSIS) break;
  }
  return out;
}

export async function generateAndStoreWorkspaceInsights(
  workspaceId: string
): Promise<{ count: number }> {
  const sql = await getDbConnection();

  const docs = await loadWorkspaceDocumentContents(workspaceId);
  if (docs.length < 2) {
    await sql`DELETE FROM workspace_insights WHERE workspace_id = ${workspaceId}`;
    return { count: 0 };
  }

  const docBlocks = docs
    .map((d) => `[Document: ${d.title} (id: ${d.pdf_summary_id})]\n${d.text}`)
    .join("\n\n---\n\n");

  const prompt = `You are analyzing multiple documents in a workspace to find comparisons and conflicts.

Document types to detect:
- comparison: Same topic or metric discussed in different documents with different values or conclusions (e.g. "Doc A says revenue $2.1M, Doc B says $3.8M").
- conflict: Contradictions or major discrepancies (e.g. conflicting dates, opposing conclusions).
- aggregate: Summary or synthesis across documents (optional).

For each insight provide:
- type: one of "comparison", "conflict", "aggregate"
- title: short headline
- description: 1-3 sentences explaining the comparison or conflict
- source_summary_ids: array of UUIDs (the pdf_summary_id of each document involved; use the "id:" from the document blocks above)

Return valid JSON only, no markdown:
{"insights":[{"type":"comparison","title":"...","description":"...","source_summary_ids":["uuid1","uuid2"]}]}

Documents (excerpts):
---
${docBlocks.slice(0, 35000)}
---`;

  let raw: string;
  try {
    raw = await openrouterChatCompletion({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 4096,
    });
  } catch (error) {
    logger.warn("Workspace insights AI call failed", {
      workspaceId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  const jsonStr = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
  let parsed: { insights?: unknown[] };
  try {
    parsed = JSON.parse(jsonStr) as { insights?: unknown[] };
  } catch (e) {
    logger.warn("Workspace insights: failed to parse AI response", {
      workspaceId,
      error: e instanceof Error ? e.message : String(e),
    });
    throw new Error("Invalid AI response format");
  }

  const summaryIdSet = new Set(docs.map((d) => d.pdf_summary_id));
  const rawList = Array.isArray(parsed?.insights) ? parsed.insights : [];
  const insights = rawList
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === "object")
    .map((item) => {
      const ids = Array.isArray(item.source_summary_ids)
        ? (item.source_summary_ids as string[]).filter((id) => summaryIdSet.has(String(id)))
        : [];
      if (ids.length === 0) return null;
      return {
        type: coerceType(item.type),
        title:
          String(item.title ?? "")
            .trim()
            .slice(0, 500) || "Untitled",
        description:
          String(item.description ?? "")
            .trim()
            .slice(0, 3000) || "",
        source_summary_ids: ids,
        metadata: (item.metadata && typeof item.metadata === "object" && item.metadata !== null
          ? item.metadata
          : {}) as Record<string, unknown>,
      };
    })
    .filter((i): i is NonNullable<typeof i> => i !== null && i.description.length > 0);

  await sql`DELETE FROM workspace_insights WHERE workspace_id = ${workspaceId}`;

  for (const ins of insights) {
    await sql`
      INSERT INTO workspace_insights (workspace_id, type, title, description, source_summary_ids, metadata)
      VALUES (${workspaceId}, ${ins.type}, ${ins.title}, ${ins.description}, ${ins.source_summary_ids}, ${JSON.stringify(ins.metadata)})
    `;
  }

  logger.info("Workspace insights stored", { workspaceId, count: insights.length });
  return { count: insights.length };
}
