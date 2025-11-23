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

    // Get documents this month
    const [docsThisMonth] = await sql`
      SELECT COUNT(*) as count 
      FROM pdf_summaries 
      WHERE user_id = ${userId}
        AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `;

    // Get documents last month
    const [docsLastMonth] = await sql`
      SELECT COUNT(*) as count 
      FROM pdf_summaries 
      WHERE user_id = ${userId}
        AND created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        AND created_at < DATE_TRUNC('month', CURRENT_DATE)
    `;

    // Get documents this week
    const [docsThisWeek] = await sql`
      SELECT COUNT(*) as count 
      FROM pdf_summaries 
      WHERE user_id = ${userId}
        AND created_at >= DATE_TRUNC('week', CURRENT_DATE)
    `;

    const totalDocuments = Number(totalDocs?.count || 0);
    const totalWordsProcessed = Number(wordsData?.total_words || 0);
    const successRate = successData?.total > 0
      ? Math.round((Number(successData.completed) / Number(successData.total)) * 100)
      : 100;

    // Calculate meaningful metrics
    // Average manual document review: 30 minutes per document
    // Average automated processing: 3.5 seconds per document
    const manualReviewTimePerDoc = 30 * 60; // 30 minutes in seconds
    const automatedProcessingTime = 3.5; // seconds
    const timeSavedPerDocument = manualReviewTimePerDoc - automatedProcessingTime; // seconds
    const totalTimeSaved = totalDocuments * timeSavedPerDocument; // seconds
    const totalTimeSavedHours = totalTimeSaved / 3600; // convert to hours
    const totalTimeSavedDays = totalTimeSavedHours / 24; // convert to days

    // Calculate money saved (assuming average hourly rate of $50/hour)
    const averageHourlyRate = 50; // dollars per hour
    const totalMoneySaved = totalTimeSavedHours * averageHourlyRate;

    // Calculate month-over-month growth
    const docsThisMonthCount = Number(docsThisMonth?.count || 0);
    const docsLastMonthCount = Number(docsLastMonth?.count || 0);
    const monthOverMonthGrowth = docsLastMonthCount > 0
      ? Math.round(((docsThisMonthCount - docsLastMonthCount) / docsLastMonthCount) * 100)
      : docsThisMonthCount > 0 ? 100 : 0;

    // Calculate average words per document
    const avgWordsPerDocument = totalDocuments > 0
      ? Math.round(totalWordsProcessed / totalDocuments)
      : 0;

    // Documents this week
    const docsThisWeekCount = Number(docsThisWeek?.count || 0);

    return NextResponse.json({
      totalDocuments,
      totalWordsProcessed,
      avgWordsPerDocument,
      successRate,
      totalTimeSavedHours: Math.round(totalTimeSavedHours * 10) / 10,
      totalTimeSavedDays: Math.round(totalTimeSavedDays * 10) / 10,
      totalMoneySaved: Math.round(totalMoneySaved),
      docsThisMonth: docsThisMonthCount,
      docsLastMonth: docsLastMonthCount,
      docsThisWeek: docsThisWeekCount,
      monthOverMonthGrowth,
      documentsOverTime: documentsOverTime.map((row: any) => ({
        date: row.date.toISOString().split('T')[0],
        count: Number(row.count),
      })),
      recentActivity: recentActivity.map((row: any) => ({
        id: row.id,
        title: row.title || 'Untitled Document',
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

