CREATE TABLE IF NOT EXISTS document_change_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    from_version INTEGER NOT NULL,
    to_version INTEGER NOT NULL,
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN (
        'added',
        'removed',
        'modified',
        'policy_shift',
        'risk_added',
        'risk_removed',
        'assumption_added',
        'assumption_removed',
        'clarification',
        'scope_change'
    )),
    summary TEXT NOT NULL,
    affected_chunks INTEGER[] DEFAULT '{}',
    confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_id, from_version, to_version, change_type, summary)
);

CREATE INDEX IF NOT EXISTS idx_document_change_events_document_id ON document_change_events(document_id);
CREATE INDEX IF NOT EXISTS idx_document_change_events_versions ON document_change_events(document_id, from_version, to_version);
CREATE INDEX IF NOT EXISTS idx_document_change_events_type ON document_change_events(change_type);
CREATE INDEX IF NOT EXISTS idx_document_change_events_created_at ON document_change_events(created_at DESC);
