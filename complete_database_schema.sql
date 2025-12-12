-- ============================================
-- COMPLETE DATABASE SCHEMA FOR VISURA
-- ============================================
-- Run this entire file in your Neon database
-- This includes: Main schema, Chatbot functionality, Share functionality, and Workspace Collaboration

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MAIN TABLES (from schema.sql)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    full_name VARCHAR(255),
    customer_id VARCHAR(255) UNIQUE,
    price_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'inactive'
);

CREATE TABLE IF NOT EXISTS pdf_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    original_file_url TEXT NOT NULL,
    summary_text TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    title TEXT,
    file_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    share_token VARCHAR(255) UNIQUE
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    stripe_payment_id VARCHAR(255) UNIQUE NOT NULL,
    price_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL REFERENCES users(email),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CHATBOT FUNCTIONALITY TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS pdf_stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pdf_summary_id UUID NOT NULL REFERENCES pdf_summaries(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    full_text_content TEXT NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pdf_qa_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pdf_store_id UUID NOT NULL REFERENCES pdf_stores(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    session_name VARCHAR(255) DEFAULT 'New Chat',
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

-- ============================================
-- DOWNLOAD TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS summary_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    summary_id UUID NOT NULL REFERENCES pdf_summaries(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, summary_id)
);

-- ============================================
-- WORKSPACE COLLABORATION TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id VARCHAR(255) NOT NULL, -- Clerk user ID
    plan VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL, -- Clerk user ID
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'member', -- owner, admin, member, viewer
    status VARCHAR(50) DEFAULT 'active', -- active, invited, inactive
    invited_by VARCHAR(255),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS document_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pdf_summary_id UUID NOT NULL REFERENCES pdf_summaries(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    shared_by VARCHAR(255) NOT NULL, -- Clerk user ID
    permission VARCHAR(50) DEFAULT 'view', -- view, comment, edit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pdf_summary_id, workspace_id)
);

CREATE TABLE IF NOT EXISTS collaboration_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pdf_summary_id UUID NOT NULL REFERENCES pdf_summaries(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL, -- Clerk user ID
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    cursor_position JSONB, -- {x: number, y: number, page: number}
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pdf_summary_id, user_id)
);

CREATE TABLE IF NOT EXISTS document_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pdf_summary_id UUID NOT NULL REFERENCES pdf_summaries(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL, -- Clerk user ID
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    content TEXT NOT NULL,
    position JSONB, -- {x: number, y: number, page: number}
    resolved BOOLEAN DEFAULT false,
    parent_comment_id UUID REFERENCES document_comments(id) ON DELETE CASCADE, -- For replies
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workspace_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    action_type VARCHAR(100) NOT NULL, -- document_uploaded, document_shared, comment_added, member_invited, etc.
    action_description TEXT,
    metadata JSONB, -- Additional data about the action
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TRIGGER FUNCTION FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pdf_summaries_updated_at ON pdf_summaries;
CREATE TRIGGER update_pdf_summaries_updated_at
BEFORE UPDATE ON pdf_summaries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

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

DROP TRIGGER IF EXISTS update_workspaces_updated_at ON workspaces;
CREATE TRIGGER update_workspaces_updated_at
BEFORE UPDATE ON workspaces
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workspace_members_updated_at ON workspace_members;
CREATE TRIGGER update_workspace_members_updated_at
BEFORE UPDATE ON workspace_members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_document_shares_updated_at ON document_shares;
CREATE TRIGGER update_document_shares_updated_at
BEFORE UPDATE ON document_shares
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_document_comments_updated_at ON document_comments;
CREATE TRIGGER update_document_comments_updated_at
BEFORE UPDATE ON document_comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Chatbot indexes
CREATE INDEX IF NOT EXISTS idx_pdf_stores_pdf_summary_id ON pdf_stores(pdf_summary_id);
CREATE INDEX IF NOT EXISTS idx_pdf_stores_user_id ON pdf_stores(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_qa_sessions_pdf_store_id ON pdf_qa_sessions(pdf_store_id);
CREATE INDEX IF NOT EXISTS idx_pdf_qa_sessions_user_id ON pdf_qa_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_qa_messages_session_id ON pdf_qa_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_pdf_qa_messages_created_at ON pdf_qa_messages(created_at);

-- Download tracking indexes
CREATE INDEX IF NOT EXISTS idx_summary_downloads_user_id ON summary_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_summary_downloads_summary_id ON summary_downloads(summary_id);

-- Share token index
CREATE INDEX IF NOT EXISTS idx_pdf_summaries_share_token ON pdf_summaries(share_token);

-- Workspace collaboration indexes
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_workspace_id ON document_shares(workspace_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_pdf_summary_id ON document_shares(pdf_summary_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_pdf_summary_id ON collaboration_sessions(pdf_summary_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_user_id ON collaboration_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_pdf_summary_id ON document_comments(pdf_summary_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_workspace_id ON document_comments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_activities_workspace_id ON workspace_activities(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_activities_created_at ON workspace_activities(created_at DESC);

-- ============================================
-- VIEWS
-- ============================================

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

-- ============================================
-- SCHEMA COMPLETE
-- ============================================
-- All tables, triggers, indexes, and views have been created
-- Your database is now ready for:
-- 1. Main PDF summary functionality
-- 2. Chatbot functionality
-- 3. Share functionality
-- 4. Workspace collaboration features










