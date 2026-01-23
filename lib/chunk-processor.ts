import { getDbConnection } from "./db";
import {
  getChunksForVersion,
  updateChunkSummary,
  linkVersionToSummary,
  isVersionComplete,
} from "./versioned-documents";
import { generateSummaryFromText } from "./openai";
import { sendAlert } from "./alerting";
import { logger } from "./logger";

export interface ProcessChunkResult {
  success: boolean;
  skipped?: boolean;
  message?: string;
  summary?: string;
  error?: string;
}


export async function processChunkInternal(
  chunkId: string,
  versionId: string
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
      const [reusedChunk] = await sql`
        SELECT summary FROM document_chunks WHERE id = ${chunk.reused_from_chunk_id}
      `;

      if (!reusedChunk?.summary) {
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

      const [updated] = await sql`
        UPDATE document_chunks
        SET summary = ${reusedChunk.summary}
        WHERE id = ${chunkId}
          AND summary IS NULL
        RETURNING id
      `;
      
      if (updated) {
        await checkVersionCompletion(versionId);
      }
      logger.info("Chunk reused summary", { chunkId, versionId, updated });
      return {
        success: true,
        skipped: !updated,
        message: "Reused summary",
      };
    }

    try {
      console.log(`Calling AI for chunk ${chunkId}`, {
        textLength: chunk.text.length,
        versionId,
      });
      logger.info("Calling AI for summary generation", {
        chunkId,
        versionId,
        textLength: chunk.text.length,
      });
      
      const summary = await generateSummaryFromText(chunk.text);
      
      console.log(`AI SUMMARY RECEIVED for chunk ${chunkId}`, {
        summaryLength: summary.length,
        versionId,
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
      logger.error("Chunk processing error", err, { chunkId, versionId });
      sendAlert({
        severity: "warning",
        type: "chunk_processing_failed",
        message: `Chunk processing failed: ${err.message}`,
        context: {
          chunkId,
          versionId,
          errorMessage: err.message,
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
  console.log(`checkVersionCompletion CALLED for ${versionId}`);
  const complete = await isVersionComplete(versionId);
  console.log(`Checking version completion for ${versionId}:`, { complete });
  
  if (!complete) {
    console.log(`Version ${versionId} not complete yet - will retry later`);
    return;
  }

  console.log(`Version ${versionId} is complete! Creating summary...`);
  logger.info("Version completion detected", { versionId });

  const sql = await getDbConnection();
  const [version] = await sql`
    SELECT document_id, pdf_summary_id, file_url FROM document_versions WHERE id = ${versionId}
  `;

  if (!version) {
    console.error(`Version ${versionId} not found in database!`);
    logger.error("Version not found when checking completion", { versionId });
    return;
  }

  if (version?.pdf_summary_id) {
    console.log(`Version ${versionId} already has summary: ${version.pdf_summary_id}`);
    return;
  }
  
  console.log(`Creating final summary for version ${versionId}...`);

  const allChunks = await getChunksForVersion(versionId);
  console.log(`All chunks for version ${versionId}:`, {
    total: allChunks.length,
    withSummary: allChunks.filter(c => c.summary).length,
    withoutSummary: allChunks.filter(c => !c.summary).length,
  });
  
  const sortedChunks = allChunks.sort((a, b) => a.chunk_index - b.chunk_index);
  const finalSummary = sortedChunks
    .map((chunk) => chunk.summary)
    .filter((s): s is string => s !== null)
    .join("\n\n");

  const fullText = sortedChunks.map((chunk) => chunk.text).join("\n\n");

  console.log(`Final summary length: ${finalSummary.length}, Full text length: ${fullText.length}`);

  if (!finalSummary || finalSummary.trim().length === 0) {
    console.error(`NO SUMMARY TO CREATE! All chunks:`, sortedChunks.map(c => ({
      index: c.chunk_index,
      hasSummary: !!c.summary,
      reusedFrom: c.reused_from_chunk_id,
    })));
    logger.error("Cannot create summary - no chunk summaries available", {
      versionId,
      totalChunks: allChunks.length,
      chunksWithSummary: allChunks.filter(c => c.summary).length,
    });
    return;
  }

  if (finalSummary) {
    const [documentInfo] = await sql`
      SELECT d.user_id, d.title
      FROM documents d
      WHERE d.id = ${version.document_id}
    `;

    const [pdfSummary] = await sql`
      INSERT INTO pdf_summaries (
        user_id, original_file_url, summary_text, title, file_name, status
      )
      VALUES (
        ${documentInfo.user_id},
        ${version.file_url || ''},
        ${finalSummary},
        ${documentInfo.title},
        '',
        'completed'
      )
      RETURNING id
    `;

    const linked = await linkVersionToSummary(versionId, pdfSummary.id);
    
    if (!linked) {
      console.error(`FAILED TO LINK SUMMARY! Version ${versionId}, Summary ${pdfSummary.id}`);
      logger.error("Failed to link summary to version", { versionId, pdfSummaryId: pdfSummary.id });
    } else {
      console.log(`SUMMARY CREATED AND LINKED!`, {
        versionId,
        pdfSummaryId: pdfSummary.id,
        summaryLength: finalSummary.length,
        linked,
      });
      logger.info("Summary created and linked", {
        versionId,
        pdfSummaryId: pdfSummary.id,
        summaryLength: finalSummary.length,
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
  }
}
