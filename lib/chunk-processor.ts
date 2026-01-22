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

      const updated = await updateChunkSummary(chunkId, reusedChunk.summary, null);
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
      const summary = await generateSummaryFromText(chunk.text);
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

async function checkVersionCompletion(versionId: string): Promise<void> {
  const complete = await isVersionComplete(versionId);
  if (!complete) {
    return;
  }

  const sql = await getDbConnection();
  const [version] = await sql`
    SELECT document_id, pdf_summary_id, file_url FROM document_versions WHERE id = ${versionId}
  `;

  if (version?.pdf_summary_id) {
    return;
  }

  const allChunks = await getChunksForVersion(versionId);
  const sortedChunks = allChunks.sort((a, b) => a.chunk_index - b.chunk_index);
  const finalSummary = sortedChunks
    .map((chunk) => chunk.summary)
    .filter((s): s is string => s !== null)
    .join("\n\n");

  const fullText = sortedChunks.map((chunk) => chunk.text).join("\n\n");

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

    await linkVersionToSummary(versionId, pdfSummary.id);


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
  }
}
