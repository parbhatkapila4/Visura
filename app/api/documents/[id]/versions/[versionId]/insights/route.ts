import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbConnection } from "@/lib/db";
import { computeVersionEfficiency, type VersionEfficiency } from "@/lib/processing-metrics";
import { logger } from "@/lib/logger";

export interface InsightsVersion {
  id: string;
  version_number: number;
  created_at: string;
  total_chunks: number;
  reused_chunks: number;
  new_chunks: number;
}

export interface InsightsEvent {
  id: string;
  event_type: string;
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface InsightsResponse {
  version: InsightsVersion;
  events: InsightsEvent[];
  metrics: VersionEfficiency;
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
      SELECT dv.id, dv.version_number, dv.created_at, dv.total_chunks, dv.reused_chunks, dv.new_chunks
      FROM document_versions dv
      JOIN documents d ON dv.document_id = d.id
      WHERE dv.id = ${versionId}
        AND dv.document_id = ${documentId}
        AND d.user_id = ${userId}
    `;

    if (!versionRow) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    const [eventsRows, metrics] = await Promise.all([
      sql`
        SELECT id, event_type, message, metadata, created_at
        FROM processing_events
        WHERE version_id = ${versionId}
        ORDER BY created_at ASC
      `,
      computeVersionEfficiency(versionId),
    ]);

    const events = (eventsRows as { id: string; event_type: string; message: string | null; metadata: unknown; created_at: string | Date }[]).map((row) => ({
      id: row.id,
      event_type: row.event_type,
      message: row.message ?? "",
      metadata: (typeof row.metadata === "object" && row.metadata !== null ? row.metadata : {}) as Record<string, unknown>,
      created_at: typeof row.created_at === "string" ? row.created_at : (row.created_at as Date).toISOString(),
    }));

    const response: InsightsResponse = {
      version: {
        id: versionRow.id as string,
        version_number: Number(versionRow.version_number),
        created_at: typeof versionRow.created_at === "string" ? versionRow.created_at : (versionRow.created_at as Date).toISOString(),
        total_chunks: Number(versionRow.total_chunks ?? 0),
        reused_chunks: Number(versionRow.reused_chunks ?? 0),
        new_chunks: Number(versionRow.new_chunks ?? 0),
      },
      events,
      metrics,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Insights API error", err, { versionId: (await params).versionId });
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
