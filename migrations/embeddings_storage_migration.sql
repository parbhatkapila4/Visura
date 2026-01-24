CREATE TABLE IF NOT EXISTS document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text_hash VARCHAR(64) NOT NULL,
  text TEXT NOT NULL,
  embedding JSONB NOT NULL,
  model VARCHAR(100) NOT NULL DEFAULT 'text-embedding-3-small',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(text_hash, model)
);
CREATE INDEX IF NOT EXISTS idx_document_embeddings_text_hash ON document_embeddings(text_hash, model);
CREATE INDEX IF NOT EXISTS idx_document_embeddings_created_at ON document_embeddings(created_at);
COMMENT ON TABLE document_embeddings IS 'Stores text embeddings for faster semantic search and cost optimization';
COMMENT ON COLUMN document_embeddings.text_hash IS 'SHA-256 hash of the text for deduplication';
COMMENT ON COLUMN document_embeddings.embedding IS 'JSON array of embedding values';
COMMENT ON COLUMN document_embeddings.model IS 'Embedding model used (e.g., text-embedding-3-small)';