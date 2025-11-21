import { getDbConnection } from "./db";
import { randomBytes } from "crypto";

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

export async function getUserDownloadCount(userId: string) {
  const sql = await getDbConnection();
  try {
    const [result] =
      await sql`SELECT COUNT(DISTINCT summary_id) as count FROM summary_downloads WHERE user_id = ${userId}`;
    return Number(result?.count || 0);
  } catch (error) {
    console.error("Error getting user download count", error);
    return 0;
  }
}

export async function hasSummaryBeenDownloaded(userId: string, summaryId: string) {
  const sql = await getDbConnection();
  try {
    const [result] =
      await sql`SELECT id FROM summary_downloads WHERE user_id = ${userId} AND summary_id = ${summaryId}`;
    return !!result;
  } catch (error) {
    console.error("Error checking if summary was downloaded", error);
    return false;
  }
}

export async function recordSummaryDownload(userId: string, summaryId: string) {
  const sql = await getDbConnection();
  try {
    // Use INSERT ... ON CONFLICT DO NOTHING to handle unique constraint
    await sql`
      INSERT INTO summary_downloads (user_id, summary_id)
      VALUES (${userId}, ${summaryId})
      ON CONFLICT (user_id, summary_id) DO NOTHING
    `;
    return { success: true };
  } catch (error) {
    console.error("Error recording summary download", error);
    throw error;
  }
}

// Generate a unique share token for a summary
export async function generateShareToken(summaryId: string, userId: string): Promise<string> {
  const sql = await getDbConnection();
  try {
    // Verify the summary belongs to the user
    const [summary] = await sql`
      SELECT id FROM pdf_summaries WHERE id = ${summaryId} AND user_id = ${userId}
    `;

    if (!summary) {
      throw new Error("Summary not found or access denied");
    }

    // Check if share token already exists
    // Note: If this fails, it likely means the share_token column doesn't exist yet
    // Run the migration: ALTER TABLE pdf_summaries ADD COLUMN share_token VARCHAR(255) UNIQUE;
    let existing;
    try {
      [existing] = await sql`
        SELECT share_token FROM pdf_summaries WHERE id = ${summaryId}
      `;
    } catch (error: any) {
      // Check if it's a column doesn't exist error
      if (error?.message?.includes('column') && error?.message?.includes('share_token')) {
        throw new Error("share_token column does not exist. Please run the database migration first. See share_token_migration.sql");
      }
      throw error;
    }

    if (existing?.share_token) {
      return existing.share_token;
    }

    // Generate a unique token (32 character hex string)
    let shareToken: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      shareToken = randomBytes(16).toString("hex");
      
      // Check if token already exists
      const [duplicate] = await sql`
        SELECT id FROM pdf_summaries WHERE share_token = ${shareToken}
      `;

      if (!duplicate) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error("Failed to generate unique share token");
    }

    // Update the summary with the share token
    await sql`
      UPDATE pdf_summaries 
      SET share_token = ${shareToken}
      WHERE id = ${summaryId}
    `;

    return shareToken!;
  } catch (error) {
    console.error("Error generating share token", error);
    throw error;
  }
}

// Revoke share token for a summary (sets share_token to NULL)
export async function revokeShareToken(summaryId: string, userId: string): Promise<{ success: boolean }> {
  const sql = await getDbConnection();
  try {
    // Verify the summary belongs to the user
    const [summary] = await sql`
      SELECT id FROM pdf_summaries WHERE id = ${summaryId} AND user_id = ${userId}
    `;

    if (!summary) {
      throw new Error("Summary not found or access denied");
    }

    // Revoke the share token by setting it to NULL
    await sql`
      UPDATE pdf_summaries 
      SET share_token = NULL
      WHERE id = ${summaryId}
    `;

    return { success: true };
  } catch (error) {
    console.error("Error revoking share token", error);
    throw error;
  }
}

// Check if summary has an active share token
export async function hasActiveShareToken(summaryId: string): Promise<boolean> {
  const sql = await getDbConnection();
  try {
    const [result] = await sql`
      SELECT share_token FROM pdf_summaries WHERE id = ${summaryId} AND share_token IS NOT NULL
    `;
    return !!result?.share_token;
  } catch (error) {
    console.error("Error checking share token status", error);
    return false;
  }
}

// Find summary by share token (for public access)
export async function findSummaryByShareToken(shareToken: string) {
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
    FROM pdf_summaries WHERE share_token = ${shareToken}`;
    
    return summary;
  } catch (error) {
    console.error("Error finding summary by share token", error);
    return null;
  }
}