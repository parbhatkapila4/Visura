import { getDbConnection } from "./db";
import { sendAlert } from "./alerting";
import { logger } from "./logger";

const ESTIMATED_TOKENS_PER_NEW_CHUNK = 550;

const ESTIMATED_COST_PER_1M_TOKENS = 2.0;

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
  versionId?: string,
  customTokenEstimate?: number
): Promise<CostCheckResult> {
  
  const maxTokensPerDay = parseInt(
    process.env.MAX_TOKENS_PER_USER_PER_DAY || "2000000",
    10
  );
  const maxNewChunksPerVersion = parseInt(
    process.env.MAX_NEW_CHUNKS_PER_VERSION || "0",
    10
  );


  if (maxNewChunksPerVersion > 0 && newChunksCount > maxNewChunksPerVersion) {
    const reason = "This document is too large to process in one go right now. Please split it into smaller parts and upload again.";

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
  const estimatedTokensForThisVersion = customTokenEstimate 
    ? customTokenEstimate 
    : newChunksCount * ESTIMATED_TOKENS_PER_NEW_CHUNK;
  const totalAfterThisVersion = tokensToday + estimatedTokensForThisVersion;

  const maxEstimatedCostPerDay = parseFloat(
    process.env.MAX_ESTIMATED_COST_PER_USER_PER_DAY || "0"
  );
  const estimatedCostToday = (tokensToday / 1_000_000) * ESTIMATED_COST_PER_1M_TOKENS;
  const estimatedCostThisVersion = (estimatedTokensForThisVersion / 1_000_000) * ESTIMATED_COST_PER_1M_TOKENS;
  const estimatedCostAfter = estimatedCostToday + estimatedCostThisVersion;

  if (Number.isFinite(maxEstimatedCostPerDay) && maxEstimatedCostPerDay > 0 && estimatedCostAfter > maxEstimatedCostPerDay) {
    const reason = "You've reached today's AI processing budget. Please try again later.";

    logger.error("Cost guardrail: estimated daily cost exceeded", undefined, {
      userId,
      documentId,
      versionId,
      estimatedCostToday,
      estimatedCostThisVersion,
      estimatedCostAfter,
      maxEstimatedCostPerDay,
    });

    sendAlert({
      severity: "critical",
      type: "cost_limit_exceeded",
      message: `Cost limit exceeded: ${reason}`,
      context: {
        userId,
        documentId,
        versionId,
        limitType: "estimated_daily_cost",
        estimatedCostAfter,
        maxEstimatedCostPerDay,
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

  if (maxTokensPerDay > 0 && totalAfterThisVersion > maxTokensPerDay) {
    const reason = "You've reached today's processing limit. Please try again tomorrow.";

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
