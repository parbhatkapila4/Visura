# Quick start guide

Run Visura locally.

---

## Prerequisites

- **Node.js 20.19+ on 20.x, 22.12+ on 22.x, or 24+** (the test tooling, Vite 7 and jsdom 27, requires it)
- **npm** (the repo ships `package-lock.json`)
- **Git**
- **Neon Postgres database** (`lib/db.ts` connects with the Neon serverless driver)
- **Accounts**: [Clerk](https://clerk.com), [Neon](https://neon.tech), [OpenRouter](https://openrouter.ai), [Supabase](https://supabase.com)

---

## Step 1: Clone and install

```bash
# Clone repository
git clone https://github.com/parbhatkapila4/Visura.git
cd Visura

# Install dependencies
npm install
```

---

## Step 2: Set up services

### 2.1 Database (Neon PostgreSQL)

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy the connection string (starts with `postgresql://`)

### 2.2 Authentication (Clerk)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Copy:
   - **Publishable key** (starts with `pk_`)
   - **Secret key** (starts with `sk_`)

### 2.3 AI service (OpenRouter)

1. Go to [OpenRouter](https://openrouter.ai)
2. Sign up and get your API key (starts with `sk-or-`)

### 2.4 File storage (Supabase)

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Copy:
   - **Project URL**
   - **Anon key**
4. Create a public storage bucket named `pdf` whose policies allow uploads with the anon key. The upload form writes files to it from the browser, and the server reads them back by public URL.

---

## Step 3: Configure environment

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

# File storage (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Payments (Razorpay). /checkout needs these. The payment routes create the Razorpay
# client when they load (src/lib/razorpay.ts) and throw without RAZORPAY_KEY_ID, so set it
# before you build (a placeholder works if you skip payments).
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Optional: Redis for rate limiting and caching
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Internal API security (generate with: openssl rand -hex 32)
INTERNAL_API_SECRET=...
CRON_SECRET=...
```

---

## Step 4: Run database migrations

Nothing applies `migrations/` automatically. `scripts/migrate.mjs` runs them against `DATABASE_URL`, taken from the environment or from `.env.local`:

```bash
node scripts/migrate.mjs --list                  # each file: applied, pending, partial or unknown
node scripts/migrate.mjs workspace_migration     # apply one file by name
node scripts/migrate.mjs --pending               # apply every file listed as pending or partial
```

`--list` judges a file by the columns it adds, so a file that only creates tables shows as `unknown` and `--pending` skips it. Before running `--pending`, apply `workspace_migration` (it enables `uuid-ossp`), `job_queue_migration` and `versioned_documents_migration` (it references `summary_jobs`) by name in that order, then every other file that shows as `unknown`.

No file in this repo creates the tables `users`, `pdf_summaries`, `summary_downloads` or `workspace_chat_messages`, the view `session_with_message_count` (read by `lib/chatbot.ts`), or the trigger function `update_updated_at_column()` that `workspace_migration` calls. Without that function, `workspace_migration` stops at its first `CREATE TRIGGER`. The chat tables `pdf_stores`, `pdf_qa_sessions` and `pdf_qa_messages` are created only by `runChatbotSchema()` in `lib/db-migration.ts`, which nothing calls. The migrations and the app expect all of these to exist already.

---

## Step 5: Start the development server

```bash
npm run dev
```

Visit **http://localhost:3000**

---

## Step 6: Verify installation

1. **Sign up**: Create an account via Clerk
2. **Upload a document**: Go to `/upload` and upload a PDF
3. **View the summary**: Check `/summaries/[id]` after processing
4. **Test chat**: Open the chatbot and ask questions about the document

---

## Optional: Advanced setup

### Redis (rate limiting and cache)

1. Go to [Upstash Console](https://console.upstash.com)
2. Create a Redis database
3. Copy REST URL and Token
4. Add to `.env.local`:
   ```bash
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=...
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
- Ensure `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL` match your routes

### Build errors

`npm run build` does not stop on TypeScript or ESLint errors, because `next.config.ts` turns both checks off. A failed build has another cause: check that `RAZORPAY_KEY_ID` is set (Step 3), then read the first error the build prints.

The build does not run either check, so run them yourself:

```bash
npm run type-check  # TypeScript errors
npm run lint        # ESLint errors
```

---

## Next steps

- Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- See [docs/SCALE_AND_COST.md](docs/SCALE_AND_COST.md) for limits and costs

---

## Need help?

- **Issues**: [GitHub Issues](https://github.com/parbhatkapila4/Visura/issues)
- **Email**: parbhat@parbhat.dev
- **Documentation**: [ARCHITECTURE.md](ARCHITECTURE.md)
