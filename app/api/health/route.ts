import { NextResponse } from "next/server";
import { getDbConnection } from "@/lib/db";
import { sendAlert } from "@/lib/alerting";

export async function GET() {
  const startTime = Date.now();
  const health: {
    status: "healthy" | "unhealthy";
    timestamp: string;
    checks: Record<string, { status: "ok" | "error"; message?: string; duration?: number }>;
  } = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    checks: {},
  };

  try {
    const dbStart = Date.now();
    const sql = await getDbConnection();
    await sql`SELECT 1`;
    const dbDuration = Date.now() - dbStart;
    health.checks.database = {
      status: "ok",
      message: "Database reachable",
      duration: dbDuration,
    };
  } catch (error) {
    health.status = "unhealthy";
    const err = error instanceof Error ? error : new Error(String(error));
    health.checks.database = {
      status: "error",
      message: err.message,
    };
    sendAlert({
      severity: "critical",
      type: "health_check_failed",
      message: `Health check failed: Database unreachable - ${err.message}`,
      context: { check: "database", errorMessage: err.message },
    }).catch(() => { });
  }

  try {
    const schemaStart = Date.now();
    const sql = await getDbConnection();
    const [result] = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'document_versions'
      ) as versions_table_exists,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'document_chunks'
      ) as chunks_table_exists,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'summary_jobs'
      ) as jobs_table_exists
    `;
    const schemaDuration = Date.now() - schemaStart;

    if (result?.versions_table_exists && result?.chunks_table_exists && result?.jobs_table_exists) {
      health.checks.schema = {
        status: "ok",
        message: "Required tables exist",
        duration: schemaDuration,
      };
    } else {
      health.status = "unhealthy";
      health.checks.schema = {
        status: "error",
        message: "Missing required tables",
        duration: schemaDuration,
      };
      sendAlert({
        severity: "critical",
        type: "health_check_failed",
        message: "Health check failed: Missing required tables",
        context: { check: "schema", missingTables: "document_versions, document_chunks, or summary_jobs" },
      }).catch(() => { });
    }
  } catch (error) {
    health.status = "unhealthy";
    const err = error instanceof Error ? error : new Error(String(error));
    health.checks.schema = {
      status: "error",
      message: err.message,
    };
    sendAlert({
      severity: "critical",
      type: "health_check_failed",
      message: `Health check failed: Schema check error - ${err.message}`,
      context: { check: "schema", errorMessage: err.message },
    }).catch(() => { });
  }

  const totalDuration = Date.now() - startTime;
  const statusCode = health.status === "healthy" ? 200 : 503;

  return NextResponse.json(
    {
      ...health,
      duration_ms: totalDuration,
    },
    { status: statusCode }
  );
}
