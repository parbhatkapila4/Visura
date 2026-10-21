import { describe, it, expect } from "vitest";
import { compareDocuments } from "@/lib/document-compare";

const AGREEMENT = [
  "MASTER SERVICES AGREEMENT",
  "",
  "1. DEFINITIONS",
  'In this agreement, "Services" means the services described in Schedule 1, and "Fees" means the amounts set out in Schedule 2.',
  "",
  "2. TERM",
  "This agreement commences on the Effective Date and continues for twelve months unless terminated earlier in accordance with clause 9.",
  "",
  "3. OBLIGATIONS OF THE SUPPLIER",
  "The Supplier shall perform the Services with reasonable skill and care, and shall comply with all applicable laws and regulations in the performance of its obligations.",
  "",
  "4. FEES AND PAYMENT",
  "The Customer shall pay the Fees within thirty days of receipt of a valid invoice. Interest accrues on late payment at 2% above base rate.",
  "",
  "5. CONFIDENTIALITY",
  "Each party shall keep confidential all information disclosed to it by the other party and shall not disclose it to any third party without prior written consent.",
  "",
  "6. INTELLECTUAL PROPERTY",
  "All intellectual property rights in the Deliverables vest in the Customer on payment in full of the Fees.",
  "",
  "7. LIABILITY",
  "The aggregate liability of either party under this agreement shall not exceed $1,000,000, except in respect of death or personal injury caused by negligence.",
  "",
  "8. INDEMNITY",
  "The Supplier shall indemnify the Customer against all losses arising from any claim that the Deliverables infringe the rights of a third party.",
  "",
  "9. TERMINATION",
  "Either party may terminate this agreement on thirty days written notice, or immediately if the other party commits a material breach that is not remedied within fourteen days.",
  "",
  "10. GOVERNING LAW",
  "This agreement is governed by the laws of England and Wales and the parties submit to the exclusive jurisdiction of the English courts.",
].join("\n");

function hardWrap(text: string, cols: number): string {
  return text
    .split("\n")
    .map((line) => {
      if (line.length <= cols) return line;
      const words = line.split(" ");
      const out: string[] = [];
      let cur = "";
      for (const w of words) {
        if (cur && (cur + " " + w).length > cols) {
          out.push(cur);
          cur = w;
        } else cur = cur ? cur + " " + w : w;
      }
      if (cur) out.push(cur);
      return out.join("\n");
    })
    .join("\n");
}

function paginate(text: string, every: number, header: string, pageWord: string): string {
  const lines = text.split("\n");
  const out: string[] = [];
  let page = 1;
  for (let i = 0; i < lines.length; i++) {
    if (i > 0 && i % every === 0) {
      out.push(header, `${pageWord} ${page++}`, "");
    }
    out.push(lines[i]);
  }
  return out.join("\n");
}

function hyphenate(text: string, word: string, at: number): string {
  return text.split(word).join(word.slice(0, at) + "-\n" + word.slice(at));
}

const VARIANTS: Array<[name: string, transform: (s: string) => string]> = [
  ["identical bytes", (s) => s],

  [
    "Word autocorrect: curly quotes, em dashes, ellipsis",
    (s) =>
      s
        .replace(/"([^"]*)"/g, "“$1”")
        .replace(/ - /g, " — ")
        .replace(/\.\.\./g, "…"),
  ],

  ["narrow page: wrapped at 60 columns", (s) => hardWrap(s, 60)],
  ["wide page: wrapped at 110 columns", (s) => hardWrap(s, 110)],

  [
    "repaginated: different wrap AND different header interval",
    (s) => paginate(hardWrap(s, 72), 7, "Acme Corp / Confidential", "Page"),
  ],

  [
    "a different exporter's furniture entirely",
    (s) => paginate(hardWrap(s, 68), 9, "CONFIDENTIAL DRAFT", "-"),
  ],

  [
    "justified text hyphenates across a line end",
    (s) => hyphenate(hardWrap(s, 64), "agreement", 5),
  ],

  [
    "hyphenation landing exactly on a page break",
    (s) => paginate(hyphenate(hardWrap(s, 64), "intellectual", 6), 6, "Acme Corp", "Page"),
  ],

  ["non-breaking spaces and tabs", (s) => s.replace(/ /g, (m, i) => (i % 7 === 0 ? " " : m))],

  ["ligatures, as a PDF text layer emits them", (s) => s.replace(/fi/g, "ﬁ").replace(/fl/g, "ﬂ")],

  ["extra blank lines throughout", (s) => s.split("\n").join("\n\n")],

  ["windows line endings", (s) => s.replace(/\n/g, "\r\n")],

  [
    "everything at once",
    (s) =>
      paginate(
        hyphenate(
          hardWrap(s.replace(/"([^"]*)"/g, "“$1”").replace(/ - /g, " — "), 66),
          "confidential",
          6
        ),
        8,
        "Acme Corp / Confidential",
        "Page"
      ).replace(/\n/g, "\r\n"),
  ],
];

describe("golden corpus — the same agreement, exported differently", () => {
  for (const [name, transform] of VARIANTS) {
    it(`reports no change: ${name}`, () => {
      const r = compareDocuments(AGREEMENT, transform(AGREEMENT));
      expect(r.changes).toHaveLength(0);
      expect(r.identical).toBe(r.total);
    });
  }

  it("is symmetric — swapping the two files reports no change either way", () => {
    for (const [, transform] of VARIANTS) {
      const r = compareDocuments(transform(AGREEMENT), AGREEMENT);
      expect(r.changes).toHaveLength(0);
    }
  });

  it("still finds a real edit buried in the noisiest export", () => {
    const [, worst] = VARIANTS[VARIANTS.length - 1];
    const edited = AGREEMENT.replace("$1,000,000", "$5,000,000");
    const r = compareDocuments(AGREEMENT, worst(edited));

    expect(r.changes).toHaveLength(1);
    expect(r.changes[0].materiality).toBe("material");
    expect(r.changes[0].diff.some((o) => o.type === "delete" && o.text.includes("1,000,000"))).toBe(
      true
    );
    expect(r.changes[0].diff.some((o) => o.type === "insert" && o.text.includes("5,000,000"))).toBe(
      true
    );
  });

  it("finds two real edits in the noisiest export without inventing a third", () => {
    const [, worst] = VARIANTS[VARIANTS.length - 1];
    const edited = AGREEMENT.replace("$1,000,000", "$5,000,000").replace(
      "thirty days written notice",
      "ninety days written notice"
    );
    const r = compareDocuments(AGREEMENT, worst(edited));


    const all = r.changes.flatMap((c) => c.diff);
    expect(all.some((o) => o.type === "insert" && o.text.includes("5,000,000"))).toBe(true);
    expect(all.some((o) => o.type === "insert" && o.text.includes("ninety"))).toBe(true);
    expect(all.some((o) => o.type === "delete" && o.text.includes("1,000,000"))).toBe(true);
    expect(all.some((o) => o.type === "delete" && o.text.includes("thirty"))).toBe(true);
    expect(r.changes.length).toBeLessThanOrEqual(2);
    expect(r.materialCount).toBe(r.changes.length);
  });

  it("keeps edits in distant clauses on separate cards", () => {
    const edited = AGREEMENT.replace(
      '"Services" means the services described in Schedule 1',
      '"Services" means the services described in Schedule 3'
    ).replace(
      "exclusive jurisdiction of the English courts",
      "non-exclusive jurisdiction of the English courts"
    );

    const r = compareDocuments(AGREEMENT, edited);
    expect(r.changes.length).toBe(2);
  });
});
