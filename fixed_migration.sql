-- Additional tables for PDF Chatbot functionality
-- Run these commands in your Neon database

-- Table to store full PDF text content for chatbot context
CREATE TABLE IF NOT EXISTS pdf_stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pdf_summary_id UUID NOT NULL REFERENCES pdf_summaries(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    full_text_content TEXT NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table to store Q&A conversations for each PDF
CREATE TABLE IF NOT EXISTS pdf_qa_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pdf_store_id UUID NOT NULL REFERENCES pdf_stores(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    session_name VARCHAR(255) DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table to store individual Q&A pairs within each session
CREATE TABLE IF NOT EXISTS pdf_qa_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES pdf_qa_sessions(id) ON DELETE CASCADE,
    message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('user', 'assistant')),
    message_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pdf_stores_pdf_summary_id ON pdf_stores(pdf_summary_id);
CREATE INDEX IF NOT EXISTS idx_pdf_stores_user_id ON pdf_stores(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_qa_sessions_pdf_store_id ON pdf_qa_sessions(pdf_store_id);
CREATE INDEX IF NOT EXISTS idx_pdf_qa_sessions_user_id ON pdf_qa_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_qa_messages_session_id ON pdf_qa_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_pdf_qa_messages_created_at ON pdf_qa_messages(created_at);

-- Triggers for updated_at timestamps
DROP TRIGGER IF EXISTS update_pdf_stores_updated_at ON pdf_stores;
CREATE TRIGGER update_pdf_stores_updated_at
BEFORE UPDATE ON pdf_stores
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pdf_qa_sessions_updated_at ON pdf_qa_sessions;
CREATE TRIGGER update_pdf_qa_sessions_updated_at
BEFORE UPDATE ON pdf_qa_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Views (using CREATE OR REPLACE to avoid errors)
CREATE OR REPLACE VIEW pdf_with_chatbot_support AS
SELECT 
    ps.id,
    ps.user_id,
    ps.title,
    ps.file_name,
    ps.summary_text,
    ps.original_file_url,
    ps.created_at,
    CASE 
        WHEN pstore.id IS NOT NULL THEN true 
        ELSE false 
    END as chatbot_enabled
FROM pdf_summaries ps
LEFT JOIN pdf_stores pstore ON ps.id = pstore.pdf_summary_id;

CREATE OR REPLACE VIEW session_with_message_count AS
SELECT 
    qas.id,
    qas.pdf_store_id,
    qas.user_id,
    qas.session_name,
    qas.created_at,
    qas.updated_at,
    COUNT(qam.id) as message_count,
    MAX(qam.created_at) as last_message_at
FROM pdf_qa_sessions qas
LEFT JOIN pdf_qa_messages qam ON qas.id = qam.session_id
GROUP BY qas.id, qas.pdf_store_id, qas.user_id, qas.session_name, qas.created_at, qas.updated_at;

-- Download tracking table for summary downloads
CREATE TABLE IF NOT EXISTS summary_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    summary_id UUID NOT NULL REFERENCES pdf_summaries(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, summary_id)
);

CREATE INDEX IF NOT EXISTS idx_summary_downloads_user_id ON summary_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_summary_downloads_summary_id ON summary_downloads(summary_id);

