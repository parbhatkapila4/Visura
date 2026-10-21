# Scale and cost

This document lists the limits that bound processing cost in Visura and where each one lives in the code. None of the numbers below is a measurement. Each one is a constant or a default read from the source.

## Constants

- `ESTIMATED_TOKENS_PER_CHUNK = 1000` (defined in `lib/versioned-documents.ts:73`). It fills `estimated_tokens_saved` (`lib/versioned-documents.ts:163`) and the token estimates in `lib/processing-metrics.ts:27-28`. It is a flat multiplier and does not depend on chunk length.
- Chunk size: a chunk closes after a sentence whose 32-bit FNV-1a hash opens the boundary gate (`BOUNDARY_GATE = 5`), or once its length count reaches `MAX_CHUNK_CHARS = 1200` (`lib/document-segmentation.ts:42-44`, `51-58`, `290-311`). The FNV-1a hash only places boundaries and is not stored; the stored chunk hash is SHA-256.
- New chunks in one upload are summarized `CHUNK_BATCH_SIZE` at a time, default 2 (`actions/versioned-upload-actions.tsx:449`)

## Document size limits

**Per file:**

- Max: 32 MB (`components/upload/supabase-upload-form.tsx:28`)
- PDF: the browser extractor reads the first 50 pages (`lib/document-extractor.ts:178`)
- Extracted text: the upload form sends the text to `createVersionedDocumentJob()` as a server action argument, and `next.config.ts` does not raise Next.js's 1 MB server action body limit, so an upload whose extracted text is over about 1 MB fails before a version is created (`components/upload/supabase-upload-form.tsx:457-464`)

**Per chunk:**

- A chunk closes at the first sentence that brings its length count (characters plus 2 per sentence) to 1,200 or more, so it can run past 1,200 characters by up to one sentence. A sentence longer than 1,200 characters is cut into 1,200-character pieces (`lib/document-segmentation.ts:42`, `273-281`, `305-311`).
- A chunk under 50 characters is not sent to the model; its own text is stored as its summary (`lib/chunk-processor.ts:123-136`, `MIN_SUMMARY_TEXT_LENGTH` in `lib/openai.ts:28`)
- `generateSummaryFromText()` truncates its input at 200,000 characters (`lib/openai.ts:219-223`). Chunks never reach that length. It applies when no chunk in a version has a model-written summary and the full text is summarized instead (`lib/chunk-processor.ts:319-347`).

**Per version:**

- No chunk limit by default: `MAX_NEW_CHUNKS_PER_VERSION` defaults to 0, which turns the check off (`lib/cost-guardrails.ts:42-44`)

## Concurrent processing

- Chunks are summarized inside the upload's server action, not in a queue. Each batch of `CHUNK_BATCH_SIZE` chunks runs concurrently, and batches run one after another (`actions/versioned-upload-actions.tsx:449-525`).
- A failed chunk does not stop the rest of its batch: each batch uses `Promise.allSettled` (`actions/versioned-upload-actions.tsx:462-491`)

**Database connections:**

- Every query goes through `neon()` from `@neondatabase/serverless` (`lib/db.ts`), which sends each query as its own HTTP request. The processing path opens no transactions.

## AI cost

### Per chunk

**Per chunk (new):**

- One summary call to `openai/gpt-4o-mini` (`SUMMARY_MODEL`, `lib/openrouter.ts:10`) through OpenRouter (`lib/openai.ts:270-271`)
- If that call fails or comes back empty, `openrouterChatCompletion()` tries `openai/gpt-4o-mini` once more (`lib/openrouter.ts:48-108`)
- Summaries are cached by text hash and language for 7 days (`lib/openai.ts:453-457`). A chunk whose text is still in that cache does not call the model.

**Per chunk (reused):**

- No summary call. The summary is copied from the newest chunk of the same document with the same hash and chunker version: one in an earlier version, or an earlier copy of the same text in this version (`lib/versioned-documents.ts:220-240`, `actions/versioned-upload-actions.tsx:397-416`).

### Cost growth

- Summary calls grow with `new_chunks`, not with `total_chunks`
- Sections, insights and graph extraction (`openai/gpt-4o-mini`) each make one call (two if the first fails or comes back empty and is retried) for every completed version with at least 100 characters of text, however many chunks it reused (`lib/chunk-processor.ts:576-610`, `lib/document-sections.ts:27`, `lib/document-insights.ts:65`, `lib/document-graph.ts:84`, `lib/openrouter.ts:48-108`)
- Change detection (`google/gemini-2.5-flash`) makes one call (two if the first fails or comes back empty and is retried on `openai/gpt-4o-mini`) per changed, inserted or deleted passage compared with the previous version, up to `MAX_PAIRS_ANALYSED = 40` passages. It makes none for version 1, none when no passage differs, and none when the two versions were chunked by different chunker versions (`lib/chunk-processor.ts:547-549`, `lib/document-change-events.ts:105`, `144-151`, `167-168`, `248-249`, `322`, `lib/openrouter.ts:48-108`).
- A version whose merged chunk summaries are longer than the word budget for its length (`getSummaryFinalWordCap`) is condensed: each section over its share is rewritten by `openai/gpt-4o-mini` in parts that each ask for at most about 300 words from at most about 6,000 words of notes, one call per part, up to 16 calls at a time. If any call fails or they take longer than 45 seconds, lines are selected from the chunk summaries instead, with no call (`lib/final-summary.ts:57-66`, `lib/final-summary.ts:89-139`).
- Chunk embeddings (`text-embedding-3-small`) are generated only for chunk text with no stored embedding. Stored embeddings are keyed by text hash and model (`lib/embeddings-storage.ts:55-78`).

## Cost tracking

### Per-version metrics

Each `document_versions` record tracks:

- `total_chunks`: Total chunks in version
- `reused_chunks`: Chunks whose hash matches a chunk in an earlier version of the same document, chunked by the same chunker version, where the newest such match already has a summary (`lib/versioned-documents.ts:220-240`, `actions/versioned-upload-actions.tsx:290-296`)
- `new_chunks`: `total_chunks - reused_chunks`, the chunks that need a new summary
- `estimated_tokens_saved`: `reused_chunks × 1000` (see Constants)

### Cost queries

**Chunk totals per document:**

```sql
SELECT
  d.id,
  d.title,
  SUM(dv.new_chunks) as new_chunks,
  SUM(dv.reused_chunks) as reused_chunks
FROM documents d
JOIN document_versions dv ON d.id = dv.document_id
GROUP BY d.id, d.title;
```

**Reuse rate per document:**

```sql
SELECT
  d.id,
  d.title,
  AVG(dv.reused_chunks::float / NULLIF(dv.total_chunks, 0)) * 100 as avg_reuse_percent
FROM documents d
JOIN document_versions dv ON d.id = dv.document_id
GROUP BY d.id, d.title;
```

## Scale limits

### Document count

**Per user:**

- The upload page stops accepting files once the account's count of `pdf_summaries` rows reaches its plan limit: Free 5, Starter 10, Pro 1000 (`lib/billing.ts:39-53`, `lib/user.ts:65-82`, `lib/summaries.ts:110-120`), and `createVersionedDocumentJob` refuses an upload past the limit too, so it holds without the page (`actions/versioned-upload-actions.tsx:71-81`)

### Version count

**Per document:**

- No version limit in code. Each version adds a placeholder row to `pdf_summaries` (`actions/versioned-upload-actions.tsx:378-384`), and that is the row the plan limit counts, so versions count toward it.

### Chunk count

**Per version:**

- No limit by default (`MAX_NEW_CHUNKS_PER_VERSION = 0`)

### Indexes

- `documents(user_id)`, `document_versions(document_id)`, `document_versions(full_content_hash)`, `document_chunks(document_version_id)`, `document_chunks(chunk_hash)` (`migrations/versioned_documents_migration.sql:31-35`)

## Cost optimization

### Automatic optimizations

1. **Chunk reuse**: A chunk whose newest match in an earlier version already has a summary skips the summary call
2. **Hash-based matching**: Each chunk's SHA-256 is taken over normalized text: Unicode NFKC, one form of quotes, dashes and whitespace, line breaks collapsed, and running headers, footers, repeated short lines and page-number lines dropped (`lib/document-segmentation.ts:74-241`). Two chunks match when their normalized text is identical.
3. **Incremental processing**: Only new chunks are summarized

### Caching

- Embeddings: stored in `document_embeddings` (`lib/embeddings-storage.ts`) and cached for 30 days (`lib/embeddings.ts:15-58`)
- Summaries: cached for 7 days by text hash and language (`lib/openai.ts:453-457`)
- Classification: 24-hour TTL (`lib/document-classification.ts:12-23`). The classifier matches regular expressions and makes no model call.
- The cache is Upstash Redis when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set, and in-process memory otherwise (`lib/cache.ts:7-23`)

## Monitoring cost metrics

### Key metrics

- `reused_chunks / total_chunks`: Reuse rate
- `new_chunks`: Chunks that need a new summary

### Key queries

**Daily new chunks:**

```sql
SELECT
  DATE_TRUNC('day', dv.created_at) as date,
  SUM(dv.new_chunks) as new_chunks,
  SUM(dv.reused_chunks) as reused_chunks
FROM document_versions dv
WHERE dv.created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', dv.created_at)
ORDER BY date DESC;
```

**Documents with the most new chunks:**

```sql
SELECT
  d.id, d.title, d.user_id,
  SUM(dv.new_chunks) as total_new_chunks
FROM documents d
JOIN document_versions dv ON d.id = dv.document_id
GROUP BY d.id, d.title, d.user_id
ORDER BY total_new_chunks DESC
LIMIT 20;
```

---

## Cost guardrails

All three live in `lib/cost-guardrails.ts` and are checked before a version is created (`actions/versioned-upload-actions.tsx:304-329`).

- `MAX_TOKENS_PER_USER_PER_DAY`: default 2,000,000 estimated tokens per user per day (`lib/cost-guardrails.ts:41`). Today's usage is estimated as `new_chunks × 550` summed over the user's versions created today (`lib/cost-guardrails.ts:5`, `20-32`). The upload being checked is estimated as `(average characters per chunk × new chunks) / 4 + 300 × new chunks` (`actions/versioned-upload-actions.tsx:300-302`).
- `MAX_NEW_CHUNKS_PER_VERSION`: default 0, off (`lib/cost-guardrails.ts:42`)
- `MAX_ESTIMATED_COST_PER_USER_PER_DAY`: default 0, off (`lib/cost-guardrails.ts:88`). When set, tokens convert to cost at the fixed `ESTIMATED_COST_PER_1M_TOKENS = 2.0` (`lib/cost-guardrails.ts:7`).
- The check reads today's usage and the version row is inserted afterwards, with no lock between them (`lib/cost-guardrails.ts:82`, `actions/versioned-upload-actions.tsx:339`). Two uploads started together can both pass.
