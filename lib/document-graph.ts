import { getDbConnection } from "./db";
import { getChunksForVersion } from "./versioned-documents";
import { openrouterChatCompletion } from "./openrouter";
import { logger } from "./logger";

export const NODE_TYPES = ["topic", "entity", "section", "concept"] as const;
export const RELATION_TYPES = ["relates_to", "contains", "references", "impacts"] as const;

export type GraphNodeType = (typeof NODE_TYPES)[number];
export type GraphRelationType = (typeof RELATION_TYPES)[number];
export interface GraphNode {
  node_id: string;
  type: GraphNodeType;
  label?: string | null;
  metadata?: Record<string, unknown>;
}

export interface GraphEdge {
  from_node_id: string;
  to_node_id: string;
  relation: GraphRelationType;
  metadata?: Record<string, unknown>;
}

export interface GraphPayload {
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

const EXCERPT_LENGTH = 15000;

function sanitizeNodeId(s: unknown): string {
  const raw = String(s ?? "")
    .trim()
    .slice(0, 250);
  const slug =
    raw
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "") || "node";
  return slug || "node";
}

function coerceNodeType(s: unknown): GraphNodeType {
  const t = String(s).toLowerCase();
  if (NODE_TYPES.includes(t as GraphNodeType)) return t as GraphNodeType;
  if (/topic|theme/.test(t)) return "topic";
  if (/entity|person|company|org/.test(t)) return "entity";
  if (/section|part|chapter/.test(t)) return "section";
  if (/concept|idea/.test(t)) return "concept";
  return "concept";
}

function coerceRelation(s: unknown): GraphRelationType {
  const t = String(s).toLowerCase().replace(/-/g, "_");
  if (RELATION_TYPES.includes(t as GraphRelationType)) return t as GraphRelationType;
  if (/relates|related/.test(t)) return "relates_to";
  if (/contains|has|include/.test(t)) return "contains";
  if (/references|refer|cite/.test(t)) return "references";
  if (/impacts|affect|influence/.test(t)) return "impacts";
  return "relates_to";
}

export async function generateAndStoreDocumentGraph(versionId: string): Promise<void> {
  try {
    const chunks = await getChunksForVersion(versionId);
    const sorted = [...chunks].sort((a, b) => a.chunk_index - b.chunk_index);
    const fullText = sorted
      .map((c) => c.text)
      .join("\n\n")
      .trim();

    if (!fullText || fullText.length < 100) {
      logger.info("Document too short for graph extraction", {
        versionId,
        length: fullText.length,
      });
      await clearGraphForVersion(versionId);
      return;
    }

    const sql = await getDbConnection();
    const sectionRows = await sql`
      SELECT title, start_page, end_page
      FROM document_sections
      WHERE document_version_id = ${versionId}
      ORDER BY sort_order ASC, start_page ASC
    `;
    const sectionsContext =
      sectionRows.length > 0
        ? `\nDocument sections (use for "section" nodes): ${JSON.stringify(sectionRows.slice(0, 25))}`
        : "";

    const prompt = `You are building a knowledge graph from a document.

Node types (use exactly these "type" values):
- topic: themes or high-level subjects (e.g. "market_analysis", "risk_management")
- entity: named things (e.g. companies, people, places): "tesla", "john_smith"
- section: document parts (e.g. "introduction", "executive_summary")
- concept: ideas or terms (e.g. "revenue", "growth", "compliance")

Relation types (use exactly these "relation" values):
- relates_to: general connection
- contains: parent contains child (e.g. section contains topic)
- references: one node references another
- impacts: one node affects another

Rules:
- node_id: unique slug-like id (lowercase, underscores, no spaces), e.g. "market_analysis", "tesla"
- label: human-readable name (e.g. "Market Analysis", "Tesla")
- Every from_node_id and to_node_id in edges must appear as node_id in nodes.
- Extract 5–25 nodes and 3–20 edges. Prefer quality over quantity.

Return valid JSON only, no markdown:
{"nodes":[{"node_id":"...","type":"topic|entity|section|concept","label":"..."}],"edges":[{"from_node_id":"...","to_node_id":"...","relation":"relates_to|contains|references|impacts"}]}
${sectionsContext}

Document excerpt (first ${EXCERPT_LENGTH} chars):
---
${fullText.slice(0, EXCERPT_LENGTH)}
---`;

    const raw = await openrouterChatCompletion({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 4096,
    });

    const jsonStr = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();
    let parsed: { nodes?: unknown[]; edges?: unknown[] };
    try {
      parsed = JSON.parse(jsonStr) as { nodes?: unknown[]; edges?: unknown[] };
    } catch (e) {
      logger.warn("Graph extraction: failed to parse AI response as JSON", {
        versionId,
        error: e instanceof Error ? e.message : String(e),
        preview: jsonStr.slice(0, 200),
      });
      return;
    }

    const rawNodes = Array.isArray(parsed?.nodes) ? parsed.nodes : [];
    const rawEdges = Array.isArray(parsed?.edges) ? parsed.edges : [];

    const nodeMap = new Map<string, GraphNode>();
    for (const n of rawNodes) {
      if (!n || typeof n !== "object") continue;
      const obj = n as Record<string, unknown>;
      const nodeId = sanitizeNodeId(obj.node_id);
      if (!nodeId) continue;
      nodeMap.set(nodeId, {
        node_id: nodeId,
        type: coerceNodeType(obj.type),
        label: obj.label != null ? String(obj.label).trim().slice(0, 500) : null,
        metadata:
          obj.metadata && typeof obj.metadata === "object" && obj.metadata !== null
            ? (obj.metadata as Record<string, unknown>)
            : {},
      });
    }

    const nodeIds = new Set(nodeMap.keys());
    const edges: GraphEdge[] = [];
    for (const e of rawEdges) {
      if (!e || typeof e !== "object") continue;
      const obj = e as Record<string, unknown>;
      const from = sanitizeNodeId(obj.from_node_id);
      const to = sanitizeNodeId(obj.to_node_id);
      if (!from || !to || !nodeIds.has(from) || !nodeIds.has(to)) continue;
      edges.push({
        from_node_id: from,
        to_node_id: to,
        relation: coerceRelation(obj.relation),
        metadata:
          obj.metadata && typeof obj.metadata === "object" && obj.metadata !== null
            ? (obj.metadata as Record<string, unknown>)
            : {},
      });
    }

    const nodes = Array.from(nodeMap.values());

    await clearGraphForVersion(versionId);

    for (const node of nodes) {
      await sql`
        INSERT INTO document_graph_nodes (document_version_id, node_id, type, label, metadata)
        VALUES (${versionId}, ${node.node_id}, ${node.type}, ${node.label ?? null}, ${JSON.stringify(node.metadata ?? {})})
      `;
    }
    for (const edge of edges) {
      await sql`
        INSERT INTO document_graph_edges (document_version_id, from_node_id, to_node_id, relation, metadata)
        VALUES (${versionId}, ${edge.from_node_id}, ${edge.to_node_id}, ${edge.relation}, ${JSON.stringify(edge.metadata ?? {})})
      `;
    }
    logger.info("Document graph stored", {
      versionId,
      nodeCount: nodes.length,
      edgeCount: edges.length,
    });
  } catch (error) {
    logger.warn("Graph extraction failed (non-fatal)", {
      versionId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function clearGraphForVersion(versionId: string): Promise<void> {
  const sql = await getDbConnection();
  await sql`DELETE FROM document_graph_edges WHERE document_version_id = ${versionId}`;
  await sql`DELETE FROM document_graph_nodes WHERE document_version_id = ${versionId}`;
}
