import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getBusinessMetrics, getBusinessMetricsSummary } from "@/lib/observability";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get("name");
    const summary = searchParams.get("summary") === "true";

    if (summary && name) {
      const summaryData = getBusinessMetricsSummary(name);
      return NextResponse.json({
        name,
        summary: summaryData,
      });
    }

    const tags: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== "name" && key !== "summary") {
        tags[key] = value;
      }
    });

    const metrics = getBusinessMetrics(name || undefined, Object.keys(tags).length > 0 ? tags : undefined);

    return NextResponse.json({
      metrics,
      count: metrics.length,
    });
  } catch (error) {
    logger.error("Error fetching observability metrics", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
