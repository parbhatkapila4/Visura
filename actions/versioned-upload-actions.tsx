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
import { getDbConnection } from "@/lib/db";

export async function createVersionedDocumentJob(
  pdfText: string,
  fileName: string,
  fileUrl: string
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
      console.log(`Found ${incompleteChunks.length} incomplete chunks for existing version ${latestVersion.id}`);

      if (incompleteChunks.length > 0) {
        console.log(`Processing ${incompleteChunks.length} incomplete chunks for existing version`);
        const batchSize = 2;
        let processedCount = 0;
        for (let i = 0; i < incompleteChunks.length; i += batchSize) {
          const batch = incompleteChunks.slice(i, i + batchSize);
          console.log(`Processing batch ${Math.floor(i / batchSize) + 1} for unchanged version`);
          const results = await Promise.allSettled(
            batch.map((chunk) => {
              console.log(`Processing incomplete chunk ${chunk.id}...`);
              return processChunkInternal(chunk.id, latestVersion.id);
            })
          );
          const succeeded = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
          processedCount += succeeded;
          console.log(`Batch completed: ${succeeded}/${batch.length} succeeded`);
        }
        console.log(`All incomplete chunks processed: ${processedCount}/${incompleteChunks.length}`);

        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log("Checking completion for unchanged version after processing...");
        const { checkVersionCompletion } = await import("@/lib/chunk-processor");
        try {
          await checkVersionCompletion(latestVersion.id);

          await new Promise(resolve => setTimeout(resolve, 1000));
          const sql = await getDbConnection();
          const [finalCheck] = await sql`
            SELECT pdf_summary_id FROM document_versions WHERE id = ${latestVersion.id}
          `;
          if (finalCheck?.pdf_summary_id) {
            console.log(`SUMMARY CREATED FOR UNCHANGED VERSION: ${finalCheck.pdf_summary_id}`);
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
            console.log(`Summary not created yet for unchanged version, will be created by polling`);
          }
        } catch (error) {
          console.error("Completion check error for unchanged version:", error);
          logger.error("Completion check failed for unchanged version", error, { versionId: latestVersion.id });
        }
      } else {
        console.log(`No incomplete chunks found for unchanged version ${latestVersion.id}`);
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


    for (const chunk of chunks) {
      const existingChunk = latestVersion
        ? await getChunksByHash(document.id, chunk.hash)
        : null;

      if (existingChunk && existingChunk.summary) {
        reusedChunks++;
      }
    }

    const newChunksCount = totalChunks - reusedChunks;


    const costCheck = await checkCostGuardrails(
      userId,
      newChunksCount,
      document.id
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


    const version = await createDocumentVersion(
      document.id,
      fullContentHash,
      totalChunks,
      reusedChunks,
      fileUrl
    );

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
        console.log(`Reused chunk ${reusedChunk.id} - summary copied from ${existingChunk.id}`);
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
      console.log("STARTING CHUNK PROCESSING", {
        versionId: version.id,
        documentId: document.id,
        totalChunks: chunksToProcess.length,
        userId,
      });
      logger.info("Starting chunk processing", {
        versionId: version.id,
        documentId: document.id,
        chunksToProcess: chunksToProcess.length,
        userId,
      });

      const batchSize = 2;
      let processedCount = 0;

      for (let i = 0; i < chunksToProcess.length; i += batchSize) {
        const batch = chunksToProcess.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}`, {
          batchSize: batch.length,
          chunkIds: batch,
          versionId: version.id,
        });

        try {
          const results = await Promise.allSettled(
            batch.map(async (chunkId) => {
              console.log(`Processing chunk ${chunkId}...`);
              const result = await processChunkInternal(chunkId, version.id);
              console.log(`Chunk ${chunkId} result:`, {
                success: result.success,
                skipped: result.skipped,
                error: result.error,
              });
              return result;
            })
          );

          const succeeded = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
          processedCount += succeeded;
          console.log(`Batch completed: ${succeeded}/${batch.length} succeeded`);

          logger.info("Batch processed", {
            versionId: version.id,
            batchNumber: Math.floor(i / batchSize) + 1,
            processed: succeeded,
            total: batch.length,
          });
        } catch (error) {
          console.error("Batch processing error:", error);
          logger.error("Batch processing error", error, {
            versionId: version.id,
            batchNumber: Math.floor(i / batchSize) + 1,
          });
        }
      }

      console.log("ALL CHUNKS PROCESSED", {
        versionId: version.id,
        totalProcessed: processedCount,
        totalChunks: chunksToProcess.length,
      });
      logger.info("All chunks processed", {
        versionId: version.id,
        totalProcessed: processedCount,
        totalChunks: chunksToProcess.length,
      });

      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log("FINAL completion check after all chunks processed...");
      const { checkVersionCompletion } = await import("@/lib/chunk-processor");
      try {
        await checkVersionCompletion(version.id);

        await new Promise(resolve => setTimeout(resolve, 1000));
        const sql = await getDbConnection();
        const [finalCheck] = await sql`
          SELECT pdf_summary_id FROM document_versions WHERE id = ${version.id}
        `;
        if (finalCheck?.pdf_summary_id) {
          console.log(`SUMMARY EXISTS: ${finalCheck.pdf_summary_id}`);
        } else {
          console.log(`Summary NOT created! Checking chunks...`);
          const [chunkCheck] = await sql`
            SELECT 
              COUNT(*) as total,
              COUNT(*) FILTER (WHERE summary IS NOT NULL) as with_summary,
              COUNT(*) FILTER (WHERE summary IS NULL AND reused_from_chunk_id IS NULL) as incomplete
            FROM document_chunks
            WHERE document_version_id = ${version.id}
          `;
          console.log(`Chunk status:`, chunkCheck);
        }
        console.log("Final completion check done");
      } catch (error) {
        console.error("Final completion check error:", error);
        logger.error("Final completion check failed", error, { versionId: version.id });
      }
    } else {
      console.log("No chunks to process (all reused)");
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
    logger.error("Error creating versioned document", err, { userId, errorMessage });
    console.error("createVersionedDocumentJob ERROR:", errorMessage, err);
    return {
      success: false,
      message: `Error: ${errorMessage}`,
      data: null,
    };
  }
}
