import { getDbConnection } from "./db";
import { createHash } from "crypto";

export interface Document {
  id: string;
  user_id: string;
  title: string;
  created_at: Date;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  full_content_hash: string;
  pdf_summary_id: string | null;
  file_url: string | null;
  total_chunks: number;
  reused_chunks: number;
  new_chunks: number;
  estimated_tokens_saved: number;
  created_at: Date;
}

export const ESTIMATED_TOKENS_PER_CHUNK = 1000;

export interface DocumentChunk {
  id: string;
  document_version_id: string;
  chunk_index: number;
  chunk_hash: string;
  text: string;
  summary: string | null;
  reused_from_chunk_id: string | null;
  job_id: string | null;
  created_at: Date;
}

export function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

export function chunkText(text: string, chunkSize: number = 1000): Array<{ text: string; hash: string; index: number }> {
  const chunks: Array<{ text: string; hash: string; index: number }> = [];
  const words = text.split(/\s+/);

  let currentChunk: string[] = [];
  let currentSize = 0;
  let chunkIndex = 0;

  for (const word of words) {
    const wordSize = word.length + 1;

    if (currentSize + wordSize > chunkSize && currentChunk.length > 0) {
      const chunkText = currentChunk.join(" ");
      chunks.push({
        text: chunkText,
        hash: hashContent(chunkText),
        index: chunkIndex++,
      });
      currentChunk = [];
      currentSize = 0;
    }

    currentChunk.push(word);
    currentSize += wordSize;
  }

  if (currentChunk.length > 0) {
    const chunkText = currentChunk.join(" ");
    chunks.push({
      text: chunkText,
      hash: hashContent(chunkText),
      index: chunkIndex++,
    });
  }

  return chunks;
}

export async function findOrCreateDocument(
  userId: string,
  title: string
): Promise<Document> {
  const sql = await getDbConnection();

  const existing = await sql`
    SELECT * FROM documents 
    WHERE user_id = ${userId} AND title = ${title}
    LIMIT 1
  `;

  if (existing.length > 0) {
    return existing[0] as Document;
  }

  const [newDoc] = await sql`
    INSERT INTO documents (user_id, title)
    VALUES (${userId}, ${title})
    RETURNING *
  `;

  return newDoc as Document;
}

export async function getLatestVersion(documentId: string): Promise<DocumentVersion | null> {
  const sql = await getDbConnection();
  const [version] = await sql`
    SELECT * FROM document_versions
    WHERE document_id = ${documentId}
    ORDER BY version_number DESC
    LIMIT 1
  `;
  return (version as DocumentVersion) || null;
}

export async function createDocumentVersion(
  documentId: string,
  fullContentHash: string,
  totalChunks: number,
  reusedChunks: number,
  fileUrl?: string | null
): Promise<DocumentVersion> {
  const sql = await getDbConnection();

  const latest = await getLatestVersion(documentId);
  const nextVersion = latest ? latest.version_number + 1 : 1;

  const newChunks = totalChunks - reusedChunks;
  const estimatedTokensSaved = reusedChunks * ESTIMATED_TOKENS_PER_CHUNK;

  if (reusedChunks > totalChunks) {
    throw new Error(
      `INVARIANT VIOLATION: reused_chunks (${reusedChunks}) > total_chunks (${totalChunks})`
    );
  }

  if (newChunks + reusedChunks !== totalChunks) {
    throw new Error(
      `INVARIANT VIOLATION: new_chunks (${newChunks}) + reused_chunks (${reusedChunks}) != total_chunks (${totalChunks})`
    );
  }

  if (estimatedTokensSaved < 0) {
    throw new Error(
      `INVARIANT VIOLATION: estimated_tokens_saved (${estimatedTokensSaved}) < 0`
    );
  }

  const [version] = await sql`
    INSERT INTO document_versions (
      document_id, 
      version_number, 
      full_content_hash,
      file_url,
      total_chunks,
      reused_chunks,
      new_chunks,
      estimated_tokens_saved
    )
    VALUES (
      ${documentId}, 
      ${nextVersion}, 
      ${fullContentHash},
      ${fileUrl || null},
      ${totalChunks},
      ${reusedChunks},
      ${newChunks},
      ${estimatedTokensSaved}
    )
    RETURNING *
  `;

  return version as DocumentVersion;
}

export async function getChunksByHash(
  documentId: string,
  chunkHash: string
): Promise<DocumentChunk | null> {
  const sql = await getDbConnection();

  const [chunk] = await sql`
    SELECT dc.* FROM document_chunks dc
    JOIN document_versions dv ON dc.document_version_id = dv.id
    WHERE dv.document_id = ${documentId}
      AND dc.chunk_hash = ${chunkHash}
    ORDER BY dv.version_number DESC, dc.chunk_index ASC
    LIMIT 1
  `;

  return (chunk as DocumentChunk) || null;
}

export async function createDocumentChunk(
  versionId: string,
  chunkIndex: number,
  chunkHash: string,
  text: string,
  reusedFromChunkId: string | null = null
): Promise<DocumentChunk> {
  const sql = await getDbConnection();

  try {
    const [chunk] = await sql`
      INSERT INTO document_chunks (
        document_version_id, chunk_index, chunk_hash, text, reused_from_chunk_id
      )
      VALUES (${versionId}, ${chunkIndex}, ${chunkHash}, ${text}, ${reusedFromChunkId})
      RETURNING *
    `;
    return chunk as DocumentChunk;
  } catch (error: any) {
    if (error?.code === "23505") {
      const [existing] = await sql`
        SELECT * FROM document_chunks
        WHERE document_version_id = ${versionId} AND chunk_index = ${chunkIndex}
      `;
      if (existing) {
        return existing as DocumentChunk;
      }
    }
    throw error;
  }
}

export async function updateChunkSummary(
  chunkId: string,
  summary: string,
  jobId: string | null = null
): Promise<boolean> {
  const sql = await getDbConnection();
  const [result] = await sql`
    UPDATE document_chunks
    SET summary = ${summary}, job_id = ${jobId}
    WHERE id = ${chunkId}
      AND summary IS NULL
    RETURNING id
  `;
  return result !== undefined;
}

export async function getChunksForVersion(versionId: string): Promise<DocumentChunk[]> {
  const sql = await getDbConnection();
  const chunks = await sql`
    SELECT * FROM document_chunks
    WHERE document_version_id = ${versionId}
    ORDER BY chunk_index ASC
  `;
  return chunks as DocumentChunk[];
}

export async function getChunksNeedingSummary(versionId: string): Promise<DocumentChunk[]> {
  const sql = await getDbConnection();
  const chunks = await sql`
    SELECT * FROM document_chunks
    WHERE document_version_id = ${versionId}
      AND summary IS NULL
      AND reused_from_chunk_id IS NULL
    ORDER BY chunk_index ASC
  `;
  return chunks as DocumentChunk[];
}

export async function linkVersionToSummary(versionId: string, pdfSummaryId: string): Promise<boolean> {
  const sql = await getDbConnection();
  const [result] = await sql`
    UPDATE document_versions
    SET pdf_summary_id = ${pdfSummaryId}
    WHERE id = ${versionId}
      AND pdf_summary_id IS NULL
    RETURNING id
  `;
  return result !== undefined;
}

export async function isVersionComplete(versionId: string): Promise<boolean> {
  const sql = await getDbConnection();
  const [newChunksResult] = await sql`
    SELECT COUNT(*) as incomplete_count
    FROM document_chunks
    WHERE document_version_id = ${versionId}
      AND summary IS NULL
      AND reused_from_chunk_id IS NULL
  `;
  
  const [reusedChunksResult] = await sql`
    SELECT COUNT(*) as incomplete_reused_count
    FROM document_chunks dc
    WHERE dc.document_version_id = ${versionId}
      AND dc.summary IS NULL
      AND dc.reused_from_chunk_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM document_chunks source
        WHERE source.id = dc.reused_from_chunk_id
        AND source.summary IS NOT NULL
      )
  `;
  
  const incompleteNew = Number(newChunksResult?.incomplete_count || 0);
  const incompleteReused = Number(reusedChunksResult?.incomplete_reused_count || 0);
  
  const isComplete = incompleteNew === 0 && incompleteReused === 0;
  
  console.log(`isVersionComplete(${versionId}):`, {
    incompleteNew,
    incompleteReused,
    isComplete,
  });
  
  return isComplete;
}

export async function getIncompleteChunks(versionId: string): Promise<DocumentChunk[]> {
  const sql = await getDbConnection();
  const chunks = await sql`
    SELECT * FROM document_chunks
    WHERE document_version_id = ${versionId}
      AND summary IS NULL
      AND reused_from_chunk_id IS NULL
    ORDER BY chunk_index ASC
  `;
  return chunks as DocumentChunk[];
}

export async function getVersionById(versionId: string): Promise<DocumentVersion | null> {
  const sql = await getDbConnection();
  const [version] = await sql`
    SELECT * FROM document_versions WHERE id = ${versionId}
  `;
  return (version as DocumentVersion) || null;
}


export async function getIncompleteVersionsOlderThan(
  thresholdMinutes: number,
  limit: number = 50
): Promise<DocumentVersion[]> {
  const sql = await getDbConnection();
  const versions = await sql`
    SELECT dv.*
    FROM document_versions dv
    WHERE dv.pdf_summary_id IS NULL
      AND dv.created_at < NOW() - make_interval(mins => ${thresholdMinutes})
      AND EXISTS (
        SELECT 1 FROM document_chunks dc
        WHERE dc.document_version_id = dv.id
          AND dc.summary IS NULL
          AND dc.reused_from_chunk_id IS NULL
      )
    ORDER BY dv.created_at ASC
    LIMIT ${limit}
  `;
  return versions as DocumentVersion[];
}
