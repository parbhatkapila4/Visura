import { sha256Hex } from "./sha256";

export const CHUNKER_VERSION = 5;
export const PAGE_BREAK = "\f";
const MAX_CHUNK_CHARS = 1200;
const BOUNDARY_GATE = 5;

export function hashContent(content: string): string {
  return sha256Hex(content);
}
function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
export function normalizeForComparison(raw: string): string {
  let text = raw.normalize("NFKC");
  text = text.replace(/\r\n?/g, "\n");
  text = text
    .replace(/ﬀ/g, "ff")
    .replace(/ﬁ/g, "fi")
    .replace(/ﬂ/g, "fl")
    .replace(/ﬃ/g, "ffi")
    .replace(/ﬄ/g, "ffl")
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[   ]/g, " ");

  text = text.replace(/­/g, "");
  text = text.split(PAGE_BREAK).join(`\n${PAGE_BREAK}\n`);
  text = text
    .split("\n")
    .map((line) => (line === PAGE_BREAK ? line : line.replace(/[ \t]+/g, " ").trim()))
    .join("\n");
  text = stripPageFurniture(text)
  text = text
    .split("\n")
    .filter((line) => line !== PAGE_BREAK)
    .join("\n");

  text = text.replace(/(\p{L})-\n\s*(\p{L})/gu, "$1$2");
  text = text.replace(/\s*\n+\s*/g, " ");
  text = text.replace(/[ \t]+/g, " ").trim();

  return text;
}
function stripPageFurniture(text: string): string {
  const lines = text.split("\n");

  const plausible = (line: string) =>
    line.length > 0 &&
    line.length <= 70 &&
    !/^[\p{Ll}]/u.test(line) &&
    !/[.!?]$/.test(line);
  const EDGE_LINES = 2;
  const templateOf = (line: string) => line.replace(/\d+/g, "#");

  const pages: number[][] = [];
  let current: number[] = [];
  lines.forEach((line, i) => {
    if (line === PAGE_BREAK) {
      pages.push(current);
      current = [];
    } else if (line) {
      current.push(i);
    }
  });
  pages.push(current);

  const edgeOf = new Map<number, "head" | "foot">();
  if (pages.length > 1) {
    for (const page of pages) {
      page.slice(0, EDGE_LINES).forEach((i) => edgeOf.set(i, "head"));
      page.slice(-EDGE_LINES).forEach((i) => {
        if (!edgeOf.has(i)) edgeOf.set(i, "foot");
      });
    }
  }

  const seen = new Map<string, { pages: Set<number>; edges: Set<string> }>();
  pages.forEach((page, pageNo) => {
    for (const i of page) {
      const edge = edgeOf.get(i);
      if (!edge || !plausible(lines[i])) continue;
      const key = templateOf(lines[i]);
      const entry = seen.get(key) ?? { pages: new Set(), edges: new Set() };
      entry.pages.add(pageNo);
      entry.edges.add(edge);
      seen.set(key, entry);
    }
  });

  const runningTemplates = new Set(
    [...seen]
      .filter(([, v]) => v.pages.size >= 2 && v.edges.size === 1)
      .map(([template]) => template)
  );
  const counts = new Map<string, number>();
  for (const line of lines) {
    if (!plausible(line)) continue;
    counts.set(line, (counts.get(line) ?? 0) + 1);
  }
  const repeated = new Set([...counts].filter(([, n]) => n >= 3).map(([line]) => line));

  return lines
    .filter((line, i) => {
      if (line === PAGE_BREAK) return true;
      const t = line.trim();
      if (!t) return true;
      // bare page numbers, "Page 4", "4 of 90", "- 12 -"
      if (/^[-–—\s]*(?:page\s+)?\d+(?:\s*(?:of|\/)\s*\d+)?[-–—\s]*$/i.test(t)) return false;
      if (repeated.has(line)) return false;
      return !(edgeOf.has(i) && runningTemplates.has(templateOf(line)));
    })
    .join("\n");
}

export interface Segment {
  index: number;
  text: string;
  hash: string;
  startPage?: number;
  endPage?: number;
}

function splitUnits(text: string): string[] {
  const sentences = text
    .split(/(?<=[.!?])\s+(?=["'(\[]?[\p{Lu}0-9])/u)
    .map((s) => s.trim())
    .filter(Boolean);

  const units: string[] = [];
  for (const sentence of sentences) {
    if (sentence.length <= MAX_CHUNK_CHARS) {
      units.push(sentence);
      continue;
    }
    for (let i = 0; i < sentence.length; i += MAX_CHUNK_CHARS) {
      units.push(sentence.slice(i, i + MAX_CHUNK_CHARS));
    }
  }
  return units;
}
export function segmentText(normalized: string): Segment[] {
  const units = splitUnits(normalized);

  const segments: Segment[] = [];
  let buf: string[] = [];
  let len = 0;

  const flush = () => {
    if (!buf.length) return;
    const text = buf.join(" ");
    segments.push({ index: segments.length, text, hash: hashContent(text) });
    buf = [];
    len = 0;
  };

  for (const unit of units) {
    buf.push(unit);
    len += unit.length + 2;

    const gateOpen = fnv1a(unit) % BOUNDARY_GATE === 0;
    if (gateOpen || len >= MAX_CHUNK_CHARS) flush();
  }
  flush();

  if (segments.length === 0) {
    const fallback = normalized.trim() || "(No extractable text)";
    segments.push({ index: 0, text: fallback, hash: hashContent(fallback) });
  }

  return segments;
}
export function segmentDocument(raw: string): Segment[] {
  return segmentText(normalizeForComparison(raw));
}
export function attachPages(
  segments: Segment[],
  pageStartOffsets: number[],
  rawLength: number,
  normalizedLength: number
): Segment[] {
  if (pageStartOffsets.length === 0 || rawLength === 0) return segments;
  const ratio = normalizedLength / rawLength;
  const bounds = pageStartOffsets.map((o) => Math.round(o * ratio));

  const pageAt = (offset: number): number => {
    let lo = 0;
    let hi = bounds.length - 1;
    let page = 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (bounds[mid] <= offset) {
        page = mid + 1;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return page;
  };

  let cursor = 0;
  return segments.map((s) => {
    const start = cursor;
    const end = cursor + s.text.length;
    cursor = end + 2;
    return { ...s, startPage: pageAt(start), endPage: pageAt(end) };
  });
}

export type AlignOp =
  | { type: "equal"; fromIndex: number; toIndex: number }
  | { type: "changed"; fromIndex: number; toIndex: number }
  | { type: "inserted"; toIndex: number }
  | { type: "deleted"; fromIndex: number };

export interface Alignment {
  ops: AlignOp[];
  equal: number;
  changed: number;
  inserted: number;
  deleted: number;
  carriedForward: number;
  total: number;
}
export function alignSegments(from: Segment[], to: Segment[]): Alignment {
  const n = from.length;
  const m = to.length;
  const ops: AlignOp[] = [];
  if (n * m > 6_000_000) {
    return alignByAnchors(from, to);
  }

  const width = m + 1;
  const dp = new Int32Array((n + 1) * width);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * width + j] =
        from[i].hash === to[j].hash
          ? dp[(i + 1) * width + j + 1] + 1
          : Math.max(dp[(i + 1) * width + j], dp[i * width + j + 1]);
    }
  }

  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (from[i].hash === to[j].hash) {
      ops.push({ type: "equal", fromIndex: i, toIndex: j });
      i++;
      j++;
    } else if (dp[(i + 1) * width + j] >= dp[i * width + j + 1]) {
      ops.push({ type: "deleted", fromIndex: i++ });
    } else {
      ops.push({ type: "inserted", toIndex: j++ });
    }
  }
  while (i < n) ops.push({ type: "deleted", fromIndex: i++ });
  while (j < m) ops.push({ type: "inserted", toIndex: j++ });

  return summarize(pairRewrites(ops), to.length);
}
function alignByAnchors(from: Segment[], to: Segment[]): Alignment {
  const toIndex = new Map<string, number>();
  for (let j = 0; j < to.length; j++) {
    toIndex.set(to[j].hash, toIndex.has(to[j].hash) ? -1 : j);
  }
  const ops: AlignOp[] = [];
  const matchedTo = new Set<number>();
  for (let i = 0; i < from.length; i++) {
    const j = toIndex.get(from[i].hash);
    if (j !== undefined && j >= 0 && !matchedTo.has(j)) {
      ops.push({ type: "equal", fromIndex: i, toIndex: j });
      matchedTo.add(j);
    } else {
      ops.push({ type: "deleted", fromIndex: i });
    }
  }
  for (let j = 0; j < to.length; j++) {
    if (!matchedTo.has(j)) ops.push({ type: "inserted", toIndex: j });
  }
  ops.sort((a, b) => {
    const ai = "toIndex" in a ? a.toIndex : Number.MAX_SAFE_INTEGER;
    const bi = "toIndex" in b ? b.toIndex : Number.MAX_SAFE_INTEGER;
    return ai - bi;
  });
  return summarize(pairRewrites(ops), to.length);
}
function pairRewrites(ops: AlignOp[]): AlignOp[] {
  const out: AlignOp[] = [];
  let k = 0;

  while (k < ops.length) {
    if (ops[k].type !== "deleted") {
      out.push(ops[k++]);
      continue;
    }

    const deletes: AlignOp[] = [];
    while (k < ops.length && ops[k].type === "deleted") deletes.push(ops[k++]);

    const inserts: AlignOp[] = [];
    while (k < ops.length && ops[k].type === "inserted") inserts.push(ops[k++]);

    const paired = Math.min(deletes.length, inserts.length);
    for (let i = 0; i < paired; i++) {
      const d = deletes[i] as { fromIndex: number };
      const ins = inserts[i] as { toIndex: number };
      out.push({ type: "changed", fromIndex: d.fromIndex, toIndex: ins.toIndex });
    }
    out.push(...deletes.slice(paired), ...inserts.slice(paired));
  }

  return out;
}

function summarize(ops: AlignOp[], total: number): Alignment {
  let equal = 0;
  let changed = 0;
  let inserted = 0;
  let deleted = 0;
  for (const op of ops) {
    if (op.type === "equal") equal++;
    else if (op.type === "changed") changed++;
    else if (op.type === "inserted") inserted++;
    else deleted++;
  }
  return { ops, equal, changed, inserted, deleted, carriedForward: equal, total };
}
export type WordOp = { type: "equal" | "insert" | "delete"; text: string };
export function wordDiff(before: string, after: string): WordOp[] {
  const a = before.split(/(\s+)/).filter((t) => t.length > 0);
  const b = after.split(/(\s+)/).filter((t) => t.length > 0);
  const n = a.length;
  const m = b.length;

  if (n * m > 4_000_000) {
    return [
      { type: "delete", text: before },
      { type: "insert", text: after },
    ];
  }

  const width = m + 1;
  const dp = new Int32Array((n + 1) * width);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * width + j] =
        a[i] === b[j]
          ? dp[(i + 1) * width + j + 1] + 1
          : Math.max(dp[(i + 1) * width + j], dp[i * width + j + 1]);
    }
  }

  const raw: WordOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) (raw.push({ type: "equal", text: a[i++] }), j++);
    else if (dp[(i + 1) * width + j] >= dp[i * width + j + 1])
      raw.push({ type: "delete", text: a[i++] });
    else raw.push({ type: "insert", text: b[j++] });
  }
  while (i < n) raw.push({ type: "delete", text: a[i++] });
  while (j < m) raw.push({ type: "insert", text: b[j++] });
  const merged: WordOp[] = [];
  for (const op of raw) {
    const last = merged[merged.length - 1];
    if (last && last.type === op.type) last.text += op.text;
    else merged.push({ ...op });
  }
  return merged;
}
export function quoteIsVerbatim(quote: string, source: string): boolean {
  const norm = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
  const q = norm(quote);
  if (q.length < 8) return false;
  return norm(source).includes(q);
}
