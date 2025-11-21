import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbConnection } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = await getDbConnection();

    // Get total documents
    const [totalDocs] = await sql`
      SELECT COUNT(*) as count FROM pdf_summaries WHERE user_id = ${userId}
    `;

    // Get total words processed
    const [wordsData] = await sql`
      SELECT SUM(LENGTH(summary_text) - LENGTH(REPLACE(summary_text, ' ', '')) + 1) as total_words
      FROM pdf_summaries WHERE user_id = ${userId}
    `;

    // Get documents over time (last 30 days)
    const documentsOverTime = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM pdf_summaries
      WHERE user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Get success rate (completed vs total)
    const [successData] = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) as total
      FROM pdf_summaries
      WHERE user_id = ${userId}
    `;

    // Get recent activity (last 10 documents)
    const recentActivity = await sql`
      SELECT 
        id,
        title,
        created_at,
        'Document uploaded' as action
      FROM pdf_summaries
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const totalDocuments = Number(totalDocs?.count || 0);
    const totalWordsProcessed = Number(wordsData?.total_words || 0);
    const successRate = successData?.total > 0
      ? Math.round((Number(successData.completed) / Number(successData.total)) * 100)
      : 100;

    // Calculate average processing time (mock for now - you can track this in your upload process)
    const averageProcessingTime = 3.5; // seconds

    return NextResponse.json({
      totalDocuments,
      totalWordsProcessed,
      averageProcessingTime,
      successRate,
      documentsOverTime: documentsOverTime.map((row: any) => ({
        date: row.date.toISOString().split('T')[0],
        count: Number(row.count),
      })),
      recentActivity: recentActivity.map((row: any) => ({
        id: row.id,
        action: row.action || 'Document uploaded',
        timestamp: row.created_at.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

