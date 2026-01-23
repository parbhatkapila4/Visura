# Quick Start Guide

Get Visura up and running in **under 10 minutes**.

---

## Prerequisites

- **Node.js 20+** (LTS recommended)
- **npm**, **yarn**, or **pnpm**
- **Git**
- **PostgreSQL database** (Neon recommended for serverless)
- **Accounts**: [Clerk](https://clerk.com), [Neon](https://neon.tech), [OpenRouter](https://openrouter.ai)

---

## Step 1: Clone & Install

```bash
# Clone repository
git clone https://github.com/parbhatkapila4/Visura.git
cd visura

# Install dependencies
npm install
```

---

## Step 2: Set Up Services

### 2.1 Database (Neon PostgreSQL)

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy the connection string (starts with `postgresql://`)

### 2.2 Authentication (Clerk)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Copy:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

### 2.3 AI Service (OpenRouter)

1. Go to [OpenRouter](https://openrouter.ai)
2. Sign up and get your API key (starts with `sk-or-`)

### 2.4 File Storage (Supabase)

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Copy:
   - **Project URL**
   - **Anon Key**
   - **Service Role Key** (from Settings → API)

### 2.5 File Uploads (UploadThing) - Optional

1. Go to [UploadThing](https://uploadthing.com)
2. Create an app
3. Copy:
   - **Secret Key** (starts with `sk_live_`)
   - **App ID**

---

## Step 3: Configure Environment

Create `.env.local` in the project root:

```bash
# Database
DATABASE_URL=postgresql://user:password@host/dbname

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# AI (OpenRouter)
OPENROUTER_API_KEY=sk-or-v1-...

# File Storage (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# File Uploads (UploadThing) - Optional
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...

# Optional: Redis for distributed rate limiting
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Optional: Observability
NEXT_PUBLIC_SENTRY_DSN=https://...
OTEL_EXPORTER_OTLP_ENDPOINT=https://...

# Internal API Security (generate with: openssl rand -hex 32)
INTERNAL_API_SECRET=...
CRON_SECRET=...
```

---

## Step 4: Run Database Migrations

```bash
# Connect to your database and run migrations
psql $DATABASE_URL -f migrations/workspace_migration.sql
psql $DATABASE_URL -f migrations/versioned_documents_migration.sql
psql $DATABASE_URL -f migrations/document_change_events_migration.sql
psql $DATABASE_URL -f migrations/embeddings_storage_migration.sql
psql $DATABASE_URL -f migrations/job_queue_migration.sql
psql $DATABASE_URL -f migrations/cost_ledger_migration.sql
psql $DATABASE_URL -f migrations/add_file_url_to_versions.sql
psql $DATABASE_URL -f migrations/add_language_to_versions.sql
```

**Or run all at once:**

```bash
for file in migrations/*.sql; do
  psql $DATABASE_URL -f "$file"
done
```

---

## Step 5: Start Development Server

```bash
npm run dev
```

Visit **http://localhost:3000**

---

## Step 6: Verify Installation

1. **Sign Up**: Create an account via Clerk
2. **Upload Document**: Go to `/upload` and upload a PDF
3. **View Summary**: Check `/summaries/[id]` after processing
4. **Test Chat**: Open chatbot and ask questions about the document

---

## Optional: Advanced Setup

### Redis (Distributed Rate Limiting)

1. Go to [Upstash Console](https://console.upstash.com)
2. Create a Redis database
3. Copy REST URL and Token
4. Add to `.env.local`:
   ```bash
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=...
   ```

### Sentry (Error Tracking)

1. Go to [Sentry](https://sentry.io)
2. Create a Next.js project
3. Copy DSN
4. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=https://...
   ```
5. Install package:
   ```bash
   npm install @sentry/nextjs
   ```

---

## Troubleshooting

### "Module not found"
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### Database connection errors
- Verify `DATABASE_URL` is correct
- Check Neon dashboard for connection issues
- Ensure migrations have run

### Authentication errors
- Verify Clerk keys are correct
- Check Clerk dashboard for webhook configuration
- Ensure `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL` match your routes

### Build errors
```bash
npm run type-check  # Check TypeScript errors
npm run lint        # Check ESLint errors
```

---

## Next Steps

- Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Review [OBSERVABILITY_SETUP.md](OBSERVABILITY_SETUP.md) for monitoring
- See [docs/SCALE_AND_COST.md](docs/SCALE_AND_COST.md) for scaling insights

---

## Need Help?

- **Issues**: [GitHub Issues](https://github.com/parbhatkapila4/Visura/issues)
- **Email**: parbhat@parbhat.dev
- **Documentation**: [ARCHITECTURE.md](ARCHITECTURE.md)

---

**You're all set! Start building amazing document intelligence features.**
