import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getWorkspaceById } from "@/lib/workspaces";
import { resolveWorkspaceVersions, searchWorkspaceChunks } from "@/lib/workspace-search";
import { logger } from "@/lib/logger";

export async function POST(
  request: NextRequest,
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

    const body = await request.json().catch(() => ({}));
    const query = typeof body.query === "string" ? body.query.trim() : "";
    const limit = typeof body.limit === "number" ? Math.min(50, Math.max(1, body.limit)) : 20;
    const document_ids = Array.isArray(body.document_ids)
      ? (body.document_ids as string[]).filter((id) => typeof id === "string")
      : undefined;

    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const versionMetas = await resolveWorkspaceVersions(workspaceId, document_ids);
    const hits = await searchWorkspaceChunks(query, versionMetas, limit);

    return NextResponse.json({ hits });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Workspace search error", err, { workspaceId: (await params).workspaceId });
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
