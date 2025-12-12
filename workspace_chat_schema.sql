-- Workspace Chat Schema
-- Run this after workspace_schema.sql

-- Workspace chat messages table
CREATE TABLE IF NOT EXISTS workspace_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL, -- Clerk user ID
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    message_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workspace_chat_messages_workspace_id ON workspace_chat_messages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_chat_messages_created_at ON workspace_chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workspace_chat_messages_user_id ON workspace_chat_messages(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_workspace_chat_messages_updated_at
BEFORE UPDATE ON workspace_chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

