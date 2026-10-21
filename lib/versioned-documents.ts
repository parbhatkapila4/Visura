import { CHUNKER_VERSION, segmentDocument } from "./document-segmentation";
import { getDbConnection } from "./db";
import { logger } from "./logger";

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
  output_language: string | null;
  chunker_version: number;
  ocr_used: boolean;
  truncated: boolean;
  total_pages: number | null;
  pages_read: number | null;
  created_at: Date;
}
export interface ExtractionConfidence {
  ocrUsed: boolean;
  truncated: boolean;
  totalPages: number | null;
  pagesRead: number | null;
}
export function coverageCaveats(version: {
  ocr_used?: boolean | null;
  truncated?: boolean | null;
  total_pages?: number | null;
  pages_read?: number | null;
}): string[] {
  const out: string[] = [];
  if (version.truncated) {
    const range =
      version.total_pages && version.pages_read
        ? `has ${version.total_pages} pages and only the first ${version.pages_read} were read`
        : "was only partly read";
    out.push(`This document ${range}, so the rest was never compared.`);
  }
  if (version.ocr_used) {
    out.push(
      "This document is a scan, read with OCR. Character recognition is not repeatable, so a section can differ between two readings of the same page without the document having changed."
    );
  }
  return out;
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
  start_page?: number | null;
  end_page?: number | null;
}

export { hashContent } from "./document-segmentation";
export function chunkText(
  text: string,
  _chunkSize: number = 1000
): Array<{ text: string; hash: string; index: number; startPage?: number; endPage?: number }> {
  return segmentDocument(text);
}
export { CHUNKER_VERSION, normalizeForComparison, segmentDocument } from "./document-segmentation";

export async function findOrCreateDocument(userId: string, title: string): Promise<Document> {
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
  fileUrl?: string | null,
  outputLanguage: string = "ENGLISH",
  confidence?: ExtractionConfidence
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
    throw new Error(`INVARIANT VIOLATION: estimated_tokens_saved (${estimatedTokensSaved}) < 0`);
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
      estimated_tokens_saved,
      output_language,
      chunker_version,
      ocr_used,
      truncated,
      total_pages,
      pages_read
    )
    VALUES (
      ${documentId},
      ${nextVersion},
      ${fullContentHash},
      ${fileUrl || null},
      ${totalChunks},
      ${reusedChunks},
      ${newChunks},
      ${estimatedTokensSaved},
      ${outputLanguage},
      ${CHUNKER_VERSION},
      ${confidence?.ocrUsed ?? false},
      ${confidence?.truncated ?? false},
      ${confidence?.totalPages ?? null},
      ${confidence?.pagesRead ?? null}
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
      AND dv.chunker_version = ${CHUNKER_VERSION}
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
  reusedFromChunkId: string | null = null,
  startPage: number | null = null,
  endPage: number | null = null
): Promise<DocumentChunk> {
  const sql = await getDbConnection();

  try {
    const [chunk] = await sql`
      INSERT INTO document_chunks (
        document_version_id, chunk_index, chunk_hash, text, reused_from_chunk_id, start_page, end_page
      )
      VALUES (${versionId}, ${chunkIndex}, ${chunkHash}, ${text}, ${reusedFromChunkId}, ${startPage ?? null}, ${endPage ?? null})
      RETURNING *
    `;
    return chunk as DocumentChunk;
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err?.code === "23505") {
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

export async function linkVersionToSummary(
  versionId: string,
  pdfSummaryId: string
): Promise<boolean> {
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

export async function createPlaceholderSummary(
  userId: string,
  title: string,
  fileUrl: string | null,
  fileName: string
): Promise<string> {
  const sql = await getDbConnection();
  const [row] = await sql`
    INSERT INTO pdf_summaries (user_id, original_file_url, summary_text, title, file_name, status)
    VALUES (${userId}, ${fileUrl || ""}, '', ${title || "Untitled Document"}, ${fileName || ""}, 'processing')
    RETURNING id
  `;
  if (!row?.id) throw new Error("Failed to create placeholder summary");
  return row.id as string;
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

  logger.info("Version completion check", {
    versionId,
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

export async function getVersionIdByPdfSummaryId(pdfSummaryId: string): Promise<string | null> {
  const sql = await getDbConnection();
  const [row] = await sql`
    SELECT id FROM document_versions WHERE pdf_summary_id = ${pdfSummaryId} LIMIT 1
  `;
  return (row?.id as string) ?? null;
}
export async function getIncompleteVersionsOlderThan(
  thresholdMinutes: number,
  limit: number = 50
): Promise<DocumentVersion[]> {
  const sql = await getDbConnection();
  const versions = await sql`
    SELECT dv.*
    FROM document_versions dv
    INNER JOIN pdf_summaries ps ON ps.id = dv.pdf_summary_id
    WHERE ps.status = 'processing'
      AND dv.created_at < NOW() - make_interval(mins => ${thresholdMinutes})
    ORDER BY dv.created_at DESC
    LIMIT ${limit}
  `;
  return versions as DocumentVersion[];
}
