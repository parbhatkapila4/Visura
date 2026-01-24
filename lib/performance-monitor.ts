import { logger } from "./logger";

interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

const metrics: Metric[] = [];
const MAX_METRICS = 10000;

export function recordMetric(
  name: string,
  value: number,
  tags?: Record<string, string>
): void {
  metrics.push({
    name,
    value,
    timestamp: Date.now(),
    tags,
  });

  if (metrics.length > MAX_METRICS) {
    metrics.splice(0, metrics.length - MAX_METRICS);
  }
}

function calculatePercentiles(values: number[]): {
  p50: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  mean: number;
  count: number;
} {
  if (values.length === 0) {
    return {
      p50: 0,
      p95: 0,
      p99: 0,
      min: 0,
      max: 0,
      mean: 0,
      count: 0,
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / count;

  const p50Index = Math.floor(count * 0.5);
  const p95Index = Math.floor(count * 0.95);
  const p99Index = Math.floor(count * 0.99);

  return {
    p50: sorted[p50Index] || 0,
    p95: sorted[p95Index] || 0,
    p99: sorted[p99Index] || 0,
    min: sorted[0] || 0,
    max: sorted[count - 1] || 0,
    mean,
    count,
  };
}

export function getMetricStats(
  name: string,
  timeWindowMs: number = 60 * 60 * 1000
): {
  p50: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  mean: number;
  count: number;
} {
  const now = Date.now();
  const cutoff = now - timeWindowMs;

  const relevantMetrics = metrics.filter(
    (m) => m.name === name && m.timestamp >= cutoff
  );

  const values = relevantMetrics.map((m) => m.value);
  return calculatePercentiles(values);
}

export function getMetricNames(): string[] {
  const names = new Set<string>();
  for (const metric of metrics) {
    names.add(metric.name);
  }
  return Array.from(names);
}

export function getMetricStatsByTags(
  name: string,
  tagKey: string,
  timeWindowMs: number = 60 * 60 * 1000
): Record<string, ReturnType<typeof calculatePercentiles>> {
  const now = Date.now();
  const cutoff = now - timeWindowMs;

  const relevantMetrics = metrics.filter(
    (m) => m.name === name && m.timestamp >= cutoff
  );

  const grouped: Record<string, number[]> = {};

  for (const metric of relevantMetrics) {
    const tagValue = metric.tags?.[tagKey] || "unknown";
    if (!grouped[tagValue]) {
      grouped[tagValue] = [];
    }
    grouped[tagValue].push(metric.value);
  }

  const result: Record<string, ReturnType<typeof calculatePercentiles>> = {};
  for (const [tagValue, values] of Object.entries(grouped)) {
    result[tagValue] = calculatePercentiles(values);
  }

  return result;
}

export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    recordMetric(name, duration, tags);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    recordMetric(`${name}_error`, duration, { ...tags, error: "true" });
    throw error;
  }
}

export function getMetricsSummary(timeWindowMs: number = 60 * 60 * 1000): Record<
  string,
  {
    p50: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
    mean: number;
    count: number;
  }
> {
  const names = getMetricNames();
  const summary: Record<string, ReturnType<typeof calculatePercentiles>> = {};

  for (const name of names) {
    summary[name] = getMetricStats(name, timeWindowMs);
  }

  return summary;
}

export function logPerformanceSummary(timeWindowMs: number = 60 * 60 * 1000): void {
  const summary = getMetricsSummary(timeWindowMs);

  logger.info("Performance metrics summary", {
    timeWindowMs,
    metrics: Object.entries(summary).map(([name, stats]) => ({
      name,
      ...stats,
    })),
  });
}
