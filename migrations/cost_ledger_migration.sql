ALTER TABLE document_versions 
ADD COLUMN IF NOT EXISTS total_chunks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reused_chunks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS new_chunks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_tokens_saved INTEGER DEFAULT 0;

ALTER TABLE document_versions
ADD CONSTRAINT check_cost_invariants CHECK (
  reused_chunks <= total_chunks
  AND new_chunks + reused_chunks = total_chunks
  AND estimated_tokens_saved >= 0
);
