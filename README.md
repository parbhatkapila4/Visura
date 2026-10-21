<div align="center">

<img src="./header.svg" alt="Visura: AI-powered document intelligence for PDFs and pipeline insights" width="920" />

<br />

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**Summarize, chat with, and compare documents. Re-upload an edited file and the passages that didn't change keep their summaries.**

[Live](https://visura.parbhat.dev/) · [Quick start](QUICK_START.md) · [Architecture](ARCHITECTURE.md)

---

</div>

## What it is

Upload a PDF, get a summary, ask questions about it, and upload the next revision to see what changed. The interesting part isn't the summary. It's the second upload, and what happens when a run would cost more than you meant to spend.

Two decisions shape the system:

- **Work is keyed by content hash**, so an edit re-summarizes the edit, not the document.
- **Spend is checked before the first model call**, not after the invoice.

---

## How it works

### The upload path

The browser reads the file first, because sending 32 MB to a server action to extract text from is the wrong shape.

1. The file goes from the browser to Supabase Storage.
2. The browser extracts the text. For a PDF it reads the first 50 pages.
3. If it finds nothing readable, it uploads the file for the server to read instead. The server reads the whole file, with no page cap and no OCR.
4. A fully scanned PDF is OCR'd in the browser, English, first 10 pages.
5. The extracted text goes to one server action, which creates the version and summarizes it.

Passages are summarized inside that request, `CHUNK_BATCH_SIZE` at a time (default 2). There is no queue in the live path.

### Versioned processing

Every upload creates a version. The text is normalized, split at content-defined boundaries, and each passage keyed by SHA-256. On re-upload under the same filename, a passage whose hash matches one in an earlier version copies that summary instead of calling the model.

```typescript
const version = await createVersionedDocumentJob({
  text: documentText,
  fileName: "contract.pdf",
  fileUrl: storageUrl,
});

// Normalizes the text and splits it into passages
// Hashes each one
// Copies the summary from a matching passage in an earlier version
// Sends only unmatched passages to the model
// Records reused_chunks and new_chunks on the version
```

**Boundaries.** A passage closes after a sentence whose FNV-1a hash opens the boundary gate, or at about 1,200 characters. Content-defined rather than fixed-size, so inserting a sentence near the top doesn't shift every boundary after it. A passage under 50 characters keeps its own text as its summary and never reaches the model.

**Normalization** is what makes the hash stable across exports. Unicode is folded to NFKC, quotes and dashes unified, whitespace and line wrapping collapsed, running headers and page numbers dropped. The same contract exported at A4 and Letter matches.

One consequence worth knowing: a line that contains only a number is treated as a page number and dropped. A table cell going from "30" to "60" can read as unchanged.

**Identical re-upload.** The full text is hashed too. Upload the same file again and you get the existing version back rather than a new one.

### Guardrails before work starts

Cost controls that run after processing are accounting, not controls.

```typescript
// Checked before the version, its passages, or any model call exist
// Daily estimated-token cap per user (MAX_TOKENS_PER_USER_PER_DAY)
// Today's usage estimated from new passage counts across today's versions
// Optional per-version passage limit (MAX_NEW_CHUNKS_PER_VERSION, off by default)
// A refused run leaves no version and no passages behind
```

The scope is passage summaries on new versions. Chat, workspace analysis and change detection are not metered against this cap. The document row and the uploaded file already exist by the time the check runs, so a refused run isn't a completely clean slate.

### Finalizing a version

A version's summary is written once every passage has one. Reused passages count as done.

The write claims the version's placeholder row while its status is still `processing`, so exactly one worker finalizes it and the second stops before anything runs twice. Passage summaries are written one statement at a time and only while the summary is still null, so two workers can call the model for the same passage but only one result lands.

There are no transactions. Passages are inserted one statement at a time after the version row.

### Summary length

Merging keeps every distinct paragraph of every passage summary. That's right for a short document and unreadable for a long one: a 92-passage upload merges to 135,000 characters.

So the merge is held to the same word budget the summarizer uses: 3,500 words up to 15 pages, 6,000 up to 50, rising to 12,000 for very long documents.

- Within the budget, the merge is used as it is, with no model call.
- Over it, each section is condensed by its own calls, each asked for about 300 words from at most 6,000 words of notes, up to 16 in flight. Small asks in parallel, because asked for 2,000 words in one reply the model writes 3,850 and takes 38 seconds, while asked for 300 it writes 300 in 4.
- If any call fails or the whole thing passes 45 seconds, a fallback selects the first lines of every section of every passage, with no model call. Nothing is ever cut mid-sentence.

### Stored embeddings and chat

Embeddings are written to Postgres, keyed by a hash of the text and the model, so the same text isn't embedded twice. Entries are kept for 30 days.

Chat over a document under 5,000 characters sends the whole text. Over that, the closest passages are retrieved by cosine similarity computed in the app over the stored vectors. If retrieval fails for any reason, it falls back to the first five passages rather than answering with nothing.

### Change detection

Each new version is compared with the one before it. Passages are aligned by hash, so nothing decides what changed except the hashes. A model is used only to describe the changes that alignment already found, on the first 40 of them.

### Compare

`/compare` takes two files directly, without an account. It lists every change it finds and, when both files were read in full without OCR, how much of the text matched after normalization.

Changes are labelled by what they touch:

- **Material**: an amount, a date, a number, a time period, or a word like shall, liable or termination.
- **Substantive**: wording that changes meaning without touching those.
- **Cosmetic**: punctuation only, or short words and numbers inside a passage that starts with a label.

A passage that moved elsewhere counts as a deletion and an insertion, except in a very long document, where a passage that only moved is recognized as such.

### Workspaces

Documents are grouped into workspaces, searched across, and compared: ask the workspace to analyze its documents and it looks for conflicts between them, which needs at least two.

---

## What happens when things fail

| Failure | What's left behind |
| --- | --- |
| The request dies mid-version | Passage summaries already written stay. The version stays `processing` and its passages resume on the next run |
| Two workers reach the same passage | Both may call the model; the write lands only while the summary is still null |
| Two workers finish at the same time | Only the one that claims the `processing` placeholder writes the summary, so chat setup and change detection don't run twice |
| Duplicate passage insert | Caught on the unique key and the existing passage is returned |
| The same changed file uploaded twice at once | Both compute the same next version number; the unique constraint rejects one |
| The provider fails or returns nothing | Retried once on `gpt-4o-mini`. If that fails too, the passage keeps no summary and nothing is written for it |
| The daily cap would be exceeded | Refused before the version, its passages, or the placeholder summary exist |
| A reused passage whose copied summary never landed | Completion falls back to the source passage's summary |

What isn't guaranteed: the same text does not always produce the same summary. Temperature is 0.3, and identical output only comes back from the 7-day summary cache.

---

## Features

| Feature | How it works |
| --- | --- |
| **Summaries** | Each passage summarized by GPT-4o mini through OpenRouter, merged, and condensed if the merge runs long |
| **Document chat** | Answers from the document's own passages; long documents retrieve the closest ones |
| **Versioned uploads** | Hash-keyed passages, matching passages keep their summaries |
| **Compare** | Every change between two files, labelled material, substantive or cosmetic |
| **Sections, insights, graph** | Generated per completed version from the document text |
| **Workspaces** | Group documents, search across them, ask for comparisons and conflicts |
| **Share links** | A 128-bit token per summary, issued and revoked by its owner |

| Component | Technology | Why |
| --- | --- | --- |
| **Versioned processing** | SHA-256 over normalized passage text | An edit costs what the edit costs |
| **Content-defined boundaries** | FNV-1a gate over sentence hashes | An insertion disturbs its own passage, not every one after it |
| **Cost guardrails** | Daily estimated-token cap, checked before anything is written | Refuse up front instead of overspending |
| **Finalization** | One claim on the placeholder row | One writer, no duplicated side effects |
| **Embeddings** | Hash-keyed lookup before the provider | The same text is never embedded twice |
| **Rate limiting** | Upstash Redis, in-memory fallback | Works locally, holds across instances |
| **Storage** | Neon Postgres | Documents, passages, summaries and vectors in one place |

---

## Tech stack

**Core**

- Next.js 15 (App Router, Server Components, Route Handlers)
- React 19
- TypeScript 5

**Backend and infrastructure**

- Neon Postgres, over the serverless HTTP driver, so every query is its own HTTP request and no pool is held
- Supabase Storage for uploaded files
- Upstash Redis for rate limiting and caching
- Vercel

**AI**

- Everything through OpenRouter: GPT-4o mini for summaries, chat, sections, insights and the graph; Gemini 2.5 Flash for change descriptions
- `text-embedding-3-small` for embeddings
- LangChain as the PDF loader

**Auth, payments, uploads**

- Clerk
- Razorpay, one-time payments in INR, USD and EUR

**Validation and logging**

- Zod on the chat routes
- Pino, structured JSON to stdout
- Webhook alerts to `ALERT_WEBHOOK_URL`, fire and forget

---

## Limits

- 32 MB per file. PDF, DOCX, TXT, MD, XLSX, XLS, PPTX. `.doc` and `.ppt` upload but can't be read.
- The browser reads the first 50 pages of a PDF. If that fails, the server reads the whole file with no OCR.
- A fully scanned PDF is OCR'd in English, first 10 pages only.
- Summaries are written in English.
- Very long documents can fail on the server action's body limit, which Next sets at 1 MB by default.
- Documents kept: 5 free, 10 Starter, 1,000 Pro. Each new version counts as one.
- 2 summary downloads per account. Re-downloading something you already downloaded is free.
- Checkout takes INR, USD and EUR.

---

## Quick start

### Prerequisites

- Node.js 20.19+ on 20.x, 22.12+ on 22.x, or 24+
- Postgres (Neon works), a Supabase project for storage, a Clerk app, an OpenRouter key

### Install

```bash
git clone https://github.com/parbhatkapila4/Visura.git
cd visura

npm install

cp ENV_TEMPLATE.md .env.local
# fill in the variables below

node scripts/migrate.mjs --pending

npm run dev
```

Runs at `http://localhost:3000`.

### Environment

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# AI
OPENROUTER_API_KEY=sk-or-...

# Storage
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Payments
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Optional: rate limiting and caching
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Internal
INTERNAL_API_SECRET=...   # openssl rand -hex 32
CRON_SECRET=...           # openssl rand -hex 32
ALERT_WEBHOOK_URL=https://...

# Cost limits
MAX_TOKENS_PER_USER_PER_DAY=2000000
MAX_NEW_CHUNKS_PER_VERSION=0   # 0 turns the per-version limit off
```

Without the Supabase variables the app throws at import, so those aren't optional.

---

## Layout

```
app/
├── (logged-in)/            Protected routes
│   ├── dashboard/          Documents and analytics
│   ├── upload/             Upload and processing
│   ├── summaries/[id]/     Summary, sections, insights, graph
│   ├── chatbot/[id]/       Document chat
│   └── workspaces/         Workspaces
├── compare/                Compare two files, no account needed
├── api/                    Route handlers
└── checkout/               Payments

lib/
├── versioned-documents.ts    Versions, passage reuse, cost metrics
├── document-segmentation.ts  Normalization, boundaries, hashing
├── document-extractor.ts     PDF, DOCX, XLSX, PPTX, OCR
├── chunk-processor.ts        Passage summaries and finalization
├── final-summary.ts          Merging and condensing
├── summary-length-config.ts  The word budget table
├── cost-guardrails.ts        Daily and per-version limits
├── embeddings-storage.ts     Hash-keyed embedding lookup
├── document-change-events.ts Change detection between versions
└── workspaces.ts             Workspaces, members, shares

migrations/   Applied by hand via scripts/migrate.mjs
tests/        Tests
```

---

## Database

| Table | Holds |
| --- | --- |
| `documents` | Document metadata and file URLs |
| `document_versions` | One row per upload, with reused and new passage counts |
| `document_chunks` | Passage text, hash, summary, and which passage it was reused from |
| `pdf_summaries` | The version's summary, with its status |
| `pdf_stores` | Full text, for chat |
| `document_embeddings` | Stored embeddings, keyed by text hash and model |
| `document_change_events` | Changes found between two versions |
| `pdf_qa_sessions` | Chat sessions |
| `pdf_qa_messages` | Conversation history |
| `workspaces` | Workspaces |
| `workspace_members` | Membership and roles |
| `document_shares` | Documents shared into a workspace |
| `users` | Plan and billing state |

---

## Security

- Clerk authentication, with middleware-protected pages
- A summary opens for the person who uploaded it, and for anyone holding its share link
- Share tokens are 128-bit, issued and revoked by the owner
- Zod validation on the chat routes
- Parameterized queries only
- HMAC signing on internal job routes, a shared secret on cron routes
- Rate limiting on chat
- Security headers set in `next.config.ts`

Deleting a document removes its summary, chat history, share link, workspace shares and comments. The uploaded file, its versions, passages and embeddings stay until they're removed separately.

---

## Operations

**Migrations** are never automatic.

```bash
node scripts/migrate.mjs --list      # every migration and its state
node scripts/migrate.mjs --pending   # apply what's missing
node scripts/migrate.mjs <name>      # apply one
```

**Deploys** go out from `main`.

**Crons** are declared in `vercel.json` and authenticated with `CRON_SECRET`. A route refuses every request when the secret isn't set.

**Health.** `/api/health` answers a simple check. `/api/ready` looks at the database and reports 503 when too many versions are sitting unfinished, which is a real signal rather than a formality.

**Alerts** are POSTed as JSON to `ALERT_WEBHOOK_URL` when it's set. Delivery is fire and forget: a failed alert is logged as a warning and never blocks the work it was reporting on.

**After a deploy:** apply any pending migrations, upload a document, run a chat, and confirm a payment reaches the right plan.

---

## Tests

```bash
npm test              # watch
npm run test:run      # once
npm run test:coverage
npm run lint
npm run type-check
```

`next build` does not stop on TypeScript or ESLint errors, by configuration in `next.config.ts`. Nothing runs these automatically, so run them yourself before pushing.

---

## Contributing

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/<your-username>/Visura.git
cd visura

npm install
cp ENV_TEMPLATE.md .env.local
node scripts/migrate.mjs --pending

git checkout -b feature/your-change
npm run test:run && npm run type-check && npm run lint

git commit -m "feat: your change"
git push origin feature/your-change
```

Conventions: component files are kebab-case, landing page sections live in `components/landing/`, and `lib/` is mostly server-side.

---

## Docs

- [ARCHITECTURE.md](ARCHITECTURE.md): system architecture and schema
- [QUICK_START.md](QUICK_START.md): setup
- [docs/SCALE_AND_COST.md](docs/SCALE_AND_COST.md): every limit and where it lives in the code
- [docs/FAILURE_SCENARIOS.md](docs/FAILURE_SCENARIOS.md): what each failure leaves behind
- [docs/OPERATOR_QUERIES.sql](docs/OPERATOR_QUERIES.sql): queries for operators

---

## License

MIT. See [LICENSE](LICENSE).

## Author

**Parbhat Kapila**

- [parbhat.dev](https://parbhat.dev)
- [@Parbhat03](https://x.com/Parbhat03)
- [parbhat-kapila](https://www.linkedin.com/in/parbhat-kapila/)
- [@parbhatkapila4](https://github.com/parbhatkapila4)