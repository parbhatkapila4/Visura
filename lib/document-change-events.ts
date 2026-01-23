import { getDbConnection } from "./db";
import { getChunksForVersion, getVersionById, DocumentVersion } from "./versioned-documents";
import { openrouterChatCompletion } from "./openrouter";
import { logger } from "./logger";

export type ChangeType =
  | "added"
  | "removed"
  | "modified"
  | "policy_shift"
  | "risk_added"
  | "risk_removed"
  | "assumption_added"
  | "assumption_removed"
  | "clarification"
  | "scope_change";

export interface ChangeEvent {
  id: string;
  document_id: string;
  from_version: number;
  to_version: number;
  change_type: ChangeType;
  summary: string;
  affected_chunks: number[];
  confidence: number;
  created_at: Date;
}

export interface SemanticChange {
  change_type: ChangeType;
  summary: string;
  confidence: number;
  affected_chunks: number[];
}

export async function createChangeEvent(
  documentId: string,
  fromVersion: number,
  toVersion: number,
  changeType: ChangeType,
  summary: string,
  affectedChunks: number[],
  confidence: number
): Promise<boolean> {
  const sql = await getDbConnection();

  try {
    await sql`
      INSERT INTO document_change_events (
        document_id, from_version, to_version, change_type, summary, affected_chunks, confidence
      )
      VALUES (
        ${documentId}, ${fromVersion}, ${toVersion}, ${changeType}, ${summary}, ${affectedChunks}, ${confidence}
      )
      ON CONFLICT (document_id, from_version, to_version, change_type, summary) DO NOTHING
    `;
    return true;
  } catch (error: any) {
    if (error?.code === "23505") {
      return false;
    }
    throw error;
  }
}
export async function getTimelineForDocument(documentId: string): Promise<ChangeEvent[]> {
  const sql = await getDbConnection();
  const events = await sql`
    SELECT * FROM document_change_events
    WHERE document_id = ${documentId}
    ORDER BY from_version ASC, to_version ASC, created_at ASC
  `;
  return events as ChangeEvent[];
}


export async function computeSemanticChanges(
  documentId: string,
  fromVersion: DocumentVersion,
  toVersion: DocumentVersion
): Promise<SemanticChange[]> {
  try {
    const fromChunks = await getChunksForVersion(fromVersion.id);
    const toChunks = await getChunksForVersion(toVersion.id);

    const fromSummaries = fromChunks
      .sort((a, b) => a.chunk_index - b.chunk_index)
      .map((chunk) => chunk.summary)
      .filter((s): s is string => s !== null);

    const toSummaries = toChunks
      .sort((a, b) => a.chunk_index - b.chunk_index)
      .map((chunk) => chunk.summary)
      .filter((s): s is string => s !== null);

    const fromSummary = fromSummaries.join("\n\n");
    const toSummary = toSummaries.join("\n\n");

    if (!fromSummary || !toSummary) {
      return [];
    }

    const changedChunks = toChunks.filter(
      (chunk) => !chunk.reused_from_chunk_id && chunk.summary
    );
    const affectedChunkIndexes = changedChunks.map((chunk) => chunk.chunk_index);

    if (affectedChunkIndexes.length === 0) {
      return [];
    }

    const prompt = `You are analyzing changes between two versions of a document.

PREVIOUS VERSION SUMMARY:
${fromSummary}

CURRENT VERSION SUMMARY:
${toSummary}

Analyze the semantic changes and classify them. Return a JSON array of change events. Each event must have:
- change_type: one of ["added", "removed", "modified", "policy_shift", "risk_added", "risk_removed", "assumption_added", "assumption_removed", "clarification", "scope_change"]
- summary: a concise, human-readable explanation of what changed and why it matters
- confidence: a float between 0.0 and 1.0 indicating how confident you are in this classification

Focus on semantic meaning, not just text differences. Consider:
- What was added/removed/modified?
- Are there policy or scope changes?
- Are there new risks or assumptions?
- Is this a clarification of existing content?

Return ONLY valid JSON array, no markdown, no explanation:
[
  {
    "change_type": "added",
    "summary": "New section on data privacy requirements added",
    "confidence": 0.9
  }
]`;

    const response = await openrouterChatCompletion({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: "You are a document change analysis system. Always return valid JSON arrays only, no markdown formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    if (!response) {
      return [];
    }

    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        logger.warn("No JSON array found in LLM response", {
          documentId,
          fromVersion: fromVersion.version_number,
          toVersion: toVersion.version_number,
        });
        return [];
      }

      const changes: Array<{
        change_type: string;
        summary: string;
        confidence: number;
      }> = JSON.parse(jsonMatch[0]);

      const validChangeTypes: ChangeType[] = [
        "added",
        "removed",
        "modified",
        "policy_shift",
        "risk_added",
        "risk_removed",
        "assumption_added",
        "assumption_removed",
        "clarification",
        "scope_change",
      ];

      return changes
        .filter((change) => validChangeTypes.includes(change.change_type as ChangeType))
        .map((change) => ({
          change_type: change.change_type as ChangeType,
          summary: change.summary,
          confidence: Math.max(0, Math.min(1, change.confidence || 0.5)),
          affected_chunks: affectedChunkIndexes,
        }));
    } catch (parseError) {
      logger.error("Failed to parse semantic changes JSON", parseError, {
        documentId,
        fromVersion: fromVersion.version_number,
        toVersion: toVersion.version_number,
        response: response.substring(0, 500),
      });
      return [];
    }
  } catch (error) {
    logger.error("Error computing semantic changes", error, {
      documentId,
      fromVersion: fromVersion.version_number,
      toVersion: toVersion.version_number,
    });
    return [];
  }
}


export async function detectAndRecordChanges(versionId: string): Promise<void> {
  const sql = await getDbConnection();
  const [version] = await sql`
    SELECT * FROM document_versions WHERE id = ${versionId}
  `;

  if (!version) {
    return;
  }

  const toVersion = version as DocumentVersion;

  if (toVersion.version_number === 1) {
    return;
  }

  const [previousVersion] = await sql`
    SELECT * FROM document_versions
    WHERE document_id = ${toVersion.document_id}
      AND version_number = ${toVersion.version_number - 1}
    LIMIT 1
  `;

  if (!previousVersion) {
    return;
  }

  const fromVersion = previousVersion as DocumentVersion;

  const changes = await computeSemanticChanges(
    toVersion.document_id,
    fromVersion,
    toVersion
  );

  for (const change of changes) {
    await createChangeEvent(
      toVersion.document_id,
      fromVersion.version_number,
      toVersion.version_number,
      change.change_type,
      change.summary,
      change.affected_chunks,
      change.confidence
    );
  }

  if (changes.length > 0) {
    logger.info("Semantic changes detected and recorded", {
      versionId,
      documentId: toVersion.document_id,
      fromVersion: fromVersion.version_number,
      toVersion: toVersion.version_number,
      changeCount: changes.length,
    });
  }
}
