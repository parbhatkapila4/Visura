-- ============================================
-- WORKSPACE COLLABORATION MIGRATION
-- ============================================
-- Run this ONLY if you already have the main tables (users, pdf_summaries, etc.)
-- This adds only the workspace collaboration tables

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
-- INDEXES FOR PERFORMANCE
-- ============================================

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
-- TRIGGERS FOR UPDATED_AT
-- ============================================
-- Make sure update_updated_at_column() function exists first
-- (It should already exist from your main schema)

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
-- MIGRATION COMPLETE
-- ============================================
-- Workspace collaboration tables have been added to your database







