# Step-by-Step Guide: Adding Share Functionality

## Step 1: Open Your Neon Database Console

1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Log in to your account
3. Select your project (the one connected to Visura)

## Step 2: Open the SQL Editor

1. In the left sidebar, click on **"SQL Editor"**
2. Click **"New Query"** or find an empty query tab

## Step 3: Copy the Migration SQL

Copy this SQL code:

```sql
ALTER TABLE pdf_summaries 
ADD COLUMN IF NOT EXISTS share_token VARCHAR(255) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_pdf_summaries_share_token ON pdf_summaries(share_token);
```

## Step 4: Paste and Run the SQL

1. Paste the SQL code into the SQL Editor
2. Click the **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
3. Wait for the success message - you should see something like "Success. No rows returned"

## Step 5: Verify the Migration

To verify it worked, run this query:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pdf_summaries' 
AND column_name = 'share_token';
```

You should see a row with `share_token` and `character varying`.

## Step 6: Restart Your Development Server

1. Go back to your terminal/command prompt where your Next.js app is running
2. Stop the server (press `Ctrl+C`)
3. Start it again:
   ```bash
   npm run dev
   ```

## Step 7: Test the Share Button

1. Open your app in the browser (usually `http://localhost:3000`)
2. Navigate to any summary page
3. Click the **"Share"** button next to "Chat with Document"
4. You should see a success message: "Share link copied to clipboard!"
5. The link should be in the format: `http://localhost:3000/share/[token]`

## Troubleshooting

### If you get an error about the column already existing:
- That's okay! The `IF NOT EXISTS` clause means it won't create duplicates
- Just proceed to Step 6

### If you can't find the SQL Editor:
- Look for "Query" or "SQL" in the left sidebar
- Some Neon interfaces call it "Query Editor"

### If the share button still doesn't work:
1. Check the browser console (F12) for any errors
2. Check your terminal for server errors
3. Make sure you restarted the dev server after running the migration

