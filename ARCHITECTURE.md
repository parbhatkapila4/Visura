# Visura - System Architecture

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Next.js 15 App Router                                          │
│  ├── Pages (Server Components)                                  │
│  ├── API Routes (Node)                                           │
│  └── Client Components (React 19)                               │
│                                                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                       AUTHENTICATION                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Clerk Auth                                                      │
│  ├── JWT Verification                                            │
│  ├── User Management                                             │
│  ├── Users Row Created by Dashboard/Chat/Workspaces              │
│  └── Protected Routes (Middleware)                               │
│                                                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                       APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Document Processing Pipeline                                    │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                  │
│  │ Extract  │───▶│  Upload  │───▶│ Analyze  │                  │
│  │   Text   │    │   File   │    │  with AI │                  │
│  └──────────┘    └──────────┘    └──────────┘                  │
│                                                                  │
│  Chat System                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                  │
│  │ Session  │───▶│ Context  │───▶│   AI     │                  │
│  │ Manager  │    │ Retrieval│    │ Response │                  │
│  └──────────┘    └──────────┘    └──────────┘                  │
│                                                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                          DATA LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Neon PostgreSQL (Serverless)                                    │
│  ├── Documents & Versions                                        │
│  ├── Document Chunks (Hash-based reuse)                          │
│  ├── PDF Summaries & Stores                                      │
│  ├── Chat Sessions & Messages                                    │
│  ├── Workspaces, Members & Shares                                │
│  ├── Document Embeddings (Persistent storage)                    │
│  └── Cost Ledger (Per-Version Chunk Counts)                      │
│                                                                  │
│  Supabase Storage                                                │
│  └── Uploaded Files                                              │
│                                                                  │
│  Upstash Redis (Distributed Cache & Rate Limiting)              │
│  ├── Rate Limiting (Distributed)                                 │
│  ├── AI Response Caching                                          │
│  └── Classification Caching                                      │
│                                                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  AI/ML Services (all via OpenRouter)                             │
│  ├── GPT-4o mini (Summaries)                                     │
│  ├── GPT-4o mini (Chat, Sections, Insights, Graph, Fallback)     │
│  ├── Gemini 2.5 Flash (Change Descriptions)                      │
│  ├── Embeddings (text-embedding-3-small)                         │
│  └── LangChain (PDF Loader for Fallback Extraction)              │
│                                                                  │
│  Payment Processing                                              │
│  └── Razorpay (one-time, INR / USD / EUR)                        │
│                                                                  │
│  Logging & Alerting                                              │
│  ├── Pino (Structured Server Logs)                               │
│  └── Webhook Alerts (ALERT_WEBHOOK_URL)                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Document Upload & Processing Flow

**Every upload from the UI goes through one server action, `createVersionedDocumentJob()`.**

```
User                Client              Server              AI Service        Database
 │                    │                   │                     │               │
 │  1. Select File    │                   │                     │               │
 │───────────────────▶│                   │                     │               │
 │                    │                   │                     │               │
 │                    │  2. Extract Text  │                     │               │
 │                    │   (in browser)    │                     │               │
 │                    │                   │                     │               │
 │                    │  3. Upload File   │                     │               │
 │                    │   to Supabase     │                     │               │
 │                    │   Storage         │                     │               │
 │                    │                   │                     │               │
 │                    │  4. Server Action │                     │               │
 │                    │   createVersioned │                     │               │
 │                    │   DocumentJob()   │                     │               │
 │                    │──────────────────▶│                     │               │
 │                    │                   │  5. Find or Create  │               │
 │                    │                   │   Document          │               │
 │                    │                   │────────────────────────────────────▶│
 │                    │                   │  6. Chunk & Match   │               │
 │                    │                   │   Chunk Hashes      │               │
 │                    │                   │────────────────────────────────────▶│
 │                    │                   │  7. Check Guardrails│               │
 │                    │                   │────────────────────────────────────▶│
 │                    │                   │  8. Create Version, │               │
 │                    │                   │   Placeholder       │               │
 │                    │                   │   Summary & Chunks  │               │
 │                    │                   │────────────────────────────────────▶│
 │                    │                   │  9. Summarize New   │               │
 │                    │                   │   Chunks in Batches │               │
 │                    │                   │────────────────────▶│               │
 │                    │                   │ 10. Save Chunk      │               │
 │                    │                   │   Summaries         │               │
 │                    │                   │────────────────────────────────────▶│
 │                    │                   │ 11. Last Chunk Done:│               │
 │                    │                   │   Merge Summary,    │               │
 │                    │                   │   Save pdf_stores   │               │
 │                    │                   │────────────────────────────────────▶│
 │                    │ 12. Return Result │                     │               │
 │                    │◀──────────────────│                     │               │
 │                    │ 13. Poll Version  │                     │               │
 │                    │   Status          │                     │               │
 │                    │──────────────────▶│                     │               │
 │ 14. Link to        │                   │                     │               │
 │     Summary        │                   │                     │               │
 │◀───────────────────│                   │                     │               │
```

**Key Points:**

- **Single Upload Path**: All uploads use `createVersionedDocumentJob()` from `actions/versioned-upload-actions.tsx`
- **Processing Runs in the Server Action**: New chunks are summarized inside `createVersionedDocumentJob()`, `CHUNK_BATCH_SIZE` (default 2) at a time, before it returns. `/api/jobs/process-chunk` exists, but nothing calls it
- **Cost Guardrails**: Checked before the version is created, so a blocked upload leaves no version, chunks or placeholder summary. The `documents` row is found or created before the check
- **Automatic Completion**: A placeholder `pdf_summaries` row (status `processing`) is created with the version. When the last chunk has a summary, `checkVersionCompletion()` fills it in, marks it `completed` and creates the `pdf_stores` row
- **Legacy Paths**: `storePdfSummaryAction` and `generatePdfSummaryFromText` still exist, but nothing calls them

### Chat Message Flow

```
User                Client              Server              Database          AI
 │                    │                   │                     │              │
 │  1. Send Message   │                   │                     │              │
 │───────────────────▶│                   │                     │              │
 │                    │                   │                     │              │
 │                    │  2. POST /api     │                     │              │
 │                    │──────────────────▶│                     │              │
 │                    │                   │                     │              │
 │                    │                   │  3. Save User Msg   │              │
 │                    │                   │────────────────────▶│              │
 │                    │                   │                     │              │
 │                    │                   │  4. Get Context     │              │
 │                    │                   │◀────────────────────│              │
 │                    │                   │                     │              │
 │                    │                   │  5. Generate Response              │
 │                    │                   │───────────────────────────────────▶│
 │                    │                   │                     │              │
 │                    │                   │  6. Save AI Msg     │              │
 │                    │                   │────────────────────▶│              │
 │                    │                   │                     │              │
 │                    │  7. Return Both   │                     │              │
 │  8. Display Chat   │◀──────────────────│                     │              │
 │◀───────────────────│                   │                     │              │
```

---

## Database Schema

### Core Tables

```sql
-- Users (created by ensureUserExistsInDatabase() when the dashboard, chat or workspaces page loads; looked up by email)
users
├── id (PK)
├── email
├── full_name
├── price_id (nothing writes it)
├── status (inactive/active)
├── plan (free/starter/pro)
├── plan_granted_at
├── razorpay_order_id
└── razorpay_payment_id

-- PDF Summaries
pdf_summaries
├── id (PK)
├── user_id (Clerk user ID)
├── title
├── summary_text
├── file_name
├── original_file_url
├── status (processing/completed)
├── created_at
└── updated_at

-- PDF Stores (full text for chat)
pdf_stores
├── id (PK)
├── pdf_summary_id (FK → pdf_summaries)
├── user_id (Clerk user ID)
├── full_text_content
├── created_at
└── updated_at

-- Chat Sessions
pdf_qa_sessions
├── id (PK)
├── pdf_store_id (FK → pdf_stores)
├── user_id (Clerk user ID)
├── session_name
├── created_at
└── updated_at

-- Chat Messages
pdf_qa_messages
├── id (PK)
├── session_id (FK → pdf_qa_sessions)
├── message_type (user/assistant)
├── message_content
├── sources (JSONB)
└── created_at
```

---

## Cost-Aware Incremental Processing

Each document version records how many of its chunks were reused from an earlier version and how many had to be summarized.

### Why Chunk Reuse Exists

When documents are versioned (e.g., updated contracts, revised reports), most content remains unchanged. Reprocessing unchanged content wastes:

- **AI API costs** (tokens consumed)
- **Processing time** (user wait time)
- **Compute resources** (serverless function invocations)

### How Cost Tracking Works

1. **Deterministic Chunking**: Text is normalized (`normalizeForComparison()` in `lib/document-segmentation.ts`), split into sentences (a sentence over 1,200 characters is cut into 1,200-character pieces) and grouped into chunks. A chunk closes after a sentence whose FNV-1a hash opens a gate, or once its length count (characters plus 2 per sentence) reaches 1,200, so a boundary depends only on the text since the previous boundary. Each chunk's normalized text is hashed with SHA-256
2. **Hash-Based Matching**: Each chunk hash is looked up among the chunks of earlier versions of the same document with the same `CHUNKER_VERSION`; the newest match is reused if it has a summary
3. **Selective Processing**: Only chunks without a reusable match are summarized
4. **Cost Metrics**: Each version tracks:
   - `total_chunks`: Total chunks in version
   - `reused_chunks`: Chunks reused from an earlier version
   - `new_chunks`: `total_chunks - reused_chunks`, the chunks that need a new summary
   - `estimated_tokens_saved`: `reused_chunks × 1000 tokens` (`ESTIMATED_TOKENS_PER_CHUNK`). This is a fixed guess, not a measurement, and it does not depend on the chunk's length

### Invariants Enforced

- `reused_chunks ≤ total_chunks`
- `new_chunks + reused_chunks = total_chunks`
- `estimated_tokens_saved ≥ 0`

These invariants are enforced by the `check_cost_invariants` CHECK constraint (`migrations/cost_ledger_migration.sql`) and checked in `createDocumentVersion()`.

---

## Document Change Events

Each new version of a document is compared with the version before it, and the changes found are stored in `document_change_events`, when both versions were chunked with the same `CHUNKER_VERSION`.

### Why Change Events Exist

Traditional diff-based approaches show _what_ changed (text differences) but not _why_ it matters or _how_ the document's meaning evolved. Semantic change events capture:

- **What changed**: Content additions, removals, modifications
- **Why it matters**: Policy shifts, risk changes, scope modifications
- **How confident**: Confidence scores for each classification

### How Change Detection Works

1. **Trigger Point**: In `checkVersionCompletion()`, after the version's summary is marked `completed` and its `pdf_stores` row is created
2. **Comparison**: The chunk hashes of this version and the previous one are aligned (`alignSegments()` in `lib/document-segmentation.ts`); no model decides what changed. Only the first 40 changed passages are analysed
3. **Classification**: For each changed passage, `google/gemini-2.5-flash` (via OpenRouter) gets its raw text, cut to 3,000 characters per side (both sides and a word-level diff when the passage was rewritten, one side when it was added or removed), and returns a type, a one-sentence summary, a quote, a materiality and a confidence. The event is dropped unless the quote appears in the passage (ignoring case and spacing)
4. **Storage**: Creates `document_change_events` records with:
   - `from_version` / `to_version`: Version pair
   - `change_type`: Semantic classification (added, removed, modified, policy_shift, risk_added, etc.)
   - `summary`: Human-readable explanation
   - `confidence`: 0.0-1.0 confidence score
   - `affected_chunks`: Index of the changed chunk in the new version (empty for a removal)

### Change Types

The system classifies changes into 10 semantic types:

- **Content Changes**: `added`, `removed`, `modified`
- **Policy Changes**: `policy_shift`, `scope_change`
- **Risk Changes**: `risk_added`, `risk_removed`
- **Assumption Changes**: `assumption_added`, `assumption_removed`
- **Clarifications**: `clarification`

### Why Diffs Are Insufficient

- **Text diffs** show character/word changes but not semantic meaning
- **Chunk diffs** show which chunks changed but not why
- **Semantic events** say why a change matters and quote the passage that shows it

### Idempotency Guarantees

- Change detection runs in the worker that wins finalization, because the placeholder summary moves out of `processing` only once. A version is finalized again if its summary is deleted and the same file is uploaded again
- `UNIQUE(document_id, from_version, to_version, change_type, summary)` stops the same event being stored twice
- Non-fatal: failures don't block version completion

### API Access

- `GET /api/documents/[id]/timeline` - Returns chronological change events
- Auth: The document must belong to the signed-in user
- Returns: Array of change events with version numbers, types, summaries, confidence

### When Change Detection Runs

- **After**: Version completion (summary + pdf_stores row created)
- **Before**: The `version_completed` processing event is logged
- **Failures**: Awaited inside `checkVersionCompletion()`, but errors are caught and logged, so they don't undo completion

### What Is NOT Guaranteed

- Change detection may fail silently (non-fatal, logged)
- LLM classification may vary between runs
- Confidence scores are estimates, not ground truth
- Change events are not created for first version (no previous version to compare)

---

## Operational Guarantees

This section explicitly states what the system guarantees and what it does not.

### Crash Guarantees

**What Is Guaranteed:**

- Chunk summaries already written stay in the database after a crash
- A chunk either has a summary or it doesn't; each summary is written in a single `UPDATE`

**How It Works:**

- Each chunk is processed independently (no cross-chunk dependencies)
- Updates are atomic: `UPDATE ... WHERE summary IS NULL` only updates if condition met
- Finalization is idempotent: `checkVersionCompletion()` fills in the placeholder summary only while its status is `processing`. `POST /api/summaries/[id]/complete` (the summary page's "Show document text" button) runs that finalization first; if chunks are still unsummarized it writes an excerpt of the chunk text but leaves the status `processing`, so the version is still merged from its chunks when they finish

**What Is NOT Guaranteed:**

- Crash during initial version creation may leave version in inconsistent state (version creation is several statements, not one transaction)
- Crash during chunk creation may require manual cleanup (UNIQUE constraint prevents duplicates)
- Crash does not preserve in-flight AI responses (must be regenerated)

### Idempotency Guarantees

**What Is Guaranteed:**

- Chunk processing is safe to retry: a chunk that already has a summary is skipped
- Uploading text identical to the latest version's returns that version instead of creating a new one (`full_content_hash`)
- Summary updates are idempotent: only update if `summary IS NULL`
- Final summary creation in `checkVersionCompletion()` is idempotent: the placeholder moves from `processing` to `completed` in one conditional `UPDATE`, and a newly inserted summary is kept only if `linkVersionToSummary()` finds `pdf_summary_id IS NULL`

**How It Works:**

- Writes that can race use WHERE clauses that check current state
- Early returns prevent duplicate processing
- UNIQUE constraints prevent duplicate records
- Chunking and hashing are deterministic: the same text always gives the same chunks and hashes

**What Is NOT Guaranteed:**

- AI provider responses may vary between runs
- Concurrent processing may result in duplicate AI calls (but only one summary is stored)

### Cost Guarantees

**What Is Guaranteed:**

- When a chunk's hash matches a chunk from an earlier version of the same document that was chunked with the same `CHUNKER_VERSION`, and the newest such match has a summary, the chunk is not summarized again
- Cost metrics are tracked per version (`total_chunks`, `reused_chunks`, `new_chunks`, `estimated_tokens_saved`)

**How It Works:**

- Chunk reuse: hash-based matching identifies chunks whose normalized text is unchanged
- Cost tracking: computed during version creation, immutable per version

**What Is NOT Guaranteed:**

- Cost is not token-accurate (uses estimates: `ESTIMATED_TOKENS_PER_CHUNK = 1000`)
- Cost does not account for AI provider rate limits or pricing changes
- Cost does not include infrastructure costs (database, serverless functions)

### Cost Guardrails

**What Is Guaranteed:**

- Cost limits are checked **before** the version is created, so a blocked upload writes no version, chunks or placeholder summary
- Exceeding a limit blocks version creation and sends a CRITICAL alert (when `ALERT_WEBHOOK_URL` is set)
- Daily usage is counted per user from versions created on the current database day (`DATE_TRUNC('day', NOW())`)
- A per-version new-chunk limit can be switched on for oversized documents

**How It Works:**

- **Daily Token Limit**: `MAX_TOKENS_PER_USER_PER_DAY` (default: 2,000,000 estimated tokens)
  - Calculated as: `SUM(new_chunks × 550)` for all versions created today, plus an estimate for the upload being checked ((average characters per chunk × new chunks) / 4, plus 300 per new chunk)
  - Checked before creating any new version
  - Blocks version creation if limit would be exceeded
- **Per-Version Chunk Limit**: `MAX_NEW_CHUNKS_PER_VERSION` (default: 0, off)
  - Blocks version creation if new chunks exceed limit
- **Daily Cost Limit**: `MAX_ESTIMATED_COST_PER_USER_PER_DAY` (default: 0, off)
  - Converts the same token estimates to dollars at `ESTIMATED_COST_PER_1M_TOKENS` and blocks version creation above the limit
- **Enforcement Point**: Guardrails checked in `createVersionedDocumentJob()` **before** `createDocumentVersion()`
  - Ensures no partial versions are created when limits are exceeded
  - Returns clear error message to caller
- **Alerting**: CRITICAL alerts sent via `sendAlert()` when limits exceeded
  - Includes: `userId`, `documentId`, `limitType`, and the usage and limit that were compared
  - Alert type: `cost_limit_exceeded`

**What Happens When Limits Are Hit:**

1. Version creation is **blocked**. The `documents` row is found or created before the check, but no version, chunk or summary row is written
2. CRITICAL alert sent to `ALERT_WEBHOOK_URL`, if it is set
3. Error returned to caller with clear message and usage details
4. No partial jobs or chunks are created
5. User must wait until next day (for daily limits) or reduce document size (for per-version limit)

**Configuration:**

- `MAX_TOKENS_PER_USER_PER_DAY`: Maximum estimated tokens per user per day (default: 2,000,000)
- `MAX_NEW_CHUNKS_PER_VERSION`: Maximum new chunks per document version (default: 0, off)
- `MAX_ESTIMATED_COST_PER_USER_PER_DAY`: Maximum estimated dollars per user per day (default: 0, off)

**What Is NOT Guaranteed:**

- Limits do not account for actual token usage (uses estimates: 550 tokens per new chunk for versions already created today)
- The check is not atomic: usage is read and then compared with no lock, so two uploads from the same user at the same time can both pass
- Limits are set by environment variables and can be changed without a code change

### What the System Intentionally Does NOT Guarantee

1. **Real-Time Processing**: Chunks in a batch may finish out of order
2. **Exact Token Counting**: Uses estimates, not actual token counts
3. **Billing Integration**: Cost tracking is for observability, not billing
4. **Cross-Version Consistency**: New chunks in each version are summarized independently of earlier summaries
5. **AI Response Determinism**: AI responses may vary between runs
6. **Zero Downtime**: System may require maintenance or schema migrations
7. **Infinite Scale**: Practical limits exist (documented in `/docs/SCALE_AND_COST.md`)

### Operational Safety

**Safe Operations:**

- Retry failed chunks (idempotent, no duplicates)
- Query incomplete work (read-only, no side effects)
- Monitor cost metrics (read-only, no side effects)

**Unsafe Operations:**

- Manually modifying chunk summaries (later versions that reuse the chunk copy the edited summary)
- Deleting chunks (later chunks that reused them lose their `reused_from_chunk_id` link)
- Modifying version numbers (breaks versioning logic)
- Bypassing idempotency checks (risks duplicate processing)

---

## Logging

**Structured Logging**

- Pino-based structured logging (server-side)
- Client-side logger for browser components
- Request IDs on the cron, health, readiness and job routes
- Pino removes fields named token, password, secret, apiKey and webhookUrl; email addresses, file URLs and document text are not redacted

See [OBSERVABILITY_SETUP.md](OBSERVABILITY_SETUP.md) for what runs and how to set it up.

---

## Alerting

The system includes webhook-based alerting for production incidents. Alerts are POSTed as JSON to `ALERT_WEBHOOK_URL`.

### Alert Transport

- **Webhook URL**: Configured via `ALERT_WEBHOOK_URL` environment variable
- **Payload Format**: JSON with `alert_type`, `severity`, `message`, `timestamp`, `context`
- **Deduplication**: Same alert type + entity ID suppressed for 10 minutes
- **Failure Handling**: A failed webhook call is logged as a warning and never throws

### Alerts from the upload pipeline and health checks

**CRITICAL Alerts:**

1. **System Not Ready** (`system_not_ready`)
   - Sent when a request to `/api/ready` finds one of these conditions (it then returns 503)
   - Conditions:
     - Stuck versions > 10 (summary still `processing` after 10 minutes)
     - Orphaned reused chunks detected
   - Context: the stuck-version count and threshold, or the number of versions with orphaned reused chunks

2. **Health Check Failed** (`health_check_failed`)
   - Sent when a request to `/api/health` returns 503
   - Conditions:
     - Database unreachable
     - Missing required tables (`document_versions`, `document_chunks`, `summary_jobs`)
   - Context: `check` (database/schema), plus `errorMessage` or `missingTables`

3. **Cost Limit Exceeded** (`cost_limit_exceeded`)
   - Sent when a cost guardrail blocks an upload (see Cost Guardrails)

`/api/jobs/process` and `/api/cron/retry-jobs` can also send `job_processing_failed` and `job_retry_exhausted`, but they act only on `summary_jobs` rows, and no upload creates one.

`/api/cron/recover-versions` runs once a day at 04:00 UTC (`vercel.json`; Vercel's Hobby plan refuses to deploy a cron that runs more often) and re-runs the unsummarized chunks of up to 50 versions whose summary is still `processing` 10 minutes after the version was created. If that throws for a version, it sends `version_recovery_failed` (critical). `POST /api/documents/[id]/versions/[versionId]/replay` re-runs the unsummarized chunks of one version of a document the signed-in user owns, with no age check, and sends `replay_failed` (warning) if the request throws; no page calls it. Both alerts carry `versionId`, `documentId` and `errorMessage`. A chunk that fails during either run sends `chunk_processing_failed` and does not throw.

**WARNING Alerts:**

1. **Chunk Processing Failed** (`chunk_processing_failed`)
   - Sent by `processChunkInternal()` when summarizing a chunk fails
   - Context: `chunkId`, `versionId`, `language`, `errorMessage`, `errorStack`

### What DOES NOT Trigger Alerts

- A rate limit or error from the requested model when the `openai/gpt-4o-mini` fallback succeeds (`lib/openrouter.ts`)
- User-initiated errors (validation failures, auth failures)
- Expected failures (e.g., document too short, unsupported format)

### What an Operator Is Expected to Do When Alerted

**CRITICAL: System Not Ready**

1. Check `/api/ready` endpoint for details
2. Query stuck versions: `SELECT * FROM document_versions WHERE ...` (see docs/OPERATOR_QUERIES.sql)
3. Investigate root cause (database issues, AI provider down, etc.)

**CRITICAL: Health Check Failed**

1. Immediate investigation required
2. Check database connectivity
3. Verify schema migrations applied
4. Check Vercel deployment status

### Alert Deduplication

- Same alert type + same entity ID suppressed for 10 minutes
- Prevents alert spam during ongoing incidents
- Deduplication key: `${alert_type}:${entityId}`
- Entity ID: `jobId`, `versionId`, `documentId`, or `userId`

### Alert Reliability

- Alerts never throw (wrapped in `.catch(() => {})`)
- Alerts fail silently if `ALERT_WEBHOOK_URL` not configured
- Webhook failures are logged but don't affect application flow
- In-memory deduplication (resets on deployment - acceptable for serverless)

---

## Request/Response Flow

### 1. User Uploads Document (Versioned Pipeline)

```typescript
Client:
1. User selects file → Browser validates file
2. Extract text client-side (pdf.js, mammoth, etc.)
3. Upload file to Supabase Storage → Get public URL
4. Call createVersionedDocumentJob(text, fileName, fileUrl, "ENGLISH", pageStartOffsets, confidence)
5. Poll /api/versions/[versionId]/status until the summary is ready, then link to /summaries/[pdfSummaryId]

Server (createVersionedDocumentJob):
1. Find or create Document record (same user, title from the file name)
2. Check if document unchanged (hash match with the latest version) → return existing version
3. Normalize and chunk the text deterministically
4. Calculate chunk reuse vs new chunks
5. Check cost guardrails (daily token limit, optional per-version and daily cost limits)
6. Create DocumentVersion with file_url
7. Create placeholder pdf_summaries record (status 'processing') and link it to the version
8. Create DocumentChunk records (reused chunks copy their summary)
9. Summarize new chunks with processChunkInternal(), CHUNK_BATCH_SIZE at a time
10. Run checkVersionCompletion(), then return versionId, documentId and chunk counts

Completion (checkVersionCompletion, run after each chunk finishes):
1. Stop unless every chunk has a summary
2. Merge chunk summaries into final summary (deduplicateAndMergeSections)
3. Fill in the placeholder pdf_summaries record and mark it 'completed'
4. Create pdf_stores record (for chat)
5. Record change events against the previous version
6. Start sections, insights, graph and chunk embeddings without waiting for them

Result:
- The upload page shows four steps: "Extracting text" and "Uploading" as they happen, "Summarizing new chunks" while the server action runs, and "Finalizing" while it polls /api/versions/[versionId]/status, with the count of chunks that have a summary
- It does not track the sections, insights, graph or embeddings work. After the server action returns, it steps through four hidden, timed placeholders for them that report nothing from the server
- Chat works automatically when processing completes
```

### 2. User Chats with Document

```typescript
Client:
1. Load chat sessions for document
2. Select or create session
3. Send message via POST /api/chatbot/messages
4. Display the reply (the API streams when sent `stream: true`; the chat UI does not send it)

Server:
1. Verify auth & rate limit
2. Validate input (Zod)
3. Check the session belongs to the user, then save user message
4. Build context: the full text, or for text over 5,000 characters the 5 chunks closest to the question by embedding similarity
5. Generate AI response with conversation history
6. Save assistant message
7. Return both messages
```

---

## Security Architecture

### Multi-Layer Security

**Authentication Flow:**

```
User → Clerk → JWT Token → Middleware → Protected Route
                              │
                              ├─ Verify JWT
                              └─ Attach userId to request
```

**API Protection Layers:**

```
Request → Auth Check → Rate Limit → Validation → Business Logic → Response
           (Clerk)      (Upstash)    (Zod)        (TypeScript)
```

This is the order in `/api/chatbot/messages`, the only rate-limited route. Zod validation is used by the chatbot routes.

**Security Features:**

- **JWT Authentication**: Clerk-managed sessions
- **Distributed Rate Limiting**: Upstash Redis sliding window (in-memory fallback without Redis), applied to `/api/chatbot/messages`
- **Internal request auth**: `/api/jobs/process` and `/api/jobs/process-chunk` require an HMAC-signed request (`lib/internal-api-auth.ts`). The cron routes accept that or `Authorization: Bearer $CRON_SECRET`, which is what Vercel Cron sends
- **Parameterized Queries**: All database queries use parameters
- **Security Headers**: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy (`next.config.ts`); no CSP

---

## Performance Optimizations

### 1. Client-Side PDF Processing

- **Why**: The file goes from the browser straight to Supabase Storage, and the server action receives the extracted text. If browser extraction fails or finds fewer than 50 characters, a server action fetches the file from storage and extracts it there
- **How**: Process in browser with pdf.js before upload

### 2. Streaming Responses (API only)

- **Why**: Lets a client render the reply as it arrives
- **How**: OpenRouter streaming API (`lib/openrouter-stream.ts`), used when a chat request sets `stream: true`. The chat UI does not set it

### 3. Database Access

- **Why**: Serverless functions create new connections
- **How**: Neon serverless driver's HTTP client (`neon()` in `lib/db.ts`), so no connection pool is held

### 4. Image Optimization

- **Why**: Faster page loads, better Core Web Vitals
- **How**: Next.js Image component + AVIF/WebP

---

## Deployment Architecture

### Production Stack

```
Users
  │
  ▼
Vercel Edge Network (CDN)
  │
  ├─▶ Static Pages (cached)
  ├─▶ API Routes (serverless)
  └─▶ Dynamic Pages (SSR)
       │
       ├─▶ Neon (Database)
       ├─▶ Supabase Storage (File Storage)
       ├─▶ Clerk (Auth)
       ├─▶ Razorpay (Payments)
       └─▶ OpenRouter (AI)
```

### Scaling Considerations

- **Horizontal**: Vercel auto-scales serverless functions
- **Database**: Neon, queried over HTTP by the serverless driver
- **File Storage**: Supabase Storage serves files by public URL
- **Rate Limiting**: Redis for distributed rate limiting
- **Caching**: Redis caches summaries, classifications and embeddings (`lib/cache.ts`)

---

## State Management

### Client State

- **React useState**: Component-level state
- **React useRef**: Non-re-rendering state (the chat's double-send guard)
- **URL State**: The `view` search param opens the dashboard's analytics tab

### Server State

- **Database**: Source of truth
- **No global state library**: Keeps bundle small

### Caching Strategy

- **Next.js**: Static pages cached at edge
- **Redis (Upstash)**: AI responses, classifications, embeddings
- **Database**: Persistent embeddings storage

---

## Error Handling Strategy

### Layered Error Handling

```
1. Input Validation (Zod, chatbot routes)
   ├─ Catch malformed requests early
   └─ Return 400 with detailed errors

2. Business Logic (try/catch)
   ├─ Handle expected failures gracefully
   └─ Return user-friendly error messages

3. Error Boundaries (React)
   ├─ Catch unexpected client errors
   └─ Show fallback UI with recovery options
```

---

## External Service Dependencies

### Critical (App won't work without these)

- Neon (Database)
- Clerk (Authentication)
- OpenRouter (AI processing)
- Supabase Storage (File storage)

### Important (Major features disabled)

- Razorpay (Payment processing)

### Optional (Nice-to-have)

- Upstash Redis (Rate limiting & caching)

### Fallback Strategy

`openrouterChatCompletion()` in `lib/openrouter.ts` retries a failed or empty model call once with `openai/gpt-4o-mini`.

---

## Build & Deploy Process

### Development

```bash
npm run dev        # Start dev server (localhost:3000)
npm run test       # Run tests in watch mode
npm run lint       # Check for code issues
```

### Pre-deployment Checks

```bash
npm run test:run       # All tests must pass
npm run type-check     # TypeScript compilation
npm run format:check   # Code formatting
npm run build          # Production build
```

### Deployment (Vercel)

```bash
vercel deploy --prod   # Vercel CLI, installed separately

# Environment variables are set in the Vercel dashboard
```

### Post-deployment Verification

1. Test critical flows (upload, chat, payment)
2. Check the Vercel function logs for errors

---

## Completed improvements

1. Distributed rate limiting with Redis
2. Streaming chat responses in the API (the chat UI does not use them)
3. Vector search with persistent embeddings
4. Cost guardrails

---

## Technology Decisions

### Why Next.js 15?

- **App Router**: Better DX, faster page transitions
- **Server Components**: Reduced client bundle, better SEO
- **API Routes**: Co-located backend logic

### Why Supabase Storage?

- **Storage**: Built-in file storage

### Why Clerk?

- **Features**: Prebuilt sign-in and sign-up components and user management

### Why OpenRouter vs Direct OpenAI?

- **Flexibility**: Access to multiple models
- **Fallback**: Can switch models if one is down
- **Future**: Easy to try new models

---

## Implemented Features

1. **Versioned Document Processing**
   - Content-defined chunking with hash-based reuse

2. **Distributed Rate Limiting**
   - Upstash Redis-backed rate limiting
   - In-memory fallback when Upstash is not configured
   - Applied to `/api/chatbot/messages`

3. **Structured Logging**
   - Pino structured logging on the server

4. **Vector Search**
   - Persistent embeddings storage
   - Batch lookup of stored embeddings

5. **Cost Guardrails**
   - Daily token limits per user
   - Optional per-version chunk and daily cost limits (off by default)
   - Checked before the version is created, so a blocked upload writes no version, chunk or placeholder summary
   - CRITICAL alerts on limit exceeded

6. **Security Hardening**
   - HMAC-based internal API signing
   - Parameterized queries (SQL injection prevention)

7. **Performance Optimization**
   - Embeddings caching (database)
   - AI response caching (Redis)
   - Client-side text extraction

---

## Related Documentation

- **[QUICK_START.md](QUICK_START.md)**: Get up and running
- **[OBSERVABILITY_SETUP.md](OBSERVABILITY_SETUP.md)**: What logging and alerting run, and how to set them up
- **[docs/SCALE_AND_COST.md](docs/SCALE_AND_COST.md)**: Processing limits, cost constants and guardrail defaults, with where each lives in the code
- **[docs/OPERATOR_QUERIES.sql](docs/OPERATOR_QUERIES.sql)**: SQL queries for operators
- **[CONTRIBUTING.md](CONTRIBUTING.md)**: Contribution guidelines
- **[README.md](README.md)**: Project overview and features
