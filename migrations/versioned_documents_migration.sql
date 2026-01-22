CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    full_content_hash VARCHAR(64) NOT NULL,
    pdf_summary_id UUID REFERENCES pdf_summaries(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_id, version_number)
);

CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_hash VARCHAR(64) NOT NULL,
    text TEXT NOT NULL,
    summary TEXT,
    reused_from_chunk_id UUID REFERENCES document_chunks(id) ON DELETE SET NULL,
    job_id UUID REFERENCES summary_jobs(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_version_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_hash ON document_versions(full_content_hash);
CREATE INDEX IF NOT EXISTS idx_document_chunks_version_id ON document_chunks(document_version_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_hash ON document_chunks(chunk_hash);
CREATE INDEX IF NOT EXISTS idx_document_chunks_reused ON document_chunks(reused_from_chunk_id) WHERE reused_from_chunk_id IS NOT NULL;
