-- Migration: Add summary_downloads table for tracking PDF summary downloads
-- Run this if you already have the database set up

CREATE TABLE IF NOT EXISTS summary_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    summary_id UUID NOT NULL REFERENCES pdf_summaries(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, summary_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_summary_downloads_user_id ON summary_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_summary_downloads_summary_id ON summary_downloads(summary_id);

