import type { ChangeCard, CompareResult, Materiality } from "./document-compare";
import { changesOnlyHeadline, coverageHeadline } from "./document-compare";
import { changeTopicLabel, type ClaimVerdict } from "./change-claims";
import type { WordOp } from "./document-segmentation";

export interface MemoInput {
  result: CompareResult;
  beforeName: string;
  afterName: string;
  coverageIsSound: boolean;
  caveats?: string[];
  verdict?: ClaimVerdict;
}
export function changeSummaryLine(card: ChangeCard): string {
  const removed = card.diff
    .filter((o) => o.type === "delete")
    .map((o) => o.text.trim())
    .filter(Boolean)
    .join(" … ");
  const added = card.diff
    .filter((o) => o.type === "insert")
    .map((o) => o.text.trim())
    .filter(Boolean)
    .join(" … ");

  const clip = (s: string, n = 120) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

  if (removed && added) return `${clip(removed)} → ${clip(added)}`;
  if (added) return `added: ${clip(added, 200)}`;
  return `removed: ${clip(removed, 200)}`;
}

const HEADING: Record<Materiality, string> = {
  material: "MATERIAL",
  substantive: "SUBSTANTIVE",
  cosmetic: "COSMETIC",
};

function grouped(result: CompareResult): Array<[Materiality, ChangeCard[]]> {
  const order: Materiality[] = ["material", "substantive", "cosmetic"];
  return order
    .map(
      (m) => [m, result.changes.filter((c) => c.materiality === m)] as [Materiality, ChangeCard[]]
    )
    .filter(([, cards]) => cards.length > 0);
}

export function memoText(input: MemoInput): string {
  const { result, beforeName, afterName, coverageIsSound, caveats = [], verdict } = input;

  const lines: string[] = [
    `${beforeName} → ${afterName}`,
    "",
    coverageIsSound ? coverageHeadline(result) : changesOnlyHeadline(result),
  ];
  if (verdict?.answered) {
    lines.push("", verdict.headline);
    for (const card of verdict.unmentioned) {
      const where = card.page !== null ? ` (page ${card.page})` : "";
      lines.push(`  - ${changeTopicLabel(card)}${where}`);
    }
  }

  if (!coverageIsSound) {
    lines.push("", "Coverage is not reported for this pair:");
    for (const c of caveats) lines.push(`  - ${c}`);
  }

  for (const [materiality, cards] of grouped(result)) {
    lines.push("", `${HEADING[materiality]} (${cards.length})`);
    cards.forEach((card, i) => {
      const where = card.page !== null ? `page ${card.page} — ` : "";
      lines.push(`${i + 1}. ${where}${changeSummaryLine(card)}`);
    });
  }

  lines.push(
    "",
    "Compared with Visura. Both files stayed in the browser — neither was uploaded.",
    "visura.parbhat.dev/compare"
  );

  return lines.join("\n");
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function diffHtml(ops: WordOp[]): string {
  return ops
    .map((op) => {
      const text = escapeHtml(op.text);
      if (op.type === "equal") return text;
      if (op.type === "delete") return `<del>${text}</del>`;
      return `<ins>${text}</ins>`;
    })
    .join("");
}
export function memoHtml(input: MemoInput): string {
  const { result, beforeName, afterName, coverageIsSound, caveats = [], verdict } = input;
  const headline = coverageIsSound ? coverageHeadline(result) : changesOnlyHeadline(result);

  const finding =
    verdict?.answered && verdict.unmentioned.length > 0
      ? `<div class="f"><p class="fh">${escapeHtml(verdict.headline)}</p><ul>${verdict.unmentioned
          .map(
            (c) =>
              `<li>${escapeHtml(changeTopicLabel(c))}${c.page !== null ? ` · page ${c.page}` : ""}</li>`
          )
          .join("")}</ul></div>`
      : verdict?.answered
        ? `<div class="f f--ok"><p class="fh">${escapeHtml(verdict.headline)}</p></div>`
        : "";

  const sections = grouped(result)
    .map(([materiality, cards]) => {
      const items = cards
        .map((card) => {
          const meta = [
            card.kind === "inserted" ? "Added" : card.kind === "deleted" ? "Removed" : "Changed",
            card.page !== null ? `page ${card.page}` : null,
          ]
            .filter(Boolean)
            .join(" · ");
          return `<article class="c ${materiality}"><p class="m">${escapeHtml(meta)}</p><p class="d">${diffHtml(card.diff)}</p></article>`;
        })
        .join("\n");
      return `<section><h2>${HEADING[materiality]} <span class="n">${cards.length}</span></h2>${items}</section>`;
    })
    .join("\n");

  const warning = coverageIsSound
    ? ""
    : `<div class="w"><p><strong>Coverage is not reported for this pair.</strong></p><ul>${caveats
        .map((c) => `<li>${escapeHtml(c)}</li>`)
        .join("")}</ul></div>`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(afterName)} — comparison</title>
<style>
  body { margin:0; background:#f3f1e9; color:#2b2927; font:15px/1.55 ui-sans-serif, system-ui, sans-serif; }
  main { max-width: 880px; margin:0 auto; padding:48px 20px 96px; }
  .e { font:12px ui-monospace, monospace; color:#67625c; word-break:break-all; }
  h1 { font:400 34px/1.12 Georgia, serif; letter-spacing:-.02em; margin:14px 0 0; max-width:22ch; }
  .note { color:#524e48; margin-top:14px; }
  h2 { font-size:14px; letter-spacing:.02em; margin:40px 0 12px; border-top:1px solid #dedacf; padding-top:12px; }
  .n { font:400 13px ui-monospace, monospace; color:#67625c; }
  .c { border:1px solid #dedacf; border-left:3px solid #c6c1b3; border-radius:4px; background:rgba(255,255,255,.6); padding:16px 18px; margin-bottom:10px; }
  .c.material { border-left-color:#a65808; }
  .c.substantive { border-left-color:#5b7690; }
  .m { font:11px ui-monospace, monospace; letter-spacing:.06em; text-transform:uppercase; color:#67625c; margin:0; }
  .d { font:16px/1.6 Georgia, serif; margin:10px 0 0; overflow-wrap:anywhere; }
  del { background:#f6dcd6; color:#7c2d1e; padding:1px 2px; border-radius:2px; }
  ins { background:#ddf0ea; color:#0a4f47; text-decoration:none; padding:1px 2px; border-radius:2px; }
  .w { border:1px solid #a65808; border-left-width:3px; background:#f6e7d2; border-radius:4px; padding:14px 18px; margin-top:28px; }
  .w ul { margin:8px 0 0; padding-left:18px; }
  .f { border:1px solid #a65808; border-left-width:3px; background:#fbf0e0; border-radius:4px; padding:16px 18px; margin-top:26px; }
  .f--ok { border-color:#0a4f47; background:#e7f2ef; }
  .fh { font:600 17px/1.4 ui-sans-serif, system-ui, sans-serif; margin:0; }
  .f ul { margin:10px 0 0; padding-left:18px; }
  .f li { margin-top:4px; }
  footer { margin-top:56px; padding-top:16px; border-top:1px solid #dedacf; font-size:13px; color:#67625c; }
</style></head>
<body><main>
<p class="e">${escapeHtml(beforeName)} → ${escapeHtml(afterName)}</p>
<h1>${escapeHtml(headline)}</h1>
<p class="note">Compared with Visura. Both files stayed in the sender's browser — neither was uploaded.</p>
${finding}
${warning}
${sections}
<footer>Coverage is measured over the text as extracted from these two files, after normalisation. It is a claim about characters, not about meaning: a clause reworded to say the same thing still counts as changed, and one moved elsewhere counts as a deletion and an insertion.</footer>
</main></body></html>`;
}
export function memoFilename(afterName: string): string {
  const stem = afterName
    .replace(/\.[^.]+$/, "")
    .replace(/[^\w.-]+/g, "-")
    .replace(/[-.]{2,}/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
  return `${stem || "comparison"}-changes.html`;
}
