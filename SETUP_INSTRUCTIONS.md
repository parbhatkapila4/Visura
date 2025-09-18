# Visura Setup Instructions

## Environment Variables Required

To fix the "Upload Your PDF" button, you need to set up the following environment variables. Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration (Required for file uploads)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration (Required for AI summaries)
OPENAI_API_KEY=your_openai_api_key

# Clerk Authentication (Required for user management)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Database (if using Neon/PostgreSQL)
DATABASE_URL=your_database_connection_string

# Stripe (if using payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## How to Get These Values

### 1. Supabase Setup
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Settings > API
3. Copy the Project URL and anon/public key
4. Create a storage bucket named "pdf" in your Supabase dashboard

### 2. OpenAI Setup
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key in the API Keys section
3. Copy the key (starts with "sk-")

### 3. Clerk Setup
1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy the publishable key and secret key from the API Keys section

## Fixed Issues

The following issues with the upload button have been resolved:

1. **Button was disabled when no file selected** - Now the button is always enabled and shows appropriate error messages
2. **Missing environment variable validation** - Added checks for required configuration
3. **PDF.js worker loading issues** - Added fallback worker URLs for better reliability
4. **Better user feedback** - Button text changes based on file selection status

## Testing the Upload

1. Make sure all environment variables are set
2. Start the development server: `npm run dev`
3. Navigate to the upload page
4. Select a PDF file - the button text should change to show the filename
5. Click "Upload Your PDF" - you should see processing indicators and success messages

## Troubleshooting

If the upload still doesn't work:

1. Check the browser console for error messages
2. Verify all environment variables are correctly set
3. Ensure you're signed in (Clerk authentication)
4. Check that your Supabase project has the "pdf" storage bucket created
5. Verify your OpenAI API key has sufficient credits

## Common Issues

- **"Configuration Error"** - Missing Supabase environment variables
- **"Please sign in"** - Not authenticated with Clerk
- **"Invalid file"** - File is not a PDF or exceeds 32MB limit
- **Worker loading errors** - Network issues with PDF.js worker, will fallback automatically
