import { getDbConnection } from "./db";

export async function getSummaries(userId: string) {
  const sql = await getDbConnection();
  const summaries =
    await sql`SELECT * FROM pdf_summaries WHERE user_id = ${userId} ORDER BY created_at DESC`;
  return summaries;
}

export async function getSummaryById(id: string) {
  try {
    const sql = await getDbConnection();

    const [summary] = await sql`SELECT id,
    user_id,
    title,
    original_file_url,
    summary_text,
    status,
    created_at,
    updated_at,
    file_name,
    LENGTH(summary_text) - LENGTH(REPLACE(summary_text, ' ', '')) + 1 as word_count
    FROM pdf_summaries WHERE id = ${id}`;
    return summary;
  } catch (error) {
    console.error("Error fetching summary by id", error);
    return null;
  }
}

export async function deleteSummary(id: string, userId: string) {
  try {
    const sql = await getDbConnection();

    const [summary] =
      await sql`SELECT id FROM pdf_summaries WHERE id = ${id} AND user_id = ${userId}`;

    if (!summary) {
      throw new Error("Summary not found or access denied");
    }

    await sql`DELETE FROM pdf_summaries WHERE id = ${id} AND user_id = ${userId}`;

    return { success: true };
  } catch (error) {
    console.error("Error deleting summary", error);
    throw error;
  }
}

export async function getUserUploadCount(userId: string) {
  const sql = await getDbConnection();
  try {
    const [result] =
      await sql`SELECT COUNT(*) as count FROM pdf_summaries WHERE user_id = ${userId}`;
    return result?.count || 0;
  } catch (error) {
    console.error("Error getting user upload count", error);
    return 0;
  }
}
