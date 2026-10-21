import { getDbConnection } from "./db";
import { getChunksForVersion, getVersionById, DocumentVersion } from "./versioned-documents";
import { openrouterChatCompletion } from "./openrouter";
import { logger } from "./logger";
import { alignSegments, quoteIsVerbatim, wordDiff } from "./document-segmentation";

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
  confidence: number,
  detail?: {
    before: string | null;
    after: string | null;
    quote: string;
    materiality: string;
    startPage: number | null;
  }
): Promise<boolean> {
  const sql = await getDbConnection();

  try {
    await sql`
      INSERT INTO document_change_events (
        document_id, from_version, to_version, change_type, summary, affected_chunks, confidence,
        before_text, after_text, quote, materiality, start_page
      )
      VALUES (
        ${documentId}, ${fromVersion}, ${toVersion}, ${changeType}, ${summary}, ${affectedChunks}, ${confidence},
        ${detail?.before ?? null}, ${detail?.after ?? null}, ${detail?.quote ?? null},
        ${detail?.materiality ?? null}, ${detail?.startPage ?? null}
      )
      ON CONFLICT (document_id, from_version, to_version, change_type, summary) DO NOTHING
    `;
    return true;
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err?.code === "23505") {
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

export type Materiality = "material" | "substantive" | "cosmetic";

export interface SemanticChangeDetail extends SemanticChange {
  before: string | null;
  after: string | null;
  quote: string;
  materiality: Materiality;
  startPage: number | null;
}

const MAX_PAIRS_ANALYSED = 40;

const VALID_CHANGE_TYPES: ChangeType[] = [
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

const VALID_MATERIALITY: Materiality[] = ["material", "substantive", "cosmetic"];
export async function computeSemanticChanges(
  documentId: string,
  fromVersion: DocumentVersion,
  toVersion: DocumentVersion
): Promise<SemanticChangeDetail[]> {
  try {
    if (fromVersion.chunker_version !== toVersion.chunker_version) {
      logger.info("Skipping change analysis across a chunker boundary", {
        documentId,
        from: fromVersion.chunker_version,
        to: toVersion.chunker_version,
      });
      return [];
    }

    const fromChunks = (await getChunksForVersion(fromVersion.id)).sort(
      (a, b) => a.chunk_index - b.chunk_index
    );
    const toChunks = (await getChunksForVersion(toVersion.id)).sort(
      (a, b) => a.chunk_index - b.chunk_index
    );
    if (!fromChunks.length || !toChunks.length) return [];

    const alignment = alignSegments(
      fromChunks.map((c, i) => ({ index: i, text: c.text, hash: c.chunk_hash })),
      toChunks.map((c, i) => ({ index: i, text: c.text, hash: c.chunk_hash }))
    );

    const changedOps = alignment.ops.filter((op) => op.type !== "equal");
    const pairs = changedOps.slice(0, MAX_PAIRS_ANALYSED);
    if (pairs.length === 0) return [];

    if (changedOps.length > pairs.length) {
      logger.warn("Change analysis truncated", {
        documentId,
        analysed: pairs.length,
        dropped: changedOps.length - pairs.length,
      });
    }

    const results = await Promise.all(
      pairs.map((op) => {
        const before = "fromIndex" in op ? (fromChunks[op.fromIndex]?.text ?? null) : null;
        const after = "toIndex" in op ? (toChunks[op.toIndex]?.text ?? null) : null;
        const chunkIndex = "toIndex" in op ? op.toIndex : null;
        const startPage = "toIndex" in op ? (toChunks[op.toIndex]?.start_page ?? null) : null;
        return analysePair({ documentId, before, after, chunkIndex, startPage });
      })
    );

    return results.filter((r): r is SemanticChangeDetail => r !== null);
  } catch (error) {
    logger.error("Error computing semantic changes", error, {
      documentId,
      fromVersion: fromVersion.version_number,
      toVersion: toVersion.version_number,
    });
    return [];
  }
}

async function analysePair(input: {
  documentId: string;
  before: string | null;
  after: string | null;
  chunkIndex: number | null;
  startPage: number | null;
}): Promise<SemanticChangeDetail | null> {
  const { documentId, before, after, chunkIndex, startPage } = input;
  if (!before && !after) return null;
  const diff = before && after ? wordDiff(before, after) : null;
  const changedWords = diff
    ? diff
        .filter((o) => o.type !== "equal")
        .map((o) => (o.type === "delete" ? "- " : "+ ") + o.text.trim())
        .join("\n")
        .slice(0, 1500)
    : null;

  const previousBlock = before
    ? "PREVIOUS:\n" + before.slice(0, 3000)
    : "PREVIOUS: (this passage is new)";
  const currentBlock = after
    ? "CURRENT:\n" + after.slice(0, 3000)
    : "CURRENT: (this passage was removed)";
  const diffBlock = changedWords
    ? "WORD-LEVEL DIFF (authoritative, do not contradict it):\n" + changedWords
    : "";

  const prompt = [
    "Two versions of one passage from a document. Say what changed and how much it matters.",
    previousBlock,
    currentBlock,
    diffBlock,
    "Return ONLY a JSON object:",
    "{",
    '  "change_type": one of ' + JSON.stringify(VALID_CHANGE_TYPES) + ",",
    '  "summary": one sentence on what changed and why it matters to someone signing this,',
    '  "quote": a SHORT VERBATIM span copied character-for-character from the passage above that shows the change. Copy it exactly. Do not paraphrase, correct or shorten words.,',
    '  "materiality": "material" if it changes an obligation, amount, date, liability or right; "substantive" if it changes meaning without changing those; "cosmetic" if it is formatting, numbering or wording with no change of meaning,',
    '  "confidence": a float 0.0-1.0',
    "}",
  ].join("\n\n");

  const response = await openrouterChatCompletion({
    model: "google/gemini-2.5-flash",
    messages: [
      {
        role: "system",
        content:
          "You analyse one passage change at a time. You always return a single valid JSON object, no markdown. The quote field must be copied verbatim from the passage; an invented quote makes the whole answer unusable.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
  });

  if (!response) return null;

  try {
    const match = response.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as {
      change_type?: string;
      summary?: string;
      quote?: string;
      materiality?: string;
      confidence?: number;
    };

    if (!parsed.summary || !parsed.quote) return null;
    if (!VALID_CHANGE_TYPES.includes(parsed.change_type as ChangeType)) return null;
    const source = (after ?? "") + "\n" + (before ?? "");
    if (!quoteIsVerbatim(parsed.quote, source)) {
      logger.warn("Dropped a change event whose quote was not verbatim", {
        documentId,
        chunkIndex,
        quote: parsed.quote.slice(0, 120),
      });
      return null;
    }

    const materiality = VALID_MATERIALITY.includes(parsed.materiality as Materiality)
      ? (parsed.materiality as Materiality)
      : "substantive";

    return {
      change_type: parsed.change_type as ChangeType,
      summary: parsed.summary,
      confidence: Math.max(0, Math.min(1, parsed.confidence ?? 0.5)),
      affected_chunks: chunkIndex === null ? [] : [chunkIndex],
      before,
      after,
      quote: parsed.quote,
      materiality,
      startPage,
    };
  } catch (parseError) {
    logger.error("Failed to parse a change event", parseError, { documentId, chunkIndex });
    return null;
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

  const changes = await computeSemanticChanges(toVersion.document_id, fromVersion, toVersion);

  for (const change of changes) {
    await createChangeEvent(
      toVersion.document_id,
      fromVersion.version_number,
      toVersion.version_number,
      change.change_type,
      change.summary,
      change.affected_chunks,
      change.confidence,
      {
        before: change.before,
        after: change.after,
        quote: change.quote,
        materiality: change.materiality,
        startPage: change.startPage,
      }
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
