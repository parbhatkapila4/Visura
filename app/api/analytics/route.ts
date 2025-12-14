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

    const [totalDocs] = await sql`
      SELECT COUNT(*) as count FROM pdf_summaries WHERE user_id = ${userId}
    `;

    const [wordsData] = await sql`
      SELECT SUM(LENGTH(summary_text) - LENGTH(REPLACE(summary_text, ' ', '')) + 1) as total_words
      FROM pdf_summaries WHERE user_id = ${userId}
    `;

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

    const [successData] = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) as total
      FROM pdf_summaries
      WHERE user_id = ${userId}
    `;

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

    const [docsThisMonth] = await sql`
      SELECT COUNT(*) as count 
      FROM pdf_summaries 
      WHERE user_id = ${userId}
        AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `;

    const [docsLastMonth] = await sql`
      SELECT COUNT(*) as count 
      FROM pdf_summaries 
      WHERE user_id = ${userId}
        AND created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        AND created_at < DATE_TRUNC('month', CURRENT_DATE)
    `;

    const [docsThisWeek] = await sql`
      SELECT COUNT(*) as count 
      FROM pdf_summaries 
      WHERE user_id = ${userId}
        AND created_at >= DATE_TRUNC('week', CURRENT_DATE)
    `;

    const totalDocuments = Number(totalDocs?.count || 0);
    const totalWordsProcessed = Number(wordsData?.total_words || 0);
    const successRate =
      successData?.total > 0
        ? Math.round((Number(successData.completed) / Number(successData.total)) * 100)
        : 100;

    const manualReviewTimePerDoc = 30 * 60;
    const automatedProcessingTime = 3.5;
    const timeSavedPerDocument = manualReviewTimePerDoc - automatedProcessingTime;
    const totalTimeSaved = totalDocuments * timeSavedPerDocument;
    const totalTimeSavedHours = totalTimeSaved / 3600;
    const totalTimeSavedDays = totalTimeSavedHours / 24;

    const averageHourlyRate = 50;
    const totalMoneySaved = totalTimeSavedHours * averageHourlyRate;

    const docsThisMonthCount = Number(docsThisMonth?.count || 0);
    const docsLastMonthCount = Number(docsLastMonth?.count || 0);
    const monthOverMonthGrowth =
      docsLastMonthCount > 0
        ? Math.round(((docsThisMonthCount - docsLastMonthCount) / docsLastMonthCount) * 100)
        : docsThisMonthCount > 0
        ? 100
        : 0;

    const avgWordsPerDocument =
      totalDocuments > 0 ? Math.round(totalWordsProcessed / totalDocuments) : 0;

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
        date: row.date.toISOString().split("T")[0],
        count: Number(row.count),
      })),
      recentActivity: recentActivity.map((row: any) => ({
        id: row.id,
        title: row.title || "Untitled Document",
        action: row.action || "Document uploaded",
        timestamp: row.created_at.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
