import {
  CHUNK_SUMMARY_BUDGET,
  getSummaryProcessingBudget,
  type SummaryProcessingBudget,
} from "./summary-length-config";

export function enforceWordLimits(
  summary: string,
  estimatedPages: number,
  options?: { isChunk?: boolean; budget?: SummaryProcessingBudget }
): string {
  const resolved: SummaryProcessingBudget =
    options?.budget ??
    (options?.isChunk ? CHUNK_SUMMARY_BUDGET : getSummaryProcessingBudget(estimatedPages));

  const lines = summary.split("\n");
  const processedLines: string[] = [];
  let totalWords = 0;
  const MAX_TOTAL_WORDS = resolved.maxTotalWords;
  const MAX_BULLET_WORDS = resolved.maxBulletWords;
  const MAX_BULLETS_PER_SECTION = resolved.maxBulletsPerSection;
  const MAX_SECTIONS = resolved.maxSections;

  let currentSection: string[] = [];
  let bulletCount = 0;
  let sectionCount = 0;

  for (const line of lines) {
    if (line.match(/^###\s+/)) {
      if (sectionCount >= MAX_SECTIONS) {
        break;
      }
      if (currentSection.length > 0) {
        processedLines.push(...currentSection);
      }
      processedLines.push(line);
      currentSection = [];
      bulletCount = 0;
      sectionCount++;
    } else if (line.trim().startsWith("-") || line.trim().startsWith("•")) {
      if (sectionCount >= MAX_SECTIONS) {
        break;
      }
      const words = line.trim().split(/\s+/);
      const wordCount = words.length;

      if (wordCount > MAX_BULLET_WORDS) {
        const truncated = words.slice(0, MAX_BULLET_WORDS).join(" ");
        const bulletPrefix = line.trim().match(/^[-•]\s*/)?.[0] || "- ";
        if (
          bulletCount < MAX_BULLETS_PER_SECTION &&
          totalWords + MAX_BULLET_WORDS <= MAX_TOTAL_WORDS
        ) {
          currentSection.push(bulletPrefix + truncated);
          bulletCount++;
          totalWords += MAX_BULLET_WORDS;
        }
      } else {
        if (bulletCount < MAX_BULLETS_PER_SECTION && totalWords + wordCount <= MAX_TOTAL_WORDS) {
          currentSection.push(line);
          bulletCount++;
          totalWords += wordCount;
        }
      }
    } else if (line.trim().length > 0 && !line.trim().startsWith("#")) {
      const words = line.trim().split(/\s+/);
      const wordCount = words.length;
      if (
        wordCount <= MAX_BULLET_WORDS &&
        totalWords + wordCount <= MAX_TOTAL_WORDS &&
        sectionCount < MAX_SECTIONS
      ) {
        currentSection.push(line);
        totalWords += wordCount;
      }
    }

    if (totalWords >= MAX_TOTAL_WORDS || sectionCount >= MAX_SECTIONS) {
      break;
    }
  }

  if (currentSection.length > 0 && sectionCount < MAX_SECTIONS) {
    processedLines.push(...currentSection);
  }

  let result = processedLines.join("\n");
  const finalWordCount = result.split(/\s+/).filter((w) => w.length > 0).length;

  if (finalWordCount > MAX_TOTAL_WORDS) {
    const words = result.split(/\s+/).filter((w) => w.length > 0);
    result = words.slice(0, MAX_TOTAL_WORDS).join(" ");
  }

  return result.trim();
}

export function enforceSummaryStructure(summary: string, estimatedPages: number): string {
  const { maxSections } = getSummaryProcessingBudget(estimatedPages);

  const sections: Array<{ title: string; content: string; index: number }> = [];
  const seenHeaders = new Set<string>();

  const lines = summary.split("\n");
  let currentSection: { title: string; content: string[] } | null = null;
  let sectionIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(/^###\s+(.+)$/);

    if (headerMatch) {
      const headerTitle = headerMatch[1].trim().toLowerCase();

      if (currentSection) {
        sections.push({
          title: currentSection.title,
          content: currentSection.content.join("\n").trim(),
          index: sectionIndex++,
        });
      }

      if (seenHeaders.has(headerTitle) || sections.length >= maxSections) {
        currentSection = null;
        continue;
      }

      seenHeaders.add(headerTitle);
      currentSection = {
        title: headerMatch[1].trim(),
        content: [],
      };
    } else if (currentSection) {
      currentSection.content.push(line);
    }
  }

  if (currentSection && sections.length < maxSections) {
    sections.push({
      title: currentSection.title,
      content: currentSection.content.join("\n").trim(),
      index: sectionIndex++,
    });
  }

  const uniqueSections = sections.slice(0, maxSections);

  const uniqueTitlesLower = uniqueSections.map((s) => s.title.toLowerCase());
  const usesExecutivePromptShape =
    uniqueTitlesLower.some((t) => t.includes("executive summary")) ||
    uniqueTitlesLower.some((t) => t.includes("key points") || t.includes("findings")) ||
    uniqueTitlesLower.some(
      (t) => t.includes("important details") || t.includes("specifications")
    ) ||
    uniqueTitlesLower.some((t) => t.includes("risks & concerns") || t.includes("critical risks")) ||
    uniqueTitlesLower.some(
      (t) => t.includes("action items") || t.includes("recommendations") || t.includes("action")
    );

  if (usesExecutivePromptShape) {
    return uniqueSections.map((s) => `### ${s.title}\n\n${s.content}`).join("\n\n");
  }

  const expectedSections = [
    "TL;DR",
    "Key Numbers",
    "Critical Risks",
    "Action Items",
    "Bottom Line",
  ];

  const finalSections: string[] = [];

  for (const expected of expectedSections) {
    const found = uniqueSections.find(
      (s) =>
        s.title.toLowerCase().includes(expected.toLowerCase()) ||
        expected.toLowerCase().includes(s.title.toLowerCase()) ||
        (expected === "TL;DR" &&
          (s.title.toLowerCase().includes("summary") || s.title.toLowerCase().includes("tldr"))) ||
        (expected === "Key Numbers" &&
          (s.title.toLowerCase().includes("numbers") ||
            s.title.toLowerCase().includes("data") ||
            s.title.toLowerCase().includes("metrics"))) ||
        (expected === "Critical Risks" &&
          (s.title.toLowerCase().includes("risk") || s.title.toLowerCase().includes("warning"))) ||
        (expected === "Action Items" &&
          (s.title.toLowerCase().includes("action") || s.title.toLowerCase().includes("next"))) ||
        (expected === "Bottom Line" &&
          (s.title.toLowerCase().includes("bottom") ||
            s.title.toLowerCase().includes("verdict") ||
            s.title.toLowerCase().includes("conclusion")))
    );

    if (found) {
      finalSections.push(`### ${found.title}\n\n${found.content}`);
    }
  }

  if (finalSections.length === 0 && uniqueSections.length > 0) {
    return uniqueSections
      .slice(0, maxSections)
      .map((s) => `### ${s.title}\n\n${s.content}`)
      .join("\n\n");
  }

  return finalSections.join("\n\n");
}

export function validateSummary(
  summary: string,
  detectedLanguage: string,
  documentType: string,
  options?: { isChunk?: boolean }
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const lowerSummary = summary.toLowerCase();
  const isChunk = options?.isChunk ?? false;

  const badPhrases = [
    "i cannot access",
    "i apologize",
    "unable to access",
    "unreadable",
    "requires translation",
    "cannot extract",
    "requires decryption",
    "encrypted",
    "cannot read",
    "unable to read",
    "no meaningful information",
    "translate document immediately",
    "consult legal counsel",
  ];

  if (detectedLanguage === "ENGLISH") {
    const hasBadPhrase = badPhrases.some((phrase) => lowerSummary.includes(phrase));
    if (hasBadPhrase) {
      errors.push("Summary contains generic/unhelpful phrases");
    }
  }

  if (detectedLanguage === "ENGLISH") {
    const wordCount = summary.split(/\s+/).filter((w) => w.length > 0).length;

    if (!isChunk && wordCount < 500) {
      errors.push(
        `Summary is too short - should be at least 500 words for comprehensive summaries (${wordCount})`
      );
    }
    if (isChunk && wordCount < 40) {
      errors.push(`Chunk summary is too short (${wordCount} words)`);
    }

    if (wordCount > 12000) {
      errors.push(`Summary exceeds 12000 words (${wordCount})`);
    }
  } else {
    const estimatedWords = Math.ceil(summary.length / 4);
    if (!isChunk && estimatedWords < 400) {
      errors.push(
        `Summary is too short - should be at least 400 words estimated (${estimatedWords})`
      );
    }
    if (isChunk && estimatedWords < 40) {
      errors.push(`Chunk summary is too short (${estimatedWords} words estimated)`);
    }
    if (estimatedWords > 12000) {
      errors.push(`Summary exceeds estimated word limit (${estimatedWords} words estimated)`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
