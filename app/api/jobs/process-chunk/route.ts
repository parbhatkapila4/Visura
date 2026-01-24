import { NextRequest, NextResponse } from "next/server";
import { processChunkInternal } from "@/lib/chunk-processor";
import { logger, generateRequestId } from "@/lib/logger";
import { requireInternalAuth } from "@/lib/internal-api-auth";

export const maxDuration = 60;


export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {

    const isAuthorized = await requireInternalAuth(request);
    if (!isAuthorized) {
      logger.warn("Unauthorized internal API access attempt", { requestId });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chunkId, versionId } = await request.json();

    if (!chunkId || !versionId) {
      return NextResponse.json({ error: "chunkId and versionId required" }, { status: 400 });
    }

    const { getDbConnection } = await import("@/lib/db");
    const sql = await getDbConnection();
    const [version] = await sql`
      SELECT output_language FROM document_versions WHERE id = ${versionId}
    `;
    
    const language = (version?.output_language || 'ENGLISH') as import("@/lib/openai").SupportedLanguage;
    
    logger.info("Processing chunk with language", {
      chunkId,
      versionId,
      language,
      storedLanguage: version?.output_language,
    });

    const result = await processChunkInternal(chunkId, versionId, language);

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
