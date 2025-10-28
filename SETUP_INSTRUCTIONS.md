# Visura Setup Instructions

## Database Setup

The chatbot functionality requires additional database tables. Follow these steps:

### 1. Run the Chatbot Schema

Execute the `chatbot_schema.sql` file in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `chatbot_schema.sql`
4. Click "Run" to execute the SQL

### 2. Verify Tables

After running the schema, you should have these new tables:
- `pdf_stores` - Stores full PDF text content for chatbot
- `pdf_qa_sessions` - Stores chat sessions
- `pdf_qa_messages` - Stores individual messages

### 3. Test Upload and Chat

1. Upload a new PDF document
2. The system should now create both the summary and the PDF store
3. Click "Chat with Document" - it should work now

## Troubleshooting

If you still see "Chatbot Not Available":
1. Check the browser console for any errors
2. Verify the database tables were created successfully
3. Try uploading a new document after running the schema

## Environment Variables

Make sure you have these environment variables set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for server-side operations)