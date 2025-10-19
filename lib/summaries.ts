import { getDbConnection } from "./db";

export async function getUserSummaries(userId: string, userPlan: string = "basic") {
  const sql = await getDbConnection();

  const limit = userPlan === "pro" ? null : 5;

  const summaries = limit
    ? await sql`SELECT * FROM pdf_summaries WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${limit}`
    : await sql`SELECT * FROM pdf_summaries WHERE user_id = ${userId} ORDER BY created_at DESC`;

  return summaries;
}

export async function findSummaryById(id: string) {
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
    console.error("Error finding summary by id", error);
    return null;
  }
}

export async function removeSummary(id: string, userId: string) {
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
    console.error("Error removing summary", error);
    throw error;
  }
}

export async function getUserDocumentCount(userId: string) {
  const sql = await getDbConnection();
  try {
    const [result] =
      await sql`SELECT COUNT(*) as count FROM pdf_summaries WHERE user_id = ${userId}`;
    return result?.count || 0;
  } catch (error) {
    console.error("Error getting user document count", error);
    return 0;
  }
}
