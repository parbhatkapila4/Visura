import { getDbConnection } from "./db";
import { getChunksForVersion } from "./versioned-documents";
import { getOrCreateEmbeddingsBatch } from "./embeddings-storage";
import { logger } from "./logger";

const DEFAULT_MODEL = "text-embedding-3-small";
const SNIPPET_MAX_LEN = 400;

export async function populateChunkEmbeddingsForVersion(versionId: string): Promise<void> {
  try {
    const chunks = await getChunksForVersion(versionId);
    const sorted = [...chunks].sort((a, b) => a.chunk_index - b.chunk_index);
    if (sorted.length === 0) return;

    const texts = sorted.map((c) => c.text);
    const embeddings = await getOrCreateEmbeddingsBatch(texts, DEFAULT_MODEL);
    if (embeddings.length !== sorted.length) {
      logger.warn("Chunk embedding count mismatch", { versionId, chunks: sorted.length, embeddings: embeddings.length });
      return;
    }

    const sql = await getDbConnection();
    await sql`DELETE FROM document_chunk_embeddings WHERE document_version_id = ${versionId}`;

    for (let i = 0; i < sorted.length; i++) {
      await sql`
        INSERT INTO document_chunk_embeddings (document_version_id, document_chunk_id, model, embedding)
        VALUES (${versionId}, ${sorted[i].id}, ${DEFAULT_MODEL}, ${JSON.stringify(embeddings[i])})
      `;
    }
    logger.info("Chunk embeddings stored for version", { versionId, count: sorted.length });
  } catch (error) {
    logger.warn("Chunk embedding population failed (non-fatal)", {
      versionId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export interface ChunkEmbeddingRow {
  document_version_id: string;
  document_chunk_id: string;
  embedding: number[];
}

export async function getChunkEmbeddingsByVersionIds(
  versionIds: string[]
): Promise<ChunkEmbeddingRow[]> {
  if (versionIds.length === 0) return [];
  const sql = await getDbConnection();
  const rows = await sql`
    SELECT document_version_id, document_chunk_id, embedding
    FROM document_chunk_embeddings
    WHERE document_version_id = ANY(${versionIds})
      AND model = ${DEFAULT_MODEL}
  `;
  return (rows as { document_version_id: string; document_chunk_id: string; embedding: unknown }[]).map(
    (r) => ({
      document_version_id: r.document_version_id,
      document_chunk_id: r.document_chunk_id,
      embedding: Array.isArray(r.embedding) ? (r.embedding as number[]) : JSON.parse(String(r.embedding ?? "[]")),
    })
  );
}

export function truncateSnippet(text: string, maxLen: number = SNIPPET_MAX_LEN): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen).trim() + "…";
}
