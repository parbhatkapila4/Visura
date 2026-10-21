import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { createJiti } from "jiti";

const ROOT = path.resolve(__dirname, "..");
const CONCURRENCY = 8;
const PRICE_IN = 0.15;
const PRICE_OUT = 0.6;
const PROMPT_TOKENS_PER_CALL = 600;
const TYPICAL_REPLY_TOKENS = 450;
const MAX_REPLY_TOKENS = 1_200;
const TOKENS_PER_WORD = 1.35;

const apply = process.argv.includes("--apply");
const versionId = process.argv.slice(2).find((a) => !a.startsWith("--"));
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
const usage = { calls: 0, failed: 0, promptTokens: 0, completionTokens: 0 };
const pendingUsage: Promise<void>[] = [];
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const response = await realFetch(input, init);
  if (url.startsWith("https://openrouter.ai/") && url.endsWith("/chat/completions")) {
    usage.calls += 1;
    if (!response.ok) {
      usage.failed += 1;
    } else {
      pendingUsage.push(
        response
          .clone()
          .json()
          .then((body) => {
            usage.promptTokens += body?.usage?.prompt_tokens ?? 0;
            usage.completionTokens += body?.usage?.completion_tokens ?? 0;
          })
          .catch(() => {})
      );
    }
  }
  return response;
}) as typeof fetch;

const dollars = (tokensIn: number, tokensOut: number) =>
  (tokensIn * PRICE_IN + tokensOut * PRICE_OUT) / 1_000_000;
const money = (n: number) => `$${n.toFixed(n < 0.1 ? 3 : 2)}`;
const count = (n: number) => n.toLocaleString("en-US");
const sections = (text: string) => (text.match(/^###\s+/gm) ?? []).length;
function ranges(indexes: number[]): string {
  const parts: string[] = [];
  for (let i = 0; i < indexes.length; i++) {
    let j = i;
    while (j + 1 < indexes.length && indexes[j + 1] === indexes[j] + 1) j++;
    parts.push(i === j ? `${indexes[i]}` : `${indexes[i]}–${indexes[j]}`);
    i = j;
  }
  return parts.join(", ");
}

async function main() {
  if (!versionId || !/^[0-9a-f-]{36}$/i.test(versionId)) {
    throw new Error("Usage: npx jiti scripts/summarize-missing-chunks.ts <version-id> [--apply]");
  }

  loadEnvLocal();
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!process.env.DATABASE_URL)
    throw new Error("No DATABASE_URL in the environment or .env.local.");
  if (!process.env.OPENROUTER_API_KEY) throw new Error("No OPENROUTER_API_KEY either.");
  const jiti = createJiti(__filename, { alias: { "@": ROOT } });
  const { generateSummaryFromText, MIN_SUMMARY_TEXT_LENGTH } = await jiti.import<
    typeof import("../lib/openai")
  >(path.join(ROOT, "lib/openai.ts"));
  const { buildFinalSummary } = await jiti.import<typeof import("../lib/final-summary")>(
    path.join(ROOT, "lib/final-summary.ts")
  );
  const { countSummaryWords, deduplicateAndMergeSections } = await jiti.import<
    typeof import("../lib/summary-merge")
  >(path.join(ROOT, "lib/summary-merge.ts"));
  const { getSummaryFinalWordCap, estimatePagesFromTextLength } = await jiti.import<
    typeof import("../lib/summary-length-config")
  >(path.join(ROOT, "lib/summary-length-config.ts"));
  type Language = Parameters<typeof generateSummaryFromText>[1];

  const sql = neon(process.env.DATABASE_URL);

  const [version] = (await sql`
    SELECT dv.id, dv.output_language, dv.pdf_summary_id, ps.status, ps.summary_text,
           ps.share_token IS NOT NULL AS shared
    FROM document_versions dv
    LEFT JOIN pdf_summaries ps ON ps.id = dv.pdf_summary_id
    WHERE dv.id = ${versionId}
  `) as Array<{
    id: string;
    output_language: string | null;
    pdf_summary_id: string | null;
    status: string | null;
    summary_text: string | null;
    shared: boolean;
  }>;
  if (!version) throw new Error(`No version ${versionId}.`);
  if (!version.pdf_summary_id || version.status !== "completed") {
    throw new Error(
      `Version ${versionId} has no completed summary (status: ${version.status ?? "none"}). Recovery finishes versions still processing; this script is for completed ones.`
    );
  }
  const language = (version.output_language || "ENGLISH") as Language;
  const chunks = (await sql`
    SELECT dc.id, dc.chunk_index, dc.text, COALESCE(dc.summary, source.summary) AS summary
    FROM document_chunks dc
    LEFT JOIN document_chunks source ON source.id = dc.reused_from_chunk_id
    WHERE dc.document_version_id = ${versionId}
    ORDER BY dc.chunk_index ASC
  `) as Array<{ id: string; chunk_index: number; text: string; summary: string | null }>;

  const missing = chunks.filter((c) => c.summary === null);
  const short = missing.filter((c) => c.text.trim().length < MIN_SUMMARY_TEXT_LENGTH);
  const toCall = missing.filter((c) => c.text.trim().length >= MIN_SUMMARY_TEXT_LENGTH);

  console.log(
    `Version ${version.id}  summary ${version.pdf_summary_id}${version.shared ? "  (has a share link)" : ""}`
  );
  console.log(
    `${chunks.length} chunks; ${missing.length} have no summary${missing.length ? ` (chunks ${ranges(missing.map((c) => c.chunk_index))})` : ""}; ${short.length} of them too short to need a call.`
  );
  if (missing.length === 0) {
    console.log("Nothing to summarize.");
    return;
  }
  const fullText = chunks.map((c) => c.text).join("\n\n");
  const wordCap = getSummaryFinalWordCap(estimatePagesFromTextLength(fullText.length), false);
  const chunkIn = toCall.reduce(
    (sum, c) => sum + PROMPT_TOKENS_PER_CALL + Math.ceil(c.text.length / 4),
    0
  );
  const chunkOut = toCall.length * TYPICAL_REPLY_TOKENS;
  const chunkOutMax = toCall.length * MAX_REPLY_TOKENS;
  const existing = chunks
    .filter((c) => c.summary?.trim() && c.summary !== c.text.trim())
    .map((c) => c.summary as string);
  const mergedWordsEstimate =
    countSummaryWords(deduplicateAndMergeSections(existing, fullText.length)) +
    Math.round((toCall.length * TYPICAL_REPLY_TOKENS) / TOKENS_PER_WORD);
  const condenses = mergedWordsEstimate > wordCap;
  const condenseIn = condenses ? Math.round(mergedWordsEstimate * TOKENS_PER_WORD) : 0;
  const condenseOutMax = condenses ? Math.round(Math.min(3_000, wordCap) * TOKENS_PER_WORD) : 0;

  console.log("\nEstimate, before any call:");
  console.log(
    `  ${toCall.length} chunk calls: about ${count(chunkIn)} input and ${count(chunkOut)} output tokens (at most ${count(chunkOutMax)} output)`
  );
  console.log(
    condenses
      ? `  then condensing about ${count(mergedWordsEstimate)} merged words to the ${count(wordCap)}-word cap: about ${count(condenseIn)} input and at most ${count(condenseOutMax)} output tokens, one call per part of about 300 words`
      : `  then the merge, about ${count(mergedWordsEstimate)} words, within the ${count(wordCap)}-word cap: no call`
  );
  console.log(
    `  about ${money(dollars(chunkIn + condenseIn, chunkOut + condenseOutMax / 2))} in all, at most ${money(dollars(chunkIn + condenseIn, chunkOutMax + condenseOutMax))} (openai/gpt-4o-mini at $${PRICE_IN} / $${PRICE_OUT} per million tokens)`
  );

  console.log(`\nSummarizing ${toCall.length} chunks, ${CONCURRENCY} at a time.`);
  const summaries = new Map<string, string>(short.map((c) => [c.id, c.text.trim()]));
  const failures: Array<{ index: number; id: string; error: string }> = [];
  let next = 0;
  let done = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, toCall.length) }, async () => {
      while (next < toCall.length) {
        const chunk = toCall[next++];
        try {
          const summary = await generateSummaryFromText(chunk.text, language, { isChunk: true });
          if (!summary?.trim()) throw new Error("empty summary");
          summaries.set(chunk.id, summary);
        } catch (error) {
          failures.push({
            index: chunk.chunk_index,
            id: chunk.id,
            error: error instanceof Error ? error.message : String(error),
          });
        }
        done += 1;
        if (done % 16 === 0 || done === toCall.length) {
          console.log(`  ${done}/${toCall.length}`);
        }
      }
    })
  );
  const chunkCalls = usage.calls;

  if (failures.length > 0) {
    await Promise.all(pendingUsage);
    failures.sort((a, b) => a.index - b.index);
    console.log(`\n${failures.length} of ${toCall.length} chunks failed. Nothing written.`);
    for (const f of failures) console.log(`  chunk ${f.index}  ${f.id}  ${f.error}`);
    console.log(`\nCalls made: ${usage.calls} (${usage.failed} came back with an error).`);
    process.exitCode = 1;
    return;
  }
  const chunkSummaries = chunks
    .map((c) => ({ text: c.text, summary: c.summary ?? summaries.get(c.id) ?? null }))
    .filter((c) => c.summary?.trim() && c.summary !== c.text.trim())
    .map((c) => c.summary as string);
  const built = await buildFinalSummary({
    chunkSummaries,
    fullTextCharLength: fullText.length,
    language,
  });
  await Promise.all(pendingUsage);

  const before = version.summary_text ?? "";
  const after = built.summary;
  console.log(`\nAll ${missing.length} missing chunks summarized.`);
  console.log(
    `summary_text: now ${count(before.length)} chars, ${count(countSummaryWords(before))} words, ${sections(before)} sections` +
      ` -> ${count(after.length)} chars, ${count(countSummaryWords(after))} words, ${sections(after)} sections` +
      ` (merge ${count(built.mergedWords)} words, cap ${count(built.wordCap)}, ${built.method})`
  );
  console.log(
    `Calls made: ${usage.calls} (${chunkCalls} for chunks, ${usage.calls - chunkCalls} to condense; ${usage.failed} came back with an error and were retried).`
  );
  console.log(
    `Tokens: ${count(usage.promptTokens)} input, ${count(usage.completionTokens)} output. Cost: ${money(dollars(usage.promptTokens, usage.completionTokens))}.`
  );

  if (!apply) {
    console.log(
      `\nDry run: nothing written. Run again with --apply to write ${summaries.size} chunk summaries and summary_text.`
    );
    return;
  }

  const ids = [...summaries.keys()];
  const texts = ids.map((id) => summaries.get(id) as string);
  const [result] = (await sql`
    WITH still AS (
      SELECT (SELECT count(*) FROM document_chunks
              WHERE id = ANY(${ids}::uuid[]) AND summary IS NULL) = ${ids.length}
         AND EXISTS (SELECT 1 FROM pdf_summaries
                     WHERE id = ${version.pdf_summary_id} AND status = 'completed'
                       AND summary_text IS NOT DISTINCT FROM ${version.summary_text}) AS ok
    ),
    written_chunks AS (
      UPDATE document_chunks dc
      SET summary = v.summary
      FROM unnest(${ids}::uuid[], ${texts}::text[]) AS v(id, summary), still
      WHERE still.ok AND dc.id = v.id AND dc.summary IS NULL
      RETURNING dc.id
    ),
    written_summary AS (
      UPDATE pdf_summaries
      SET summary_text = ${after}
      FROM still
      WHERE still.ok AND id = ${version.pdf_summary_id}
      RETURNING id
    )
    SELECT (SELECT count(*) FROM written_chunks)::int AS chunks,
           (SELECT count(*) FROM written_summary)::int AS summary
  `) as Array<{ chunks: number; summary: number }>;

  if (result.chunks === ids.length && result.summary === 1) {
    console.log(`\nWrote ${result.chunks} chunk summaries and summary_text.`);
  } else {
    console.log(
      "\nNothing written: a chunk or the summary changed after this run read them. Run it again."
    );
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
