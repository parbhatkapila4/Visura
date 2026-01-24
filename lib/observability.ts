
import { logger } from "./logger";

let sentryInitialized = false;

export async function initSentry() {
  if (sentryInitialized) return;

  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!sentryDsn) {
    logger.warn("Sentry DSN not configured, error tracking disabled");
    return;
  }

  try {

    // @ts-expect-error - Sentry is optional dependency, may not be installed
    const SentryModule = await import("@sentry/nextjs").catch(() => null);
    if (!SentryModule) {
      logger.warn("Sentry package not installed, error tracking disabled");
      return;
    }

    SentryModule.init({
      dsn: sentryDsn,
      environment: process.env.NODE_ENV || "development",
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      debug: process.env.NODE_ENV === "development",
      integrations: [
        new SentryModule.Integrations.Http({ tracing: true }),
      ],
      beforeSend(event: any, hint: any) {
        if (process.env.NODE_ENV === "production") {
          const error = hint?.originalException;
          if (error instanceof Error) {
            if (error.message.includes("validation") || error.message.includes("Invalid")) {
              return null;
            }
          }
        }
        return event;
      },
    });

    sentryInitialized = true;
    logger.info("Sentry initialized", { environment: process.env.NODE_ENV });
  } catch (error) {
    logger.error("Failed to initialize Sentry", error);
  }
}

export async function captureException(error: Error, context?: Record<string, unknown>) {
  try {
    // @ts-expect-error - Sentry is optional dependency, may not be installed
    const SentryModule = await import("@sentry/nextjs").catch(() => null);
    if (SentryModule) {
      SentryModule.captureException(error, {
        extra: context,
      });
    } else {
      logger.error("Exception occurred", error, context);
    }
  } catch {
    logger.error("Exception occurred", error, context);
  }
}

export async function captureMessage(message: string, level: "info" | "warning" | "error" = "info", context?: Record<string, unknown>) {
  try {
    // @ts-expect-error - Sentry is optional dependency, may not be installed
    const SentryModule = await import("@sentry/nextjs").catch(() => null);
    if (SentryModule) {
      SentryModule.captureMessage(message, {
        level: level === "info" ? "info" : level === "warning" ? "warning" : "error",
        extra: context,
      });
    } else {
      if (level === "warning") {
        logger.warn(message, context);
      } else if (level === "error") {
        logger.error(message, undefined, context);
      } else {
        logger.info(message, context);
      }
    }
  } catch {
    if (level === "warning") {
      logger.warn(message, context);
    } else if (level === "error") {
      logger.error(message, undefined, context);
    } else {
      logger.info(message, context);
    }
  }
}

let tracingInitialized = false;

export async function initTracing() {
  if (tracingInitialized) return;

  const otelEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  if (!otelEndpoint) {
    logger.warn("OpenTelemetry endpoint not configured, distributed tracing disabled");
    return;
  }

  try {
    logger.info("OpenTelemetry tracing available", { endpoint: otelEndpoint });
    tracingInitialized = true;
  } catch (error) {
    logger.error("Failed to initialize OpenTelemetry", error);
  }
}

export function trace<T extends (...args: any[]) => Promise<any>>(
  name: string,
  fn: T,
  attributes?: Record<string, string | number>
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const startTime = Date.now();
    try {
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      logger.info(`Trace: ${name}`, {
        duration,
        ...attributes,
        success: true,
      });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Trace: ${name} failed`, error, {
        duration,
        ...attributes,
        success: false,
      });
      throw error;
    }
  }) as T;
}

interface BusinessMetric {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: Date;
}

const businessMetrics: BusinessMetric[] = [];

export function trackBusinessMetric(name: string, value: number, tags?: Record<string, string>) {
  const metric: BusinessMetric = {
    name,
    value,
    tags,
    timestamp: new Date(),
  };

  businessMetrics.push(metric);

  if (businessMetrics.length > 1000) {
    businessMetrics.shift();
  }

  logger.info("Business metric tracked", { name, value, tags });
}

export function getBusinessMetrics(name?: string, tags?: Record<string, string>): BusinessMetric[] {
  let filtered = businessMetrics;

  if (name) {
    filtered = filtered.filter((m) => m.name === name);
  }

  if (tags) {
    filtered = filtered.filter((m) => {
      return Object.entries(tags).every(([key, value]) => m.tags?.[key] === value);
    });
  }

  return filtered;
}

export function getBusinessMetricsSummary(name: string): {
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
} {
  const metrics = businessMetrics.filter((m) => m.name === name);
  if (metrics.length === 0) {
    return { count: 0, sum: 0, avg: 0, min: 0, max: 0 };
  }

  const values = metrics.map((m) => m.value);
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return { count: metrics.length, sum, avg, min, max };
}

export function trackPerformanceMetric(operation: string, duration: number, metadata?: Record<string, unknown>) {
  trackBusinessMetric("performance", duration, {
    operation,
    ...(metadata as Record<string, string>),
  });
}

export function trackUserEngagement(event: string, userId: string, metadata?: Record<string, unknown>) {
  trackBusinessMetric("user_engagement", 1, {
    event,
    userId,
    ...(metadata as Record<string, string>),
  });
}

export function trackFeatureUsage(feature: string, userId: string, metadata?: Record<string, unknown>) {
  trackBusinessMetric("feature_usage", 1, {
    feature,
    userId,
    ...(metadata as Record<string, string>),
  });
}
