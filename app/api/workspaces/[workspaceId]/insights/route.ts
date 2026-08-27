import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getWorkspaceById } from "@/lib/workspaces";
import { getDbConnection } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId } = await params;
    const workspace = await getWorkspaceById(workspaceId, userId);
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const sql = await getDbConnection();
    const rows = await sql`
      SELECT id, type, title, description, source_summary_ids, metadata, created_at
      FROM workspace_insights
      WHERE workspace_id = ${workspaceId}
      ORDER BY created_at DESC
    `;

    const insights = (
      rows as Array<{
        id: string;
        type: string;
        title: string;
        description: string;
        source_summary_ids: string[] | unknown;
        metadata: unknown;
        created_at: string | Date;
      }>
    ).map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      description: r.description,
      source_summary_ids: Array.isArray(r.source_summary_ids) ? r.source_summary_ids : [],
      metadata:
        r.metadata && typeof r.metadata === "object" && r.metadata !== null
          ? (r.metadata as object)
          : {},
      created_at:
        typeof r.created_at === "string" ? r.created_at : (r.created_at as Date).toISOString(),
    }));

    return NextResponse.json({ insights });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Workspace insights GET error", err, { workspaceId: (await params).workspaceId });
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
