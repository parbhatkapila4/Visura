import { getDbConnection } from "./db";
import { getChunksForVersion } from "./versioned-documents";
import { openrouterChatCompletion } from "./openrouter";
import { logger } from "./logger";

export interface DocumentSection {
  id: string;
  document_version_id: string;
  title: string;
  start_page: number;
  end_page: number;
  sort_order: number;
  created_at?: Date;
}

const CHARS_PER_PAGE_ESTIMATE = 2500;

export async function generateAndStoreDocumentSections(versionId: string): Promise<void> {
  try {
    const chunks = await getChunksForVersion(versionId);
    const sorted = [...chunks].sort((a, b) => a.chunk_index - b.chunk_index);
    const fullText = sorted.map((c) => c.text).join("\n\n").trim();

    if (!fullText || fullText.length < 100) {
      logger.info("Document too short for section detection", { versionId, length: fullText.length });
      await deleteSectionsForVersion(versionId);
      return;
    }

    const totalPagesEstimate = Math.max(1, Math.ceil(fullText.length / CHARS_PER_PAGE_ESTIMATE));

    const prompt = `You are analyzing a document to extract its logical structure (sections with titles and page ranges).

Document length: approximately ${fullText.length} characters. Assume about ${CHARS_PER_PAGE_ESTIMATE} characters per page, so the document is roughly ${totalPagesEstimate} pages.

Return a JSON array of sections. Each section must have:
- "title": string (short section title, e.g. "Introduction", "Market Analysis", "Conclusion")
- "start_page": number (1-based page number)
- "end_page": number (1-based, >= start_page)

Order sections by start_page. Cover the whole document; use reasonable estimates if exact pages are unknown.
Return ONLY valid JSON, no markdown or explanation. Example:
[{"title":"Introduction","start_page":1,"end_page":3},{"title":"Market Analysis","start_page":4,"end_page":10}]

Document excerpt (first 12000 chars):
---
${fullText.slice(0, 12000)}
---`;

    const raw = await openrouterChatCompletion({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 2048,
    });

    const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    let items: Array<{ title: string; start_page: number; end_page: number }>;
    try {
      items = JSON.parse(jsonStr) as Array<{ title: string; start_page: number; end_page: number }>;
    } catch (e) {
      logger.warn("Section detection: failed to parse AI response as JSON", {
        versionId,
        error: e instanceof Error ? e.message : String(e),
        preview: jsonStr.slice(0, 200),
      });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      logger.info("Section detection: no sections returned", { versionId });
      await deleteSectionsForVersion(versionId);
      return;
    }

    const sections = items
      .filter(
        (s) =>
          typeof s.title === "string" &&
          typeof s.start_page === "number" &&
          typeof s.end_page === "number" &&
          s.start_page >= 1 &&
          s.end_page >= s.start_page
      )
      .map((s) => ({
        title: String(s.title).trim().slice(0, 2000) || "Untitled",
        start_page: Math.min(totalPagesEstimate, Math.max(1, Math.floor(s.start_page))),
        end_page: Math.min(totalPagesEstimate, Math.max(1, Math.floor(s.end_page))),
      }))
      .sort((a, b) => a.start_page - b.start_page);

    if (sections.length === 0) {
      await deleteSectionsForVersion(versionId);
      return;
    }

    await deleteSectionsForVersion(versionId);
    const sql = await getDbConnection();
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      await sql`
        INSERT INTO document_sections (document_version_id, title, start_page, end_page, sort_order)
        VALUES (${versionId}, ${s.title}, ${s.start_page}, ${s.end_page}, ${i})
      `;
    }
    logger.info("Document sections stored", { versionId, count: sections.length });
  } catch (error) {
    logger.warn("Section detection failed (non-fatal)", {
      versionId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function deleteSectionsForVersion(versionId: string): Promise<void> {
  const sql = await getDbConnection();
  await sql`DELETE FROM document_sections WHERE document_version_id = ${versionId}`;
}
