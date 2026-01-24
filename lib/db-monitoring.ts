import { getDbConnection } from "./db";
import { logger } from "./logger";
import { trackPerformanceMetric } from "./observability";

interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  error?: string;
}

const queryMetrics: QueryMetrics[] = [];
const MAX_METRICS = 1000;

export function trackQuery(query: string, duration: number, error?: Error) {
  const metric: QueryMetrics = {
    query: query.substring(0, 200),
    duration,
    timestamp: new Date(),
    error: error?.message,
  };

  queryMetrics.push(metric);

  if (queryMetrics.length > MAX_METRICS) {
    queryMetrics.shift();
  }

  if (duration > 1000) {
    logger.warn("Slow query detected", {
      query: query.substring(0, 200),
      duration,
      error: error?.message,
    });
    trackPerformanceMetric("slow_query", duration, {
      query: query.substring(0, 100),
    });
  }

  trackPerformanceMetric("database_query", duration, {
    hasError: !!error,
  });
}

export async function trackedQuery<T>(
  queryFn: () => Promise<T>,
  queryName?: string
): Promise<T> {
  const startTime = Date.now();
  try {
    const result = await queryFn();
    const duration = Date.now() - startTime;
    trackQuery(queryName || "unknown", duration);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    trackQuery(queryName || "unknown", duration, error instanceof Error ? error : undefined);
    throw error;
  }
}

export function getQueryStats(): {
  totalQueries: number;
  avgDuration: number;
  slowQueries: number;
  errorQueries: number;
  recentQueries: QueryMetrics[];
} {
  const recent = queryMetrics.slice(-100);
  const total = queryMetrics.length;
  const durations = queryMetrics.map((m) => m.duration);
  const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  const slowQueries = queryMetrics.filter((m) => m.duration > 1000).length;
  const errorQueries = queryMetrics.filter((m) => m.error).length;

  return {
    totalQueries: total,
    avgDuration,
    slowQueries,
    errorQueries,
    recentQueries: recent,
  };
}

export async function getConnectionPoolMetrics(): Promise<{
  activeConnections?: number;
  idleConnections?: number;
  totalConnections?: number;
}> {
  try {
    const sql = await getDbConnection();
    return {};
  } catch (error) {
    logger.error("Failed to get connection pool metrics", error);
    return {};
  }
}

export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency: number;
  error?: string;
}> {
  const startTime = Date.now();
  try {
    const sql = await getDbConnection();
    await sql`SELECT 1`;
    const latency = Date.now() - startTime;

    return {
      healthy: true,
      latency,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      healthy: false,
      latency,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
