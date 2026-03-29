CREATE TABLE IF NOT EXISTS workspace_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL CHECK (type IN ('comparison', 'conflict', 'aggregate')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    source_summary_ids UUID [] NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_workspace_insights_workspace_id ON workspace_insights(workspace_id);