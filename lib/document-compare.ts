import {
  alignSegments,
  normalizeForComparison,
  segmentText,
  wordDiff,
  type Segment,
  type WordOp,
} from "./document-segmentation";


export type Materiality = "material" | "substantive" | "cosmetic";

export interface ChangeCard {
  id: string;
  kind: "changed" | "inserted" | "deleted";
  before: string | null;
  after: string | null;
  diff: WordOp[];
  materiality: Materiality;
  page: number | null;
  passages: { before: number; after: number };
  note?: string;
}

export interface CompareResult {
  
  total: number;
  identical: number;
  changes: ChangeCard[];
  materialCount: number;
  substantiveCount: number;
  cosmeticCount: number;
  normalized: { before: string; after: string };
}

const OBLIGATION_WORDS =
  /\b(shall|must|may not|will not|shall not|required|obligated|entitled|liable|indemnif\w*|terminate\w*|warrant\w*|guarantee\w*)\b/i;
const MONEY =
  /(?:[$£€₹]\s?[\d,]+(?:\.\d+)?|\b\d[\d,]*(?:\.\d+)?\s?(?:usd|eur|gbp|inr|dollars|euros)\b)/i;
const NUMBERISH = /\b\d[\d,]*(?:\.\d+)?%?\b/;
const NUMBER_WORDS =
  /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|half|quarter|annual\w*|month\w*|quarterly|weekly|daily|first|second|third|fourth|fifth|tenth)\b/i;
const DATEISH =
  /\b(?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}-\d{2}-\d{2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2})\b/i;
const MARKER_TOKEN = /^[\s(\[]*[\dA-Za-z]{1,4}[.)\]]*[\s]*$/;
const PUNCT_ONLY = /^[\s.,;:()\[\]"'–—-]*$/;
export function classifyMateriality(diff: WordOp[]): Materiality {
  const touched = diff.filter((op) => op.type !== "equal");
  if (touched.length === 0) return "cosmetic";

  const changedText = touched.map((op) => op.text).join(" ");
  const startsWithChange = diff.length > 0 && diff[0].type !== "equal";
  if (startsWithChange && touched.every((op) => MARKER_TOKEN.test(op.text))) {
    return "cosmetic";
  }

  if (MONEY.test(changedText) || DATEISH.test(changedText)) return "material";
  if (OBLIGATION_WORDS.test(changedText)) return "material";
  if (NUMBERISH.test(changedText) || NUMBER_WORDS.test(changedText)) return "material";
  if (PUNCT_ONLY.test(changedText)) return "cosmetic";

  return "substantive";
}

const RANK: Record<Materiality, number> = { material: 0, substantive: 1, cosmetic: 2 };
const UNTOUCHED_RUN_CHARS = 160;
const CONTEXT_CHARS = 110;

function tail(text: string): string {
  if (text.length <= CONTEXT_CHARS) return text;
  const cut = text.slice(text.length - CONTEXT_CHARS);
  return `… ${cut.slice(cut.indexOf(" ") + 1)}`;
}

function head(text: string): string {
  if (text.length <= CONTEXT_CHARS) return text;
  const cut = text.slice(0, CONTEXT_CHARS);
  return `${cut.slice(0, cut.lastIndexOf(" "))} …`;
}

function splitOnUntouchedRuns(ops: WordOp[]): WordOp[][] {
  const hasEdit = (group: WordOp[]) => group.some((o) => o.type !== "equal");
  const groups: WordOp[][] = [];
  let current: WordOp[] = [];

  for (const op of ops) {
    if (op.type === "equal" && op.text.length >= UNTOUCHED_RUN_CHARS) {
      if (hasEdit(current)) {
        current.push({ type: "equal", text: head(op.text) });
        groups.push(current);
      }
      current = [{ type: "equal", text: tail(op.text) }];
      continue;
    }
    current.push(op);
  }
  if (hasEdit(current)) groups.push(current);

  return groups.length > 0 ? groups : [ops];
}


export interface CompareOptions {
  pageStartOffsets?: number[];
  rawAfterLength?: number;
}
export function compareDocuments(
  beforeRaw: string,
  afterRaw: string,
  options: CompareOptions = {}
): CompareResult {
  const beforeNorm = normalizeForComparison(beforeRaw);
  const afterNorm = normalizeForComparison(afterRaw);
  const beforeSegments = segmentText(beforeNorm);
  const afterSegments = withPages(segmentText(afterNorm), afterNorm, options);
  const alignment = alignSegments(beforeSegments, afterSegments);
  const regions: Array<{
    beforeParts: string[];
    afterParts: string[];
    page: number | null;
    fromIndex: number | null;
    toIndex: number | null;
  }> = [];
  let region: (typeof regions)[number] | null = null;

  for (const op of alignment.ops) {
    if (op.type === "equal") {
      region = null;
      continue;
    }
    if (!region) {
      region = { beforeParts: [], afterParts: [], page: null, fromIndex: null, toIndex: null };
      regions.push(region);
    }
    if ("fromIndex" in op) {
      region.beforeParts.push(beforeSegments[op.fromIndex]?.text ?? "");
      region.fromIndex ??= op.fromIndex;
    }
    if ("toIndex" in op) {
      region.afterParts.push(afterSegments[op.toIndex]?.text ?? "");
      region.toIndex ??= op.toIndex;
      region.page ??= afterSegments[op.toIndex]?.startPage ?? null;
    }
  }

  const changes: ChangeCard[] = regions.flatMap((r) => {
    const before = r.beforeParts.length ? r.beforeParts.join(" ") : null;
    const after = r.afterParts.length ? r.afterParts.join(" ") : null;

    const diff =
      before !== null && after !== null
        ? wordDiff(before, after)
        : before !== null
          ? [{ type: "delete" as const, text: before }]
          : [{ type: "insert" as const, text: after ?? "" }];

    const kind =
      before !== null && after !== null ? "changed" : after !== null ? "inserted" : "deleted";
    const parts = kind === "changed" ? splitOnUntouchedRuns(diff) : [diff];

    return parts.map((ops, i) => ({
      id: `r${r.fromIndex ?? "x"}-${r.toIndex ?? "x"}${i > 0 ? `-${i}` : ""}`,
      kind,
      before,
      after,
      diff: ops,
      materiality: classifyMateriality(ops),
      page: r.page,
      passages:
        i === 0
          ? { before: r.beforeParts.length, after: r.afterParts.length }
          : { before: 0, after: 0 },
    }));
  });
  changes.sort((a, b) => {
    const r = RANK[a.materiality] - RANK[b.materiality];
    if (r !== 0) return r;
    return (a.page ?? 0) - (b.page ?? 0);
  });

  return {
    total: afterSegments.length,
    identical: alignment.equal,
    changes,
    materialCount: changes.filter((c) => c.materiality === "material").length,
    substantiveCount: changes.filter((c) => c.materiality === "substantive").length,
    cosmeticCount: changes.filter((c) => c.materiality === "cosmetic").length,
    normalized: { before: beforeNorm, after: afterNorm },
  };
}

function withPages(segments: Segment[], normalized: string, options: CompareOptions): Segment[] {
  const { pageStartOffsets, rawAfterLength } = options;
  if (!pageStartOffsets?.length || !rawAfterLength) return segments;

  const ratio = normalized.length / rawAfterLength;
  const bounds = pageStartOffsets.map((o) => Math.round(o * ratio));

  let cursor = 0;
  return segments.map((s) => {
    const start = cursor;
    cursor += s.text.length + 2;
    let page = 1;
    for (let i = 0; i < bounds.length; i++) {
      if (bounds[i] <= start) page = i + 1;
      else break;
    }
    return { ...s, startPage: page, endPage: page };
  });
}
export function changesOnlyHeadline(result: CompareResult): string {
  const n = result.changes.length;
  if (n === 0) return "No changes found in the part that was read.";
  const m = result.materialCount;
  const material =
    m === 0 ? "none material" : m === n ? (n === 1 ? "material" : "all material") : `${m} material`;
  return `${n.toLocaleString()} ${n === 1 ? "change" : "changes"} found, ${material}.`;
}

export function coverageHeadline(result: CompareResult): string {
  const coverage = `${result.identical.toLocaleString()} of ${result.total.toLocaleString()} passages are character-identical`;

  const n = result.changes.length;
  if (n === 0) return `${coverage}. Nothing changed.`;
  const changes = `${n.toLocaleString()} ${n === 1 ? "change" : "changes"}`;
  const m = result.materialCount;
  const material =
    m === 0 ? "none material" : m === n ? (n === 1 ? "material" : "all material") : `${m} material`;

  return `${coverage}. ${changes}, ${material}.`;
}
