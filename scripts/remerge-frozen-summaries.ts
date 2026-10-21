import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

const ROOT = path.resolve(__dirname, "..");
const apply = process.argv.includes("--apply");
const since =
  process.argv.find((a) => a.startsWith("--since="))?.slice("--since=".length) ?? "2026-03-14";

if (!/^\d{4}-\d{2}-\d{2}$/.test(since)) {
  throw new Error(`--since must be a date like 2026-03-14, not "${since}"`);
}
function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const eq = line.indexOf("=");
    if (eq < 1 || line.trimStart().startsWith("#")) continue;
    const key = line.slice(0, eq).trim();
    const value = line
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

const sections = (summary: string) => (summary.match(/^###\s+/gm) ?? []).length;

async function main() {
  loadEnvLocal();
  if (!process.env.DATABASE_URL)
    throw new Error("No DATABASE_URL in the environment or .env.local.");
  const { buildFinalSummary } = await import("../lib/final-summary");
  const { countSummaryWords } = await import("../lib/summary-merge");
  type Language = Parameters<typeof buildFinalSummary>[0]["language"];

  const sql = neon(process.env.DATABASE_URL);

  const candidates = (await sql`
    SELECT dv.id AS version_id, dv.new_chunks, dv.total_chunks, dv.output_language,
           ps.id AS pdf_summary_id, ps.summary_text, ps.share_token IS NOT NULL AS shared
    FROM document_versions dv
    JOIN pdf_summaries ps ON ps.id = dv.pdf_summary_id
    WHERE ps.status = 'completed' AND dv.new_chunks >= 2 AND dv.created_at >= ${since}
    ORDER BY dv.created_at ASC
  `) as Array<{
    version_id: string;
    new_chunks: number;
    total_chunks: number;
    output_language: string | null;
    pdf_summary_id: string;
    summary_text: string | null;
    shared: boolean;
  }>;

  console.log(
    `${candidates.length} completed summaries since ${since} with 2+ new chunks. ${apply ? "Writing." : "Dry run: nothing is written."}\n`
  );

  let written = 0;
  let wouldWrite = 0;

  for (const row of candidates) {
    const chunks = (await sql`
      SELECT dc.chunk_index, dc.text, COALESCE(dc.summary, source.summary) AS summary
      FROM document_chunks dc
      LEFT JOIN document_chunks source ON source.id = dc.reused_from_chunk_id
      WHERE dc.document_version_id = ${row.version_id}
      ORDER BY dc.chunk_index ASC
    `) as Array<{ chunk_index: number; text: string; summary: string | null }>;

    const fullText = chunks.map((c) => c.text).join("\n\n");
    const chunkSummaries = chunks
      .filter((c) => c.summary?.trim() && c.summary !== c.text.trim())
      .map((c) => c.summary as string);
    const withSummary = chunks.filter((c) => c.summary?.trim()).length;

    const current = row.summary_text ?? "";
    const label = `version ${row.version_id}  summary ${row.pdf_summary_id}`;

    if (chunkSummaries.length === 0) {
      console.log(`skip   ${label}  no chunk summaries to merge`);
      continue;
    }

    const built = await buildFinalSummary({
      chunkSummaries,
      fullTextCharLength: fullText.length,
      language: (row.output_language || "ENGLISH") as Language,
    });
    const rebuilt = built.summary;
    const partial = withSummary < chunks.length;
    const detail =
      `\n         chunks ${withSummary}/${chunks.length} summarized` +
      (partial ? " (PARTIAL: some chunks never got a summary)" : "") +
      (row.shared ? ", has a share link" : "") +
      `\n         now      ${current.length} chars, ${countSummaryWords(current)} words, ${sections(current)} sections` +
      `\n         merged   ${built.mergedWords} words before the cap` +
      `\n         rebuilt  ${rebuilt.length} chars, ${countSummaryWords(rebuilt)} words, ${sections(rebuilt)} sections` +
      `  (cap ${built.wordCap} words, ${built.method})`;

    if (!rebuilt.trim() || rebuilt === current) {
      console.log(`same   ${label}${detail}`);
      continue;
    }

    wouldWrite += 1;
    if (!apply) {
      console.log(`would  ${label}${detail}`);
      continue;
    }

    const updated = await sql`
      UPDATE pdf_summaries
      SET summary_text = ${rebuilt}
      WHERE id = ${row.pdf_summary_id}
        AND status = 'completed'
        AND summary_text IS NOT DISTINCT FROM ${row.summary_text}
      RETURNING id
    `;
    if (updated.length > 0) {
      written += 1;
      console.log(`wrote  ${label}${detail}`);
    } else {
      console.log(`moved  ${label}  changed since it was read; left alone`);
    }
  }

  console.log(
    apply
      ? `\nRewrote ${written} of ${wouldWrite} summaries.`
      : `\n${wouldWrite} summaries would be rewritten. Run again with --apply to write them.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
