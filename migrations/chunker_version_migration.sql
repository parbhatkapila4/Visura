ALTER TABLE document_versions
  ADD COLUMN IF NOT EXISTS chunker_version INTEGER NOT NULL DEFAULT 1;

COMMENT ON COLUMN document_versions.chunker_version IS
  'Segmenter that produced this version''s chunk hashes. Only versions sharing a value may be compared or reused across.';

CREATE INDEX IF NOT EXISTS idx_document_versions_document_chunker
  ON document_versions (document_id, chunker_version, version_number DESC);
