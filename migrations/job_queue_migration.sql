
CREATE TABLE IF NOT EXISTS summary_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    pdf_summary_id UUID REFERENCES pdf_summaries(id) ON DELETE CASCADE,
    

    extracted_text TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    

    status VARCHAR(20) NOT NULL DEFAULT 'queued' 
        CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    

    error_message TEXT,
    error_stack TEXT,
    

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX IF NOT EXISTS idx_summary_jobs_status ON summary_jobs(status) 
    WHERE status IN ('queued', 'processing');
CREATE INDEX IF NOT EXISTS idx_summary_jobs_user_id ON summary_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_summary_jobs_created_at ON summary_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_summary_jobs_retry ON summary_jobs(status, retry_count, created_at) 
    WHERE status = 'failed' AND retry_count < max_retries;
CREATE INDEX IF NOT EXISTS idx_summary_jobs_stuck ON summary_jobs(status, started_at) 
    WHERE status = 'processing';


ALTER TABLE pdf_summaries ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'processing';
ALTER TABLE pdf_summaries ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES summary_jobs(id);
