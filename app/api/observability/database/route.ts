import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getQueryStats, getConnectionPoolMetrics, checkDatabaseHealth } from "@/lib/db-monitoring";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const healthCheck = searchParams.get("health") === "true";

    if (healthCheck) {
      const health = await checkDatabaseHealth();
      return NextResponse.json(health);
    }

    const [queryStats, poolMetrics] = await Promise.all([
      getQueryStats(),
      getConnectionPoolMetrics(),
    ]);

    return NextResponse.json({
      queryStats,
      poolMetrics,
    });
  } catch (error) {
    logger.error("Error fetching database metrics", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
