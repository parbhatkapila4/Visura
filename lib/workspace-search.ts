import { getDbConnection } from "./db";
import { getVersionIdByPdfSummaryId } from "./versioned-documents";
import { getOrCreateEmbedding } from "./embeddings-storage";
import { cosineSimilarity } from "./embeddings";
import {
  getChunkEmbeddingsByVersionIds,
  truncateSnippet as truncateSnippetUtil,
} from "./document-chunk-embeddings";

export interface WorkspaceSearchHit {
  pdf_summary_id: string;
  document_id: string;
  document_version_id: string;
  chunk_id: string;
  snippet: string;
  page: number | null;
  score: number;
  title?: string;
}

export interface VersionMeta {
  versionId: string;
  document_id: string;
  pdf_summary_id: string;
  title: string | null;
}

export async function resolveWorkspaceVersions(
  workspaceId: string,
  documentIds?: string[]
): Promise<VersionMeta[]> {
  const sql = await getDbConnection();

  const shareRows = await sql`
    SELECT ds.pdf_summary_id
    FROM document_shares ds
    WHERE ds.workspace_id = ${workspaceId}
  `;
  let summaryIds = (shareRows as { pdf_summary_id: string }[]).map((r) => r.pdf_summary_id);
  if (documentIds && documentIds.length > 0) {
    const set = new Set(documentIds);
    summaryIds = summaryIds.filter((id) => set.has(id));
  }
  if (summaryIds.length === 0) return [];

  const versionRows = await sql`
    SELECT dv.id AS version_id, dv.document_id, dv.pdf_summary_id, ps.title
    FROM document_versions dv
    INNER JOIN pdf_summaries ps ON ps.id = dv.pdf_summary_id
    WHERE dv.pdf_summary_id = ANY(${summaryIds})
  `;

  const bySummary = new Map<string, { version_id: string; document_id: string; title: string | null }>();
  for (const r of versionRows as { version_id: string; document_id: string; pdf_summary_id: string; title: string | null }[]) {
    bySummary.set(r.pdf_summary_id, { version_id: r.version_id, document_id: r.document_id, title: r.title });
  }

  return summaryIds
    .filter((sid) => bySummary.has(sid))
    .map((pdf_summary_id) => {
      const m = bySummary.get(pdf_summary_id)!;
      return {
        versionId: m.version_id,
        document_id: m.document_id,
        pdf_summary_id,
        title: m.title ?? null,
      };
    });
}

export async function searchWorkspaceChunks(
  query: string,
  versionMetas: VersionMeta[],
  limit: number = 20
): Promise<WorkspaceSearchHit[]> {
  if (versionMetas.length === 0) return [];

  const versionIds = versionMetas.map((v) => v.versionId);
  const metaByVersion = new Map(versionMetas.map((v) => [v.versionId, v]));

  const queryEmbedding = await getOrCreateEmbedding(query);
  const rows = await getChunkEmbeddingsByVersionIds(versionIds);

  const scored = rows.map((row) => {
    const sim = cosineSimilarity(queryEmbedding, row.embedding);
    return { ...row, score: sim };
  });
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, limit);

  const chunkIds = top.map((r) => r.document_chunk_id);
  const sql = await getDbConnection();
  const chunkRows = await sql`
    SELECT id, text, start_page, end_page
    FROM document_chunks
    WHERE id = ANY(${chunkIds})
  `;
  const chunkMap = new Map(
    (chunkRows as { id: string; text: string; start_page: number | null; end_page: number | null }[]).map((c) => [
      c.id,
      {
        text: c.text ?? "",
        page: c.start_page != null && c.end_page != null ? Math.round((c.start_page + c.end_page) / 2) : c.start_page ?? c.end_page ?? null,
      },
    ])
  );

  const hits: WorkspaceSearchHit[] = [];
  for (const row of top) {
    const meta = metaByVersion.get(row.document_version_id);
    if (!meta) continue;
    const chunk = chunkMap.get(row.document_chunk_id);
    const snippet = chunk ? truncateSnippetUtil(chunk.text) : "";
    const page = chunk?.page ?? null;
    hits.push({
      pdf_summary_id: meta.pdf_summary_id,
      document_id: meta.document_id,
      document_version_id: row.document_version_id,
      chunk_id: row.document_chunk_id,
      snippet,
      page,
      score: row.score,
      title: meta.title ?? undefined,
    });
  }
  return hits;
}
