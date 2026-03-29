CREATE TABLE IF NOT EXISTS document_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_page INTEGER NOT NULL,
    end_page INTEGER NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_document_sections_version_id ON document_sections(document_version_id);
ALTER TABLE document_chunks
ADD COLUMN IF NOT EXISTS start_page INTEGER;
ALTER TABLE document_chunks
ADD COLUMN IF NOT EXISTS end_page INTEGER;