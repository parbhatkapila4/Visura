import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getWorkspaceById } from "@/lib/workspaces";
import { generateAndStoreWorkspaceInsights } from "@/lib/workspace-insights";
import { logger } from "@/lib/logger";

export async function POST(
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

    const { count } = await generateAndStoreWorkspaceInsights(workspaceId);
    return NextResponse.json({ ok: true, count });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Workspace analyze error", err, { workspaceId: (await params).workspaceId });
    return NextResponse.json({ error: "Analysis failed", details: err.message }, { status: 500 });
  }
}
