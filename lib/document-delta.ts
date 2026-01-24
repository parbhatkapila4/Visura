import { getDbConnection } from "./db";
import { getLatestVersion, getChunksForVersion } from "./versioned-documents";
import { generateSummaryFromText } from "./openai";

export async function computeDocumentDelta(documentId: string): Promise<string> {
  const sql = await getDbConnection();

  const versions = await sql`
    SELECT * FROM document_versions
    WHERE document_id = ${documentId}
    ORDER BY version_number DESC
    LIMIT 2
  `;

  if (versions.length < 2) {
    return "This is the first version of this document.";
  }

  const currentVersion = versions[0];
  const previousVersion = versions[1];

  const currentChunks = await getChunksForVersion(currentVersion.id);
  const previousChunks = await getChunksForVersion(previousVersion.id);

  const changedChunks = currentChunks.filter(
    (chunk) => !chunk.reused_from_chunk_id && chunk.summary
  );

  if (changedChunks.length === 0) {
    return "No changes detected in this version.";
  }

  const changedSummaries = changedChunks
    .map((chunk) => chunk.summary)
    .filter((s): s is string => s !== null);

  if (changedSummaries.length === 0) {
    return "Changes detected but summaries not yet available.";
  }

  const deltaText = changedSummaries.join("\n\n");

  try {
    const deltaSummary = await generateSummaryFromText(
      `The following sections changed in the new version:\n\n${deltaText}\n\nProvide a concise summary of what changed, focusing on key differences and new information.`,
      'ENGLISH',
      { isChunk: false }
    );
    return deltaSummary;
  } catch (error) {
    console.error("Delta computation error:", error);
    return changedSummaries.join("\n\n");
  }
}
