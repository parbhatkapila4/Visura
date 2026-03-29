ALTER TABLE document_versions
ADD COLUMN IF NOT EXISTS output_language VARCHAR(20) DEFAULT 'ENGLISH';
CREATE INDEX IF NOT EXISTS idx_document_versions_language ON document_versions(output_language);