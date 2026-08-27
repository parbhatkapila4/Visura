import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbConnection } from "@/lib/db";
import { logger } from "@/lib/logger";
import type { GraphNodeType, GraphRelationType } from "@/lib/document-graph";

export interface GraphResponse {
  nodes: Array<{
    id: string;
    type: GraphNodeType;
    label: string | null;
    metadata: Record<string, unknown>;
  }>;
  edges: Array<{
    from: string;
    to: string;
    relation: GraphRelationType;
  }>;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: documentId, versionId } = await params;
    const sql = await getDbConnection();

    const [versionRow] = await sql`
      SELECT dv.id
      FROM document_versions dv
      JOIN documents d ON dv.document_id = d.id
      WHERE dv.id = ${versionId}
        AND dv.document_id = ${documentId}
        AND d.user_id = ${userId}
    `;

    if (!versionRow) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    const nodeRows = await sql`
      SELECT node_id, type, label, metadata
      FROM document_graph_nodes
      WHERE document_version_id = ${versionId}
    `;

    const edgeRows = await sql`
      SELECT from_node_id, to_node_id, relation
      FROM document_graph_edges
      WHERE document_version_id = ${versionId}
    `;

    const nodeIds = new Set((nodeRows as { node_id: string }[]).map((r) => r.node_id));

    const nodes = (
      nodeRows as { node_id: string; type: string; label: string | null; metadata: unknown }[]
    ).map((r) => ({
      id: r.node_id,
      type: r.type as GraphNodeType,
      label: r.label ?? null,
      metadata:
        r.metadata && typeof r.metadata === "object" && r.metadata !== null
          ? (r.metadata as Record<string, unknown>)
          : {},
    }));

    const edges = (edgeRows as { from_node_id: string; to_node_id: string; relation: string }[])
      .filter((e) => nodeIds.has(e.from_node_id) && nodeIds.has(e.to_node_id))
      .map((e) => ({
        from: e.from_node_id,
        to: e.to_node_id,
        relation: e.relation as GraphRelationType,
      }));

    const response: GraphResponse = { nodes, edges };
    return NextResponse.json(response);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Graph API error", err, { versionId: (await params).versionId });
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
