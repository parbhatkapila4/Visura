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
      SELECT
        ds.pdf_summary_id,
        ps.title,
        ps.file_name,
        (SELECT dv.document_id
         FROM document_versions dv
         WHERE dv.pdf_summary_id = ds.pdf_summary_id
         ORDER BY dv.version_number DESC
         LIMIT 1) AS document_id
      FROM document_shares ds
      INNER JOIN pdf_summaries ps ON ps.id = ds.pdf_summary_id
      WHERE ds.workspace_id = ${workspaceId}
      ORDER BY ds.created_at DESC
    `;

    const documents = (rows as { pdf_summary_id: string; title: string | null; file_name: string | null; document_id: string | null }[]).map(
      (r) => ({
        pdf_summary_id: r.pdf_summary_id,
        document_id: r.document_id ?? "",
        title: r.title ?? "Untitled",
        file_name: r.file_name ?? undefined,
      })
    );

    return NextResponse.json({ documents });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Workspace documents error", err, { workspaceId: (await params).workspaceId });
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
