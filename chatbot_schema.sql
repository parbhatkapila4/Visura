-- Chatbot functionality tables
-- Run this after the main schema.sql

CREATE TABLE IF NOT EXISTS pdf_stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pdf_summary_id UUID NOT NULL REFERENCES pdf_summaries(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    full_text_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pdf_qa_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pdf_store_id UUID NOT NULL REFERENCES pdf_stores(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    session_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pdf_qa_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES pdf_qa_sessions(id) ON DELETE CASCADE,
    message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('user', 'assistant')),
    message_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add triggers for the new tables
CREATE TRIGGER update_pdf_stores_updated_at
BEFORE UPDATE ON pdf_stores
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pdf_qa_sessions_updated_at
BEFORE UPDATE ON pdf_qa_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pdf_stores_pdf_summary_id ON pdf_stores(pdf_summary_id);
CREATE INDEX IF NOT EXISTS idx_pdf_stores_user_id ON pdf_stores(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_qa_sessions_pdf_store_id ON pdf_qa_sessions(pdf_store_id);
CREATE INDEX IF NOT EXISTS idx_pdf_qa_sessions_user_id ON pdf_qa_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_qa_messages_session_id ON pdf_qa_messages(session_id);