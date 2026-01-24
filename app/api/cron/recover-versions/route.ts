import { NextRequest, NextResponse } from "next/server";
import { getIncompleteVersionsOlderThan } from "@/lib/versioned-documents";
import { replayIncompleteChunks } from "@/lib/version-replay";
import { sendAlert } from "@/lib/alerting";
import { logger, generateRequestId } from "@/lib/logger";
import { requireInternalAuth } from "@/lib/internal-api-auth";

export const maxDuration = 60;

const STUCK_VERSION_THRESHOLD_MINUTES = 10;


export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const authHeader = request.headers.get("authorization");
  const hasBearerAuth = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const hasInternalAuth = await requireInternalAuth(request);

  if (!hasBearerAuth && !hasInternalAuth) {
    logger.warn("Unauthorized cron job access attempt", { requestId });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    logger.info("Version recovery cron started", { requestId });

    const incompleteVersions = await getIncompleteVersionsOlderThan(
      STUCK_VERSION_THRESHOLD_MINUTES,
      50
    );

    if (incompleteVersions.length === 0) {
      logger.info("Version recovery cron completed: no stuck versions", { requestId });
      return NextResponse.json({
        versionsFound: 0,
        versionsRecovered: 0,
        chunksProcessed: 0,
      });
    }

    logger.info("Found incomplete versions for recovery", {
      requestId,
      count: incompleteVersions.length,
    });

    const recoveryResults = await Promise.allSettled(
      incompleteVersions.map(async (version) => {
        try {
          const result = await replayIncompleteChunks(version.id);
          return {
            versionId: version.id,
            documentId: version.document_id,
            success: true,
            chunksProcessed: result.triggered,
            incompleteChunks: result.incompleteChunks,
          };
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error("Version recovery failed", err, {
            requestId,
            versionId: version.id,
            documentId: version.document_id,
          });

          sendAlert({
            severity: "critical",
            type: "version_recovery_failed",
            message: `Automatic version recovery failed: ${err.message}`,
            context: {
              versionId: version.id,
              documentId: version.document_id,
              errorMessage: err.message,
            },
          }).catch(() => { });

          return {
            versionId: version.id,
            documentId: version.document_id,
            success: false,
            error: err.message,
          };
        }
      })
    );

    const succeeded = recoveryResults.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ) as Array<PromiseFulfilledResult<{ success: true; chunksProcessed: number; versionId: string; documentId: string; incompleteChunks: number }>>;

    const failed = recoveryResults.filter(
      (r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success)
    );

    const totalChunksProcessed = succeeded.reduce(
      (sum, r) => sum + (r.value?.chunksProcessed || 0),
      0
    );

    const result = {
      versionsFound: incompleteVersions.length,
      versionsRecovered: succeeded.length,
      versionsFailed: failed.length,
      chunksProcessed: totalChunksProcessed,
    };

    logger.info("Version recovery cron completed", { requestId, ...result });

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Version recovery cron error", error, { requestId });
    return NextResponse.json(
      {
        error: "Recovery failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
