import { getDbConnection } from "./db";
import { getChunksForVersion } from "./versioned-documents";
import { openrouterChatCompletion } from "./openrouter";
import { logger } from "./logger";

export const DOCUMENT_INSIGHT_TYPES = [
  "key_insight",
  "risk",
  "financial_highlight",
  "actionable_point",
  "important_fact",
] as const;

export type DocumentInsightType = (typeof DOCUMENT_INSIGHT_TYPES)[number];

export interface DocumentInsight {
  id: string;
  document_version_id: string;
  type: DocumentInsightType;
  title: string;
  description: string;
  confidence: number;
  page: number | null;
  source_text: string | null;
  created_at?: Date;
}

export interface DocumentInsightInput {
  type: DocumentInsightType;
  title: string;
  description: string;
  confidence: number;
  page: number | null;
  source_text: string | null;
}

const EXCERPT_LENGTH = 18000;

function coerceType(s: unknown): DocumentInsightType {
  const t = String(s).toLowerCase().replace(/\s+/g, "_");
  if (DOCUMENT_INSIGHT_TYPES.includes(t as DocumentInsightType)) return t as DocumentInsightType;
  if (/key|insight/.test(t)) return "key_insight";
  if (/risk/.test(t)) return "risk";
  if (/financial|highlight/.test(t)) return "financial_highlight";
  if (/actionable|action/.test(t)) return "actionable_point";
  if (/fact|important/.test(t)) return "important_fact";
  return "key_insight";
}

function clampConfidence(n: unknown): number {
  const v = typeof n === "number" && !Number.isNaN(n) ? n : Number(n);
  if (typeof v !== "number" || Number.isNaN(v)) return 0.8;
  return Math.max(0, Math.min(1, v));
}

export async function generateAndStoreDocumentInsights(versionId: string): Promise<void> {
  try {
    const chunks = await getChunksForVersion(versionId);
    const sorted = [...chunks].sort((a, b) => a.chunk_index - b.chunk_index);
    const fullText = sorted.map((c) => c.text).join("\n\n").trim();

    if (!fullText || fullText.length < 100) {
      logger.info("Document too short for insight extraction", { versionId, length: fullText.length });
      await deleteInsightsForVersion(versionId);
      return;
    }

    const sql = await getDbConnection();
    const sectionRows = await sql`
      SELECT title, start_page, end_page
      FROM document_sections
      WHERE document_version_id = ${versionId}
      ORDER BY sort_order ASC, start_page ASC
    `;
    const sectionsContext =
      sectionRows.length > 0
        ? `\nDocument sections (for page alignment): ${JSON.stringify(sectionRows.slice(0, 30))}`
        : "";

    const prompt = `You are analyzing a document to extract structured insights for the reader.

Categories (use exactly these "type" values):
- key_insight: Main takeaways, conclusions, or central ideas
- risk: Risks, caveats, or warnings
- financial_highlight: Financial figures, metrics, or monetary implications
- actionable_point: Recommended actions, next steps, or things to do
- important_fact: Notable facts, dates, or data points

For each insight provide:
- type: one of key_insight, risk, financial_highlight, actionable_point, important_fact
- title: short headline (e.g. "Revenue growth in Q3")
- description: 1-3 sentences explaining the insight
- confidence: number between 0 and 1 (e.g. 0.9 for high confidence)
- page: optional integer (1-based) if you can infer from content/sections; use null if unknown
- source_text: optional short quote from the document (snippet) that supports the insight; null if not applicable

Extract multiple insights across categories. Return valid JSON only, no markdown:
{"insights": [{"type": "key_insight", "title": "...", "description": "...", "confidence": 0.9, "page": 1, "source_text": "..."}, ...]}
${sectionsContext}

Document excerpt (first ${EXCERPT_LENGTH} chars):
---
${fullText.slice(0, EXCERPT_LENGTH)}
---`;

    const raw = await openrouterChatCompletion({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 4096,
    });

    const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    let parsed: { insights?: unknown[] };
    try {
      parsed = JSON.parse(jsonStr) as { insights?: unknown[] };
    } catch (e) {
      logger.warn("Insight extraction: failed to parse AI response as JSON", {
        versionId,
        error: e instanceof Error ? e.message : String(e),
        preview: jsonStr.slice(0, 200),
      });
      return;
    }

    const rawList = Array.isArray(parsed?.insights) ? parsed.insights : [];
    const insights: DocumentInsightInput[] = rawList
      .filter(
        (item): item is Record<string, unknown> =>
          item !== null && typeof item === "object"
      )
      .map((item) => ({
        type: coerceType(item.type),
        title: String(item.title ?? "").trim().slice(0, 500) || "Untitled",
        description: String(item.description ?? "").trim().slice(0, 5000) || "",
        confidence: clampConfidence(item.confidence),
        page:
          typeof item.page === "number" && !Number.isNaN(item.page) && item.page >= 1
            ? Math.floor(item.page)
            : null,
        source_text:
          item.source_text != null && String(item.source_text).trim()
            ? String(item.source_text).trim().slice(0, 2000)
            : null,
      }))
      .filter((i) => i.description.length > 0);

    if (insights.length === 0) {
      await deleteInsightsForVersion(versionId);
      return;
    }

    await deleteInsightsForVersion(versionId);
    for (const ins of insights) {
      await sql`
        INSERT INTO document_insights (
          document_version_id, type, title, description, confidence, page, source_text
        )
        VALUES (
          ${versionId},
          ${ins.type},
          ${ins.title},
          ${ins.description},
          ${ins.confidence},
          ${ins.page},
          ${ins.source_text}
        )
      `;
    }
    logger.info("Document insights stored", { versionId, count: insights.length });
  } catch (error) {
    logger.warn("Insight extraction failed (non-fatal)", {
      versionId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function deleteInsightsForVersion(versionId: string): Promise<void> {
  const sql = await getDbConnection();
  await sql`DELETE FROM document_insights WHERE document_version_id = ${versionId}`;
}
