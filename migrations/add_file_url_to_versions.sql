
ALTER TABLE document_versions
ADD COLUMN IF NOT EXISTS file_url TEXT;

CREATE INDEX IF NOT EXISTS idx_document_versions_file_url ON document_versions(file_url) WHERE file_url IS NOT NULL;
