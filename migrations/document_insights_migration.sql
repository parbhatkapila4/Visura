CREATE TABLE IF NOT EXISTS document_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL CHECK (
        type IN (
            'key_insight',
            'risk',
            'financial_highlight',
            'actionable_point',
            'important_fact'
        )
    ),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    confidence NUMERIC(3, 2) NOT NULL CHECK (
        confidence >= 0
        AND confidence <= 1
    ),
    page INTEGER,
    source_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_document_insights_version_id ON document_insights(document_version_id);