
SELECT 
  dv.id as version_id,
  dv.version_number,
  d.title as document_title,
  d.user_id,
  dv.created_at,
  dv.total_chunks,
  dv.reused_chunks,
  dv.new_chunks,
  COUNT(dc.id) FILTER (WHERE dc.summary IS NULL AND dc.reused_from_chunk_id IS NULL) as incomplete_chunks,
  NOW() - dv.created_at as age
FROM document_versions dv
JOIN documents d ON dv.document_id = d.id
LEFT JOIN document_chunks dc ON dv.id = dc.document_version_id
WHERE dv.pdf_summary_id IS NULL
GROUP BY dv.id, dv.version_number, d.title, d.user_id, dv.created_at, dv.total_chunks, dv.reused_chunks, dv.new_chunks
HAVING COUNT(dc.id) FILTER (WHERE dc.summary IS NULL AND dc.reused_from_chunk_id IS NULL) > 0
  AND dv.created_at < NOW() - INTERVAL '10 minutes'
ORDER BY dv.created_at ASC;

SELECT 
  dc.id as chunk_id,
  dc.chunk_index,
  dc.chunk_hash,
  dc.document_version_id,
  dv.version_number,
  d.title as document_title,
  d.user_id,
  dc.created_at,
  CASE 
    WHEN dc.reused_from_chunk_id IS NOT NULL THEN 'waiting_for_source'
    WHEN dc.summary IS NULL THEN 'needs_processing'
    ELSE 'complete'
  END as status
FROM document_chunks dc
JOIN document_versions dv ON dc.document_version_id = dv.id
JOIN documents d ON dv.document_id = d.id
WHERE dc.summary IS NULL
  AND dc.reused_from_chunk_id IS NULL
ORDER BY dv.created_at ASC, dc.chunk_index ASC;


SELECT 
  dc.id as chunk_id,
  dc.chunk_index,
  dc.document_version_id,
  dv.version_number,
  dc.reused_from_chunk_id,
  source_dc.summary IS NOT NULL as source_has_summary,
  CASE 
    WHEN source_dc.id IS NULL THEN 'source_missing'
    WHEN source_dc.summary IS NULL THEN 'source_incomplete'
    ELSE 'source_ready'
  END as source_status
FROM document_chunks dc
JOIN document_versions dv ON dc.document_version_id = dv.id
LEFT JOIN document_chunks source_dc ON dc.reused_from_chunk_id = source_dc.id
WHERE dc.summary IS NULL
  AND dc.reused_from_chunk_id IS NOT NULL
ORDER BY dv.created_at ASC, dc.chunk_index ASC;


SELECT 
  dv.id as version_id,
  dv.version_number,
  d.title as document_title,
  d.user_id,
  dv.created_at,
  dv.total_chunks,
  COUNT(dc.id) FILTER (WHERE dc.summary IS NOT NULL) as completed_chunks,
  COUNT(dc.id) FILTER (WHERE dc.summary IS NULL AND dc.reused_from_chunk_id IS NULL) as incomplete_new_chunks,
  COUNT(dc.id) FILTER (WHERE dc.summary IS NULL AND dc.reused_from_chunk_id IS NOT NULL) as incomplete_reused_chunks,
  dv.pdf_summary_id IS NULL as needs_final_summary
FROM document_versions dv
JOIN documents d ON dv.document_id = d.id
LEFT JOIN document_chunks dc ON dv.id = dc.document_version_id
WHERE dv.pdf_summary_id IS NULL
GROUP BY dv.id, dv.version_number, d.title, d.user_id, dv.created_at, dv.total_chunks, dv.pdf_summary_id
HAVING COUNT(dc.id) FILTER (WHERE dc.summary IS NULL AND dc.reused_from_chunk_id IS NULL) > 0
ORDER BY dv.created_at ASC;

SELECT 
  d.id as document_id,
  d.title,
  d.user_id,
  COUNT(DISTINCT dv.id) as version_count,
  SUM(dv.total_chunks) as total_chunks_all_versions,
  SUM(dv.new_chunks) as total_new_chunks,
  SUM(dv.reused_chunks) as total_reused_chunks,
  SUM(dv.estimated_tokens_saved) as total_tokens_saved,
  ROUND(AVG(dv.reused_chunks::float / NULLIF(dv.total_chunks, 0)) * 100, 2) as avg_reuse_percent,
  SUM(dv.new_chunks) * 1500 as estimated_tokens_used
FROM documents d
JOIN document_versions dv ON d.id = dv.document_id
GROUP BY d.id, d.title, d.user_id
ORDER BY total_new_chunks DESC
LIMIT 50;


SELECT 
  d.id as document_id,
  d.title,
  d.user_id,
  COUNT(DISTINCT dv.id) as version_count,
  AVG(dv.reused_chunks::float / NULLIF(dv.total_chunks, 0)) * 100 as avg_reuse_percent,
  SUM(dv.new_chunks) as total_new_chunks
FROM documents d
JOIN document_versions dv ON d.id = dv.document_id
GROUP BY d.id, d.title, d.user_id
HAVING COUNT(DISTINCT dv.id) > 1
  AND AVG(dv.reused_chunks::float / NULLIF(dv.total_chunks, 0)) < 0.3
ORDER BY avg_reuse_percent ASC
LIMIT 50;


SELECT 
  dc.id as chunk_id,
  dc.chunk_index,
  dc.document_version_id,
  dv.version_number,
  d.title as document_title,
  dc.chunk_hash,
  dc.summary IS NOT NULL as has_summary,
  dc.reused_from_chunk_id IS NOT NULL as is_reused,
  dc.created_at,
  dc.updated_at,
  CASE 
    WHEN dc.summary IS NULL AND dc.reused_from_chunk_id IS NULL THEN 'incomplete'
    WHEN dc.summary IS NOT NULL THEN 'complete'
    WHEN dc.reused_from_chunk_id IS NOT NULL AND dc.summary IS NULL THEN 'reused_pending'
    ELSE 'unknown'
  END as status
FROM document_chunks dc
JOIN document_versions dv ON dc.document_version_id = dv.id
JOIN documents d ON dv.document_id = d.id
WHERE dc.summary IS NULL
  AND dc.created_at < NOW() - INTERVAL '1 hour'
ORDER BY dc.created_at ASC;


SELECT 
  dv.id as version_id,
  dv.version_number,
  d.title as document_title,
  dv.total_chunks,
  COUNT(dc.id) as actual_chunks,
  COUNT(dc.id) FILTER (WHERE dc.summary IS NOT NULL) as chunks_with_summary,
  COUNT(dc.id) FILTER (WHERE dc.reused_from_chunk_id IS NOT NULL) as reused_chunks,
  COUNT(dc.id) FILTER (WHERE dc.summary IS NULL AND dc.reused_from_chunk_id IS NULL) as incomplete_chunks,
  dv.pdf_summary_id IS NOT NULL as has_final_summary,
  CASE 
    WHEN COUNT(dc.id) FILTER (WHERE dc.summary IS NULL AND dc.reused_from_chunk_id IS NULL) = 0 
      AND dv.pdf_summary_id IS NOT NULL THEN 'complete'
    WHEN COUNT(dc.id) FILTER (WHERE dc.summary IS NULL AND dc.reused_from_chunk_id IS NULL) = 0 
      AND dv.pdf_summary_id IS NULL THEN 'chunks_complete_summary_pending'
    ELSE 'incomplete'
  END as completion_status
FROM document_versions dv
JOIN documents d ON dv.document_id = d.id
LEFT JOIN document_chunks dc ON dv.id = dc.document_version_id
WHERE dv.id = 'VERSION_ID_HERE'  -- Replace with actual version ID
GROUP BY dv.id, dv.version_number, d.title, dv.total_chunks, dv.pdf_summary_id;


SELECT COUNT(*) as stuck_versions
FROM document_versions dv
WHERE dv.pdf_summary_id IS NULL
  AND dv.created_at < NOW() - INTERVAL '10 minutes'
  AND EXISTS (
    SELECT 1 FROM document_chunks dc
    WHERE dc.document_version_id = dv.id
      AND dc.summary IS NULL
      AND dc.reused_from_chunk_id IS NULL
  );


SELECT COUNT(*) as incomplete_chunks
FROM document_chunks dc
WHERE dc.summary IS NULL
  AND dc.reused_from_chunk_id IS NULL;


SELECT COUNT(DISTINCT dc.document_version_id) as versions_with_orphaned_reused_chunks
FROM document_chunks dc
WHERE dc.reused_from_chunk_id IS NOT NULL
  AND dc.summary IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM document_chunks source_dc
    WHERE source_dc.id = dc.reused_from_chunk_id
      AND source_dc.summary IS NOT NULL
  );

SELECT 
  d.user_id,
  COUNT(DISTINCT d.id) as document_count,
  COUNT(DISTINCT dv.id) as version_count,
  SUM(dv.total_chunks) as total_chunks,
  SUM(dv.new_chunks) as total_new_chunks,
  SUM(dv.reused_chunks) as total_reused_chunks,
  SUM(dv.estimated_tokens_saved) as total_tokens_saved,
  SUM(dv.new_chunks) * 1500 as estimated_tokens_used,
  ROUND(AVG(dv.reused_chunks::float / NULLIF(dv.total_chunks, 0)) * 100, 2) as avg_reuse_percent
FROM documents d
JOIN document_versions dv ON d.id = dv.document_id
GROUP BY d.user_id
ORDER BY estimated_tokens_used DESC;


SELECT 
  DATE_TRUNC('day', dv.created_at) as date,
  COUNT(*) as versions_created,
  AVG(dv.reused_chunks::float / NULLIF(dv.total_chunks, 0)) * 100 as avg_reuse_percent,
  SUM(dv.new_chunks) as total_new_chunks,
  SUM(dv.estimated_tokens_saved) as total_tokens_saved
FROM document_versions dv
WHERE dv.created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', dv.created_at)
ORDER BY date DESC;
