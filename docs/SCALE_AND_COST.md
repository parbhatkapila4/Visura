# Scale & Cost Envelope

This document defines the operational limits and cost characteristics of the system.

## Constants

- `ESTIMATED_TOKENS_PER_CHUNK = 1000` (defined in `lib/versioned-documents.ts`)
- Default chunk size: ~1000 tokens (~4000 characters)
- Default max retries: 3 (per job)
- Processing timeout: 10 minutes (for stuck job detection)

## Document Size Limits

### Max Safe Document Size

**Per Version:**
- Theoretical: Unlimited (chunked processing)
- Practical: ~1000 chunks per version (1M tokens)
- Reason: Processing time scales linearly with chunk count

**Per Chunk:**
- Max: ~200,000 characters (truncated in `generateSummaryFromText()`)
- Typical: ~4000 characters (~1000 tokens)
- Min: 50 characters (rejected as too short)

**Total Document:**
- Max safe: ~4M characters (~1M tokens) = ~1000 chunks
- Typical: ~40,000 characters (~10K tokens) = ~10 chunks
- Processing time: ~2-6 seconds per chunk × chunk count

## Concurrent Processing Limits

### Assumptions

**Vercel Serverless:**
- Max function duration: 60 seconds (Pro plan)
- Concurrent invocations: Auto-scales (no hard limit)
- Rate limits: Per-endpoint (configured in `lib/rate-limit.ts`)

**Safe Concurrent Jobs:**
- Assumption: 50-100 concurrent chunk processing jobs
- Bottleneck: AI provider rate limits (OpenRouter)
- Mitigation: Rate limiting + retry logic

**Database Connections:**
- Neon serverless: Connection pooling (up to 1000 connections)
- Assumption: Each serverless function = 1 connection
- Safe limit: ~500 concurrent functions

## AI Cost Envelope

### Cost Calculation

**Per Chunk (New):**
- Input tokens: ~1000 (chunk text)
- Output tokens: ~500 (summary)
- Total: ~1500 tokens per new chunk
- Cost: Varies by model (Gemini 2.5 Flash is cost-effective)

**Per Chunk (Reused):**
- Input tokens: 0 (no AI call)
- Output tokens: 0 (reused from previous version)
- Total: 0 tokens
- Cost: $0.00

### Cost Scenarios

**Scenario 1: First Version (No Reuse)**
- Document: 10 chunks
- New chunks: 10
- Reused chunks: 0
- Tokens: 10 × 1500 = 15,000 tokens
- Estimated cost: ~$0.01-0.05 (depending on model)

**Scenario 2: Second Version (50% Reuse)**
- Document: 10 chunks
- New chunks: 5 (changed)
- Reused chunks: 5 (unchanged)
- Tokens: 5 × 1500 = 7,500 tokens
- Estimated cost: ~$0.005-0.025
- Savings: 50% vs full reprocessing

**Scenario 3: Third Version (80% Reuse)**
- Document: 10 chunks
- New chunks: 2 (changed)
- Reused chunks: 8 (unchanged)
- Tokens: 2 × 1500 = 3,000 tokens
- Estimated cost: ~$0.002-0.01
- Savings: 80% vs full reprocessing

### Cost Growth Characteristics

**Linear Growth (No Reuse):**
- Cost = chunks × tokens_per_chunk × cost_per_token
- Scales linearly with document size
- No optimization

**Sub-Linear Growth (With Reuse):**
- Cost = new_chunks × tokens_per_chunk × cost_per_token
- Reuse rate determines cost reduction
- Typical reuse: 50-80% for versioned documents

**Worst Case:**
- Every version is completely new (0% reuse)
- Cost = full reprocessing every time
- Example: 10 versions × 10 chunks × 1500 tokens = 150,000 tokens

**Best Case:**
- Every version reuses all chunks (100% reuse)
- Cost = 0 tokens (only first version)
- Example: 10 versions, only first version processed

**Realistic Case:**
- Average reuse: 60-70% per version
- Cost = 30-40% of worst case
- Example: 10 versions, ~60,000 tokens total (vs 150,000 worst case)

## Cost Tracking

### Per-Version Metrics

Each `document_versions` record tracks:
- `total_chunks`: Total chunks in version
- `reused_chunks`: Chunks reused from previous version
- `new_chunks`: Chunks requiring AI processing
- `estimated_tokens_saved`: `reused_chunks × 1000`

### Cost Queries

**Total Cost Per Document:**
```sql
SELECT 
  d.id,
  d.title,
  SUM(dv.new_chunks) * 1500 as estimated_tokens_used,
  SUM(dv.estimated_tokens_saved) as estimated_tokens_saved,
  SUM(dv.new_chunks) * 1500 - SUM(dv.estimated_tokens_saved) as net_tokens
FROM documents d
JOIN document_versions dv ON d.id = dv.document_id
GROUP BY d.id, d.title;
```

**Reuse Rate Per Document:**
```sql
SELECT 
  d.id,
  d.title,
  AVG(dv.reused_chunks::float / NULLIF(dv.total_chunks, 0)) * 100 as avg_reuse_percent
FROM documents d
JOIN document_versions dv ON d.id = dv.document_id
GROUP BY d.id, d.title;
```

## Scale Limits

### Document Count

**Per User:**
- No hard limit (database-driven)
- Practical: Thousands of documents per user
- Bottleneck: Query performance (indexed on `user_id`)

**System-Wide:**
- No hard limit (PostgreSQL scales)
- Practical: Millions of documents
- Bottleneck: Database size/performance

### Version Count

**Per Document:**
- No hard limit
- Practical: Hundreds of versions per document
- Bottleneck: Query performance (indexed on `document_id`)

**System-Wide:**
- No hard limit
- Practical: Millions of versions
- Bottleneck: Database size/performance

### Chunk Count

**Per Version:**
- No hard limit (chunked processing)
- Practical: ~1000 chunks per version
- Bottleneck: Processing time

**System-Wide:**
- No hard limit
- Practical: Billions of chunks
- Bottleneck: Database size/performance

## Performance Characteristics

### Processing Time

**Per Chunk:**
- AI generation: 2-6 seconds (varies by model)
- Database operations: <100ms
- Total: ~2-6 seconds per chunk

**Per Version:**
- Sequential: chunks × 3 seconds (worst case)
- Concurrent: ~3 seconds (all chunks in parallel)
- Typical: 5-30 seconds for 10 chunks

### Database Performance

**Queries:**
- Indexed on `user_id`, `document_id`, `version_id`, `chunk_hash`
- Typical query: <10ms
- Worst case: <100ms (with proper indexes)

**Writes:**
- Chunk insert: <10ms
- Summary update: <10ms
- Version creation: <10ms

## Cost Optimization

### Automatic Optimizations

1. **Chunk Reuse**: Unchanged chunks skip AI processing
2. **Hash-Based Matching**: O(1) lookup for reuse detection
3. **Incremental Processing**: Only new chunks processed

### Manual Optimizations

1. **Batch Processing**: Process multiple chunks concurrently
2. **Retry Logic**: Automatic retry for transient failures
3. **Stuck Job Recovery**: Automatic recovery of stuck jobs

## Cost Monitoring

### Key Metrics

- `estimated_tokens_saved`: Tracks reuse efficiency
- `reused_chunks / total_chunks`: Reuse rate
- `new_chunks`: Actual processing required

### Alerts (Recommended)

- High cost documents: `new_chunks > threshold`
- Low reuse rate: `reused_chunks / total_chunks < 0.3`
- Abnormal patterns: Sudden cost spikes

## Economic Correctness

The system is economically correct because:

1. **Cost is Observable**: Every version tracks cost metrics
2. **Cost is Minimized**: Reuse prevents redundant processing
3. **Cost is Predictable**: Linear scaling with new chunks
4. **Cost is Verifiable**: Metrics stored in database

At scale, cost grows sub-linearly due to chunk reuse, making the system economically sustainable for versioned document processing.
