import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logger } from "./logger";


export class InMemoryRateLimiter {
  constructor(public requests: number, public windowMs: number) { }

  async limit(identifier: string): Promise<{ success: boolean; remaining: number; reset: number }> {
    const now = Date.now();
    const key = identifier;

    if (inMemoryStore[key] && inMemoryStore[key].resetTime < now) {
      delete inMemoryStore[key];
    }

    if (!inMemoryStore[key]) {
      inMemoryStore[key] = {
        count: 0,
        resetTime: now + this.windowMs,
      };
    }

    const entry = inMemoryStore[key];
    entry.count++;

    const success = entry.count <= this.requests;
    const remaining = Math.max(0, this.requests - entry.count);
    const reset = entry.resetTime;

    return { success, remaining, reset };
  }
}


const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});


let useUpstash = true;
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  useUpstash = false;
  logger.warn("Upstash Redis not configured, falling back to in-memory rate limiting", {
    url: !!process.env.UPSTASH_REDIS_REST_URL,
    token: !!process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}


interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const inMemoryStore: RateLimitStore = {};


export function createRateLimiter(requests: number, window: string) {
  if (useUpstash) {

    const upstashWindow = convertWindowToUpstashFormat(window);



    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, upstashWindow as `${number} ${"s" | "m" | "h" | "d"}`),
      analytics: true,
      prefix: "@visura/ratelimit",
    });
  } else {
    const windowMs = parseWindowToMs(window);
    return new InMemoryRateLimiter(requests, windowMs);
  }
}


function convertWindowToUpstashFormat(window: string): string {
  const match = window.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid window format: ${window}. Expected format: 10s, 1m, 1h, 1d`);
  }

  const value = match[1];
  const unit = match[2];


  return `${value} ${unit}`;
}

function parseWindowToMs(window: string): number {
  const match = window.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid window format: ${window}. Expected format: 10s, 1m, 1h, 1d`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unknown time unit: ${unit}`);
  }
}


export const chatbotRateLimit = createRateLimiter(10, "1m");
export const uploadRateLimit = createRateLimiter(5, "1h");
export const summaryRateLimit = createRateLimiter(20, "1h");
export const generalAPIRateLimit = createRateLimiter(100, "1m");


export async function checkRateLimit(
  limiter: Ratelimit | InMemoryRateLimiter,
  identifier: string
): Promise<{ allowed: true } | { allowed: false; response: Response }> {
  try {
    let result: { success: boolean; remaining: number; reset: number };

    if (limiter instanceof Ratelimit) {

      const upstashResult = await limiter.limit(identifier);
      result = {
        success: upstashResult.success,
        remaining: upstashResult.remaining,
        reset: upstashResult.reset,
      };
    } else {

      result = await limiter.limit(identifier);
    }

    if (!result.success) {
      const resetDate = new Date(result.reset);

      return {
        allowed: false,
        response: new Response(
          JSON.stringify({
            error: "Rate limit exceeded",
            message: "Too many requests. Please try again later.",
            retryAfter: resetDate.toISOString(),
            remaining: 0,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Remaining": String(result.remaining),
              "X-RateLimit-Reset": String(result.reset),
              "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)),
            },
          }
        ),
      };
    }

    return { allowed: true };
  } catch (error) {
    logger.error("Rate limit check failed", error, { identifier });

    return { allowed: true };
  }
}

export async function getRateLimitStatus(
  limiter: Ratelimit | InMemoryRateLimiter,
  identifier: string
): Promise<{ remaining: number; reset: number }> {
  try {
    if (limiter instanceof Ratelimit) {



      const result = await limiter.limit(identifier);
      return {
        remaining: result.remaining,
        reset: result.reset,
      };
    } else {

      const entry = inMemoryStore[identifier];
      const requests = (limiter as InMemoryRateLimiter)["requests"];
      const windowMs = (limiter as InMemoryRateLimiter)["windowMs"];

      if (!entry || entry.resetTime < Date.now()) {
        return {
          remaining: requests,
          reset: Date.now() + windowMs,
        };
      }

      return {
        remaining: Math.max(0, requests - entry.count),
        reset: entry.resetTime,
      };
    }
  } catch (error) {
    logger.error("Get rate limit status failed", error, { identifier });
    return {
      remaining: 0,
      reset: Date.now(),
    };
  }
}

export async function getRateLimitForUser(userId: string): Promise<Ratelimit | InMemoryRateLimiter> {
  return chatbotRateLimit;
}

let rateLimitHits = 0;
let totalRequests = 0;

export function trackRateLimitHit(endpoint: string, userId: string) {
  rateLimitHits++;
  totalRequests++;

  logger.warn("Rate limit hit", {
    endpoint,
    userId,
    hitRate: totalRequests > 0 ? (rateLimitHits / totalRequests) * 100 : 0,
  });

  if (totalRequests > 1000 && rateLimitHits / totalRequests > 0.1) {
    logger.error("High rate limit hit rate detected", undefined, {
      hitRate: ((rateLimitHits / totalRequests) * 100).toFixed(2),
      endpoint,
    });
  }
}

export function getRateLimitMetrics() {
  return {
    totalRequests,
    rateLimitHits,
    hitRate: totalRequests > 0 ? rateLimitHits / totalRequests : 0,
    usingUpstash: useUpstash,
  };
}
