import { describe, it, expect } from "vitest";
import { createHash } from "crypto";
import {
  CHUNKER_VERSION,
  alignSegments,
  attachPages,
  PAGE_BREAK,
  normalizeForComparison,
  quoteIsVerbatim,
  segmentDocument,
  wordDiff,
} from "@/lib/document-segmentation";

function legacyChunk(text: string, chunkSize = 1000) {
  const chunks: Array<{ text: string; hash: string }> = [];
  const words = text.split(/\s+/);
  let cur: string[] = [];
  let size = 0;
  for (const word of words) {
    const w = word.length + 1;
    if (size + w > chunkSize && cur.length > 0) {
      const t = cur.join(" ");
      chunks.push({ text: t, hash: createHash("sha256").update(t).digest("hex") });
      cur = [];
      size = 0;
    }
    cur.push(word);
    size += w;
  }
  if (cur.length) {
    const t = cur.join(" ");
    chunks.push({ text: t, hash: createHash("sha256").update(t).digest("hex") });
  }
  return chunks;
}

function overlap(a: Array<{ hash: string }>, b: Array<{ hash: string }>): number {
  const seen = new Map<string, number>();
  for (const c of a) seen.set(c.hash, (seen.get(c.hash) ?? 0) + 1);
  let hit = 0;
  for (const c of b) {
    const n = seen.get(c.hash) ?? 0;
    if (n > 0) {
      hit++;
      seen.set(c.hash, n - 1);
    }
  }
  return hit / b.length;
}
function buildAgreement(clauses = 90): string {
  const body: string[] = ["MASTER SERVICES AGREEMENT", ""];
  for (let i = 1; i <= clauses; i++) {
    body.push(`${i}. CLAUSE ${i}`);
    body.push(
      `This clause ${i} sets out the obligations of the parties with respect to matter ${i}. ` +
        `Each party shall perform its duties in good faith and with reasonable care. ` +
        `No amendment to this clause ${i} is effective unless made in writing and signed by both parties.`
    );
    if (i % 3 === 0) {
      body.push(
        `Notwithstanding the foregoing, the parties acknowledge that section ${i} may be ` +
          `superseded by a later written instrument executed by authorised representatives.`
      );
    }
    body.push("");
    if (i % 6 === 0) {
      body.push("Acme Corp / Confidential");
      body.push(`Page ${Math.ceil(i / 6)}`);
      body.push("");
    }
  }
  return body.join("\n");
}

describe("normalizeForComparison", () => {
  it("folds the differences a second export introduces but a reader never sees", () => {
    const wordA = 'The "liability" cap - see clause 11.2 - shall apply.';
    const wordB = "The “liability” cap — see clause 11.2 — shall apply.";
    expect(normalizeForComparison(wordB)).toBe(normalizeForComparison(wordA));
  });

  it("rejoins a word hyphenated across a line break", () => {
    expect(normalizeForComparison("indemni-\nfication applies")).toBe("indemnification applies");
  });

  it("collapses ligatures", () => {
    expect(normalizeForComparison("the ﬁnal oﬀer")).toBe("the final offer");
  });

  it("strips running headers and bare page numbers", () => {
    const withFurniture = [
      "Acme Corp / Confidential",
      "Page 1",
      "",
      "Real clause text one.",
      "",
      "Acme Corp / Confidential",
      "Page 2",
      "",
      "Real clause text two.",
      "",
      "Acme Corp / Confidential",
      "Page 3",
      "",
      "Real clause text three.",
    ].join("\n");
    const out = normalizeForComparison(withFurniture);
    expect(out).not.toContain("Acme Corp / Confidential");
    expect(out).not.toMatch(/^Page \d+$/m);
    expect(out).toContain("Real clause text two.");
  });

  it("never strips repeated body text, however often it repeats", () => {
    const lines: string[] = [];
    for (let i = 1; i <= 6; i++) {
      lines.push(`Section ${i}`, "of the parties hereto", "The Parties agree as follows.", "");
    }
    const out = normalizeForComparison(lines.join("\n"));
    expect(out).toContain("of the parties hereto");
    expect(out).toContain("The Parties agree as follows.");
  });

  it("rejoins a word hyphenated across a page break, header and all", () => {
    const paged = [
      "the obliga-",
      "Acme Corp / Confidential",
      "Page 4",
      "",
      "tions of the parties",
      "",
      "more text here",
      "Acme Corp / Confidential",
      "Page 5",
      "",
      "and yet more",
      "",
      "Acme Corp / Confidential",
      "Page 6",
      "",
      "final line",
    ].join("\n");
    const out = normalizeForComparison(paged);
    expect(out).toContain("obligations of the parties");
    expect(out).not.toContain("Acme Corp / Confidential");
  });

  it("is idempotent", () => {
    const once = normalizeForComparison(buildAgreement(12));
    expect(normalizeForComparison(once)).toBe(once);
  });
});
describe("page furniture, with real page structure", () => {
  const page = (...lines: string[]) => lines.join("\n");

  it("strips a running header that carries its own page number", () => {
    const doc = [
      page(
        "Acme Corp / Confidential",
        "1",
        "1. DEFINITIONS",
        "The Services are those described in Schedule 1."
      ),
      page(
        "Acme Corp / Confidential",
        "2",
        "2. TERM",
        "This agreement continues for twelve months."
      ),
    ].join(PAGE_BREAK);

    const out = normalizeForComparison(doc);
    expect(out).not.toContain("Acme Corp");
    expect(out).toContain("1. DEFINITIONS");
    expect(out).toContain("2. TERM");
  });

  it("reports no change when the same contract is paginated differently", () => {
    const body = [
      "1. DEFINITIONS",
      "The Services are those described in Schedule 1, and the Fees are those set out in Schedule 2.",
      "2. TERM",
      "This agreement commences on the Effective Date and continues for twelve months.",
      "3. FEES",
      "The Customer shall pay the Fees within thirty days of receipt of a valid invoice.",
      "4. TERMINATION",
      "Either party may terminate on thirty days written notice.",
    ];
    const paginate = (breakAfter: number) => {
      const header = (n: number) => ["Acme Corp / Confidential", String(n)];
      return [
        page(...header(1), ...body.slice(0, breakAfter)),
        page(...header(2), ...body.slice(breakAfter)),
      ].join(PAGE_BREAK);
    };
    expect(normalizeForComparison(paginate(3))).toBe(normalizeForComparison(paginate(5)));
  });

  it("keeps a repeated line that is a complete sentence", () => {
    const line = "This page is intentionally left blank.";
    const doc = [page(line, "1"), page(line, "2"), page(line, "3")].join(PAGE_BREAK);
    expect(normalizeForComparison(doc)).toContain(line);
  });

  it("keeps a line that appears at a page edge on only one page", () => {
    const doc = [
      page("SCHEDULE 1", "The Services", "Delivery of the platform."),
      page("2. TERM", "This agreement continues for twelve months."),
    ].join(PAGE_BREAK);
    expect(normalizeForComparison(doc)).toContain("SCHEDULE 1");
  });

  it("keeps a repeated phrase that sits in the body rather than at an edge", () => {
    const filler = (n: number) => `Clause ${n} sets out an obligation of the Supplier.`;
    const doc = [
      page("HEAD", filler(1), "Subject to clause 9", filler(2), "FOOT"),
      page("HEAD", filler(3), "Subject to clause 9", filler(4), "FOOT"),
    ].join(PAGE_BREAK);
    const out = normalizeForComparison(doc);
    expect(out).toContain("Subject to clause 9");
    expect(out).not.toContain("HEAD");
    expect(out).not.toContain("FOOT");
  });

  it("rejoins a word hyphenated across a page break", () => {
    const doc = [
      page("Acme Corp / Confidential", "1", "The Supplier shall meet its obli-"),
      page("Acme Corp / Confidential", "2", "gations under this agreement."),
    ].join(PAGE_BREAK);
    expect(normalizeForComparison(doc)).toContain("obligations under this agreement.");
  });

  it("leaves no page marker in the output", () => {
    const doc = [page("A", "1", "First page body."), page("A", "2", "Second page body.")].join(
      PAGE_BREAK
    );
    expect(normalizeForComparison(doc)).not.toContain(PAGE_BREAK);
  });
});

describe("segmentDocument", () => {
  it("is deterministic", () => {
    const doc = buildAgreement(30);
    expect(segmentDocument(doc).map((s) => s.hash)).toEqual(
      segmentDocument(doc).map((s) => s.hash)
    );
  });

  it("carries every segment forward when nothing changed", () => {
    const doc = buildAgreement(60);
    const a = segmentDocument(doc);
    const b = segmentDocument(doc);
    expect(alignSegments(a, b).carriedForward).toBe(b.length);
  });

  it("keeps chunks within the size ceiling", () => {
    for (const s of segmentDocument(buildAgreement(60))) {
      expect(s.text.length).toBeLessThanOrEqual(1800 + 200);
    }
  });
});

describe("locality — the property the whole ledger rests on", () => {
  const original = buildAgreement(90);
  const revised = original.replace(
    "This clause 8 sets out",
    "The parties have agreed an additional provision here. This clause 8 sets out"
  );

  it("the edit actually landed near the front", () => {
    expect(revised).not.toBe(original);
    expect(revised.indexOf("additional provision") / revised.length).toBeLessThan(0.2);
  });

  it("an early insertion disturbs only its own neighbourhood", () => {
    const a = segmentDocument(original);
    const b = segmentDocument(revised);
    const result = alignSegments(a, b);
    const ratio = result.carriedForward / b.length;

    expect(ratio).toBeGreaterThan(0.9);
    expect(b.length - result.carriedForward).toBeLessThanOrEqual(2);
  });

  it("beats the size-counting chunker it replaces, which reused almost nothing", () => {
    const legacyRatio = overlap(
      legacyChunk(normalizeForComparison(original)),
      legacyChunk(normalizeForComparison(revised))
    );
    const a = segmentDocument(original);
    const b = segmentDocument(revised);
    const newRatio = alignSegments(a, b).carriedForward / b.length;

    expect(legacyRatio).toBeLessThan(0.2);
    expect(newRatio).toBeGreaterThan(legacyRatio + 0.7);
  });

  it("holds for an edit in the middle and at the end", () => {
    for (const clause of [45, 88]) {
      const edited = original.replace(
        `This clause ${clause} sets out`,
        `An inserted sentence appears here. This clause ${clause} sets out`
      );
      const b = segmentDocument(edited);
      const result = alignSegments(segmentDocument(original), b);
      expect(result.carriedForward / b.length).toBeGreaterThan(0.9);
    }
  });

  it("reports a pure deletion as deleted, not as wholesale change", () => {
    const shortened = original.replace(
      /\n25\. CLAUSE 25\n[\s\S]*?\n\n26\. CLAUSE 26/,
      "\n26. CLAUSE 26"
    );
    const b = segmentDocument(shortened);
    const result = alignSegments(segmentDocument(original), b);
    expect(result.carriedForward / b.length).toBeGreaterThan(0.9);
    expect(result.deleted + result.changed).toBeGreaterThan(0);
  });
});

describe("alignSegments", () => {
  it("locates a changed clause rather than smearing the change across the document", () => {
    const original = buildAgreement(40);
    const revised = original.replace(
      "obligations of the parties with respect to matter 20",
      "obligations of the parties with respect to revised matter 20"
    );
    const result = alignSegments(segmentDocument(original), segmentDocument(revised));
    const touched = result.ops.filter((o) => o.type !== "equal");
    expect(touched.length).toBeGreaterThan(0);
    expect(touched.length).toBeLessThanOrEqual(3);
  });

  it("counts every segment of the new version exactly once", () => {
    const a = segmentDocument(buildAgreement(30));
    const b = segmentDocument(buildAgreement(33));
    const r = alignSegments(a, b);
    expect(r.equal + r.changed + r.inserted).toBe(b.length);
    expect(r.total).toBe(b.length);
  });
});

describe("wordDiff", () => {
  it("finds the number that moved", () => {
    const ops = wordDiff(
      "The aggregate liability shall not exceed $1,000,000 in any event.",
      "The aggregate liability shall not exceed $5,000,000 in any event."
    );
    expect(ops.find((o) => o.type === "delete")?.text).toContain("$1,000,000");
    expect(ops.find((o) => o.type === "insert")?.text).toContain("$5,000,000");
    expect(ops.filter((o) => o.type === "equal").length).toBeGreaterThan(0);
  });

  it("finds a payment term change", () => {
    const ops = wordDiff("payable net 30 days", "payable net 45 days");
    expect(ops.some((o) => o.type === "delete" && o.text.includes("30"))).toBe(true);
    expect(ops.some((o) => o.type === "insert" && o.text.includes("45"))).toBe(true);
  });

  it("reconstructs both sides losslessly", () => {
    const before = "the quick brown fox jumps over the lazy dog";
    const after = "the quick red fox leaps over the dog";
    const ops = wordDiff(before, after);
    const rebuiltBefore = ops
      .filter((o) => o.type !== "insert")
      .map((o) => o.text)
      .join("");
    const rebuiltAfter = ops
      .filter((o) => o.type !== "delete")
      .map((o) => o.text)
      .join("");
    expect(rebuiltBefore).toBe(before);
    expect(rebuiltAfter).toBe(after);
  });
});

describe("quoteIsVerbatim", () => {
  const source = "The aggregate liability shall not exceed $5,000,000 in any event.";

  it("accepts a quote that is really there, ignoring whitespace and case", () => {
    expect(quoteIsVerbatim("shall not   exceed $5,000,000", source)).toBe(true);
  });

  it("rejects a paraphrase", () => {
    expect(quoteIsVerbatim("liability is capped at five million dollars", source)).toBe(false);
  });

  it("rejects a quote too short to mean anything", () => {
    expect(quoteIsVerbatim("the", source)).toBe(false);
  });
});

describe("attachPages", () => {
  it("assigns increasing page numbers from raw page offsets", () => {
    const raw = buildAgreement(40);
    const normalized = normalizeForComparison(raw);
    const segments = segmentDocument(raw);
    const pageStarts = [0, Math.floor(raw.length / 3), Math.floor((raw.length * 2) / 3)];
    const withPages = attachPages(segments, pageStarts, raw.length, normalized.length);

    expect(withPages[0].startPage).toBe(1);
    expect(withPages[withPages.length - 1].endPage).toBeGreaterThanOrEqual(1);
    for (let i = 1; i < withPages.length; i++) {
      expect(withPages[i].startPage!).toBeGreaterThanOrEqual(withPages[i - 1].startPage!);
    }
  });
});

describe("CHUNKER_VERSION", () => {
  it("is set, so versions chunked differently are never silently compared", () => {
    expect(CHUNKER_VERSION).toBeGreaterThanOrEqual(2);
  });
});
