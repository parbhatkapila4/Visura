import { getDbConnection } from "./db";

export async function checkChatbotTables() {
  try {
    const sql = await getDbConnection();

    const storesTable = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pdf_stores'
      );
    `;

    const sessionsTable = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pdf_qa_sessions'
      );
    `;

    const messagesTable = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pdf_qa_messages'
      );
    `;

    return {
      pdf_stores: storesTable[0]?.exists || false,
      pdf_qa_sessions: sessionsTable[0]?.exists || false,
      pdf_qa_messages: messagesTable[0]?.exists || false,
    };
  } catch (error) {
    console.error("Error checking chatbot tables:", error);
    return {
      pdf_stores: false,
      pdf_qa_sessions: false,
      pdf_qa_messages: false,
    };
  }
}

export async function runChatbotSchema() {
  try {
    const sql = await getDbConnection();

    await sql`
      CREATE TABLE IF NOT EXISTS pdf_stores (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        pdf_summary_id UUID NOT NULL REFERENCES pdf_summaries(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        full_text_content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS pdf_qa_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        pdf_store_id UUID NOT NULL REFERENCES pdf_stores(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        session_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS pdf_qa_messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID NOT NULL REFERENCES pdf_qa_sessions(id) ON DELETE CASCADE,
        message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('user', 'assistant')),
        message_content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_pdf_stores_pdf_summary_id ON pdf_stores(pdf_summary_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pdf_stores_user_id ON pdf_stores(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pdf_qa_sessions_pdf_store_id ON pdf_qa_sessions(pdf_store_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pdf_qa_sessions_user_id ON pdf_qa_sessions(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pdf_qa_messages_session_id ON pdf_qa_messages(session_id);`;

    console.log("Chatbot tables created successfully");
    return { success: true, message: "Chatbot tables created successfully" };
  } catch (error) {
    console.error("Error creating chatbot tables:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
