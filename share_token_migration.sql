-- Migration: Add share_token column to pdf_summaries table for public sharing
-- This allows summaries to be shared via a unique token without requiring authentication

ALTER TABLE pdf_summaries 
ADD COLUMN IF NOT EXISTS share_token VARCHAR(255) UNIQUE;

-- Create index for faster lookups by share_token
CREATE INDEX IF NOT EXISTS idx_pdf_summaries_share_token ON pdf_summaries(share_token);

-- Generate share tokens for existing summaries (optional - can be done on-demand)
-- UPDATE pdf_summaries SET share_token = encode(gen_random_bytes(16), 'hex') WHERE share_token IS NULL;

