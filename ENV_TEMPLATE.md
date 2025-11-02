# Environment Variables Template

Copy this content to `.env.local` in your project root:

```bash
# ============================================
# VISURA - ENVIRONMENT VARIABLES
# ============================================

# DATABASE - Supabase PostgreSQL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://user:password@host:5432/database

# AUTHENTICATION - Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# AI PROVIDERS
OPENAI_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-v1-...

# FILE STORAGE - UploadThing
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=your-app-id

# PAYMENTS - Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# APPLICATION
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

See full documentation in README.md for detailed setup instructions.

