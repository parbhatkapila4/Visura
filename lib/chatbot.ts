import { getDbConnection } from "./db";

export async function savePdfStore({
  pdfSummaryId,
  userId,
  fullTextContent,
}: {
  pdfSummaryId: string;
  userId: string;
  fullTextContent: string;
}) {
  try {
    const sql = await getDbConnection();
    const result = await sql`
      INSERT INTO pdf_stores(pdf_summary_id, user_id, full_text_content)
      VALUES(${pdfSummaryId}, ${userId}, ${fullTextContent})
      RETURNING id
    `;
    return result[0];
  } catch (error) {
    console.error("Error saving PDF store:", error);
    throw error;
  }
}

export async function getPdfStoreBySummaryId(
  pdfSummaryId: string,
  userId: string
) {
  try {
    const sql = await getDbConnection();
    const [result] = await sql`
      SELECT * FROM pdf_stores 
      WHERE pdf_summary_id = ${pdfSummaryId} AND user_id = ${userId}
    `;
    return result;
  } catch (error) {
    console.error("Error fetching PDF store:", error);
    return null;
  }
}

export async function getPdfStoreById(pdfStoreId: string, userId: string) {
  try {
    const sql = await getDbConnection();
    const [result] = await sql`
      SELECT * FROM pdf_stores 
      WHERE id = ${pdfStoreId} AND user_id = ${userId}
    `;
    return result;
  } catch (error) {
    console.error("Error fetching PDF store by ID:", error);
    return null;
  }
}

export async function createQASession({
  pdfStoreId,
  userId,
  sessionName = "New Chat",
}: {
  pdfStoreId: string;
  userId: string;
  sessionName?: string;
}) {
  try {
    const sql = await getDbConnection();
    const result = await sql`
      INSERT INTO pdf_qa_sessions(pdf_store_id, user_id, session_name)
      VALUES(${pdfStoreId}, ${userId}, ${sessionName})
      RETURNING id
    `;
    return result[0];
  } catch (error) {
    console.error("Error creating QA session:", error);
    throw error;
  }
}

export async function getQASessionsByPdfStore(
  pdfStoreId: string,
  userId: string
) {
  try {
    const sql = await getDbConnection();
    const sessions = await sql`
      SELECT * FROM session_with_message_count
      WHERE pdf_store_id = ${pdfStoreId} AND user_id = ${userId}
      ORDER BY updated_at DESC
    `;
    return sessions;
  } catch (error) {
    console.error("Error fetching QA sessions:", error);
    return [];
  }
}

export async function getQASessionById(sessionId: string, userId: string) {
  try {
    const sql = await getDbConnection();
    const [session] = await sql`
      SELECT qas.*, ps.full_text_content, pss.title, pss.file_name
      FROM pdf_qa_sessions qas
      JOIN pdf_stores ps ON qas.pdf_store_id = ps.id
      JOIN pdf_summaries pss ON ps.pdf_summary_id = pss.id
      WHERE qas.id = ${sessionId} AND qas.user_id = ${userId}
    `;
    return session;
  } catch (error) {
    console.error("Error fetching QA session:", error);
    return null;
  }
}

export async function updateQASessionName(
  sessionId: string,
  userId: string,
  newName: string
) {
  try {
    const sql = await getDbConnection();
    const result = await sql`
      UPDATE pdf_qa_sessions 
      SET session_name = ${newName}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${sessionId} AND user_id = ${userId}
      RETURNING id
    `;
    return result[0];
  } catch (error) {
    console.error("Error updating QA session name:", error);
    throw error;
  }
}

export async function deleteQASession(sessionId: string, userId: string) {
  try {
    const sql = await getDbConnection();
    await sql`
      DELETE FROM pdf_qa_sessions 
      WHERE id = ${sessionId} AND user_id = ${userId}
    `;
    return { success: true };
  } catch (error) {
    console.error("Error deleting QA session:", error);
    throw error;
  }
}

export async function saveQAMessage({
  sessionId,
  messageType,
  messageContent,
}: {
  sessionId: string;
  messageType: "user" | "assistant";
  messageContent: string;
}) {
  try {
    const sql = await getDbConnection();
    const result = await sql`
      INSERT INTO pdf_qa_messages(session_id, message_type, message_content)
      VALUES(${sessionId}, ${messageType}, ${messageContent})
      RETURNING id, message_type, message_content, created_at
    `;

    await sql`
      UPDATE pdf_qa_sessions 
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = ${sessionId}
    `;

    return result[0];
  } catch (error) {
    console.error("Error saving QA message:", error);
    throw error;
  }
}

export async function getQAMessagesBySession(
  sessionId: string,
  userId: string
) {
  try {
    const sql = await getDbConnection();

    const [session] = await sql`
      SELECT id FROM pdf_qa_sessions 
      WHERE id = ${sessionId} AND user_id = ${userId}
    `;

    if (!session) {
      throw new Error("Session not found or access denied");
    }

    const messages = await sql`
      SELECT * FROM pdf_qa_messages
      WHERE session_id = ${sessionId}
      ORDER BY created_at ASC
    `;
    return messages;
  } catch (error) {
    console.error("Error fetching QA messages:", error);
    return [];
  }
}

export async function getPdfsWithChatbotSupport(userId: string) {
  try {
    const sql = await getDbConnection();
    const pdfs = await sql`
      SELECT * FROM pdf_with_chatbot_support
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return pdfs;
  } catch (error) {
    console.error("Error fetching PDFs with chatbot support:", error);
    return [];
  }
}
