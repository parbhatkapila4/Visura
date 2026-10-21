import { describe, it, expect } from "vitest";
import { compareDocuments } from "@/lib/document-compare";
import { changeTopicLabel, changeTopics, claimVerdict } from "@/lib/change-claims";


const clause = (n: number, heading: string, body: string) => `${n}. ${heading}\n\n${body}\n`;

const AGREEMENT = (cap: string, notice: string) =>
  [
    clause(
      7,
      "INTELLECTUAL PROPERTY",
      "All intellectual property rights in the Deliverables vest in the Customer on payment in full of the Fees. The Supplier retains all rights in its pre-existing materials and tools."
    ),
    clause(
      8,
      "LIABILITY",
      `The aggregate liability of either party under this agreement shall not exceed ${cap}, except in respect of death or personal injury caused by negligence or any liability that cannot lawfully be limited.`
    ),
    clause(
      9,
      "INDEMNITY",
      "The Supplier shall indemnify the Customer against all losses arising from any claim that the Deliverables infringe the intellectual property rights of a third party."
    ),
    clause(
      10,
      "TERMINATION",
      `Either party may terminate this agreement on ${notice} days written notice, or immediately if the other party commits a material breach that is not remedied within fourteen days of notice.`
    ),
    clause(
      11,
      "FORCE MAJEURE",
      "Neither party is liable for failure to perform caused by an event beyond its reasonable control, provided it notifies the other party promptly."
    ),
  ].join("\n");

const result = () => compareDocuments(AGREEMENT("$1,000,000", "30"), AGREEMENT("$5,000,000", "45"));

describe("changeTopicLabel", () => {
  it("names the clause each change sits in", () => {
    const labels = result().changes.map(changeTopicLabel);
    expect(labels).toContain("8. LIABILITY");
    expect(labels).toContain("10. TERMINATION");
  });

  it("does not swallow the sentence after the heading", () => {
    const labels = result().changes.map(changeTopicLabel);
    for (const l of labels) expect(l.length).toBeLessThan(40);
  });

  it("falls back to the changed words when the document has no headings", () => {
    const r = compareDocuments(
      "The widget is blue and the housing is steel throughout the assembly.",
      "The widget is green and the housing is steel throughout the assembly."
    );
    const label = changeTopicLabel(r.changes[0]);
    expect(label).toMatch(/blue|green/);
  });
});

describe("claimVerdict", () => {
  it("says nothing until the reader has answered", () => {
    const r = result();
    const v = claimVerdict(r, new Set());
    expect(v.answered).toBe(false);
    expect(v.headline).toBe("");
    expect(v.unmentioned).toHaveLength(r.changes.length);
  });

  it("reports what was not disclosed once one change is acknowledged", () => {
    const r = result();
    const topics = changeTopics(r);
    const liability = topics.find((t) => t.label === "8. LIABILITY");
    expect(liability).toBeDefined();

    const v = claimVerdict(r, new Set([liability!.id]));
    expect(v.answered).toBe(true);
    expect(v.acknowledged).toHaveLength(1);
    expect(v.unmentioned).toHaveLength(r.changes.length - 1);
    expect(v.headline).toMatch(/not told about/);
  });

  it("clears the document when everything was disclosed", () => {
    const r = result();
    const v = claimVerdict(r, new Set(r.changes.map((c) => c.id)));
    expect(v.unmentioned).toHaveLength(0);
    expect(v.headline).toMatch(/you were told about/);
  });

  it("counts material changes separately in the headline", () => {
    const r = result();
    const v = claimVerdict(r, new Set([r.changes[0].id]));
    const material = v.unmentioned.filter((c) => c.materiality === "material").length;
    if (material > 0) expect(v.headline).toMatch(/material/);
  });

  it("gives every change a stable id so ticks survive a re-render", () => {
    const ids = result().changes.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(result().changes.map((c) => c.id)).toEqual(ids);
  });
});
