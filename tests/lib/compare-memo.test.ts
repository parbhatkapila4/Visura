import { describe, it, expect } from "vitest";
import { compareDocuments } from "@/lib/document-compare";
import { changeSummaryLine, memoFilename, memoHtml, memoText } from "@/lib/compare-memo";
import { claimVerdict } from "@/lib/change-claims";


function agreement(clauses = 20, overrides: Record<number, string> = {}): string {
  const body: string[] = ["MASTER SERVICES AGREEMENT", ""];
  for (let i = 1; i <= clauses; i++) {
    body.push(`${i}. CLAUSE ${i}`);
    body.push(
      overrides[i] ??
        `This clause ${i} sets out the obligations of the parties with respect to matter ${i}. ` +
          `Each party shall perform its duties in good faith.`
    );
    body.push("");
  }
  return body.join("\n");
}

const before = agreement(20, { 6: "The aggregate liability shall not exceed $1,000,000." });
const after = agreement(20, { 6: "The aggregate liability shall not exceed $5,000,000." });
const result = compareDocuments(before, after);

const sound = {
  result,
  beforeName: "MSA_v3.pdf",
  afterName: "MSA_v3_ACME_REVISED.pdf",
  coverageIsSound: true,
};

describe("changeSummaryLine", () => {
  it("reduces a change to the words that moved", () => {
    const line = changeSummaryLine(result.changes[0]);
    expect(line).toContain("1,000,000");
    expect(line).toContain("→");
    expect(line).toContain("5,000,000");
  });

  it("labels an insertion as added rather than inventing a left-hand side", () => {
    expect(
      changeSummaryLine({
        id: "i1",
        kind: "inserted",
        before: null,
        after: "A wholly new clause.",
        diff: [{ type: "insert", text: "A wholly new clause." }],
        materiality: "substantive",
        page: null,
        passages: { before: 0, after: 1 },
      })
    ).toBe("added: A wholly new clause.");
  });

  it("labels a deletion as removed", () => {
    expect(
      changeSummaryLine({
        id: "d1",
        kind: "deleted",
        before: "A clause that is gone.",
        after: null,
        diff: [{ type: "delete", text: "A clause that is gone." }],
        materiality: "substantive",
        page: null,
        passages: { before: 1, after: 0 },
      })
    ).toBe("removed: A clause that is gone.");
  });
});

describe("memoText", () => {
  it("leads with the coverage claim and names both files", () => {
    const text = memoText(sound);
    expect(text.startsWith("MSA_v3.pdf → MSA_v3_ACME_REVISED.pdf")).toBe(true);
    expect(text).toContain("passages are character-identical");
  });

  it("lists every change under its own heading", () => {
    const text = memoText(sound);
    expect(text).toContain("MATERIAL (");
    const listed = text.split("\n").filter((l) => /^\d+\. /.test(l)).length;
    expect(listed).toBe(result.changes.length);
  });

  it("says the files were never uploaded, because that is the reason to trust it", () => {
    expect(memoText(sound)).toContain("neither was uploaded");
  });

  it("carries the caveat when coverage was withheld, and makes no coverage claim", () => {
    const text = memoText({
      ...sound,
      coverageIsSound: false,
      caveats: ["MSA_v3.pdf is a scan, read with OCR."],
    });
    expect(text).not.toContain("character-identical");
    expect(text).toContain("Coverage is not reported");
    expect(text).toContain("read with OCR");
  });
});

describe("memoHtml", () => {
  const html = memoHtml(sound);

  it("is a whole standalone document", () => {
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("</html>");
  });

  it("carries no script, so it survives being emailed and opened anywhere", () => {
    expect(html.toLowerCase()).not.toContain("<script");
    expect(html).not.toContain("http://");
  });

  it("shows the full diff rather than a summary, so the reader can check it", () => {
    expect(html).toContain("<del>");
    expect(html).toContain("<ins>");
    expect(html).toContain("1,000,000");
    expect(html).toContain("5,000,000");
  });

  it("escapes document text instead of injecting it as markup", () => {
    const nasty = agreement(6, { 3: 'A clause with <script>alert("x")</script> & "quotes".' });
    const r = compareDocuments(agreement(6), nasty);
    const out = memoHtml({ ...sound, result: r });
    expect(out).not.toContain("<script>alert");
    expect(out).toContain("&lt;script&gt;");
  });

  it("repeats the caveat when coverage was withheld", () => {
    const out = memoHtml({
      ...sound,
      coverageIsSound: false,
      caveats: ["Only the first 50 of 130 pages were read."],
    });
    expect(out).toContain("Coverage is not reported");
    expect(out).toContain("Only the first 50 of 130 pages were read.");
    expect(out).not.toContain("character-identical");
  });
});

describe("memoFilename", () => {
  it("is named after the document it describes", () => {
    expect(memoFilename("MSA_v3_ACME_REVISED.pdf")).toBe("MSA_v3_ACME_REVISED-changes.html");
  });

  it("survives a name full of characters a filesystem dislikes", () => {
    expect(memoFilename("Acme / Draft #2 (final).docx")).toBe("Acme-Draft-2-final-changes.html");
  });
});
describe("the claim check in a memo", () => {
  const twoEdits = compareDocuments(
    agreement(20, {
      6: "The aggregate liability shall not exceed $1,000,000.",
      14: "Either party may terminate on thirty days written notice.",
    }),
    agreement(20, {
      6: "The aggregate liability shall not exceed $5,000,000.",
      14: "Either party may terminate on ninety days written notice.",
    })
  );
  const base = { ...sound, result: twoEdits };

  it("says nothing about disclosure when the reader never answered", () => {
    const verdict = claimVerdict(twoEdits, new Set());
    const text = memoText({ ...base, verdict });
    expect(text).not.toMatch(/not told about/i);
    expect(memoHtml({ ...base, verdict })).not.toMatch(/not told about/i);
  });

  it("leads with what was not disclosed once the reader answered", () => {
    const verdict = claimVerdict(twoEdits, new Set([twoEdits.changes[0].id]));
    const text = memoText({ ...base, verdict });
    expect(text).toMatch(/not told about/i);
    expect(text.indexOf("not told about")).toBeLessThan(text.indexOf("MATERIAL"));
  });

  it("reports a clean bill when everything was disclosed", () => {
    const verdict = claimVerdict(twoEdits, new Set(twoEdits.changes.map((c) => c.id)));
    expect(memoText({ ...base, verdict })).toMatch(/you were told about/i);
    expect(memoHtml({ ...base, verdict })).toMatch(/you were told about/i);
  });

  it("escapes the finding, like everything else drawn from the document", () => {
    const hostile = compareDocuments(
      agreement(20, { 6: "The cap is <script>alert(1)</script> one." }),
      agreement(20, { 6: "The cap is <script>alert(2)</script> two." })
    );
    const verdict = claimVerdict(hostile, new Set([hostile.changes[0]?.id ?? "x"]));
    const html = memoHtml({ ...base, result: hostile, verdict });
    expect(html).not.toContain("<script>alert(");
  });
});
