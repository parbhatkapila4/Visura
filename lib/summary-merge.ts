import { estimatePagesFromTextLength, getSummaryProcessingBudget } from "./summary-length-config";

const MERGE_SECTION_ORDER: string[] = [
  "executive summary",
  "overview",
  "tldr",
  "key points",
  "findings",
  "important details",
  "specifications",
  "key numbers",
  "financial",
  "rights & obligations",
  "risks",
  "concerns",
  "liabilit",
  "action items",
  "recommendations",
  "key takeaways",
  "insights",
  "additional information",
  "evidence",
  "signals",
  "gaps",
  "recommendation",
  "bottom line",
  "conclusion",
];

function mergeSectionSortKey(title: string): number {
  const t = title.toLowerCase().trim();
  const idx = MERGE_SECTION_ORDER.findIndex((k) => t.includes(k));
  return idx === -1 ? 800 : idx;
}

export function deduplicateAndMergeSections(
  chunkSummaries: string[],
  fullTextCharLength: number
): string {
  if (chunkSummaries.length === 0) return "";

  const allSections: Array<{ title: string; content: string; normalizedTitle: string }> = [];

  for (const summary of chunkSummaries) {
    const lines = summary.split("\n");
    let currentSection: { title: string; content: string[] } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headerMatch = line.match(/^###\s+(.+)$/);

      if (headerMatch) {
        if (currentSection) {
          const normalizedTitle = currentSection.title.toLowerCase().trim();
          allSections.push({
            title: currentSection.title,
            content: currentSection.content.join("\n").trim(),
            normalizedTitle,
          });
        }

        currentSection = {
          title: headerMatch[1].trim(),
          content: [],
        };
      } else if (currentSection) {
        currentSection.content.push(line);
      }
    }

    if (currentSection) {
      const normalizedTitle = currentSection.title.toLowerCase().trim();
      allSections.push({
        title: currentSection.title,
        content: currentSection.content.join("\n").trim(),
        normalizedTitle,
      });
    }
  }

  const sectionGroups = new Map<string, Array<{ title: string; content: string }>>();

  for (const section of allSections) {
    const normalized = section.normalizedTitle
      .replace(/^executive\s+summary$/i, "executive summary")
      .replace(/^key\s+insights?$/i, "key insights")
      .replace(/^evidence\s+(&|and)\s+signals?$/i, "evidence & signals")
      .replace(/^risks?\s+(&|and)\s+gaps?$/i, "risks & gaps")
      .replace(/^action(s)?$/i, "action")
      .replace(/^should\s+i\s+care\??$/i, "should i care")
      .replace(/^core\s+mental\s+models?$/i, "core mental models")
      .replace(/^high[-\s]signal\s+sections?$/i, "high-signal sections")
      .replace(/^actionable\s+takeaways?$/i, "actionable takeaways")
      .replace(/^risks?\s+(&|and)\s+limits?$/i, "risks & limits");

    if (!sectionGroups.has(normalized)) {
      sectionGroups.set(normalized, []);
    }
    sectionGroups.get(normalized)!.push({
      title: section.title,
      content: section.content,
    });
  }

  const mergedSections: Array<{ title: string; content: string }> = [];

  for (const [normalizedTitle, sections] of sectionGroups.entries()) {
    const titleCounts = new Map<string, number>();
    for (const s of sections) {
      titleCounts.set(s.title, (titleCounts.get(s.title) || 0) + 1);
    }
    const mostCommonTitle = Array.from(titleCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];

    const contentSet = new Set<string>();
    for (const s of sections) {
      const paragraphs = s.content.split("\n\n").filter((p) => p.trim().length > 0);
      for (const para of paragraphs) {
        const trimmed = para.trim();
        if (trimmed.length > 20) {
          contentSet.add(trimmed);
        }
      }
    }

    const mergedContent = Array.from(contentSet).join("\n\n");
    if (mergedContent.trim().length > 0) {
      mergedSections.push({
        title: mostCommonTitle,
        content: mergedContent,
      });
    }
  }

  const estimatedPages = estimatePagesFromTextLength(Math.max(fullTextCharLength, 1));
  const { maxSections } = getSummaryProcessingBudget(estimatedPages);

  const sorted = [...mergedSections].sort((a, b) => {
    const d = mergeSectionSortKey(a.title) - mergeSectionSortKey(b.title);
    if (d !== 0) return d;
    return a.title.localeCompare(b.title);
  });

  return sorted
    .slice(0, maxSections)
    .map((s) => `### ${s.title}\n\n${s.content}`)
    .join("\n\n");
}
export function countSummaryWords(text: string): number {
  return text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}
export interface SummarySection {
  heading: string | null;
  lines: string[];
}

export function splitSections(summary: string): SummarySection[] {
  const sections: SummarySection[] = [];
  let current: SummarySection = { heading: null, lines: [] };
  for (const line of summary.split("\n")) {
    if (/^###\s+\S/.test(line)) {
      if (current.heading !== null || current.lines.some((l) => l.trim())) sections.push(current);
      current = { heading: line, lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.heading !== null || current.lines.some((l) => l.trim())) sections.push(current);
  return sections;
}

export function joinSections(sections: SummarySection[]): string {
  return sections
    .map((s) => {
      const body = s.lines.join("\n").trim();
      return s.heading === null ? body : body ? `${s.heading}\n\n${body}` : s.heading;
    })
    .filter((part) => part.trim().length > 0)
    .join("\n\n");
}
function firstLines(section: SummarySection, depth: number): SummarySection {
  const kept: string[] = [];
  let count = 0;
  for (const line of section.lines) {
    if (line.trim()) {
      if (count === depth) break;
      count += 1;
    }
    kept.push(line);
  }
  return { heading: section.heading, lines: kept };
}
export function trimToWordBudget(summary: string, maxWords: number): string {
  const sections = splitSections(summary);
  const words = (s: SummarySection) =>
    s.lines.reduce((sum, line) => sum + countSummaryWords(line), 0);
  let total = sections.reduce(
    (sum, s) => sum + words(s) + (s.heading ? countSummaryWords(s.heading) : 0),
    0
  );

  while (total > maxWords && sections.length > 0) {
    let longest = sections.length - 1;
    for (let i = sections.length - 1; i >= 0; i--) {
      if (words(sections[i]) > words(sections[longest])) longest = i;
    }
    const section = sections[longest];
    let last = section.lines.length - 1;
    while (last >= 0 && !section.lines[last].trim()) last -= 1;
    if (last < 0) {
      total -= section.heading ? countSummaryWords(section.heading) : 0;
      sections.splice(longest, 1);
      continue;
    }
    total -= countSummaryWords(section.lines[last]);
    section.lines = section.lines.slice(0, last);
    if (!section.lines.some((l) => l.trim())) {
      total -= section.heading ? countSummaryWords(section.heading) : 0;
      sections.splice(longest, 1);
    }
  }

  return joinSections(sections);
}
export function mergeWithinWordBudget(
  chunkSummaries: string[],
  fullTextCharLength: number,
  maxWords: number
): string {
  const merged = deduplicateAndMergeSections(chunkSummaries, fullTextCharLength);
  if (countSummaryWords(merged) <= maxWords) return merged;

  const parsed = chunkSummaries.map(splitSections);
  const all = parsed.map((_, i) => i);
  const build = (depth: number, chunks: number[]) =>
    deduplicateAndMergeSections(
      chunks.map((i) => joinSections(parsed[i].map((s) => firstLines(s, depth)))),
      fullTextCharLength
    );
  const fits = (text: string) => countSummaryWords(text) <= maxWords;

  if (fits(build(1, all))) {
    let low = 1;
    let high = Math.max(
      1,
      ...parsed.flatMap((sections) => sections.map((s) => s.lines.filter((l) => l.trim()).length))
    );
    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      if (fits(build(mid, all))) low = mid;
      else high = mid - 1;
    }
    return build(low, all);
  }
  const spaced = (count: number) => {
    if (count <= 1) return [0];
    const picked = new Set<number>();
    for (let j = 0; j < count; j++) {
      picked.add(Math.round((j * (parsed.length - 1)) / (count - 1)));
    }
    return [...picked].sort((a, b) => a - b);
  };

  if (!fits(build(1, spaced(1)))) return trimToWordBudget(build(1, spaced(1)), maxWords);
  let low = 1;
  let high = parsed.length - 1;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (fits(build(1, spaced(mid)))) low = mid;
    else high = mid - 1;
  }
  return build(1, spaced(low));
}
