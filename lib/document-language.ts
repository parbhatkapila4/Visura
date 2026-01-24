
export type SupportedLanguage = 'ENGLISH' | 'HINDI' | 'FRENCH' | 'GERMAN' | 'RUSSIAN';

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  ENGLISH: 'English',
  HINDI: 'Hindi',
  FRENCH: 'French',
  GERMAN: 'German',
  RUSSIAN: 'Russian',
};

export function detectDocumentLanguage(text: string): SupportedLanguage {
  const sample = text.substring(0, 5000).toLowerCase();

  const hindiPattern = /[\u0900-\u097F]/;
  if (hindiPattern.test(text)) {
    return 'HINDI';
  }

  const russianPattern = /[\u0400-\u04FF]/;
  if (russianPattern.test(text)) {
    return 'RUSSIAN';
  }

  const frenchWords = ['le', 'la', 'les', 'de', 'du', 'des', 'et', 'est', 'un', 'une', 'dans', 'pour', 'avec', 'sur', 'par'];
  const frenchCount = frenchWords.filter(word => new RegExp(`\\b${word}\\b`).test(sample)).length;
  if (frenchCount >= 5) {
    return 'FRENCH';
  }

  const germanWords = ['der', 'die', 'das', 'und', 'ist', 'für', 'mit', 'auf', 'von', 'zu', 'den', 'dem', 'des'];
  const germanCount = germanWords.filter(word => new RegExp(`\\b${word}\\b`).test(sample)).length;
  if (germanCount >= 5) {
    return 'GERMAN';
  }

  return 'ENGLISH';
}
