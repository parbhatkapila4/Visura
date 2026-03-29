CREATE TABLE IF NOT EXISTS document_chunk_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
    document_chunk_id UUID NOT NULL REFERENCES document_chunks(id) ON DELETE CASCADE,
    model VARCHAR(64) NOT NULL DEFAULT 'text-embedding-3-small',
    embedding JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(document_version_id, document_chunk_id)
);
CREATE INDEX IF NOT EXISTS idx_document_chunk_embeddings_version_id ON document_chunk_embeddings(document_version_id);