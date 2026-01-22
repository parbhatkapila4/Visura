import { getDbConnection } from "./db";
import { ESTIMATED_TOKENS_PER_CHUNK } from "./versioned-documents";
import { sendAlert } from "./alerting";
import { logger } from "./logger";


const ESTIMATED_TOKENS_PER_NEW_CHUNK = 1500;

export interface CostCheckResult {
  allowed: boolean;
  reason?: string;
  currentUsage?: {
    tokensToday: number;
    maxTokensPerDay: number;
    newChunksInVersion: number;
    maxNewChunksPerVersion: number;
  };
}

async function getDailyTokenUsage(userId: string): Promise<number> {
  const sql = await getDbConnection();

  const [result] = await sql`
    SELECT COALESCE(SUM(dv.new_chunks * ${ESTIMATED_TOKENS_PER_NEW_CHUNK}), 0) as tokens_today
    FROM document_versions dv
    JOIN documents d ON dv.document_id = d.id
    WHERE d.user_id = ${userId}
      AND DATE_TRUNC('day', dv.created_at) = DATE_TRUNC('day', NOW())
  `;

  return Number(result?.tokens_today || 0);
}


export async function checkCostGuardrails(
  userId: string,
  newChunksCount: number,
  documentId?: string,
  versionId?: string
): Promise<CostCheckResult> {
  const maxTokensPerDay = parseInt(
    process.env.MAX_TOKENS_PER_USER_PER_DAY || "100000",
    10
  );
  const maxNewChunksPerVersion = parseInt(
    process.env.MAX_NEW_CHUNKS_PER_VERSION || "100",
    10
  );


  if (newChunksCount > maxNewChunksPerVersion) {
    const reason = `New chunks (${newChunksCount}) exceeds per-version limit (${maxNewChunksPerVersion})`;

    logger.error("Cost guardrail: per-version limit exceeded", undefined, {
      userId,
      documentId,
      versionId,
      newChunksCount,
      maxNewChunksPerVersion,
    });

    sendAlert({
      severity: "critical",
      type: "cost_limit_exceeded",
      message: `Cost limit exceeded: ${reason}`,
      context: {
        userId,
        documentId,
        versionId,
        limitType: "per_version",
        currentUsage: newChunksCount,
        limit: maxNewChunksPerVersion,
      },
    }).catch(() => { });

    return {
      allowed: false,
      reason,
      currentUsage: {
        tokensToday: 0,
        maxTokensPerDay,
        newChunksInVersion: newChunksCount,
        maxNewChunksPerVersion,
      },
    };
  }


  const tokensToday = await getDailyTokenUsage(userId);
  const estimatedTokensForThisVersion = newChunksCount * ESTIMATED_TOKENS_PER_NEW_CHUNK;
  const totalAfterThisVersion = tokensToday + estimatedTokensForThisVersion;

  if (totalAfterThisVersion > maxTokensPerDay) {
    const reason = `Daily token limit would be exceeded: ${totalAfterThisVersion} > ${maxTokensPerDay} (current: ${tokensToday}, this version: ${estimatedTokensForThisVersion})`;

    logger.error("Cost guardrail: daily limit exceeded", undefined, {
      userId,
      documentId,
      versionId,
      tokensToday,
      estimatedTokensForThisVersion,
      totalAfterThisVersion,
      maxTokensPerDay,
    });

    sendAlert({
      severity: "critical",
      type: "cost_limit_exceeded",
      message: `Cost limit exceeded: ${reason}`,
      context: {
        userId,
        documentId,
        versionId,
        limitType: "daily",
        currentUsage: tokensToday,
        limit: maxTokensPerDay,
        estimatedTokensForThisVersion,
        totalAfterThisVersion,
      },
    }).catch(() => { });

    return {
      allowed: false,
      reason,
      currentUsage: {
        tokensToday,
        maxTokensPerDay,
        newChunksInVersion: newChunksCount,
        maxNewChunksPerVersion,
      },
    };
  }

  return {
    allowed: true,
    currentUsage: {
      tokensToday,
      maxTokensPerDay,
      newChunksInVersion: newChunksCount,
      maxNewChunksPerVersion,
    },
  };
}
