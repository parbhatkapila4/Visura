import { NextResponse } from "next/server";
import { getDbConnection } from "@/lib/db";
import { sendAlert } from "@/lib/alerting";

const STUCK_VERSION_THRESHOLD_MINUTES = 10;
const MAX_STUCK_VERSIONS = 10;

export async function GET() {
  const startTime = Date.now();
  const ready: {
    status: "ready" | "not_ready";
    timestamp: string;
    checks: Record<string, { status: "ok" | "error"; message?: string; count?: number }>;
  } = {
    status: "ready",
    timestamp: new Date().toISOString(),
    checks: {},
  };

  try {
    const sql = await getDbConnection();

    const [stuckVersions] = await sql`
      SELECT COUNT(*) as count
      FROM document_versions dv
      WHERE dv.pdf_summary_id IS NULL
        AND dv.created_at < NOW() - make_interval(mins => ${STUCK_VERSION_THRESHOLD_MINUTES})
        AND EXISTS (
          SELECT 1 FROM document_chunks dc
          WHERE dc.document_version_id = dv.id
            AND dc.summary IS NULL
            AND dc.reused_from_chunk_id IS NULL
        )
    `;

    const stuckCount = Number(stuckVersions?.count || 0);

    if (stuckCount > MAX_STUCK_VERSIONS) {
      ready.status = "not_ready";
      ready.checks.stuck_versions = {
        status: "error",
        message: `Too many stuck versions: ${stuckCount} (threshold: ${MAX_STUCK_VERSIONS})`,
        count: stuckCount,
      };
      sendAlert({
        severity: "critical",
        type: "system_not_ready",
        message: `System not ready: ${stuckCount} stuck versions (threshold: ${MAX_STUCK_VERSIONS})`,
        context: { stuckVersionsCount: stuckCount, threshold: MAX_STUCK_VERSIONS },
      }).catch(() => { });
    } else {
      ready.checks.stuck_versions = {
        status: "ok",
        message: `Stuck versions within limit: ${stuckCount}`,
        count: stuckCount,
      };
    }
  } catch (error) {
    ready.status = "not_ready";
    ready.checks.stuck_versions = {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to check stuck versions",
    };
  }

  try {
    const sql = await getDbConnection();

    const [orphanedChunks] = await sql`
      SELECT COUNT(DISTINCT dc.document_version_id) as count
      FROM document_chunks dc
      WHERE dc.reused_from_chunk_id IS NOT NULL
        AND dc.summary IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM document_chunks source_dc
          WHERE source_dc.id = dc.reused_from_chunk_id
            AND source_dc.summary IS NOT NULL
        )
    `;

    const orphanedCount = Number(orphanedChunks?.count || 0);

    if (orphanedCount > 0) {
      ready.status = "not_ready";
      ready.checks.orphaned_reused_chunks = {
        status: "error",
        message: `Versions with orphaned reused chunks: ${orphanedCount}`,
        count: orphanedCount,
      };
      sendAlert({
        severity: "critical",
        type: "system_not_ready",
        message: `System not ready: ${orphanedCount} versions with orphaned reused chunks`,
        context: { orphanedChunksCount: orphanedCount },
      }).catch(() => { });
    } else {
      ready.checks.orphaned_reused_chunks = {
        status: "ok",
        message: "No orphaned reused chunks",
        count: 0,
      };
    }
  } catch (error) {
    ready.status = "not_ready";
    ready.checks.orphaned_reused_chunks = {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to check orphaned chunks",
    };
  }

  const totalDuration = Date.now() - startTime;
  const statusCode = ready.status === "ready" ? 200 : 503;

  return NextResponse.json(
    {
      ...ready,
      duration_ms: totalDuration,
    },
    { status: statusCode }
  );
}
