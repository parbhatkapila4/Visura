# Observability setup guide

Sentry, tracing, feature tracking and database monitoring never run in this codebase. `@sentry/nextjs` is not installed, and nothing calls `initSentry`, `captureException`, `initTracing`, `trackUserEngagement` or `trackFeatureUsage` in `lib/observability.ts`. `lib/db-monitoring.ts` is not imported anywhere. The `/api/observability/metrics`, `/api/observability/database` and `/api/metrics` routes have been removed. `measurePerformance` in `lib/performance-monitor.ts` still records durations in memory, but nothing reads them. The sections below cover what does run.

## Manual setup required

- **Run the database migration**:
   ```bash
   psql $DATABASE_URL -f migrations/embeddings_storage_migration.sql
   ```

## What runs automatically

- **Structured logging**: Server code that logs through `lib/logger.ts` writes JSON logs via Pino
- **Client-side logging**: `lib/client-logger.ts` prints timestamped lines to the browser console in development only

## What requires setup

- **Embeddings storage**: Requires the migration above; `lib/embeddings-storage.ts` reads and writes the `document_embeddings` table it creates

## Production recommendations

- **Set up alerts**: Set `ALERT_WEBHOOK_URL`; `sendAlert()` in `lib/alerting.ts` posts alerts to it as JSON and does nothing when it is unset
