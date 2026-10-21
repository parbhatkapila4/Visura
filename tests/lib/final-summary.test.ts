import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { openrouterChatCompletion } = vi.hoisted(() => ({ openrouterChatCompletion: vi.fn() }));
vi.mock("@/lib/openrouter", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/openrouter")>()),
  openrouterChatCompletion,
}));

import { buildFinalSummary } from "@/lib/final-summary";
import { SUMMARY_MODEL } from "@/lib/openrouter";
import { countSummaryWords, deduplicateAndMergeSections } from "@/lib/summary-merge";
import { getSummaryFinalWordCap } from "@/lib/summary-length-config";

const WORDS = "alpha bravo charlie delta echo foxtrot golf hotel india juliet".split(" ");
const line = (chunk: number, section: string, n: number) =>
  `- Chunk ${chunk} ${section} point ${n}: ${WORDS.join(" ")} ends here.`;

function chunkSummary(chunk: number): string {
  return [
    "### Executive summary",
    "",
    line(chunk, "summary", 1),
    line(chunk, "summary", 2),
    line(chunk, "summary", 3),
    "",
    "### Risks",
    "",
    line(chunk, "risk", 1),
    line(chunk, "risk", 2),
  ].join("\n");
}

const chunks = (n: number) => Array.from({ length: n }, (_, i) => chunkSummary(i + 1));
const FULL_TEXT = 20_000; // about 11 pages
const CAP = getSummaryFinalWordCap(11, false);

function sectionReply(words: number, lead = ""): string {
  const bullet = "- The agreement renews each year unless either party gives notice in writing.";
  return lead + Array.from({ length: Math.ceil(words / 13) }, () => bullet).join("\n");
}

const promptOf = (call: number) =>
  openrouterChatCompletion.mock.calls[call][0].messages
    .map((m: { content: string }) => m.content)
    .join("\n");

const headings = (summary: string) => summary.split("\n").filter((l) => l.startsWith("###"));

beforeEach(() => {
  openrouterChatCompletion.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("buildFinalSummary", () => {
  it("uses the budget the single-pass summarizer uses", () => {
    expect(CAP).toBe(3_500);
  });

  it("keeps the merge as it is, with no model call, when it is within the budget", async () => {
    const input = chunks(5);
    const result = await buildFinalSummary({
      chunkSummaries: input,
      fullTextCharLength: FULL_TEXT,
    });

    expect(result.method).toBe("merged");
    expect(result.summary).toBe(deduplicateAndMergeSections(input, FULL_TEXT));
    expect(openrouterChatCompletion).not.toHaveBeenCalled();
  });

  it("condenses each section over its share in parts of about 300 words and keeps the merge's headings", async () => {
    openrouterChatCompletion.mockResolvedValue(sectionReply(250));

    const result = await buildFinalSummary({
      chunkSummaries: chunks(120),
      fullTextCharLength: FULL_TEXT,
    });

    expect(result.mergedWords).toBeGreaterThan(CAP);
    expect(result.method).toBe("condensed");
    const prompts = openrouterChatCompletion.mock.calls.map((_, i) => promptOf(i));
    const summaryParts = prompts.filter((p) => p.includes('for the "Executive summary" section'));
    const riskParts = prompts.filter((p) => p.includes('for the "Risks" section'));
    expect(summaryParts).toHaveLength(4);
    expect(riskParts).toHaveLength(3);
    expect(summaryParts.some((p) => p.includes("Chunk 1 summary point 1"))).toBe(true);
    expect(summaryParts.some((p) => p.includes("Chunk 120 summary point 3"))).toBe(true);
    expect(riskParts.some((p) => p.includes("Chunk 120 risk point 2"))).toBe(true);
    for (const p of summaryParts) expect(p).toContain("about 300 words, and never more than 450");
    for (const p of riskParts) expect(p).toMatch(/about 26[67] words, and never more than 400/);
    expect(headings(result.summary)).toEqual(["### Executive summary", "### Risks"]);
  });

  it("uses the summary model for every call", async () => {
    openrouterChatCompletion.mockResolvedValue(sectionReply(250));

    await buildFinalSummary({ chunkSummaries: chunks(120), fullTextCharLength: FULL_TEXT });

    expect(openrouterChatCompletion).toHaveBeenCalled();
    for (const [request] of openrouterChatCompletion.mock.calls) {
      expect(request.model).toBe(SUMMARY_MODEL);
    }
  });

  it("never asks one call for more than about 300 words or gives it more than 6,000 words of notes", async () => {
    openrouterChatCompletion.mockResolvedValue(sectionReply(250));
    const big = Array.from({ length: 2_350 }, (_, i) => line(i + 1, "summary", 1));
    const small = Array.from({ length: 382 }, (_, i) => line(i + 1, "risk", 1));
    const input = [
      ["### Executive summary", "", ...big].join("\n"),
      ["### Risks", "", ...small].join("\n"),
    ];

    const result = await buildFinalSummary({
      chunkSummaries: input,
      fullTextCharLength: 90_000,
    });

    expect(result.method).toBe("condensed");
    for (const [request] of openrouterChatCompletion.mock.calls) {
      const prompt = request.messages[1].content as string;
      const aim = Number(prompt.match(/about (\d+) words/)![1]);
      const notes = prompt.slice(prompt.indexOf("Notes:"));
      expect(aim).toBeLessThanOrEqual(300);
      expect(countSummaryWords(notes)).toBeLessThanOrEqual(6_001);
    }

    const riskCalls = openrouterChatCompletion.mock.calls.filter(([request]) =>
      (request.messages[1].content as string).includes('for the "Risks" section')
    );
    expect(riskCalls).toHaveLength(2);
  });

  it("keeps a section already within its share as merged, without a call", async () => {
    openrouterChatCompletion.mockResolvedValue(sectionReply(600));
    const input = [
      chunkSummary(1),
      ...Array.from({ length: 119 }, (_, i) =>
        ["### Executive summary", "", line(i + 2, "summary", 1), line(i + 2, "summary", 2)].join(
          "\n"
        )
      ),
    ];

    const result = await buildFinalSummary({
      chunkSummaries: input,
      fullTextCharLength: FULL_TEXT,
    });

    expect(result.method).toBe("condensed");
    for (const [request] of openrouterChatCompletion.mock.calls) {
      expect(request.messages[1].content).toContain('for the "Executive summary" section');
    }
    expect(result.summary).toContain(line(1, "risk", 1));
    expect(result.summary).toContain(line(1, "risk", 2));
  });

  it("trims overlong replies by whole lines and drops headings and lead-ins from a reply", async () => {
    openrouterChatCompletion.mockResolvedValue(
      sectionReply(5_000, "Here is the condensed section:\n\n### Stray heading\n")
    );

    const result = await buildFinalSummary({
      chunkSummaries: chunks(120),
      fullTextCharLength: FULL_TEXT,
    });

    expect(result.method).toBe("condensed");
    expect(countSummaryWords(result.summary)).toBeLessThanOrEqual(CAP);
    const body = result.summary
      .split("\n")
      .filter((l) => !l.startsWith("###"))
      .join("\n");
    expect(countSummaryWords(body)).toBeLessThanOrEqual(3_000);
    expect(result.summary).not.toContain("Stray heading");
    expect(result.summary).not.toContain("Here is the condensed section");
    expect(headings(result.summary)).toEqual(["### Executive summary", "### Risks"]);
    for (const l of result.summary.split("\n")) {
      if (l.startsWith("- ")) expect(l.endsWith("in writing.")).toBe(true);
    }
  });

  it("selects lines within the budget when a call fails", async () => {
    openrouterChatCompletion.mockRejectedValue(new Error("All model attempts failed"));

    const result = await buildFinalSummary({
      chunkSummaries: chunks(120),
      fullTextCharLength: FULL_TEXT,
    });

    expect(result.method).toBe("selected");
    expect(countSummaryWords(result.summary)).toBeLessThanOrEqual(CAP);
    expect(result.summary).toContain("Chunk 120 ");
  });

  it("selects lines when a reply is empty", async () => {
    openrouterChatCompletion.mockResolvedValue("");

    const result = await buildFinalSummary({
      chunkSummaries: chunks(120),
      fullTextCharLength: FULL_TEXT,
    });

    expect(result.method).toBe("selected");
  });

  it("stops waiting after 45 seconds and selects lines instead", async () => {
    vi.useFakeTimers();
    openrouterChatCompletion.mockReturnValue(new Promise(() => {}));

    const pending = buildFinalSummary({
      chunkSummaries: chunks(120),
      fullTextCharLength: FULL_TEXT,
    });
    await vi.advanceTimersByTimeAsync(45_000);
    const result = await pending;

    expect(result.method).toBe("selected");
    expect(countSummaryWords(result.summary)).toBeLessThanOrEqual(CAP);
  });

  it("asks for the document's own language", async () => {
    openrouterChatCompletion.mockResolvedValue(sectionReply(600));

    await buildFinalSummary({
      chunkSummaries: chunks(120),
      fullTextCharLength: FULL_TEXT,
      language: "FRENCH",
    });

    expect(openrouterChatCompletion).toHaveBeenCalled();
    openrouterChatCompletion.mock.calls.forEach((_, i) => {
      expect(promptOf(i)).toContain("Write in French.");
    });
  });
});
