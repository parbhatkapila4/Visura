import { LANGUAGE_NAMES, type SupportedLanguage } from "./document-language";
import { logger } from "./logger";
import { openrouterChatCompletion, SUMMARY_MODEL } from "./openrouter";
import {
  FULL_SUMMARY_TARGET_WORDS,
  estimatePagesFromTextLength,
  getSummaryFinalWordCap,
} from "./summary-length-config";
import {
  countSummaryWords,
  deduplicateAndMergeSections,
  joinSections,
  mergeWithinWordBudget,
  splitSections,
  trimToWordBudget,
} from "./summary-merge";
const CONDENSE_TIMEOUT_MS = 45_000;
const CONDENSE_CONCURRENCY = 16;
const MAX_CALL_AIM_WORDS = 300;
const MAX_CALL_INPUT_WORDS = 6_000;
const CONDENSE_INPUT_MAX_WORDS = 50_000;
const MIN_SECTION_WORDS = 40;
const MIN_CONDENSED_WORDS = 50;

export type FinalSummaryMethod = "merged" | "condensed" | "selected";

export interface FinalSummary {
  summary: string;
  method: FinalSummaryMethod;
  wordCap: number;
  mergedWords: number;
}

export async function buildFinalSummary({
  chunkSummaries,
  fullTextCharLength,
  language = "ENGLISH",
}: {
  chunkSummaries: string[];
  fullTextCharLength: number;
  language?: SupportedLanguage;
}): Promise<FinalSummary> {
  const merged = deduplicateAndMergeSections(chunkSummaries, fullTextCharLength);
  const wordCap = getSummaryFinalWordCap(
    estimatePagesFromTextLength(Math.max(fullTextCharLength, 1)),
    false
  );
  const mergedWords = countSummaryWords(merged);

  if (mergedWords <= wordCap) {
    return { summary: merged, method: "merged", wordCap, mergedWords };
  }

  try {
    const notes =
      mergedWords <= CONDENSE_INPUT_MAX_WORDS
        ? merged
        : mergeWithinWordBudget(chunkSummaries, fullTextCharLength, CONDENSE_INPUT_MAX_WORDS);
    const condensed = trimToWordBudget(
      await withTimeout(condenseBySection(notes, wordCap, language), CONDENSE_TIMEOUT_MS),
      wordCap
    );
    if (/^###\s+\S/m.test(condensed) && countSummaryWords(condensed) >= MIN_CONDENSED_WORDS) {
      return { summary: condensed, method: "condensed", wordCap, mergedWords };
    }
    logger.warn("Condensed summary was unusable; selecting lines from the chunk summaries", {
      words: countSummaryWords(condensed),
      wordCap,
    });
  } catch (error) {
    logger.warn("Could not condense the merged summary; selecting lines from the chunk summaries", {
      error: error instanceof Error ? error.message : String(error),
      wordCap,
      mergedWords,
    });
  }

  return {
    summary: mergeWithinWordBudget(chunkSummaries, fullTextCharLength, wordCap),
    method: "selected",
    wordCap,
    mergedWords,
  };
}
async function condenseBySection(
  notes: string,
  wordCap: number,
  language: SupportedLanguage
): Promise<string> {
  const sections = splitSections(notes).filter((s) => s.heading !== null);
  const words = sections.map((s) => countSummaryWords(s.lines.join("\n")));
  const total = Math.max(
    1,
    words.reduce((sum, w) => sum + w, 0)
  );
  const aimTotal = Math.min(FULL_SUMMARY_TARGET_WORDS.min, wordCap);
  const limitTotal = Math.min(FULL_SUMMARY_TARGET_WORDS.max, wordCap);

  const jobs: Array<() => Promise<void>> = [];
  const planned = sections.map((section, i) => {
    const share = words[i] / total;
    const budgetShare = Math.max(MIN_SECTION_WORDS, Math.floor(wordCap * share));
    if (words[i] <= budgetShare) return { section, parts: null };

    const limit = Math.max(
      MIN_SECTION_WORDS,
      Math.min(budgetShare, Math.round(limitTotal * share))
    );
    const aim = Math.max(MIN_SECTION_WORDS, Math.min(limit, Math.round(aimTotal * share)));
    const groups = splitLines(
      section.lines,
      Math.max(Math.ceil(aim / MAX_CALL_AIM_WORDS), Math.ceil(words[i] / MAX_CALL_INPUT_WORDS))
    );
    const title = (section.heading ?? "").replace(/^###\s+/, "").trim();
    const parts = new Array<string>(groups.length);

    groups.forEach((lines, k) => {
      const fraction = countSummaryWords(lines.join("\n")) / Math.max(1, words[i]);
      const partAim = Math.max(MIN_SECTION_WORDS, Math.round(aim * fraction));
      const partLimit = Math.max(partAim, Math.round(limit * fraction));
      jobs.push(async () => {
        const text = await condenseNotes({
          title,
          lines,
          part: groups.length > 1 ? { index: k + 1, of: groups.length } : null,
          aim: partAim,
          limit: partLimit,
          language,
        });
        parts[k] = trimToWordBudget(text, partLimit);
      });
    });

    return { section, parts };
  });

  await runLimited(jobs, CONDENSE_CONCURRENCY);

  return joinSections(
    planned.map(({ section, parts }) =>
      parts === null ? section : { heading: section.heading, lines: parts.join("\n\n").split("\n") }
    )
  );
}
function splitLines(lines: string[], count: number): string[][] {
  const content = lines.filter((line) => line.trim());
  if (count <= 1 || content.length <= 1) return [content];

  const total = content.reduce((sum, line) => sum + countSummaryWords(line), 0);
  const groups: string[][] = [];
  let current: string[] = [];
  let seen = 0;
  for (const line of content) {
    current.push(line);
    seen += countSummaryWords(line);
    if (groups.length < count - 1 && seen >= (total * (groups.length + 1)) / count) {
      groups.push(current);
      current = [];
    }
  }
  if (current.length) groups.push(current);
  return groups;
}

async function condenseNotes({
  title,
  lines,
  part,
  aim,
  limit,
  language,
}: {
  title: string;
  lines: string[];
  part: { index: number; of: number } | null;
  aim: number;
  limit: number;
  language: SupportedLanguage;
}): Promise<string> {
  const reply = await openrouterChatCompletion({
    model: SUMMARY_MODEL,
    temperature: 0.3,
    max_tokens: Math.min(16_000, Math.ceil(limit * 1.6) + 128),
    messages: [
      {
        role: "system",
        content:
          "You condense notes into one section of a document summary. The notes were written part by part, and they run from the start of the document to its end.",
      },
      {
        role: "user",
        content: [
          part
            ? `These are notes ${part.index} of ${part.of} for the "${title}" section of a summary of one document. The other notes are condensed separately, so write only about these.`
            : `These are the notes for the "${title}" section of a summary of one document.`,
          "",
          `Rewrite them in about ${aim} words, and never more than ${limit}.`,
          '- Write short paragraphs or "- " bullets. Each one is a complete sentence.',
          "- Cover all of these notes, not only the first ones.",
          "- Keep names, numbers, dates, amounts, deadlines and obligations exactly as the notes give them.",
          "- Use only what the notes say. Add no facts, advice or commentary.",
          `- Write in ${LANGUAGE_NAMES[language] ?? "English"}.`,
          "- Reply with the text only, without a heading.",
          "",
          "Notes:",
          "",
          lines.join("\n"),
        ].join("\n"),
      },
    ],
  });
  const out = reply
    .replace(/```[a-z]*\n?/gi, "")
    .split("\n")
    .filter((line) => !/^#{1,6}\s/.test(line));
  while (
    out.length &&
    (!out[0].trim() || /^(here is|here's|below is|sure|certainly)\b.*:\s*$/i.test(out[0].trim()))
  ) {
    out.shift();
  }
  const text = out.join("\n").trim();
  if (!text) throw new Error(`empty reply for the "${title}" section`);
  return text;
}

async function runLimited(jobs: Array<() => Promise<void>>, limit: number): Promise<void> {
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, jobs.length) }, async () => {
    while (next < jobs.length) {
      const i = next++;
      await jobs[i]();
    }
  });
  await Promise.all(workers);
}

function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`no reply after ${ms} ms`)), ms);
  });
  return Promise.race([work, timeout]).finally(() => clearTimeout(timer));
}
