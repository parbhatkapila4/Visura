import { openrouterChatCompletion } from "@/lib/openrouter";
import { logger } from "@/lib/logger";
import { cached, getSummaryCacheKey } from "@/lib/cache";
import { hashContent } from "@/lib/versioned-documents";
import { measurePerformance } from "@/lib/performance-monitor";
import { classifyDocument, type DocumentClassification } from "@/lib/document-classification";
import { detectDocumentLanguage, type SupportedLanguage, LANGUAGE_NAMES } from "@/lib/document-language";
import { getTypeSpecificPrompt } from "@/lib/summary-prompts";
import { enforceSummaryStructure, enforceWordLimits, validateSummary } from "@/lib/summary-post-processing";

export type { DocumentClassification, SupportedLanguage };
export { classifyDocument, detectDocumentLanguage, LANGUAGE_NAMES };

async function _classifyDocumentInternal(text: string): Promise<DocumentClassification> {
  const sampleText = text.substring(0, 15000).toLowerCase();

  const signals: Record<string, RegExp[]> = {
    'LEGAL/CONTRACT': [
      /whereas/i,
      /\bparty\s+(a|b|first|second)\b/i,
      /signature\s+block/i,
      /indemnif/i,
      /liability/i,
      /\b\d+\.\d+\s+[a-z]/i,
      /clause\s+\d+/i,
      /agreement\s+between/i,
      /terms\s+and\s+conditions/i,
      /breach\s+of\s+contract/i,
      /governing\s+law/i,
    ],
    'FINANCIAL/BOND': [
      /bond\s+indenture/i,
      /coupon\s+rate/i,
      /maturity\s+date/i,
      /yield\s+to\s+maturity/i,
      /principal\s+amount/i,
      /interest\s+payment/i,
      /credit\s+rating/i,
      /debt\s+instrument/i,
      /face\s+value/i,
      /p&l|profit\s+and\s+loss/i,
      /revenue/i,
      /ebitda/i,
      /financial\s+statement/i,
    ],
    'PRODUCT/TECHNICAL': [
      /\bprd\b/i,
      /product\s+requirements/i,
      /user\s+stor/i,
      /api\s+doc/i,
      /```[\s\S]*?```/,
      /requirements?\s+spec/i,
      /architecture/i,
      /technical\s+spec/i,
      /system\s+design/i,
      /feature\s+list/i,
    ],
    'RESEARCH/ANALYSIS': [
      /methodology/i,
      /hypothesis/i,
      /findings/i,
      /statistical/i,
      /survey\s+result/i,
      /data\s+analysis/i,
      /research\s+question/i,
      /literature\s+review/i,
      /case\s+study/i,
    ],
    'MEETING NOTES': [
      /attendees?:/i,
      /action\s+items?/i,
      /\[[\sx]\]/i,
      /decisions?\s+made/i,
      /meeting\s+notes/i,
      /minutes/i,
      /agenda/i,
      /next\s+steps/i,
    ],
    'MARKETING': [
      /target\s+audience/i,
      /campaign/i,
      /brand\s+voice/i,
      /messaging\s+framework/i,
      /kpis?/i,
      /marketing\s+strategy/i,
      /go-to-market/i,
      /brand\s+guidelines/i,
    ],
    'HR/PEOPLE': [
      /job\s+description/i,
      /salary\s+band/i,
      /performance\s+review/i,
      /org\s+chart/i,
      /benefits\s+package/i,
      /hiring/i,
      /employee\s+handbook/i,
      /compensation/i,
    ],
    'NOVEL/CREATIVE': [
      /chapter\s+\d+/i,
      /"[^"]*"/,
      /character\s+arc/i,
      /plot\s+structure/i,
      /narrative\s+voice/i,
      /protagonist/i,
      /antagonist/i,
      /dialogue/i,
      /scene\s+setting/i,
    ],
    'PROJECT/PROPOSAL': [
      /project\s+description/i,
      /project\s+scope/i,
      /deliverables/i,
      /timeline/i,
      /milestones/i,
      /project\s+plan/i,
      /proposal/i,
      /statement\s+of\s+work/i,
    ],
  };

  const scores: Record<string, number> = {};

  for (const [type, patterns] of Object.entries(signals)) {
    let score = 0;
    for (const pattern of patterns) {
      const matches = sampleText.match(pattern);
      if (matches) {
        score += matches.length;
      }
    }
    scores[type] = score;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topType = sorted[0][0];
  const topScore = sorted[0][1];
  const secondScore = sorted[1]?.[1] || 0;

  const confidence = topScore > 0
    ? Math.min(95, Math.round((topScore / (topScore + secondScore + 1)) * 100))
    : 50;

  return {
    type: topType,
    confidence,
    subtype: topScore > 3 && sorted.length > 1 && sorted[1][1] > 0
      ? sorted[1][0]
      : undefined,
  };
}

export async function generateSummaryFromText(
  pdfText: string,
  language: SupportedLanguage = 'ENGLISH',
  options?: { isChunk?: boolean }
) {
  try {
    const isChunk = options?.isChunk || false;
    logger.info("Starting summary generation with classification and type-specific prompts", {
      requestedLanguage: language,
      requestedLanguageName: LANGUAGE_NAMES[language],
      isChunk,
      textLength: pdfText.length,
    });

    const detectedLanguage = detectDocumentLanguage(pdfText);
    logger.info("Document language detected", {
      detectedLanguage,
      detectedLanguageName: LANGUAGE_NAMES[detectedLanguage],
      outputLanguage: language,
      outputLanguageName: LANGUAGE_NAMES[language],
      textLength: pdfText.length,
      languageMatch: detectedLanguage === language,
    });

    if (detectedLanguage === 'HINDI') {
      const hasDevanagari = /[\u0900-\u097F]/.test(pdfText);
      const devanagariCount = (pdfText.match(/[\u0900-\u097F]/g) || []).length;
      logger.info("Hindi validation", {
        hasDevanagari,
        devanagariCount,
      });

      if (!hasDevanagari && pdfText.length > 100) {
        logger.warn("Document detected as Hindi but no Devanagari script found", {
          textLength: pdfText.length,
          preview: pdfText.substring(0, 500),
        });
      }
    }

    if (!pdfText || pdfText.trim().length < 50) {
      throw new Error("Text content too short to generate summary");
    }

    const estimatedPages = Math.ceil(pdfText.length / 1900);
    const isShortDocument = estimatedPages <= 15;

    logger.info("Document length estimated", {
      estimatedPages,
      isShortDocument,
      textLength: pdfText.length,
    });

    const textToSummarize =
      pdfText.length > 200000
        ? pdfText.substring(0, 200000) +
        "\n\n[Content truncated for processing - document is very long]"
        : pdfText;

    logger.info("Classifying document type");
    const classification = await measurePerformance(
      "document_classification",
      async () => {
        return await classifyDocument(pdfText);
      },
      { textLength: String(pdfText.length) }
    );
    logger.info("Document classified", {
      type: classification.type,
      confidence: classification.confidence,
      subtype: classification.subtype,
    });

    const typeSpecificPrompt = getTypeSpecificPrompt(classification.type, estimatedPages, isChunk);
    logger.info("Using type-specific prompt template", {
      type: classification.type,
      requestedLanguage: language,
      requestedLanguageName: LANGUAGE_NAMES[language],
    });

    logger.info("Generating type-specific summary", {
      model: "anthropic/claude-3.5-haiku",
      type: classification.type,
      requestedLanguage: language,
      requestedLanguageName: LANGUAGE_NAMES[language],
      detectedLanguage,
      detectedLanguageName: LANGUAGE_NAMES[detectedLanguage],
    });

    const textHash = hashContent(textToSummarize);


    const generateSummary = async () => {
      logger.info("Generating new summary (cache miss or language mismatch)", {
        textHash,
        requestedLanguage: language,
        requestedLanguageName: LANGUAGE_NAMES[language],
      });

      let response = await measurePerformance(
        "ai_summary_generation",
        async () => {
          const temperature = 0.3;
          const maxTokens = isChunk ? 800 : 4000;

          return await openrouterChatCompletion({
            model: "anthropic/claude-3.5-haiku",
            messages: [
              {
                role: "system",
                content: `You are Visura, an AI assistant that creates comprehensive, well-structured document summaries for founders and business professionals.

CRITICAL LANGUAGE REQUIREMENT - READ THIS CAREFULLY:
YOU MUST WRITE THE ENTIRE SUMMARY IN ${LANGUAGE_NAMES[language].toUpperCase()}.
DO NOT WRITE IN ENGLISH.
DO NOT USE ENGLISH WORDS.
DO NOT MIX LANGUAGES.

${language === 'RUSSIAN' ? `
OUTPUT LANGUAGE: RUSSIAN (Русский)
- You MUST use Cyrillic script (кириллица) for ALL text
- Example CORRECT: "Это документ о продаже"
- Example WRONG: "Eto dokument o prodazhe" or "This is a document"
- Use Russian words: это, документ, о, для, с, по, из, на, в, к, от, при, за, про, без, под, над, между, среди
` : ''}
${language === 'GERMAN' ? `
OUTPUT LANGUAGE: GERMAN (Deutsch)
- You MUST use German words and grammar
- Use: der, die, das, und, ist, für, mit, auf, von, zu, den, dem, des, eine, ein, sind, werden, haben, können, muss, wird, wurde, dass, wenn, aber, oder, nicht, auch, nur, noch, schon, immer, sehr, mehr, viel, alle, jeder, dieser, jener
- Example CORRECT: "Dies ist ein Dokument über den Verkauf"
- Example WRONG: "This is a document about the sale"
- Write EVERYTHING in German, not English
` : ''}
${language === 'FRENCH' ? `
OUTPUT LANGUAGE: FRENCH (Français)
- You MUST use French words and grammar
- Use: le, la, les, de, du, des, et, est, un, une, dans, pour, avec, sur, par, que, qui, dont, où
- Example CORRECT: "Ceci est un document sur la vente"
- Example WRONG: "This is a document about the sale"
` : ''}
${language === 'HINDI' ? `
OUTPUT LANGUAGE: HINDI (हिंदी)
- You MUST use Devanagari script (हिंदी) for ALL text
- DO NOT use English transliteration
- Example CORRECT: "यह बिक्री के बारे में एक दस्तावेज़ है"
- Example WRONG: "Yeh bikri ke bare mein ek document hai" or "This is a document about sale"
- Use Hindi words: यह, एक, है, और, के, में, से, को, पर, के लिए, इस, उस, सभी, कुछ, बहुत, अधिक, कम, नहीं, हाँ
- Write in Hindi script (Devanagari), NOT in English letters
` : ''}

INPUT: Document is in ${LANGUAGE_NAMES[detectedLanguage]}
OUTPUT: Summary MUST be 100% in ${LANGUAGE_NAMES[language]} - NO EXCEPTIONS

SUMMARY GUIDELINES:
${isChunk ? `
- This is a CHUNK summary (part of a larger document) - aim for 200-400 words total
- Extract key information, facts, numbers, dates, and important details from this chunk
- Be concise but informative - focus on the most important information in this section
- Use clear, professional language
- Organize information logically in the provided sections
- Fill each section with relevant content from this chunk
- Be specific - include numbers, dates, names, and concrete details when available
- This will be merged with other chunk summaries to create the final comprehensive summary
` : `
- Be EXTREMELY comprehensive and detailed - aim for 2,000-3,000 words total
- Extract ALL information, facts, numbers, dates, quotes, examples, and specific details from the document
- Be purely informative - focus on facts, data, and concrete information from the document
- Use clear, professional language with detailed explanations
- Organize information logically in the provided sections
- Fill each section completely with substantial, detailed content
- Be very specific and detailed - include extensive information, not just key points
- Include actual numbers, dates, names, percentages, quotes, examples, case studies, and all concrete details
- Provide comprehensive coverage - don't summarize too much, include more detail
- Make it informative and factual - extract and present all relevant information from the document
`}

IF YOU WRITE IN ENGLISH WHEN ${LANGUAGE_NAMES[language].toUpperCase()} IS REQUESTED, THIS IS A COMPLETE FAILURE.`,
              },
              {
                role: "user",
                content: `LANGUAGE REQUIREMENT: Write the ENTIRE summary in ${LANGUAGE_NAMES[language]}. DO NOT use English.

Document Type: ${classification.type}

${typeSpecificPrompt}

DOCUMENT TEXT (written in ${LANGUAGE_NAMES[detectedLanguage]}):
${textToSummarize}

INSTRUCTIONS:
1. Read the ENTIRE document carefully and thoroughly (it's in ${LANGUAGE_NAMES[detectedLanguage]})
2. Extract ALL information, facts, numbers, dates, quotes, examples, names, and details from the document
3. Write the summary COMPLETELY in ${LANGUAGE_NAMES[language]} - DO NOT use English
4. Follow the section structure provided in the prompt
5. Be EXTREMELY thorough and detailed - provide comprehensive, informative content (aim for 2,000-3,000 words total)
6. Include extensive specific details: names, dates, amounts, percentages, deadlines, quotes, examples, case studies, statistics
7. Make it purely informative - focus on facts and detailed information from the document
8. Fill each section with substantial content - don't be brief, be comprehensive
9. Extract and present ALL relevant information, not just key points
10. Be detailed and factual - include extensive information from the document
${language === 'HINDI' ? '11. IMPORTANT: Write in Devanagari script (हिंदी), NOT in English transliteration' : ''}
${language === 'GERMAN' ? '11. IMPORTANT: Use German words (der, die, das, und, ist, für, mit, etc.), NOT English words' : ''}

Create a comprehensive, detailed, and purely informative summary now. Output language MUST be ${LANGUAGE_NAMES[language]}.`,
              },
            ],
            temperature,
            max_tokens: maxTokens,
          });
        },
        { type: classification.type, language, estimatedPages: estimatedPages.toString() }
      );


      if (language !== 'ENGLISH') {
        const responseLower = response.toLowerCase();
        const hasCyrillic = /[\u0400-\u04FF]/.test(response);
        const hasDevanagari = /[\u0900-\u097F]/.test(response);
        const hasGermanChars = /[äöüÄÖÜß]/.test(response);
        const hasGermanWords = /\b(der|die|das|und|ist|für|mit|auf|von|zu|den|dem|des|eine|ein|sind|werden|haben|können|müssen|wird|wurde|wurden|kann|muss|soll|sollte|dass|wenn|aber|oder|nicht|auch|nur|noch|schon|immer|sehr|mehr|viel|alle|jeder|dieser|jener|welcher|welche|welches)\b/i.test(responseLower);
        const hasFrenchChars = /[àâäéèêëïîôùûüÿç]/.test(response);
        const hasFrenchWords = /\b(le|la|les|de|du|des|et|est|un|une|dans|pour|avec|sur|par|que|qui|dont|où)\b/i.test(responseLower);
        const isEnglish = /\b(the|and|is|are|was|were|this|that|with|from|for|can|will|would|should)\b/i.test(responseLower) &&
          !hasCyrillic && !hasDevanagari && !hasGermanChars && !hasFrenchChars;

        const languageChecks: Record<Exclude<SupportedLanguage, 'ENGLISH'>, boolean> = {
          RUSSIAN: hasCyrillic,
          HINDI: hasDevanagari,
          GERMAN: hasGermanChars || hasGermanWords,
          FRENCH: hasFrenchChars || hasFrenchWords,
        };


        const hasLanguageMarker = languageChecks[language as Exclude<SupportedLanguage, 'ENGLISH'>] || false;

        if (isEnglish || !hasLanguageMarker) {
          logger.error("AI generated summary in wrong language - rejecting", {
            requestedLanguage: language,
            requestedLanguageName: LANGUAGE_NAMES[language],
            hasCyrillic,
            hasDevanagari,
            hasGermanChars,
            hasGermanWords,
            hasFrenchChars,
            hasFrenchWords,
            isEnglish,
            hasLanguageMarker,
            responsePreview: response.substring(0, 200),
          });


          throw new Error(`AI generated summary in wrong language. Requested: ${LANGUAGE_NAMES[language]}, but output appears to be in English or wrong language.`);
        }
      }

      return response;
    };


    const summary = await cached(
      getSummaryCacheKey(textHash, language),
      generateSummary,
      7 * 24 * 60 * 60
    );

    logger.info("Summary generated successfully", {
      summaryLength: summary?.length || 0,
      preview: summary?.substring(0, 200),
      documentType: classification.type,
      requestedLanguage: language,
      requestedLanguageName: LANGUAGE_NAMES[language],
      detectedLanguage,
      detectedLanguageName: LANGUAGE_NAMES[detectedLanguage],
      summaryLanguageCheck: summary?.substring(0, 100),
    });


    const minLength = isChunk
      ? (language === 'ENGLISH' ? 200 : 150)
      : (language === 'ENGLISH' ? 1000 : 800);
    if (!summary || summary.trim().length < minLength) {
      logger.error("AI returned empty or very short summary", undefined, {
        summaryLength: summary?.length || 0,
        requestedLanguage: language,
        minLength,
        summaryPreview: summary?.substring(0, 100),
      });
      throw new Error(`AI returned empty or very short summary (${summary?.length || 0} chars, minimum ${minLength})`);
    }


    if (language !== 'ENGLISH') {
      const summaryLower = summary.toLowerCase();
      const hasCyrillic = /[\u0400-\u04FF]/.test(summary);
      const hasDevanagari = /[\u0900-\u097F]/.test(summary);
      const hasGermanChars = /[äöüÄÖÜß]/.test(summary);
      const hasGermanWords = /\b(der|die|das|und|ist|für|mit|auf|von|zu|den|dem|des|eine|ein|sind|werden|haben|können|müssen|wird|wurde|wurden|kann|muss|soll|sollte|dass|wenn|aber|oder|nicht|auch|nur|noch|schon|immer|sehr|mehr|viel|alle|jeder|dieser|jener|welcher|welche|welches)\b/i.test(summaryLower);
      const hasFrenchChars = /[àâäéèêëïîôùûüÿç]/.test(summary);
      const hasFrenchWords = /\b(le|la|les|de|du|des|et|est|un|une|dans|pour|avec|sur|par|que|qui|dont|où)\b/i.test(summaryLower);
      const isEnglish = /\b(the|and|is|are|was|were|this|that|with|from|for|can|will|would|should)\b/i.test(summaryLower) &&
        !hasCyrillic && !hasDevanagari && !hasGermanChars && !hasFrenchChars;

      const languageChecks: Record<Exclude<SupportedLanguage, 'ENGLISH'>, boolean> = {
        RUSSIAN: hasCyrillic,
        HINDI: hasDevanagari,
        GERMAN: hasGermanChars || hasGermanWords,
        FRENCH: hasFrenchChars || hasFrenchWords,
      };

      const hasLanguageMarker = languageChecks[language] || false;


      if (isEnglish) {
        logger.error("CRITICAL: Summary generated in English but requested language was different", {
          requestedLanguage: language,
          requestedLanguageName: LANGUAGE_NAMES[language],
          summaryPreview: summary.substring(0, 200),
          hasCyrillic,
          hasDevanagari,
          hasGermanChars,
          hasGermanWords,
          hasFrenchChars,
          hasFrenchWords,
          isEnglish,
        });
      } else if (!hasLanguageMarker && summary.length > 200) {
        logger.warn("Output language verification: May not be in requested language", {
          requestedLanguage: language,
          requestedLanguageName: LANGUAGE_NAMES[language],
          summaryPreview: summary.substring(0, 150),
          hasCyrillic,
          hasDevanagari,
          hasGermanChars,
          hasGermanWords,
          hasFrenchChars,
          hasFrenchWords,
        });
      } else {
        logger.info("Output language verification: Appears to be in requested language", {
          requestedLanguage: language,
          hasLanguageMarker,
        });
      }
    }

    const validation = validateSummary(summary, detectedLanguage, classification.type);
    if (!validation.isValid) {
      logger.error("Summary validation failed", undefined, {
        errors: validation.errors,
        summaryPreview: summary.substring(0, 300),
        summaryLength: summary.length,
        detectedLanguage,
        outputLanguage: language,
        documentType: classification.type,
        ...(detectedLanguage === 'HINDI' || language === 'HINDI' ? {
          devanagariCount: (summary.match(/[\u0900-\u097F]/g) || []).length,
          inputPreview: pdfText.substring(0, 500),
          summaryFull: summary,
        } : {}),
        ...(detectedLanguage === 'RUSSIAN' || language === 'RUSSIAN' ? {
          cyrillicCount: (summary.match(/[\u0400-\u04FF]/g) || []).length,
          summaryFull: summary,
        } : {}),
        ...(detectedLanguage === 'GERMAN' || language === 'GERMAN' ? {
          germanChars: (summary.match(/[äöüÄÖÜß]/g) || []).length,
          germanWords: summary.toLowerCase().match(/\b(der|die|das|und|ist|für|mit|auf|von|zu)\b/gi)?.length || 0,
          summaryFull: summary,
        } : {}),
      });


      if (language !== 'ENGLISH' || detectedLanguage !== 'ENGLISH') {
        logger.warn("Summary validation warnings for non-English document (continuing anyway)", {
          errors: validation.errors,
          detectedLanguage,
          outputLanguage: language,
          summaryLength: summary.length,
        });
      } else {
        throw new Error(`Summary validation failed: ${validation.errors.join(", ")}`);
      }
    }

    let cleanedSummary = enforceSummaryStructure(summary, isShortDocument);

    cleanedSummary = enforceWordLimits(cleanedSummary);

    let finalWordCount: number;
    if (language === 'ENGLISH') {
      finalWordCount = cleanedSummary.split(/\s+/).filter(w => w.length > 0).length;
    } else {
      finalWordCount = Math.ceil(cleanedSummary.length / 4.5);
    }

    logger.info("Final cleaned summary", {
      summaryLength: cleanedSummary.length,
      wordCount: finalWordCount,
      language,
    });


    const maxWords = 800;

    if (finalWordCount > maxWords) {
      logger.warn(`Summary exceeds ${maxWords} words after processing, truncating`, {
        wordCount: finalWordCount,
        language,
      });

      if (language === 'ENGLISH') {
        const words = cleanedSummary.split(/\s+/).filter(w => w.length > 0);
        cleanedSummary = words.slice(0, maxWords).join(' ');
      } else {
        const maxChars = maxWords * 4.5;
        if (cleanedSummary.length > maxChars) {
          cleanedSummary = cleanedSummary.substring(0, maxChars);
          const lastSectionIndex = cleanedSummary.lastIndexOf('###');
          if (lastSectionIndex > 0) {
            cleanedSummary = cleanedSummary.substring(0, lastSectionIndex).trim();
          }
        }
      }

      const finalCount = language === 'ENGLISH'
        ? cleanedSummary.split(/\s+/).filter(w => w.length > 0).length
        : Math.ceil(cleanedSummary.length / 4.5);

      logger.info("Summary truncated", {
        finalWordCount: finalCount,
        maxWords,
        language,
      });
    }

    return cleanedSummary;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Summary generation error", err, {
      textLength: pdfText.length,
      language,
    });
    throw err;
  }
}
