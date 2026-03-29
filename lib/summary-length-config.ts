export const APPROX_CHARS_PER_PAGE = 1900;

export function estimatePagesFromTextLength(textLength: number): number {
  return Math.max(1, Math.ceil(textLength / APPROX_CHARS_PER_PAGE));
}

export interface SummaryProcessingBudget {
  maxSections: number;
  maxTotalWords: number;
  maxBulletsPerSection: number;
  maxBulletWords: number;
}

export function getSummaryProcessingBudget(estimatedPages: number): SummaryProcessingBudget {
  const p = estimatedPages;
  if (p <= 15) {
    return {
      maxSections: 7,
      maxTotalWords: 3500,
      maxBulletsPerSection: 40,
      maxBulletWords: 120,
    };
  }
  if (p <= 50) {
    return {
      maxSections: 10,
      maxTotalWords: 6000,
      maxBulletsPerSection: 52,
      maxBulletWords: 120,
    };
  }
  if (p <= 150) {
    return {
      maxSections: 12,
      maxTotalWords: 8500,
      maxBulletsPerSection: 58,
      maxBulletWords: 130,
    };
  }
  if (p <= 400) {
    return {
      maxSections: 15,
      maxTotalWords: 10_000,
      maxBulletsPerSection: 65,
      maxBulletWords: 130,
    };
  }
  return {
    maxSections: 18,
    maxTotalWords: 12_000,
    maxBulletsPerSection: 72,
    maxBulletWords: 140,
  };
}

export function getSummaryMaxOutputTokens(estimatedPages: number, isChunk: boolean): number {
  if (isChunk) return 1200;
  const p = estimatedPages;
  if (p <= 15) return 6000;
  if (p <= 50) return 10_000;
  if (p <= 150) return 14_000;
  if (p <= 400) return 18_000;
  return 22_000;
}

export function getSummaryFinalWordCap(estimatedPages: number, isChunk: boolean): number {
  if (isChunk) return 700;
  return getSummaryProcessingBudget(estimatedPages).maxTotalWords;
}

export const CHUNK_SUMMARY_BUDGET: SummaryProcessingBudget = {
  maxSections: 7,
  maxTotalWords: 720,
  maxBulletsPerSection: 18,
  maxBulletWords: 95,
};
