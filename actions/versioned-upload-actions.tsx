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
} from "@/lib/versioned-documents";
import { formatFileNameAsTitle } from "@/utils/format-utils";
import { checkCostGuardrails } from "@/lib/cost-guardrails";
import { logger } from "@/lib/logger";

export async function createVersionedDocumentJob(
  pdfText: string,
  fileName: string,
  fileUrl: string
) {
  let userId: string | undefined = undefined;
  try {
    const authResult = await auth();
    userId = authResult.userId || undefined;
    if (!userId) {
      return {
        success: false,
        message: "User not found",
        data: null,
      };
    }

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
        await createDocumentChunk(
          version.id,
          chunk.index,
          chunk.hash,
          chunk.text,
          existingChunk.id
        );
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
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

      for (const chunkId of chunksToProcess) {
        fetch(`${baseUrl}/api/jobs/process-chunk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chunkId, versionId: version.id }),
        }).catch((err) => {
          logger.error("Failed to trigger chunk processing", err, {
            chunkId,
            versionId: version.id,
            documentId: document.id,
            userId,
          });
        });
      }
    }

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
    logger.error("Error creating versioned document", err, { userId });
    return {
      success: false,
      message: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      data: null,
    };
  }
}
