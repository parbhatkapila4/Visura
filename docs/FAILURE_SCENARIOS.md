# Failure scenarios

This document describes what each failure leaves in the database and which code path keeps it from corrupting data. Claims cite the code they rely on. Where the code does not handle a case, the scenario says so.

## Scenario 1: Crash mid-chunk processing

**What fails:**

- The function summarizing a chunk crashes after the model call completes but before `updateChunkSummary()` writes
- OR: The function times out during the model call

**What data exists after the failure:**

- Chunk record exists with `summary IS NULL`
- Version record exists, and its placeholder row in `pdf_summaries` still has `status = 'processing'` (`actions/versioned-upload-actions.tsx:378-384`)
- No partial summary data in database: the summary is written by a single `UPDATE` (`lib/versioned-documents.ts:277-291`)

**Why data is not corrupted:**

- `updateChunkSummary()` writes only `WHERE summary IS NULL`, so a later write cannot overwrite a summary that already landed
- `processChunkInternal()` returns early for a chunk that already has a summary (`lib/chunk-processor.ts:39-46`)

**Invariants:**

- `UPDATE ... WHERE summary IS NULL` ensures only unprocessed chunks are updated

---

## Scenario 2: Some chunks fail during an upload

**What fails:**

- New chunks are summarized in batches of `CHUNK_BATCH_SIZE`, default 2, and the chunks in a batch run concurrently (`actions/versioned-upload-actions.tsx:449-525`)
- Some chunks complete, others fail
- OR: The function stops before its final `checkVersionCompletion()` call (`actions/versioned-upload-actions.tsx:536-537`)

**What data exists after the failure:**

- Some chunks have `summary IS NOT NULL` (completed)
- Some chunks have `summary IS NULL` (incomplete)
- The version's placeholder in `pdf_summaries` still has `status = 'processing'`
- All chunk records are valid (no partial writes)

**How it is handled:**

1. A failed chunk does not stop the others: each batch uses `Promise.allSettled` (`actions/versioned-upload-actions.tsx:462-491`)
2. `checkVersionCompletion()` builds the final summary only when each of the version's chunk records has a summary. A reused chunk counts as done when its source has one. Chunk records that were never inserted are not detected (Scenario 4) (`lib/versioned-documents.ts:346-382`, `lib/chunk-processor.ts:266-269`).
3. A version whose summary is already `completed` is skipped (`lib/chunk-processor.ts:247-253`)

**Why data is not corrupted:**

- Each chunk is processed independently
- Finalization moves the placeholder out of `processing` with `UPDATE ... WHERE status = 'processing'`, so only one worker writes the final summary (`lib/chunk-processor.ts:414-431`). The summary page's "Show document text" button (`POST /api/summaries/[id]/complete`) first tries that finalization itself. If chunks are still unsummarized, it writes an excerpt of the document text but leaves the status `processing`, and only while the status is still what it read, so the version is still merged when its chunks finish and the excerpt is replaced (`app/api/summaries/[id]/complete/route.ts`).
- When a version has no placeholder, `linkVersionToSummary()` links only `WHERE pdf_summary_id IS NULL`, and a worker that loses deletes the row it inserted (`lib/chunk-processor.ts:499-508`)

**Invariants:**

- Chunk processing is independent (no cross-chunk dependencies)
- Version completion check is idempotent
- Summaries already written stay; a failure does not delete them

---

## Scenario 3: The same chunk processed twice at once

**What fails:**

- Two workers call `processChunkInternal()` for the same chunk at the same time

**What data exists after the failure:**

- Both workers read the chunk with `summary IS NULL`
- Race condition on `updateChunkSummary()`

**What happens:**

1. Both workers may call the model
2. First worker: `UPDATE ... WHERE summary IS NULL` succeeds, returns `true`
3. Second worker: `UPDATE ... WHERE summary IS NULL` matches no row, returns `false`
4. Second worker returns `skipped: true` (no-op) (`lib/chunk-processor.ts:174-183`)

**Why data is not corrupted:**

- The conditional `UPDATE` lets exactly one write land
- `UNIQUE(document_version_id, chunk_index)` prevents duplicate chunks (`migrations/versioned_documents_migration.sql:29`)
- Only one worker finalizes the version (Scenario 2)

**Invariants:**

- `UPDATE ... WHERE summary IS NULL` is atomic
- No duplicate summaries created

---

## Scenario 4: Partial DB writes

**What fails:**

- The upload stops partway through inserting chunk records

**What data exists after the failure:**

- The version record exists with its `total_chunks`, and its placeholder summary is linked (`actions/versioned-upload-actions.tsx:339-384`)
- Only the chunk records inserted before the stop exist. Chunks are inserted one statement at a time after the version record, with no transaction (`actions/versioned-upload-actions.tsx:397-434`). `lib/db.ts` sends each query as its own HTTP request.

**Not handled:**

- Nothing recreates the missing chunk records. Uploading a file with the same name and the same extracted text returns the existing version, because the name maps to the same document, its content hash matches, and that version already has a linked summary (`actions/versioned-upload-actions.tsx:91-115`, `lib/versioned-documents.ts:113-127`).
- `isVersionComplete()` checks only the chunk records that exist (`lib/versioned-documents.ts:346-382`). If finalization runs on such a version, the summary is built from part of the text.

**What is guarded:**

- `UNIQUE(document_version_id, chunk_index)` prevents duplicate chunks
- `createDocumentChunk()` catches a duplicate key error (`23505`) and returns the existing chunk (`lib/versioned-documents.ts:262-274`)

---

## Scenario 5: AI provider failure

**What fails:**

- OpenRouter returns an error status
- Network failure during the model call

**How it is handled:**

1. `openrouterChatCompletion()` retries a failed call once on `openai/gpt-4o-mini` (`lib/openrouter.ts:48-108`)
2. If that fails too, `processChunkInternal()` logs the error and returns `success: false` (`lib/chunk-processor.ts:196-221`)

**What data exists after the failure:**

- Chunk record exists with `summary IS NULL`
- No partial summary data
- Error logged but not persisted to chunk

**Why data is not corrupted:**

- A failed chunk summary call writes nothing to the chunk
- The version is not finalized while this chunk has no summary (Scenario 2)

---

## Scenario 6: Reused chunk source missing

**What fails:**

- The summary copied onto a reused chunk never lands (the `UPDATE` after its insert fails)
- OR: The source chunk is deleted. Nothing in the app deletes chunk records, so this happens only if a row is removed by hand.

**How it is handled:**

1. Reuse is chosen only when the matching earlier chunk already has a summary (`actions/versioned-upload-actions.tsx:398-400`), and that summary is copied onto the new chunk right after insert (`actions/versioned-upload-actions.tsx:410-416`)
2. If the copy never landed, `isVersionComplete()` still counts the chunk as done while its source has a summary (`lib/versioned-documents.ts:356-367`), and finalization reads the source's summary instead (`lib/chunk-processor.ts:287-294`)
3. If the source chunk is deleted, the foreign key is `ON DELETE SET NULL` (`migrations/versioned_documents_migration.sql:24-25`), so `reused_from_chunk_id` becomes `NULL`. A chunk that also has no summary then counts as a new chunk that needs one.

**Why data is not corrupted:**

- Reused chunks require a source that already has a summary
- A reused chunk whose copy landed keeps its own summary if the source is deleted

---

## Scenario 7: Concurrent version creation

**What fails:**

- The same user uploads a changed version of the same document twice at once. Documents belong to one user, so two users never share one.

**What happens:**

- Both uploads read the same latest version and compute the same next `version_number` (`lib/versioned-documents.ts:159-160`)
- `UNIQUE(document_id, version_number)` (`migrations/versioned_documents_migration.sql:15`) rejects the second insert. That upload returns an error before creating a placeholder or any chunks (`actions/versioned-upload-actions.tsx:339-347`, `541-560`).

**Not handled:**

- If the document does not exist yet, both uploads can create it. `findOrCreateDocument()` checks and then inserts, and `documents` has no unique constraint on `(user_id, title)` (`lib/versioned-documents.ts:113-133`). The result is two documents with the same title, each with its own version 1.

---

## Summary: What keeps these failures from corrupting data

1. **Conditional updates**: Chunk summaries, placeholder finalization and version linking each write only while the row is unfinished (`WHERE summary IS NULL`, `WHERE status = 'processing'`, `WHERE pdf_summary_id IS NULL`)
2. **Database constraints**: `UNIQUE(document_version_id, chunk_index)` and `UNIQUE(document_id, version_number)`
3. **Isolation**: Each chunk is processed independently
4. **Completion gate**: A version is finalized only when each of its chunk records has a summary. Chunk records that were never inserted are not detected (Scenario 4).

Not guaranteed:

- The model is not deterministic. A second call for the same chunk text and language returns the cached summary while the 7-day summary cache holds it (`lib/openai.ts:453-457`); the in-memory fallback cache, used when Upstash is not configured, does not survive a crash (Scenario 1) (`lib/cache.ts:7-23`).
- Chunk records are not written in a transaction (Scenario 4).
- While a version is unfinished, the "Show document text" button puts an excerpt of the document where the summary will go; the merged summary replaces it only when the remaining chunks finish, which for a stuck version means the daily recovery run (Scenario 2).
