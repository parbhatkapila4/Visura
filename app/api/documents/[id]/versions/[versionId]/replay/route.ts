import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbConnection } from "@/lib/db";
import { replayVersion, replayIncompleteChunks } from "@/lib/version-replay";
import { getVersionById } from "@/lib/versioned-documents";
import { sendAlert } from "@/lib/alerting";
import { logger, generateRequestId } from "@/lib/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const requestId = generateRequestId();
  const { id: documentId, versionId } = await params;

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const sql = await getDbConnection();

    const [document] = await sql`
      SELECT * FROM documents WHERE id = ${documentId} AND user_id = ${userId}
    `;

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const version = await getVersionById(versionId);
    if (!version || version.document_id !== documentId) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    const { onlyIncomplete } = await request.json().catch(() => ({ onlyIncomplete: false }));

    logger.info("Replay started", { requestId, documentId, versionId, userId, onlyIncomplete });

    let result;
    if (onlyIncomplete) {
      result = await replayIncompleteChunks(versionId);
    } else {
      result = await replayVersion(versionId);
    }

    logger.info("Replay completed", { requestId, documentId, ...result });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Replay error", err, { requestId, documentId, versionId });
    sendAlert({
      severity: "warning",
      type: "replay_failed",
      message: `Version replay failed: ${err.message}`,
      context: {
        documentId,
        versionId,
        errorMessage: err.message,
      },
    }).catch(() => { });
    return NextResponse.json(
      { error: "Replay failed", details: err.message },
      { status: 500 }
    );
  }
}
