import { getDbConnection } from "./db";
import { logger } from "./logger";

export const PROCESSING_EVENT_TYPES = [
  "upload_started",
  "chunking_started",
  "chunking_completed",
  "hash_diff_started",
  "reuse_calculated",
  "llm_processing_started",
  "embeddings_started",
  "indexing_started",
  "version_completed",
  "version_failed",
] as const;

export type ProcessingEventType = (typeof PROCESSING_EVENT_TYPES)[number];

export interface LogProcessingEventParams {
  versionId: string;
  type: ProcessingEventType;
  message?: string;
  metadata?: Record<string, unknown>;
}

export function logProcessingEvent(params: LogProcessingEventParams): void {
  void (async () => {
    try {
      const sql = await getDbConnection();
      await sql`
        INSERT INTO processing_events (version_id, event_type, message, metadata)
        VALUES (
          ${params.versionId},
          ${params.type},
          ${params.message ?? ""},
          ${JSON.stringify(params.metadata ?? {})}
        )
      `;
    } catch (error) {
      logger.warn("Processing event log failed (non-fatal)", {
        versionId: params.versionId,
        type: params.type,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  })();
}
