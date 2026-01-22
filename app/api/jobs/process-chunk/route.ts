import { NextRequest, NextResponse } from "next/server";
import { processChunkInternal } from "@/lib/chunk-processor";
import { logger, generateRequestId } from "@/lib/logger";

export const maxDuration = 60;


export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { chunkId, versionId } = await request.json();

    if (!chunkId || !versionId) {
      return NextResponse.json({ error: "chunkId and versionId required" }, { status: 400 });
    }

    const result = await processChunkInternal(chunkId, versionId);

    if (!result.success) {
      if (result.error === "Chunk not found") {
        return NextResponse.json({ error: result.error }, { status: 404 });
      }
      if (result.skipped) {
        return NextResponse.json(
          { success: false, message: result.error, skipped: true },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Processing failed", details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      summary: result.summary,
      skipped: result.skipped,
    });
  } catch (error) {
    logger.error("Process chunk route error", error, { requestId });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
