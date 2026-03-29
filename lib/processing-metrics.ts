import { getDbConnection } from "./db";
import { ESTIMATED_TOKENS_PER_CHUNK } from "./versioned-documents";

export interface VersionEfficiency {
  totalChunks: number;
  reusedChunks: number;
  newChunks: number;
  reusePercent: number;
  estimatedTokens: number;
  estimatedTokensSaved: number;
  processingDurationMs: number | null;
}

export async function computeVersionEfficiency(versionId: string): Promise<VersionEfficiency> {
  const sql = await getDbConnection();

  const [version] = await sql`
    SELECT total_chunks, reused_chunks, new_chunks
    FROM document_versions
    WHERE id = ${versionId}
  `;

  const totalChunks = version ? Number(version.total_chunks ?? 0) : 0;
  const reusedChunks = version ? Number(version.reused_chunks ?? 0) : 0;
  const newChunks = version ? Number(version.new_chunks ?? 0) : 0;
  const reusePercent = totalChunks > 0 ? (reusedChunks / totalChunks) * 100 : 0;
  const estimatedTokens = totalChunks * ESTIMATED_TOKENS_PER_CHUNK;
  const estimatedTokensSaved = reusedChunks * ESTIMATED_TOKENS_PER_CHUNK;

  let processingDurationMs: number | null = null;
  if (version) {
    const [range] = await sql`
      SELECT
        MIN(created_at) AS min_at,
        MAX(created_at) AS max_at,
        COUNT(*) AS cnt
      FROM processing_events
      WHERE version_id = ${versionId}
    `;
    const cnt = Number(range?.cnt ?? 0);
    const minAt = range?.min_at;
    const maxAt = range?.max_at;
    if (cnt >= 2 && minAt != null && maxAt != null) {
      const minMs = new Date(minAt as string | Date).getTime();
      const maxMs = new Date(maxAt as string | Date).getTime();
      processingDurationMs = Math.round(maxMs - minMs);
    }
  }

  return {
    totalChunks,
    reusedChunks,
    newChunks,
    reusePercent,
    estimatedTokens,
    estimatedTokensSaved,
    processingDurationMs,
  };
}
