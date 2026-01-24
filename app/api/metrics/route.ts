import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getMetricStats,
  getMetricsSummary,
  getMetricNames,
  getMetricStatsByTags,
} from "@/lib/performance-monitor";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const metricName = searchParams.get("name");
    const timeWindow = searchParams.get("timeWindow");
    const tagKey = searchParams.get("tagKey");

    const timeWindowMs = timeWindow
      ? parseInt(timeWindow, 10) * 1000
      : 60 * 60 * 1000;

    if (metricName) {
      if (tagKey) {
        const stats = getMetricStatsByTags(metricName, tagKey, timeWindowMs);
        return NextResponse.json({
          metric: metricName,
          tagKey,
          timeWindowMs,
          stats,
        });
      } else {
        const stats = getMetricStats(metricName, timeWindowMs);
        return NextResponse.json({
          metric: metricName,
          timeWindowMs,
          ...stats,
        });
      }
    } else {
      const summary = getMetricsSummary(timeWindowMs);
      const names = getMetricNames();

      return NextResponse.json({
        timeWindowMs,
        metrics: names,
        summary,
      });
    }
  } catch (error) {
    logger.error("Error fetching metrics", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
