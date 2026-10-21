import type { ChangeCard, CompareResult } from "./document-compare";

export interface ChangeTopic {
  id: string;
  label: string;
  page: number | null;
}

const HEADING =
  /(?:\b(\d{1,2}(?:\.\d{1,2})*)\.?\s+([A-Z][A-Z0-9&'’\- ]{2,48}?)(?=\s+[A-Z][a-z]|\s*$)|\b((?:SCHEDULE|ARTICLE|ANNEX|APPENDIX|EXHIBIT|SECTION)\s+[A-Z0-9]{1,4})\b)/g;

function headings(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(HEADING)) {
    const label = m[3] ?? `${m[1]}. ${m[2]}`;
    out.push(label.replace(/\s+/g, " ").trim());
  }
  return out;
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
export function changeTopicLabel(card: ChangeCard): string {
  const firstEdit = card.diff.findIndex((op) => op.type !== "equal");
  const lead = card.diff
    .slice(0, firstEdit === -1 ? card.diff.length : firstEdit)
    .map((op) => op.text)
    .join(" ");

  const before = headings(lead);
  if (before.length > 0) return before[before.length - 1];

  const anywhere = headings(card.diff.map((op) => op.text).join(" "));
  if (anywhere.length > 0) return anywhere[0];

  if (card.page !== null) {
    const changed = card.diff
      .filter((op) => op.type !== "equal")
      .map((op) => op.text.trim())
      .filter(Boolean)
      .join(" ");
    return changed ? `Page ${card.page} — ${clip(changed, 44)}` : `Page ${card.page}`;
  }

  const changed = card.diff
    .filter((op) => op.type !== "equal")
    .map((op) => op.text.trim())
    .filter(Boolean)
    .join(" ");
  return clip(changed || "Unlabelled change", 56);
}
export function changeTopics(result: CompareResult): ChangeTopic[] {
  return result.changes.map((card) => ({
    id: card.id,
    label: changeTopicLabel(card),
    page: card.page,
  }));
}

export interface ClaimVerdict {
  acknowledged: ChangeCard[];
  unmentioned: ChangeCard[];
  answered: boolean;
  headline: string;
}

export function claimVerdict(
  result: CompareResult,
  acknowledgedIds: ReadonlySet<string>
): ClaimVerdict {
  const acknowledged = result.changes.filter((c) => acknowledgedIds.has(c.id));
  const unmentioned = result.changes.filter((c) => !acknowledgedIds.has(c.id));
  const answered = acknowledged.length > 0;

  let headline: string;
  if (!answered) {
    headline = "";
  } else if (unmentioned.length === 0) {
    headline = "Everything that changed, you were told about.";
  } else {
    const n = unmentioned.length;
    const material = unmentioned.filter((c) => c.materiality === "material").length;
    const noun = n === 1 ? "change" : "changes";
    headline =
      material === n
        ? `${n} ${noun} you were not told about, ${n === 1 ? "and it is" : "all of them"} material.`
        : material > 0
          ? `${n} ${noun} you were not told about, ${material} material.`
          : `${n} ${noun} you were not told about.`;
  }

  return { acknowledged, unmentioned, answered, headline };
}
