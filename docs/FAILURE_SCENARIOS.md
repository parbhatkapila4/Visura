# Failure Scenarios & Recovery Proof

This document describes real failure cases that the system handles, based on actual code paths.

## Scenario 1: Worker Crash Mid-Chunk Processing

**What Fails:**
- Serverless function processing a chunk crashes after AI call completes but before `updateChunkSummary()` commits
- OR: Function times out during AI generation

**What Data Exists After Failure:**
- Chunk record exists with `summary IS NULL`
- `reused_from_chunk_id` may be set (if reused chunk)
- Version record exists
- No partial summary data in database

**What Happens on Replay:**
1. `getIncompleteChunks(versionId)` finds the chunk (because `summary IS NULL AND reused_from_chunk_id IS NULL`)
2. Replay triggers `/api/jobs/process-chunk` for this chunk
3. `updateChunkSummary()` executes: `UPDATE ... WHERE summary IS NULL AND reused_from_chunk_id IS NULL`
4. If AI already completed but update failed: AI call runs again (idempotent - same input, same output)
5. If AI was interrupted: AI call runs fresh
6. Summary is persisted atomically

**Why Data Is NOT Corrupted:**
- Atomic WHERE clause prevents overwriting existing summaries
- Chunk processing is idempotent (same input → same output)
- No partial state exists in database

**Invariants That Guarantee Correctness:**
- `UPDATE ... WHERE summary IS NULL` ensures only unprocessed chunks are updated
- Chunk processing is deterministic (same text → same summary)

---

## Scenario 2: Worker Crash Mid-Version Processing

**What Fails:**
- Multiple chunks are being processed concurrently
- Some chunks complete, others fail mid-processing
- Function crashes before `checkVersionCompletion()` runs

**What Data Exists After Failure:**
- Some chunks have `summary IS NOT NULL` (completed)
- Some chunks have `summary IS NULL` (incomplete)
- Version record exists with `pdf_summary_id IS NULL` (not yet complete)
- All chunk records are valid (no partial writes)

**What Happens on Replay:**
1. `getIncompleteChunks(versionId)` finds only chunks where `summary IS NULL AND reused_from_chunk_id IS NULL`
2. Completed chunks are skipped (early return in process-chunk route)
3. Only incomplete chunks are processed
4. When last chunk completes, `checkVersionCompletion()` runs
5. Final summary is created only if `pdf_summary_id IS NULL`

**Why Data Is NOT Corrupted:**
- Each chunk is processed independently
- Completed chunks are never reprocessed (idempotency check)
- Final summary creation is idempotent (`WHERE pdf_summary_id IS NULL`)

**Invariants That Guarantee Correctness:**
- Chunk processing is independent (no cross-chunk dependencies)
- Version completion check is idempotent
- Partial progress is preserved

---

## Scenario 3: Duplicate Replay Calls

**What Fails:**
- Operator accidentally triggers replay twice simultaneously
- OR: Retry cron job runs while manual replay is in progress

**What Data Exists After Failure:**
- Multiple workers processing same chunks concurrently
- Race condition on `updateChunkSummary()`

**What Happens on Replay:**
1. Both workers call `updateChunkSummary()` for same chunk
2. First worker: `UPDATE ... WHERE summary IS NULL` succeeds, returns `true`
3. Second worker: `UPDATE ... WHERE summary IS NULL` finds `summary IS NOT NULL`, returns `false`
4. Second worker returns `skipped: true` (no-op)
5. Both workers may call AI, but only first update succeeds

**Why Data Is NOT Corrupted:**
- Atomic WHERE clause ensures only one update succeeds
- Database-level constraint prevents duplicate chunks
- Idempotency checks prevent duplicate processing

**Invariants That Guarantee Correctness:**
- `UPDATE ... WHERE summary IS NULL` is atomic
- Multiple concurrent updates converge to same state
- No duplicate summaries created

---

## Scenario 4: Partial DB Writes

**What Fails:**
- Database connection drops after `INSERT INTO document_chunks` but before commit
- OR: Transaction rollback occurs mid-version creation

**What Data Exists After Failure:**
- Version record may or may not exist (transaction atomicity)
- Chunk records may be partially created
- UNIQUE constraint violations if retry attempts duplicate inserts

**What Happens on Replay:**
1. If version doesn't exist: Version creation must be retried (not handled by replay - this is initial creation failure)
2. If version exists but chunks missing: `createDocumentChunk()` handles duplicate key errors gracefully
3. Duplicate chunk insert returns existing chunk (idempotent)
4. Replay processes only incomplete chunks

**Why Data Is NOT Corrupted:**
- UNIQUE constraint on `(document_version_id, chunk_index)` prevents duplicates
- `createDocumentChunk()` catches duplicate key errors and returns existing chunk
- Transaction boundaries ensure atomicity at version level

**Invariants That Guarantee Correctness:**
- Database UNIQUE constraints prevent duplicate chunks
- Error handling in `createDocumentChunk()` makes inserts idempotent
- Version creation is atomic (all or nothing)

---

## Scenario 5: Retry Exhaustion

**What Fails:**
- Chunk processing fails repeatedly (AI provider down, network issues)
- Retry count reaches `max_retries` (3 by default)
- Job marked as `failed` in job queue system

**What Data Exists After Failure:**
- Chunk record exists with `summary IS NULL`
- `reused_from_chunk_id IS NULL` (new chunk, not reused)
- Version record exists but incomplete
- No job record (if using separate job queue)

**What Happens on Replay:**
1. `getIncompleteChunks(versionId)` finds the failed chunk
2. Replay triggers processing (bypasses job queue retry limits)
3. If issue is resolved: Chunk processes successfully
4. If issue persists: Chunk remains incomplete, can be retried later
5. No retry count limit on manual replay

**Why Data Is NOT Corrupted:**
- Failed chunks remain in valid state (`summary IS NULL`)
- Replay is independent of job queue retry logic
- Manual intervention possible for persistent failures

**Invariants That Guarantee Correctness:**
- Chunk state is preserved even after retry exhaustion
- Replay is always possible (no permanent failure state)
- Manual recovery path exists

---

## Scenario 6: AI Provider Failure

**What Fails:**
- OpenRouter API returns 500/503/429
- Network timeout during AI call
- AI provider rate limits exceeded

**What Data Exists After Failure:**
- Chunk record exists with `summary IS NULL`
- No partial summary data
- Error logged but not persisted to chunk

**What Happens on Replay:**
1. Replay triggers chunk processing
2. AI call is retried (idempotent - same input)
3. If provider recovered: Summary generated successfully
4. If provider still down: Chunk remains incomplete, can retry later
5. No data corruption (chunk state unchanged)

**Why Data Is NOT Corrupted:**
- AI failures don't modify database state
- Chunk remains in processable state (`summary IS NULL`)
- Retry is safe (deterministic input → deterministic output)

**Invariants That Guarantee Correctness:**
- AI failures are external (don't corrupt internal state)
- Chunk processing is retryable indefinitely
- No partial AI responses stored

---

## Scenario 7: Reused Chunk Source Missing

**What Fails:**
- Chunk has `reused_from_chunk_id` pointing to chunk that was deleted
- OR: Source chunk exists but `summary IS NULL` (source never completed)

**What Data Exists After Failure:**
- Chunk record with `reused_from_chunk_id IS NOT NULL`
- Source chunk missing or incomplete
- Chunk has `summary IS NULL`

**What Happens on Replay:**
1. Process-chunk route checks: `if (chunk.reused_from_chunk_id)`
2. Queries source chunk: `SELECT summary FROM document_chunks WHERE id = ${reused_from_chunk_id}`
3. If source missing or `summary IS NULL`: Returns error `"Reused chunk missing source summary"`
4. Chunk remains incomplete until source is processed
5. Manual intervention may be needed

**Why Data Is NOT Corrupted:**
- Foreign key constraint ensures referential integrity
- Error is returned (no silent failure)
- Chunk state is preserved (can be fixed manually)

**Invariants That Guarantee Correctness:**
- Foreign key constraints prevent orphaned references
- Reused chunks require valid source
- Errors are explicit (no silent corruption)

---

## Scenario 8: Concurrent Version Creation

**What Fails:**
- Two users upload same document simultaneously
- Both create versions with same `full_content_hash`
- Race condition on version number assignment

**What Data Exists After Failure:**
- Two version records with same `full_content_hash`
- Different `version_number` values
- Potential duplicate processing

**What Happens on Replay:**
- Each version is processed independently
- Chunk reuse works within each version's context
- No cross-version contamination

**Why Data Is NOT Corrupted:**
- UNIQUE constraint on `(document_id, version_number)` prevents duplicate versions
- Each version is isolated (chunks scoped to version)
- Version numbers are deterministic (auto-increment)

**Invariants That Guarantee Correctness:**
- Version isolation (chunks belong to specific version)
- Version numbers are unique per document
- No cross-version data leakage

---

## Summary: Why These Scenarios Don't Corrupt Data

1. **Atomic Updates**: All updates use `WHERE` clauses that check current state
2. **Idempotency**: All operations are safe to retry (same input → same output)
3. **Database Constraints**: UNIQUE and FOREIGN KEY constraints prevent invalid states
4. **Isolation**: Each chunk/version is processed independently
5. **Deterministic**: Same inputs always produce same outputs
6. **No Partial State**: Either operation completes or doesn't (no half-states)
7. **Replay Safety**: Replay only processes incomplete work (never overwrites)

The system converges to the same final state regardless of failure point or retry pattern.
