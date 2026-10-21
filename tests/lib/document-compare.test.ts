import { describe, it, expect } from "vitest";
import {
  changesOnlyHeadline,
  classifyMateriality,
  compareDocuments,
  coverageHeadline,
} from "@/lib/document-compare";
import { wordDiff } from "@/lib/document-segmentation";

function agreement(clauses = 60, overrides: Record<number, string> = {}): string {
  const body: string[] = ["MASTER SERVICES AGREEMENT", ""];
  for (let i = 1; i <= clauses; i++) {
    body.push(`${i}. CLAUSE ${i}`);
    body.push(
      overrides[i] ??
        `This clause ${i} sets out the obligations of the parties with respect to matter ${i}. ` +
          `Each party shall perform its duties in good faith and with reasonable care.`
    );
    body.push("");
  }
  return body.join("\n");
}

describe("compareDocuments", () => {
  it("reports total coverage when nothing changed", () => {
    const doc = agreement(40);
    const r = compareDocuments(doc, doc);
    expect(r.identical).toBe(r.total);
    expect(r.changes).toHaveLength(0);
    expect(coverageHeadline(r)).toContain(`${r.total} of ${r.total}`);
  });

  it("accounts for every passage of the new version exactly once", () => {
    const r = compareDocuments(agreement(40), agreement(44));
    const covered = r.changes.reduce((n, c) => n + c.passages.after, 0);
    expect(r.identical + covered).toBe(r.total);
  });

  it("never reports a passage as identical when its text differs", () => {
    const before = agreement(40);
    const after = agreement(40, {
      20: "This clause 20 sets out the obligations of the parties with respect to matter 20. Each party shall perform its duties in good faith and with utmost care.",
    });
    const r = compareDocuments(before, after);
    const found = r.changes.some((c) => (c.after ?? "").includes("utmost care"));
    expect(found).toBe(true);
    expect(r.identical).toBeLessThan(r.total);
  });

  it("survives a second export of the same document with no real change", () => {
    const clean = agreement(30);
    const reexported = clean
      .replace(/good faith/g, "good faith")
      .replace(/with respect to/g, "with respect\nto")
      .replace(/obligations/g, "obliga-\ntions")
      .split("\n")
      .flatMap((line, i) =>
        i > 0 && i % 9 === 0 ? ["Acme Corp / Confidential", "Page " + i, "", line] : [line]
      )
      .join("\n");

    const r = compareDocuments(clean, reexported);
    expect(r.identical).toBe(r.total);
    expect(r.changes).toHaveLength(0);
  });

  it("keeps a local edit local", () => {
    const before = agreement(60);
    const after = before.replace(
      "This clause 6 sets out",
      "An additional sentence was inserted here. This clause 6 sets out"
    );
    const r = compareDocuments(before, after);
    expect(r.identical / r.total).toBeGreaterThan(0.9);
  });

  it("orders material changes first without dropping any", () => {
    const before = agreement(40, {
      4: "The aggregate liability shall not exceed $1,000,000 in any event.",
      34: "The parties record their intention in the colour blue.",
    });
    const after = agreement(40, {
      4: "The aggregate liability shall not exceed $5,000,000 in any event.",
      34: "The parties record their intention in the colour green.",
    });
    const r = compareDocuments(before, after);

    expect(r.changes.length).toBeGreaterThanOrEqual(2);
    expect(r.changes[0].materiality).toBe("material");
    expect(r.changes[0].diff.some((o) => o.text.includes("5,000,000"))).toBe(true);
    expect(r.materialCount + r.substantiveCount + r.cosmeticCount).toBe(r.changes.length);
  });

  it("exposes the normalized text it hashed, so a claim can be checked by eye", () => {
    const r = compareDocuments(agreement(5), agreement(5));
    expect(r.normalized.before.length).toBeGreaterThan(0);
    expect(r.normalized.before).toBe(r.normalized.after);
  });

  it("assigns pages when page offsets are supplied", () => {
    const before = agreement(30);
    const after = before.replace("matter 15.", "matter 15 as amended.");
    const r = compareDocuments(before, after, {
      pageStartOffsets: [0, Math.floor(after.length / 2)],
      rawAfterLength: after.length,
    });
    for (const c of r.changes) {
      if (c.kind !== "deleted") expect(c.page).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("classifyMateriality", () => {
  const m = (a: string, b: string) => classifyMateriality(wordDiff(a, b));

  it("calls a money change material", () => {
    expect(m("shall not exceed $1,000,000", "shall not exceed $5,000,000")).toBe("material");
  });

  it("calls a payment term change material", () => {
    expect(m("payable net 30 days", "payable net 45 days")).toBe("material");
  });

  it("calls a spelled-out period change material, same as the digits would be", () => {
    expect(m("on thirty days written notice", "on ninety days written notice")).toBe("material");
    expect(m("a term of twelve months", "a term of twenty-four months")).toBe("material");
  });

  it("calls an obligation flip material", () => {
    expect(m("the supplier shall deliver", "the supplier may deliver")).toBe("material");
  });

  it("calls a date change material", () => {
    expect(m("effective 01/01/2026", "effective 01/06/2026")).toBe("material");
  });

  it("calls pure renumbering cosmetic", () => {
    expect(m("(a) the parties agree", "(b) the parties agree")).toBe("cosmetic");
  });

  it("calls shall/will material — in a contract that is a real change, not a rewording", () => {
    expect(m("each party shall use reasonable care", "each party will use reasonable care")).toBe(
      "material"
    );
  });

  it("calls a reworded sentence substantive", () => {
    expect(
      m("each party shall use reasonable care", "each party shall use reasonable efforts")
    ).toBe("substantive");
  });

  it("defaults to substantive rather than burying something it cannot classify", () => {
    expect(m("the widget is blue", "the widget is green")).toBe("substantive");
  });
});

describe("two edits close together", () => {
  const clause = (n: number) =>
    `${n}. CLAUSE ${n}. Each party shall perform its duties under this clause in good faith and ` +
    `with reasonable care, and no amendment is effective unless made in writing and signed by ` +
    `authorised representatives of both parties.`;

  const doc = (cap: string, notice: string) =>
    [
      clause(1),
      clause(2),
      `8. LIABILITY. The aggregate liability of either party shall not exceed ${cap}, except in respect of death or personal injury.`,
      clause(3),
      clause(4),
      clause(5),
      `9. TERMINATION. Either party may terminate this agreement on ${notice} days written notice to the other party.`,
      clause(6),
    ].join("\n\n");

  it("reports them as two changes, not one", () => {
    const r = compareDocuments(doc("$1,000,000", "thirty"), doc("$5,000,000", "ninety"));
    expect(r.changes).toHaveLength(2);
    expect(r.materialCount).toBe(2);
  });

  it("puts each edit on its own card, with the other one absent", () => {
    const r = compareDocuments(doc("$1,000,000", "thirty"), doc("$5,000,000", "ninety"));
    const text = (i: number) =>
      r.changes[i].diff
        .filter((o) => o.type !== "equal")
        .map((o) => o.text)
        .join(" ");
    const cards = [text(0), text(1)];
    const money = cards.find((c) => c.includes("5,000,000"));
    const notice = cards.find((c) => c.includes("ninety"));
    expect(money).toBeDefined();
    expect(notice).toBeDefined();
    expect(money).not.toContain("ninety");
    expect(notice).not.toContain("5,000,000");
  });

  it("still keeps one edit spanning a passage boundary on a single card", () => {
    const before = [clause(1), clause(2), clause(3), clause(4)].join("\n\n");
    const after = before.replace(
      "no amendment is effective unless made in writing and signed by authorised representatives of both parties.",
      "no amendment is effective unless approved in advance by the steering committee."
    );
    const r = compareDocuments(before, after);
    expect(r.changes).toHaveLength(1);
  });
});

describe("coverageHeadline", () => {
  it("leads with what was verified unchanged", () => {
    const r = compareDocuments(agreement(20), agreement(20));
    expect(coverageHeadline(r).startsWith(`${r.total} of ${r.total} passages are`)).toBe(true);
  });

  it("names the material count when there is one", () => {
    const before = agreement(20, { 4: "liability shall not exceed $1,000,000." });
    const after = agreement(20, { 4: "liability shall not exceed $9,000,000." });
    const headline = coverageHeadline(compareDocuments(before, after));
    expect(headline).toMatch(/\d+ changes?,/);
    expect(headline).toMatch(/material\.$/);
  });
});

describe("changesOnlyHeadline", () => {
  it("never mentions coverage, because coverage is exactly what is unavailable", () => {
    const before = agreement(20, { 4: "liability shall not exceed $1,000,000." });
    const after = agreement(20, { 4: "liability shall not exceed $9,000,000." });
    const h = changesOnlyHeadline(compareDocuments(before, after));
    expect(h).not.toMatch(/identical|passages are|verified|unchanged/i);
    expect(h).toMatch(/change/);
  });

  it("says nothing was found rather than claiming nothing changed", () => {
    const doc = agreement(10);
    const h = changesOnlyHeadline(compareDocuments(doc, doc));
    expect(h).toBe("No changes found in the part that was read.");
  });
});
