"use client";

import Link from "next/link";
import { ChevronLeft, Network } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const NODE_TYPE_ORDER = ["topic", "entity", "section", "concept"] as const;
const TYPE_LABELS: Record<string, string> = {
  topic: "Topics",
  entity: "Entities",
  section: "Sections",
  concept: "Concepts",
};

export interface GraphNode {
  id: string;
  type: string;
  label: string | null;
  metadata?: Record<string, unknown>;
}

export interface GraphEdge {
  from: string;
  to: string;
  relation: string;
}

export interface GraphLibraryShape {
  nodes: Array<{ id: string; type: string; label: string | null }>;
  edges: Array<{ source: string; target: string; label: string }>;
}

export interface DocumentGraphPanelProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  summaryId: string;
  summaryTitle: string;
}

function prepareForGraphLibrary(nodes: GraphNode[], edges: GraphEdge[]): GraphLibraryShape {
  return {
    nodes: nodes.map((n) => ({ id: n.id, type: n.type, label: n.label ?? null })),
    edges: edges.map((e) => ({ source: e.from, target: e.to, label: e.relation })),
  };
}

export function DocumentGraphPanel({
  nodes,
  edges,
  summaryId,
  summaryTitle,
}: DocumentGraphPanelProps) {
  const hasData = nodes.length > 0 || edges.length > 0;
  const graphShape = prepareForGraphLibrary(nodes, edges);

  const nodesByType = NODE_TYPE_ORDER.reduce<Record<string, GraphNode[]>>((acc, type) => {
    const items = nodes.filter((n) => n.type === type);
    if (items.length > 0) acc[type] = items;
    return acc;
  }, {});

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white">
      <header className="sticky top-0 z-10 border-b border-[#1f1f1f] bg-[#0a0a0a]/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-[#888] hover:text-white hover:bg-[#1a1a1a]"
          >
            <Link href={`/summaries/${summaryId}`}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">{summaryTitle}</h1>
            <p className="text-xs text-[#666]">Knowledge graph</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {!hasData ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center px-4">
            <p className="text-[#888] text-center mb-4">No graph data for this document yet.</p>
            <Button
              variant="outline"
              asChild
              className="border-[#333] text-[#888] hover:bg-[#1a1a1a]"
            >
              <Link href={`/summaries/${summaryId}`}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to summary
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <p className="text-sm text-[#888]">
              Graph: {graphShape.nodes.length} nodes, {graphShape.edges.length} edges.
            </p>

            {NODE_TYPE_ORDER.map((type) => {
              const items = nodesByType[type];
              if (!items || items.length === 0) return null;
              const label = TYPE_LABELS[type] ?? type;

              return (
                <Card key={type} className="bg-[#111] border-[#1f1f1f]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-white">{label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {items.map((node) => (
                        <li
                          key={node.id}
                          className="text-sm text-[#ccc] flex items-center gap-2"
                        >
                          <Network className="h-3.5 w-3.5 text-[#555] shrink-0" />
                          <span className="truncate">{node.label || node.id}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}

            {edges.length > 0 && (
              <Card className="bg-[#111] border-[#1f1f1f]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-white">Relationships</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5 text-sm text-[#888]">
                    {edges.slice(0, 50).map((edge, i) => {
                      const fromLabel = nodes.find((n) => n.id === edge.from)?.label ?? edge.from;
                      const toLabel = nodes.find((n) => n.id === edge.to)?.label ?? edge.to;
                      return (
                        <li key={`${edge.from}-${edge.to}-${i}`} className="truncate">
                          {fromLabel} → {toLabel} <span className="text-[#555]">({edge.relation})</span>
                        </li>
                      );
                    })}
                    {edges.length > 50 && (
                      <li className="text-[#555] pt-1">… and {edges.length - 50} more</li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
