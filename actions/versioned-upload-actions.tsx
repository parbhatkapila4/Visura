"use server";

import { auth } from "@clerk/nextjs/server";
import {
  findOrCreateDocument,
  createDocumentVersion,
  chunkText,
  hashContent,
  getLatestVersion,
  getChunksByHash,
  createDocumentChunk,
  getIncompleteChunks,
} from "@/lib/versioned-documents";
import { formatFileNameAsTitle } from "@/utils/format-utils";
import { checkCostGuardrails } from "@/lib/cost-guardrails";
import { logger } from "@/lib/logger";
import { processChunkInternal } from "@/lib/chunk-processor";
import type { SupportedLanguage } from "@/lib/openai";
import { getDbConnection } from "@/lib/db";

export async function createVersionedDocumentJob(
  pdfText: string,
  fileName: string,
  fileUrl: string,
  language: SupportedLanguage = 'ENGLISH'
) {
  let userId: string | undefined = undefined;
  try {
    logger.info("createVersionedDocumentJob called", { fileName, textLength: pdfText.length });
    const authResult = await auth();
    userId = authResult.userId || undefined;
    if (!userId) {
      logger.warn("No user ID in createVersionedDocumentJob");
      return {
        success: false,
        message: "User not found",
        data: null,
      };
    }
    logger.info("User authenticated", { userId });

    if (!pdfText || pdfText.trim().length < 50) {
      return {
        success: false,
        message: "No text content found in PDF",
        data: null,
      };
    }

    const title = formatFileNameAsTitle(fileName);
    const fullContentHash = hashContent(pdfText);

    const document = await findOrCreateDocument(userId, title);
    const latestVersion = await getLatestVersion(document.id);

    if (latestVersion && latestVersion.full_content_hash === fullContentHash) {
      if (latestVersion.pdf_summary_id) {
        logger.info("Document unchanged with existing summary", {
          versionId: latestVersion.id,
          pdfSummaryId: latestVersion.pdf_summary_id,
          userId,
        });
        return {
          success: true,
          message: "Document unchanged, using existing version",
          data: {
            documentId: document.id,
            versionId: latestVersion.id,
            versionNumber: latestVersion.version_number,
            pdfSummaryId: latestVersion.pdf_summary_id,
            unchanged: true,
          },
        };
      }

      logger.info("Document unchanged but no summary - processing existing version", {
        versionId: latestVersion.id,
        documentId: document.id,
        userId,
      });

      const incompleteChunks = await getIncompleteChunks(latestVersion.id);
      logger.info("Found incomplete chunks for existing version", {
        versionId: latestVersion.id,
        incompleteCount: incompleteChunks.length,
      });

      if (incompleteChunks.length > 0) {
        logger.info("Processing incomplete chunks for existing version", {
          versionId: latestVersion.id,
          incompleteCount: incompleteChunks.length,
        });
        const batchSize = parseInt(process.env.CHUNK_BATCH_SIZE || "2", 10);
        let processedCount = 0;
        for (let i = 0; i < incompleteChunks.length; i += batchSize) {
          const batch = incompleteChunks.slice(i, i + batchSize);
          logger.info("Processing batch for unchanged version", {
            versionId: latestVersion.id,
            batchNumber: Math.floor(i / batchSize) + 1,
            batchSize: batch.length,
          });
          const results = await Promise.allSettled(
            batch.map((chunk) => {
              logger.info("Processing incomplete chunk", {
                chunkId: chunk.id,
                versionId: latestVersion.id,
              });
              return processChunkInternal(chunk.id, latestVersion.id, language);
            })
          );
          const succeeded = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
          processedCount += succeeded;
          logger.info("Batch completed for unchanged version", {
            versionId: latestVersion.id,
            batchNumber: Math.floor(i / batchSize) + 1,
            succeeded,
            total: batch.length,
          });
        }
        logger.info("All incomplete chunks processed for unchanged version", {
          versionId: latestVersion.id,
          processedCount,
          total: incompleteChunks.length,
        });

        const completionDelay = parseInt(process.env.COMPLETION_CHECK_DELAY_MS || "2000", 10);
        await new Promise(resolve => setTimeout(resolve, completionDelay));
        logger.info("Checking completion for unchanged version after processing", {
          versionId: latestVersion.id,
        });
        const { checkVersionCompletion } = await import("@/lib/chunk-processor");
        try {
          await checkVersionCompletion(latestVersion.id);

          await new Promise(resolve => setTimeout(resolve, 1000));
          const sql = await getDbConnection();
          const [finalCheck] = await sql`
            SELECT pdf_summary_id FROM document_versions WHERE id = ${latestVersion.id}
          `;
          if (finalCheck?.pdf_summary_id) {
            logger.info("Summary created for unchanged version", {
              versionId: latestVersion.id,
              pdfSummaryId: finalCheck.pdf_summary_id,
            });
            return {
              success: true,
              message: "Document unchanged, summary now created",
              data: {
                documentId: document.id,
                versionId: latestVersion.id,
                versionNumber: latestVersion.version_number,
                pdfSummaryId: finalCheck.pdf_summary_id,
                unchanged: true,
              },
            };
          } else {
            logger.info("Summary not created yet for unchanged version, will be created by polling", {
              versionId: latestVersion.id,
            });
          }
        } catch (error) {
          logger.error("Completion check failed for unchanged version", error, {
            versionId: latestVersion.id,
          });
        }
      } else {
        logger.info("No incomplete chunks found for unchanged version", {
          versionId: latestVersion.id,
        });
        const { checkVersionCompletion } = await import("@/lib/chunk-processor");
        await checkVersionCompletion(latestVersion.id);
      }

      return {
        success: true,
        message: "Document unchanged, processing existing version",
        data: {
          documentId: document.id,
          versionId: latestVersion.id,
          versionNumber: latestVersion.version_number,
          pdfSummaryId: null,
          unchanged: true,
        },
      };
    }

    const chunks = chunkText(pdfText);
    const totalChunks = chunks.length;
    let reusedChunks = 0;
    const chunksToProcess: string[] = [];

    const totalTextSize = pdfText.length;
    const avgCharsPerChunk = totalTextSize / totalChunks;

    for (const chunk of chunks) {
      const existingChunk = latestVersion
        ? await getChunksByHash(document.id, chunk.hash)
        : null;

      if (existingChunk && existingChunk.summary) {
        reusedChunks++;
      }
    }

    const newChunksCount = totalChunks - reusedChunks;

    const estimatedTokensForNewChunks = Math.ceil(
      (avgCharsPerChunk * newChunksCount) / 4 + (newChunksCount * 300)
    );

    const costCheck = await checkCostGuardrails(
      userId,
      newChunksCount,
      document.id,
      undefined,
      estimatedTokensForNewChunks
    );

    if (!costCheck.allowed) {
      logger.warn("Cost guardrail blocked version creation", {
        userId,
        documentId: document.id,
        reason: costCheck.reason,
        currentUsage: costCheck.currentUsage,
      });

      return {
        success: false,
        message: costCheck.reason || "Cost limit exceeded",
        data: {
          blocked: true,
          costLimitExceeded: true,
          currentUsage: costCheck.currentUsage,
        },
      };
    }


    logger.info("Creating document version with language", {
      documentId: document.id,
      language,
      totalChunks,
      reusedChunks,
      newChunks: totalChunks - reusedChunks,
    });

    const version = await createDocumentVersion(
      document.id,
      fullContentHash,
      totalChunks,
      reusedChunks,
      fileUrl,
      language
    );

    logger.info("Document version created", {
      versionId: version.id,
      versionNumber: version.version_number,
      language: version.output_language,
    });

    for (const chunk of chunks) {
      const existingChunk = latestVersion
        ? await getChunksByHash(document.id, chunk.hash)
        : null;

      if (existingChunk && existingChunk.summary) {
        const reusedChunk = await createDocumentChunk(
          version.id,
          chunk.index,
          chunk.hash,
          chunk.text,
          existingChunk.id
        );
        const sql = await getDbConnection();
        await sql`
          UPDATE document_chunks
          SET summary = ${existingChunk.summary}
          WHERE id = ${reusedChunk.id}
            AND summary IS NULL
        `;
        logger.info("Reused chunk summary", {
          chunkId: reusedChunk.id,
          sourceChunkId: existingChunk.id,
          versionId: version.id,
        });
      } else {
        const newChunk = await createDocumentChunk(
          version.id,
          chunk.index,
          chunk.hash,
          chunk.text,
          null
        );
        chunksToProcess.push(newChunk.id);
      }
    }

    if (chunksToProcess.length > 0) {
      logger.info("Starting chunk processing", {
        versionId: version.id,
        documentId: document.id,
        chunksToProcess: chunksToProcess.length,
        userId,
      });

      const batchSize = parseInt(process.env.CHUNK_BATCH_SIZE || "2", 10);
      let processedCount = 0;

      for (let i = 0; i < chunksToProcess.length; i += batchSize) {
        const batch = chunksToProcess.slice(i, i + batchSize);
        logger.info("Processing batch", {
          versionId: version.id,
          batchNumber: Math.floor(i / batchSize) + 1,
          batchSize: batch.length,
          chunkIds: batch,
        });

        try {
          const results = await Promise.allSettled(
            batch.map(async (chunkId) => {
              logger.info("Processing chunk", {
                chunkId,
                versionId: version.id,
                language,
              });
              try {
                const result = await processChunkInternal(chunkId, version.id, language);
                logger.info("Chunk processing result", {
                  chunkId,
                  versionId: version.id,
                  success: result.success,
                  skipped: result.skipped,
                  error: result.error,
                });
                return result;
              } catch (chunkError) {
                logger.error("Chunk processing failed", chunkError, {
                  chunkId,
                  versionId: version.id,
                  language,
                });
                return {
                  success: false,
                  error: chunkError instanceof Error ? chunkError.message : String(chunkError),
                };
              }
            })
          );

          const succeeded = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
          const failed = results.filter((r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success));

          if (failed.length > 0) {
            logger.error("Some chunks failed in batch", undefined, {
              versionId: version.id,
              batchNumber: Math.floor(i / batchSize) + 1,
              failed: failed.map(r => ({
                status: r.status,
                error: r.status === "rejected" ? String(r.reason) : r.value.error,
              })),
            });
          }

          processedCount += succeeded;
          logger.info("Batch processed", {
            versionId: version.id,
            batchNumber: Math.floor(i / batchSize) + 1,
            processed: succeeded,
            failed: failed.length,
            total: batch.length,
          });
        } catch (error) {
          logger.error("Batch processing error", error, {
            versionId: version.id,
            batchNumber: Math.floor(i / batchSize) + 1,
          });
        }
      }

      logger.info("All chunks processed", {
        versionId: version.id,
        totalProcessed: processedCount,
        totalChunks: chunksToProcess.length,
      });

      const completionDelay = parseInt(process.env.COMPLETION_CHECK_DELAY_MS || "2000", 10);
      await new Promise(resolve => setTimeout(resolve, completionDelay));

      const { checkVersionCompletion } = await import("@/lib/chunk-processor");
      const sql = await getDbConnection();

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          logger.info(`Final completion check attempt ${attempt}/3`, {
            versionId: version.id,
          });

          await checkVersionCompletion(version.id);

          await new Promise(resolve => setTimeout(resolve, 1000));
          const [finalCheck] = await sql`
            SELECT pdf_summary_id FROM document_versions WHERE id = ${version.id}
          `;

          if (finalCheck?.pdf_summary_id) {
            logger.info("Summary created successfully", {
              versionId: version.id,
              pdfSummaryId: finalCheck.pdf_summary_id,
              attempt,
            });
            break;
          } else {
            logger.warn(`Summary not created yet (attempt ${attempt}/3), checking chunks`, {
              versionId: version.id,
            });
            const [chunkCheck] = await sql`
              SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE summary IS NOT NULL) as with_summary,
                COUNT(*) FILTER (WHERE summary IS NULL AND reused_from_chunk_id IS NULL) as incomplete_new,
                COUNT(*) FILTER (WHERE summary IS NULL AND reused_from_chunk_id IS NOT NULL) as incomplete_reused
              FROM document_chunks
              WHERE document_version_id = ${version.id}
            `;
            logger.info("Chunk status after processing", {
              versionId: version.id,
              attempt,
              total: Number(chunkCheck?.total || 0),
              withSummary: Number(chunkCheck?.with_summary || 0),
              incompleteNew: Number(chunkCheck?.incomplete_new || 0),
              incompleteReused: Number(chunkCheck?.incomplete_reused || 0),
            });

            if (attempt === 3 && Number(chunkCheck?.with_summary || 0) > 0) {
              logger.warn("Forcing summary creation with partial chunks", {
                versionId: version.id,
                chunksWithSummary: Number(chunkCheck?.with_summary || 0),
                totalChunks: Number(chunkCheck?.total || 0),
              });
              await checkVersionCompletion(version.id);
            }

            if (attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        } catch (error) {
          logger.error(`Final completion check failed (attempt ${attempt}/3)`, error, { versionId: version.id });
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
    } else {
      logger.info("No chunks to process (all reused)", {
        versionId: version.id,
        documentId: document.id,
      });
      const { checkVersionCompletion } = await import("@/lib/chunk-processor");
      await checkVersionCompletion(version.id);
    }

    logger.info("Version created successfully", {
      versionId: version.id,
      documentId: document.id,
      chunksTotal: version.total_chunks,
      chunksToProcess: chunksToProcess.length,
      userId,
    });

    return {
      success: true,
      message: "Document version created",
      data: {
        documentId: document.id,
        versionId: version.id,
        versionNumber: version.version_number,
        chunksTotal: version.total_chunks,
        chunksToProcess: version.new_chunks,
        chunksReused: version.reused_chunks,
        estimatedTokensSaved: version.estimated_tokens_saved,
      },
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error("Error creating versioned document", err, {
      userId,
      errorMessage,
      fileName,
    });
    return {
      success: false,
      message: `Error: ${errorMessage}`,
      data: null,
    };
  }
}
