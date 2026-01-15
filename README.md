<p align="center">
  <img src="public/Logo.png" alt="Visura Logo" width="120" height="120" />
</p>

<h1 align="center">Visura</h1>

<p align="center">
  <strong>AI-Powered Document Intelligence Platform</strong>
</p>

<p align="center">
  Transform complex documents into actionable insights in seconds, not hours.
</p>

<p align="center">
  <a href="https://visura.parbhat.dev/">Live Demo</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#pricing">Pricing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.5-black?logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind-4.1-38BDF8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

<br />

<p align="center">
  <img src="public/demo.png" alt="Visura Dashboard" width="100%" />
</p>

---

## The Problem

Professionals spend **2.5 hours daily** reading documents. Researchers wade through hundreds of papers. Legal teams analyze thousands of contract pages. The information overload is real.

**Visura changes that.**

---

## The Solution

Visura is an AI-powered document intelligence platform that:

- **Summarizes** complex PDFs into digestible insights in under 30 seconds
- **Enables conversations** with your documents through an intelligent chatbot
- **Facilitates collaboration** with team workspaces and real-time chat
- **Scales** from individual users to enterprise teams

<br />

## Features

### 🧠 AI-Powered Document Analysis

| Feature | Description |
|---------|-------------|
| **Smart Summaries** | Extract key insights from any PDF instantly with Gemini 2.5 Flash |
| **Document Chat** | Ask questions and get context-aware answers from your documents |
| **Multi-Session Support** | Organize conversations by topic with auto-generated session names |
| **Context Retention** | AI remembers previous messages for coherent, flowing conversations |

### 👥 Team Collaboration

| Feature | Description |
|---------|-------------|
| **Workspaces** | Create shared spaces for teams to collaborate on documents |
| **Real-time Chat** | Communicate with team members within workspaces |
| **Document Sharing** | Share summaries across workspace members with permission controls |
| **Member Management** | Invite members, assign roles (Owner, Admin, Member, Viewer) |
| **Collaboration Presence** | See who's viewing documents in real-time |

### 📊 Analytics Dashboard

| Feature | Description |
|---------|-------------|
| **Processing Metrics** | Track documents processed, success rates, and efficiency scores |
| **Time Saved Calculations** | Quantify productivity gains with automated time tracking |
| **Value Analytics** | Estimate monetary value saved through automation |
| **Performance Forecasting** | Visualize trends and predict future processing needs |
| **Recent Activity Feed** | Monitor document activity across your account |

### 🎨 Premium User Experience

| Feature | Description |
|---------|-------------|
| **Responsive Design** | Flawless experience across mobile, tablet, and desktop |
| **Dark Mode** | Modern dark theme with vibrant orange accents |
| **Keyboard Shortcuts** | `Cmd+U` (upload), `Cmd+D` (dashboard), `?` (help panel) |
| **Loading States** | Smooth skeleton animations and transitions |
| **Framer Motion** | Fluid animations throughout the interface |

### 🔐 Enterprise-Grade Security

| Feature | Description |
|---------|-------------|
| **Authentication** | Clerk-powered user management with SSO support |
| **Authorization** | Protected routes with middleware enforcement |
| **Input Validation** | Zod schemas for compile-time and runtime type safety |
| **Rate Limiting** | API protection against abuse (configurable per endpoint) |
| **Security Headers** | HTTPS, CSP, CORS, X-Frame-Options configured |

### 💳 Global Payments

| Feature | Description |
|---------|-------------|
| **Multi-Currency** | Automatic currency detection (INR, USD, EUR, GBP, CAD, AUD, SGD, JPY) |
| **Geo-Detection** | Price localization based on visitor location |
| **Razorpay Integration** | Secure payment processing with local payment methods |
| **Plan Management** | Starter, Pro, and Enterprise tiers |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 15 (App Router) | Full-stack React with SSR/SSG |
| **Language** | TypeScript 5 | Type-safe development |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Utility-first styling with accessible components |
| **Database** | Neon (PostgreSQL) | Serverless Postgres with connection pooling |
| **Auth** | Clerk | User management, sessions, and SSO |
| **AI** | OpenRouter (Gemini 2.5 Flash) | Document summarization and chat |
| **Storage** | Supabase + UploadThing | File uploads and blob storage |
| **Payments** | Razorpay | Multi-currency payment processing |
| **PDF Processing** | pdf.js + pdf-parse | Client and server-side text extraction |
| **Animations** | Framer Motion | Fluid UI animations |
| **Charts** | Recharts | Analytics visualizations |
| **Validation** | Zod | Runtime type validation |
| **Testing** | Vitest + Testing Library | Unit and integration testing |
| **Deployment** | Vercel | Edge network hosting |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Next.js   │  │   React 19  │  │   Framer Motion         │  │
│  │  App Router │  │  Components │  │   Animations            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  API Routes │  │  Middleware │  │   Rate Limiting         │  │
│  │  /api/*     │  │  Auth Check │  │   Abuse Prevention      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Clerk     │  │  OpenRouter │  │   Razorpay              │  │
│  │   Auth      │  │   AI/LLM    │  │   Payments              │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │    Neon     │  │  Supabase   │  │   UploadThing           │  │
│  │  PostgreSQL │  │   Storage   │  │   File Uploads          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm, yarn, or pnpm
- Accounts: [Clerk](https://clerk.com), [Neon](https://neon.tech), [OpenRouter](https://openrouter.ai), [UploadThing](https://uploadthing.com), [Supabase](https://supabase.com), [Razorpay](https://razorpay.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/parbhatkapila4/Visura.git
cd visura

# Install dependencies
npm install

# Copy environment template
cp ENV_TEMPLATE.md .env.local

# Start development server
npm run dev
```

Visit `http://localhost:3000`

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# AI (OpenRouter)
OPENROUTER_API_KEY=sk-or-...

# File Storage
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Payments (Razorpay)
RAZORPAY_KEY_ID=rzp_...
RAZORPAY_KEY_SECRET=...
```

---

## Project Structure

```
visura/
├── app/                          # Next.js App Router
│   ├── (logged-in)/              # Protected routes
│   │   ├── dashboard/            # Main dashboard
│   │   ├── upload/               # Document upload
│   │   ├── summaries/[id]/       # Summary viewer
│   │   ├── chatbot/[id]/         # Document chat
│   │   └── workspaces/           # Team workspaces
│   ├── api/                      # API endpoints
│   │   ├── analytics/            # Analytics data
│   │   ├── chatbot/              # Chat functionality
│   │   ├── downloads/            # Download management
│   │   ├── payments/             # Payment processing
│   │   ├── summaries/            # Summary CRUD + sharing
│   │   └── workspaces/           # Workspace management
│   ├── checkout/                 # Payment pages
│   └── share/[token]/            # Public share pages
├── components/
│   ├── chatbot/                  # Chat interface
│   ├── common/                   # Shared components
│   ├── dashboard/                # Dashboard components
│   ├── home/                     # Landing page sections
│   ├── summaries/                # Summary display
│   ├── ui/                       # shadcn/ui primitives
│   ├── upload/                   # Upload components
│   └── workspaces/               # Workspace components
├── lib/                          # Backend logic
│   ├── chatbot.ts                # Chat session management
│   ├── chatbot-ai.ts             # AI response generation
│   ├── db.ts                     # Database connection
│   ├── openrouter.ts             # LLM integration
│   ├── rate-limit.ts             # Rate limiting
│   ├── summaries.ts              # Summary operations
│   ├── validators.ts             # Zod schemas
│   └── workspaces.ts             # Workspace operations
├── actions/                      # Server actions
├── utils/                        # Utility functions
└── tests/                        # Test files
```

---

## Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Starter** | $10/mo | 5 documents/month, Basic AI summaries, Document chat, Email support |
| **Pro** | $20/mo | Unlimited documents, Advanced AI, Priority support, API access, Team sharing |
| **Enterprise** | $99/mo | Everything in Pro, Unlimited team members, Custom AI training, SSO/SAML, SLA |

*Localized pricing available: ₹880/₹1770/₹8200 (India), €9/€17/€85 (Europe)*

---

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Production build
npm run start            # Start production server

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix linting issues
npm run format           # Prettier formatting
npm run type-check       # TypeScript validation

# Testing
npm test                 # Run tests (watch mode)
npm run test:run         # Run tests once
npm run test:coverage    # Generate coverage report
npm run test:ui          # Visual test runner
```

### Database Migrations

```bash
# Workspace tables
psql $DATABASE_URL -f migrations/workspace_migration.sql
```

---

## API Reference

### Authentication
All API routes require Clerk authentication. Include the session token in requests.

### Rate Limits
| Endpoint | Limit |
|----------|-------|
| Chatbot messages | 10/minute |
| Document uploads | 5/hour (Basic), Unlimited (Pro) |
| Summary downloads | 2/day (Basic), Unlimited (Pro) |

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics` | Fetch user analytics |
| `POST` | `/api/chatbot/messages` | Send chat message |
| `GET` | `/api/summaries/[id]` | Get summary details |
| `POST` | `/api/summaries/[id]/share` | Generate share link |
| `GET` | `/api/workspaces` | List user workspaces |
| `POST` | `/api/workspaces/members` | Invite workspace member |
| `POST` | `/api/payments/create-order` | Create Razorpay order |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + U` | Upload new document |
| `Cmd/Ctrl + D` | Go to dashboard |
| `Cmd/Ctrl + K` | Open search |
| `?` | Open keyboard shortcuts panel |
| `Esc` | Close modals |

---

## Security

| Measure | Implementation |
|---------|----------------|
| **Authentication** | Clerk with JWT verification |
| **Authorization** | Middleware-protected routes |
| **Input Validation** | Zod schemas on all API inputs |
| **SQL Injection** | Parameterized queries via Neon client |
| **XSS Protection** | React auto-escaping + CSP headers |
| **Rate Limiting** | Configurable per-endpoint limits |
| **HTTPS** | Enforced in production |

---

## Performance

| Metric | Target | Status |
|--------|--------|--------|
| **LCP** (Largest Contentful Paint) | < 2.5s | ✅ |
| **FID** (First Input Delay) | < 100ms | ✅ |
| **CLS** (Cumulative Layout Shift) | < 0.1 | ✅ |
| **PDF Processing** | < 2s (10MB) | ✅ |
| **AI Summary Generation** | < 3s | ✅ |
| **Chat Response** | < 1.5s | ✅ |

---

## Roadmap

### Completed ✅
- [x] PDF upload and text extraction
- [x] AI-powered summarization (Gemini 2.5 Flash)
- [x] Interactive document chatbot
- [x] Team workspaces with real-time chat
- [x] Document sharing with permissions
- [x] Analytics dashboard
- [x] Multi-currency payments
- [x] Mobile-responsive design
- [x] Keyboard shortcuts

### In Progress 🚧
- [ ] Streaming AI responses
- [ ] Batch document upload
- [ ] Export to Word/Markdown
- [ ] OCR for scanned PDFs

### Planned 📋
- [ ] Vector search for improved chat
- [ ] Document comparison
- [ ] Custom AI model fine-tuning
- [ ] API for third-party integrations
- [ ] On-premise deployment option

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Fork the repository
# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes
# Run tests
npm run test:run

# Commit with conventional commits
git commit -m "feat: add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

---

## Support

- **Email**: parbhat@parbhat.dev
- **GitHub Issues**: Bug reports and feature requests
- **Documentation**: [ARCHITECTURE.md](ARCHITECTURE.md)

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>Built by <a href="https://parbhat.dev">Parbhat Kapila</a></strong>
</p>

<p align="center">
  <a href="https://x.com/Parbhat03">Twitter</a> •
  <a href="https://www.linkedin.com/in/parbhat-kapila/">LinkedIn</a> •
  <a href="https://github.com/parbhatkapila4/Visura">GitHub</a>
</p>

<p align="center">
  <sub>If Visura saves you time, consider giving it a ⭐ on GitHub!</sub>
</p>
