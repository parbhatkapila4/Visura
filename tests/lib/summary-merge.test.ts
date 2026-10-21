import { describe, it, expect } from "vitest";
import {
  countSummaryWords,
  deduplicateAndMergeSections,
  mergeWithinWordBudget,
  trimToWordBudget,
} from "@/lib/summary-merge";


const WORDS = "alpha bravo charlie delta echo foxtrot golf hotel india juliet".split(" ");

function chunkSummary(chunk: number): string {
  const line = (section: string, n: number) =>
    `- Chunk ${chunk} ${section} point ${n}: ${WORDS.join(" ")} ends here.`;
  return [
    "### Executive summary",
    "",
    line("summary", 1),
    line("summary", 2),
    line("summary", 3),
    "",
    "### Key points",
    "",
    line("key", 1),
    line("key", 2),
    line("key", 3),
    "",
    "### Risks",
    "",
    line("risk", 1),
    line("risk", 2),
    line("risk", 3),
  ].join("\n");
}

const chunks = (n: number) => Array.from({ length: n }, (_, i) => chunkSummary(i + 1));
const FULL_TEXT = 20_000; 

function expectWholeLines(summary: string, sources: string[]) {
  const sourceLines = new Set(sources.flatMap((s) => s.split("\n").map((l) => l.trim())));
  for (const line of summary.split("\n")) {
    if (!line.trim() || line.startsWith("###")) continue;
    expect(sourceLines.has(line.trim())).toBe(true);
  }
}

describe("countSummaryWords", () => {
  it("counts words and not markdown markers", () => {
    expect(countSummaryWords("### Key points\n\n- One two three.\n• Four")).toBe(6);
    expect(countSummaryWords("")).toBe(0);
  });
});

describe("mergeWithinWordBudget", () => {
  it("returns the plain merge, unchanged, when it is within the budget", () => {
    const input = chunks(3);
    expect(mergeWithinWordBudget(input, FULL_TEXT, 10_000)).toBe(
      deduplicateAndMergeSections(input, FULL_TEXT)
    );
  });

  it("stays within the budget and keeps whole lines only", () => {
    const input = chunks(40);
    const merged = deduplicateAndMergeSections(input, FULL_TEXT);
    expect(countSummaryWords(merged)).toBeGreaterThan(1_000);

    const capped = mergeWithinWordBudget(input, FULL_TEXT, 1_000);
    expect(countSummaryWords(capped)).toBeLessThanOrEqual(1_000);
    expectWholeLines(capped, input);
  });

  it("keeps the end of the document, not only its start", () => {
    const capped = mergeWithinWordBudget(chunks(40), FULL_TEXT, 1_000);
    expect(capped).toContain("Chunk 1 ");
    expect(capped).toContain("Chunk 40 ");
  });

  it("keeps every section the merge has", () => {
    const capped = mergeWithinWordBudget(chunks(40), FULL_TEXT, 1_000);
    expect(capped).toContain("### Executive summary");
    expect(capped).toContain("### Key points");
    expect(capped).toContain("### Risks");
  });

  it("uses fewer chunks, first and last included, when one line per section is too much", () => {
    const input = chunks(40);
    const capped = mergeWithinWordBudget(input, FULL_TEXT, 500);
    expect(countSummaryWords(capped)).toBeLessThanOrEqual(500);
    expectWholeLines(capped, input);
    expect(capped).toContain("Chunk 1 ");
    expect(capped).toContain("Chunk 40 ");
    const used = new Set([...capped.matchAll(/Chunk (\d+) /g)].map((m) => Number(m[1])));
    expect(used.size).toBeLessThan(40);
    expect(used.size).toBeGreaterThan(2);
  });
});

describe("trimToWordBudget", () => {
  const summary = [
    "### Long",
    "",
    "- one two three four five six seven eight nine ten.",
    "- one two three four five six seven eight nine ten.",
    "- one two three four five six seven eight nine ten.",
    "",
    "### Short",
    "",
    "- one two three.",
  ].join("\n");

  it("leaves a summary within the budget alone", () => {
    expect(trimToWordBudget(summary, 100)).toBe(summary);
  });

  it("drops whole lines from the longest section first", () => {
    const trimmed = trimToWordBudget(summary, 25);
    expect(countSummaryWords(trimmed)).toBeLessThanOrEqual(25);
    expect(trimmed).toContain("### Short\n\n- one two three.");
    expect(trimmed.split("\n").filter((l) => l.startsWith("- one two three four")).length).toBe(2);
  });

  it("removes the heading of a section it empties", () => {
    const trimmed = trimToWordBudget("### Keep\n\n- a b c.\n\n### Gone\n\n- d e f g h i.", 5);
    expect(trimmed).not.toContain("### Gone");
    expect(countSummaryWords(trimmed)).toBeLessThanOrEqual(5);
  });
});
