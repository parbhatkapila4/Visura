import { getDbConnection } from "./db";
import {
  getChunksForVersion,
  updateChunkSummary,
  linkVersionToSummary,
  isVersionComplete,
} from "./versioned-documents";
import { generateSummaryFromText, type SupportedLanguage } from "./openai";
import { sendAlert } from "./alerting";
import { logger } from "./logger";
import { measurePerformance } from "./performance-monitor";


function deduplicateAndMergeSections(chunkSummaries: string[]): string {
  if (chunkSummaries.length === 0) return "";


  const allSections: Array<{ title: string; content: string; normalizedTitle: string }> = [];

  for (const summary of chunkSummaries) {
    const lines = summary.split('\n');
    let currentSection: { title: string; content: string[] } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headerMatch = line.match(/^###\s+(.+)$/);

      if (headerMatch) {

        if (currentSection) {
          const normalizedTitle = currentSection.title.toLowerCase().trim();
          allSections.push({
            title: currentSection.title,
            content: currentSection.content.join('\n').trim(),
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
        content: currentSection.content.join('\n').trim(),
        normalizedTitle,
      });
    }
  }


  const sectionGroups = new Map<string, Array<{ title: string; content: string }>>();

  for (const section of allSections) {

    const normalized = section.normalizedTitle
      .replace(/^executive\s+summary$/i, 'executive summary')
      .replace(/^key\s+insights?$/i, 'key insights')
      .replace(/^evidence\s+(&|and)\s+signals?$/i, 'evidence & signals')
      .replace(/^risks?\s+(&|and)\s+gaps?$/i, 'risks & gaps')
      .replace(/^action(s)?$/i, 'action')
      .replace(/^should\s+i\s+care\??$/i, 'should i care')
      .replace(/^core\s+mental\s+models?$/i, 'core mental models')
      .replace(/^high[-\s]signal\s+sections?$/i, 'high-signal sections')
      .replace(/^actionable\s+takeaways?$/i, 'actionable takeaways')
      .replace(/^risks?\s+(&|and)\s+limits?$/i, 'risks & limits');

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
    const mostCommonTitle = Array.from(titleCounts.entries())
      .sort((a, b) => b[1] - a[1])[0][0];


    const contentSet = new Set<string>();
    for (const s of sections) {
      const paragraphs = s.content.split('\n\n').filter(p => p.trim().length > 0);
      for (const para of paragraphs) {
        const trimmed = para.trim();
        if (trimmed.length > 20) {
          contentSet.add(trimmed);
        }
      }
    }

    const mergedContent = Array.from(contentSet).join('\n\n');
    if (mergedContent.trim().length > 0) {
      mergedSections.push({
        title: mostCommonTitle,
        content: mergedContent,
      });
    }
  }


  const expectedSections = [
    { key: 'executive summary', title: 'Executive Summary' },
    { key: 'key insights', title: 'Key Insights' },
    { key: 'evidence & signals', title: 'Evidence & Signals' },
    { key: 'risks & gaps', title: 'Risks & Gaps' },
    { key: 'action', title: 'Action' },
  ];

  const finalSections: string[] = [];

  for (const expected of expectedSections) {
    const found = mergedSections.find(s =>
      s.title.toLowerCase().includes(expected.key) ||
      expected.key.includes(s.title.toLowerCase())
    );

    if (found) {
      finalSections.push(`### ${expected.title}\n\n${found.content}`);
    }
  }

  if (finalSections.length < 5) {
    const usedTitles = new Set(finalSections.map(s => {
      const match = s.match(/^###\s+(.+)$/m);
      return match ? match[1].toLowerCase() : '';
    }));

    for (const section of mergedSections) {
      if (finalSections.length >= 5) break;
      const normalized = section.title.toLowerCase();
      if (!usedTitles.has(normalized)) {
        finalSections.push(`### ${section.title}\n\n${section.content}`);
        usedTitles.add(normalized);
      }
    }
  }

  return finalSections.slice(0, 5).join('\n\n');
}

export interface ProcessChunkResult {
  success: boolean;
  skipped?: boolean;
  message?: string;
  summary?: string;
  error?: string;
}


export async function processChunkInternal(
  chunkId: string,
  versionId: string,
  language: SupportedLanguage = 'ENGLISH'
): Promise<ProcessChunkResult> {
  try {
    logger.info("Chunk processing started", { chunkId, versionId });

    const sql = await getDbConnection();
    const [chunk] = await sql`
      SELECT * FROM document_chunks WHERE id = ${chunkId}
    `;

    if (!chunk) {
      logger.warn("Chunk not found", { chunkId, versionId });
      return {
        success: false,
        error: "Chunk not found",
      };
    }

    if (chunk.summary) {
      logger.info("Chunk already processed", { chunkId, versionId });
      return {
        success: true,
        skipped: true,
        message: "Chunk already processed",
      };
    }

    if (chunk.reused_from_chunk_id) {
      const [currentVersion] = await sql`
        SELECT output_language FROM document_versions WHERE id = ${versionId}
      `;
      const currentLanguage = (currentVersion?.output_language || 'ENGLISH') as SupportedLanguage;

      const [reusedChunkData] = await sql`
        SELECT 
          dc.summary,
          dc.version_id,
          dv.output_language
        FROM document_chunks dc
        JOIN document_versions dv ON dc.version_id = dv.id
        WHERE dc.id = ${chunk.reused_from_chunk_id}
      `;

      if (!reusedChunkData?.summary) {
        logger.error("Reused chunk missing source summary", undefined, {
          chunkId,
          versionId,
          reusedFromChunkId: chunk.reused_from_chunk_id,
        });
        sendAlert({
          severity: "warning",
          type: "chunk_processing_failed",
          message: "Reused chunk missing source summary",
          context: {
            chunkId,
            versionId,
            reusedFromChunkId: chunk.reused_from_chunk_id,
          },
        }).catch(() => { });
        return {
          success: false,
          skipped: true,
          error: "Reused chunk missing source summary",
        };
      }

      const sourceLanguage = (reusedChunkData.output_language || 'ENGLISH') as SupportedLanguage;

      if (currentLanguage === sourceLanguage) {
        const [updated] = await sql`
          UPDATE document_chunks
          SET summary = ${reusedChunkData.summary}
          WHERE id = ${chunkId}
            AND summary IS NULL
          RETURNING id
        `;

        if (updated) {
          await checkVersionCompletion(versionId);
        }
        logger.info("Chunk reused summary (same language)", {
          chunkId,
          versionId,
          updated,
          language: currentLanguage,
        });
        return {
          success: true,
          skipped: !updated,
          message: "Reused summary",
        };
      } else {
        logger.info("Language mismatch - regenerating summary instead of reusing", {
          chunkId,
          versionId,
          sourceLanguage,
          currentLanguage,
          reusedFromChunkId: chunk.reused_from_chunk_id,
        });
      }
    }

    try {
      logger.info("Calling AI for summary generation", {
        chunkId,
        versionId,
        textLength: chunk.text.length,
        language,
        languageName: language === 'ENGLISH' ? 'English' :
          language === 'RUSSIAN' ? 'Russian' :
            language === 'GERMAN' ? 'German' :
              language === 'FRENCH' ? 'French' :
                language === 'HINDI' ? 'Hindi' : language,
      });

      const summary = await measurePerformance(
        "chunk_summary_generation",
        async () => {
          return await generateSummaryFromText(chunk.text, language, { isChunk: true });
        },
        { chunkId, versionId, language }
      );

      logger.info("AI summary received for chunk", {
        chunkId,
        versionId,
        summaryLength: summary.length,
        language,
        preview: summary.substring(0, 100),
      });

      const updated = await updateChunkSummary(chunkId, summary, null);

      if (!updated) {
        logger.info("Chunk already processed (race condition)", { chunkId, versionId });
        return {
          success: true,
          skipped: true,
          message: "Chunk already processed (race condition)",
        };
      }

      await checkVersionCompletion(versionId);

      logger.info("Chunk processing completed", { chunkId, versionId, summaryLength: summary.length });
      return {
        success: true,
        summary,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Chunk processing error", err, {
        chunkId,
        versionId,
        language,
        errorStack: err.stack,
        errorName: err.name,
      });
      sendAlert({
        severity: "warning",
        type: "chunk_processing_failed",
        message: `Chunk processing failed: ${err.message}`,
        context: {
          chunkId,
          versionId,
          language,
          errorMessage: err.message,
          errorStack: err.stack,
        },
      }).catch(() => { });
      return {
        success: false,
        error: err.message,
      };
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Process chunk error", err, { chunkId, versionId });
    return {
      success: false,
      error: err.message || "Internal server error",
    };
  }
}

export async function checkVersionCompletion(versionId: string): Promise<void> {
  logger.info("Checking version completion", { versionId });

  const sql = await getDbConnection();

  try {
    const [versionCheck] = await sql`
      SELECT pdf_summary_id FROM document_versions WHERE id = ${versionId}
    `;

    if (versionCheck?.pdf_summary_id) {
      logger.info("Version already has summary - skipping", {
        versionId,
        pdfSummaryId: versionCheck.pdf_summary_id
      });
      return;
    }

    const complete = await isVersionComplete(versionId);

    const [status] = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE summary IS NOT NULL AND summary != '') as with_summary,
        COUNT(*) FILTER (WHERE summary IS NULL AND reused_from_chunk_id IS NULL) as incomplete_new,
        COUNT(*) FILTER (WHERE summary IS NULL AND reused_from_chunk_id IS NOT NULL) as incomplete_reused
      FROM document_chunks
      WHERE document_version_id = ${versionId}
    `;

    const totalChunks = Number(status?.total || 0);
    const chunksWithSummary = Number(status?.with_summary || 0);
    const incompleteNew = Number(status?.incomplete_new || 0);
    const incompleteReused = Number(status?.incomplete_reused || 0);

    logger.info("Version completion check", {
      versionId,
      totalChunks,
      chunksWithSummary,
      incompleteNew,
      incompleteReused,
      isComplete: complete,
      completionRatio: totalChunks > 0 ? `${Math.round((chunksWithSummary / totalChunks) * 100)}%` : '0%',
    });

    const hasEnoughChunks = totalChunks > 0 && chunksWithSummary >= Math.max(1, Math.ceil(totalChunks * 0.5));

    if (!complete && !hasEnoughChunks) {
      logger.info("Version not complete yet - waiting for more chunks", {
        versionId,
        chunksWithSummary,
        totalChunks,
        needed: Math.ceil(totalChunks * 0.5),
      });
      return;
    }

    if (!complete && hasEnoughChunks) {
      logger.warn("Creating summary with partial completion", {
        versionId,
        chunksWithSummary,
        totalChunks,
        incompleteNew,
        incompleteReused,
      });
    }

    logger.info("Proceeding to create summary", { versionId, chunksWithSummary, totalChunks });

    const [version] = await sql`
      SELECT document_id, pdf_summary_id, file_url FROM document_versions WHERE id = ${versionId}
    `;

    if (!version) {
      logger.error("Version not found when checking completion", undefined, { versionId });
      return;
    }

    if (version?.pdf_summary_id) {
      logger.info("Version already has summary", { versionId, pdfSummaryId: version.pdf_summary_id });
      return;
    }

    logger.info("Creating final summary for version", { versionId });

    const allChunks = await getChunksForVersion(versionId);
    logger.info("Chunk status for version", {
      versionId,
      total: allChunks.length,
      withSummary: allChunks.filter(c => c.summary).length,
      withoutSummary: allChunks.filter(c => !c.summary).length,
    });

    const sortedChunks = allChunks.sort((a, b) => a.chunk_index - b.chunk_index);
    const chunkSummaries = sortedChunks
      .map((chunk) => chunk.summary)
      .filter((s): s is string => s !== null && s !== undefined && s.trim().length > 0);

    logger.info("Chunk summaries extracted for final merge", {
      versionId,
      totalChunks: allChunks.length,
      chunksWithSummary: chunkSummaries.length,
      summaryLengths: chunkSummaries.map(s => s.length),
      completionRatio: allChunks.length > 0 ? `${Math.round((chunkSummaries.length / allChunks.length) * 100)}%` : '0%',
    });

    if (chunkSummaries.length === 0) {
      logger.error("CRITICAL: No valid chunk summaries - cannot create final summary", undefined, {
        versionId,
        totalChunks: allChunks.length,
        chunkDetails: sortedChunks.map(c => ({
          index: c.chunk_index,
          hasSummary: !!c.summary,
          summaryLength: c.summary?.length || 0,
          summaryPreview: c.summary?.substring(0, 50) || 'null/empty',
          reusedFrom: c.reused_from_chunk_id,
        })),
      });
      return;
    }

    const finalSummary = deduplicateAndMergeSections(chunkSummaries);

    const fullText = sortedChunks.map((chunk) => chunk.text).join("\n\n");

    logger.info("Final summary created", {
      versionId,
      summaryLength: finalSummary.length,
      fullTextLength: fullText.length,
    });

    if (!finalSummary || finalSummary.trim().length === 0) {
      logger.error("CRITICAL: Cannot create summary - no valid chunk summaries", undefined, {
        versionId,
        totalChunks: allChunks.length,
        chunksWithSummary: allChunks.filter(c => c.summary).length,
        chunkSummariesCount: chunkSummaries.length,
        chunkDetails: sortedChunks.map(c => ({
          index: c.chunk_index,
          hasSummary: !!c.summary,
          summaryLength: c.summary?.length || 0,
          summaryPreview: c.summary?.substring(0, 50) || 'null/empty',
          reusedFrom: c.reused_from_chunk_id,
        })),
      });

      if (allChunks.length > 0 && allChunks.filter(c => c.summary).length === 0) {
        logger.error("CRITICAL: All chunks processed but none have summaries - processing may have failed", undefined, {
          versionId,
          totalChunks: allChunks.length,
        });
      }
      return;
    }

    try {
      const [documentInfo] = await sql`
      SELECT d.user_id, d.title
      FROM documents d
      WHERE d.id = ${version.document_id}
    `;

      if (!documentInfo || !documentInfo.user_id) {
        logger.error("CRITICAL: Document info missing when creating summary", undefined, {
          versionId,
          documentId: version.document_id,
          hasDocumentInfo: !!documentInfo,
        });
        return;
      }

      logger.info("Inserting summary into pdf_summaries", {
        versionId,
        userId: documentInfo.user_id,
        title: documentInfo.title,
        summaryLength: finalSummary.length,
        fileUrl: version.file_url,
      });

      let fileName = '';
      if (version.file_url) {
        try {
          const urlParts = version.file_url.split('/');
          fileName = urlParts[urlParts.length - 1] || '';
          // Remove query params if any
          fileName = fileName.split('?')[0];
        } catch (e) {
          logger.warn("Could not extract file name from URL", { fileUrl: version.file_url });
        }
      }

      let pdfSummary;
      try {
        [pdfSummary] = await sql`
        INSERT INTO pdf_summaries (
          user_id, original_file_url, summary_text, title, file_name, status
        )
        VALUES (
          ${documentInfo.user_id},
          ${version.file_url || ''},
          ${finalSummary},
          ${documentInfo.title || 'Untitled Document'},
          ${fileName},
          'completed'
        )
        RETURNING id
      `;
      } catch (insertError) {
        logger.error("CRITICAL: Failed to insert summary into pdf_summaries", insertError, {
          versionId,
          userId: documentInfo.user_id,
          summaryLength: finalSummary.length,
          errorMessage: insertError instanceof Error ? insertError.message : String(insertError),
        });
        throw insertError;
      }

      if (!pdfSummary || !pdfSummary.id) {
        logger.error("CRITICAL: Failed to create pdf_summary - no ID returned from INSERT", undefined, {
          versionId,
          userId: documentInfo.user_id,
          insertResult: pdfSummary,
        });
        return;
      }

      logger.info("Summary inserted successfully into pdf_summaries", {
        versionId,
        pdfSummaryId: pdfSummary.id,
        userId: documentInfo.user_id,
        summaryLength: finalSummary.length,
      });

      const linked = await linkVersionToSummary(versionId, pdfSummary.id);

      if (!linked) {
        logger.error("CRITICAL: Failed to link summary to version - summary exists but not linked", undefined, {
          versionId,
          pdfSummaryId: pdfSummary.id,
          userId: documentInfo.user_id,
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        const retryLinked = await linkVersionToSummary(versionId, pdfSummary.id);
        if (retryLinked) {
          logger.info("Successfully linked summary on retry", {
            versionId,
            pdfSummaryId: pdfSummary.id,
          });
        } else {
          logger.error("CRITICAL: Retry linking also failed", undefined, {
            versionId,
            pdfSummaryId: pdfSummary.id,
          });
        }
      } else {
        logger.info("Summary created and linked successfully", {
          versionId,
          pdfSummaryId: pdfSummary.id,
          summaryLength: finalSummary.length,
          userId: documentInfo.user_id,
        });
      }

      if (fullText && fullText.trim().length > 0) {
        try {
          const { savePdfStore } = await import("./chatbot");
          await savePdfStore({
            pdfSummaryId: pdfSummary.id,
            userId: documentInfo.user_id,
            fullTextContent: fullText,
          });
          logger.info("PDF store created for chat", { versionId, pdfSummaryId: pdfSummary.id });
        } catch (chatbotError) {
          logger.warn("Failed to create PDF store for chat (non-fatal)", {
            versionId,
            pdfSummaryId: pdfSummary.id,
            error: chatbotError instanceof Error ? chatbotError.message : String(chatbotError),
          });
        }
      }

      try {
        const { detectAndRecordChanges } = await import("./document-change-events");
        await detectAndRecordChanges(versionId);
      } catch (changeError) {
        logger.warn("Failed to detect semantic changes (non-fatal)", {
          versionId,
          documentId: version.document_id,
          error: changeError instanceof Error ? changeError.message : String(changeError),
        });
      }

      logger.info("Summary creation process completed successfully", {
        versionId,
        pdfSummaryId: pdfSummary.id,
        userId: documentInfo.user_id,
      });
    } catch (error) {
      logger.error("CRITICAL: Error in summary creation process", error, {
        versionId,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  } catch (error) {
    logger.error("CRITICAL: Error in checkVersionCompletion outer try block", error, {
      versionId,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });
  }
}
