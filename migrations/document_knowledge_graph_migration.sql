CREATE TABLE IF NOT EXISTS document_graph_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
    node_id VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL CHECK (
        type IN ('topic', 'entity', 'section', 'concept')
    ),
    label TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(document_version_id, node_id)
);
CREATE INDEX IF NOT EXISTS idx_document_graph_nodes_version_id ON document_graph_nodes(document_version_id);
CREATE TABLE IF NOT EXISTS document_graph_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
    from_node_id VARCHAR(255) NOT NULL,
    to_node_id VARCHAR(255) NOT NULL,
    relation VARCHAR(64) NOT NULL CHECK (
        relation IN (
            'relates_to',
            'contains',
            'references',
            'impacts'
        )
    ),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_document_graph_edges_version_id ON document_graph_edges(document_version_id);