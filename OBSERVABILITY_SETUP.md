# Observability Setup Guide

**Production-Ready Observability Stack**

Visura includes a comprehensive observability system with error tracking, distributed tracing, business metrics, and database monitoring. This guide will help you set it up.

## 1. Sentry Error Tracking (Optional but Recommended)

### Setup Steps:

1. **Create Sentry Account**: Go to https://sentry.io and create a free account
2. **Create Project**: Create a new Next.js project in Sentry
3. **Get DSN**: Copy your DSN from Sentry project settings
4. **Add to Environment Variables**:
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
   ```

### Install Sentry Package:

```bash
npm install @sentry/nextjs
```

### Initialize Sentry:

The observability module will automatically initialize Sentry when `NEXT_PUBLIC_SENTRY_DSN` is set.

## 2. OpenTelemetry Tracing (Optional)

### Setup Steps:

1. **Set OpenTelemetry Endpoint**:
   ```bash
   OTEL_EXPORTER_OTLP_ENDPOINT=https://your-otel-endpoint.com
   ```

2. **Install OpenTelemetry Packages** (if needed):
   ```bash
   npm install @opentelemetry/api @opentelemetry/sdk-node
   ```

## 3. Business Metrics

Business metrics are automatically tracked and stored in-memory. Access them via:

- **API Endpoint**: `GET /api/observability/metrics`
- **Query Parameters**:
  - `name`: Filter by metric name
  - `summary=true`: Get summary statistics
  - Additional tags: Filter by tag values

### Example Usage:

```typescript
import { trackUserEngagement, trackFeatureUsage } from "@/lib/observability";

// Track user engagement
trackUserEngagement("document_uploaded", userId, { documentType: "PDF" });

// Track feature usage
trackFeatureUsage("vector_search", userId, { documentId: "123" });
```

## 4. Database Monitoring

Database query performance is automatically tracked. Access metrics via:

- **API Endpoint**: `GET /api/observability/database`
- **Health Check**: `GET /api/observability/database?health=true`

### Metrics Tracked:

- Total queries
- Average duration
- Slow queries (>1 second)
- Error queries
- Recent query history

## 5. Performance Monitoring

Performance metrics are integrated with the existing performance monitor:

- P50/P95/P99 latencies
- Operation counts
- Error rates

Access via: `GET /api/metrics`

## Manual Setup Required

1. **Sentry DSN** (optional): Add `NEXT_PUBLIC_SENTRY_DSN` to your `.env.local`
2. **OpenTelemetry Endpoint** (optional): Add `OTEL_EXPORTER_OTLP_ENDPOINT` to your `.env.local`
3. **Run Database Migration**: 
   ```bash
   psql $DATABASE_URL -f migrations/embeddings_storage_migration.sql
   ```

## Available Metrics Endpoints

### Business Metrics
- **Endpoint**: `GET /api/observability/metrics`
- **Query Params**: 
  - `name`: Filter by metric name
  - `summary=true`: Get summary statistics
  - `tags[key]=value`: Filter by tag values
- **Authentication**: Requires Clerk authentication

### Database Performance
- **Endpoint**: `GET /api/observability/database`
- **Health Check**: `GET /api/observability/database?health=true`
- **Metrics**: Query stats, slow queries, connection pool metrics
- **Authentication**: Requires Clerk authentication

### Performance Metrics
- **Endpoint**: `GET /api/metrics`
- **Query Params**: 
  - `metricName`: Specific metric
  - `timeWindow`: Time window in seconds
  - `tagKey`: Group by tag
- **Returns**: P50, P95, P99 latencies

## What's Automatically Enabled

- **Business Metrics Tracking**: Automatically tracks user engagement and feature usage
- **Database Query Monitoring**: Automatically tracks all database queries
- **Performance Metrics**: Integrated with existing performance monitor
- **Structured Logging**: All logs are structured and searchable (Pino)
- **Client-Side Logging**: Browser logging with structured format

## What Requires Setup

- **Sentry**: Requires account and DSN (optional but recommended for production)
- **OpenTelemetry**: Requires endpoint configuration (optional, for distributed tracing)
- **Embeddings Storage**: Requires database migration (recommended for production)

## Production Recommendations

1. **Enable Sentry**: Critical for production error tracking
2. **Set Up Alerts**: Configure webhook alerts for critical errors
3. **Monitor Database**: Regularly check `/api/observability/database?health=true`
4. **Track Business Metrics**: Use metrics API to build dashboards
5. **Review Performance**: Monitor P95/P99 latencies via `/api/metrics`

## Example: Building a Dashboard

```typescript
// Fetch business metrics
const metrics = await fetch('/api/observability/metrics?summary=true');

// Fetch database health
const dbHealth = await fetch('/api/observability/database?health=true');

// Fetch performance metrics
const perf = await fetch('/api/metrics?metricName=document_processing');
```
