interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export class InMemoryRateLimiter {
  constructor(private requests: number, private windowMs: number) {}

  async limit(identifier: string): Promise<{ success: boolean; remaining: number; reset: number }> {
    const now = Date.now();
    const key = identifier;

    if (store[key] && store[key].resetTime < now) {
      delete store[key];
    }

    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + this.windowMs,
      };
    }

    const entry = store[key];
    entry.count++;

    const success = entry.count <= this.requests;
    const remaining = Math.max(0, this.requests - entry.count);
    const reset = entry.resetTime;

    return { success, remaining, reset };
  }
}

export const chatbotRateLimit = new InMemoryRateLimiter(10, 60 * 1000);
export const uploadRateLimit = new InMemoryRateLimiter(5, 60 * 60 * 1000);
export const summaryRateLimit = new InMemoryRateLimiter(20, 60 * 60 * 1000);
export const generalAPIRateLimit = new InMemoryRateLimiter(100, 60 * 1000);
export async function checkRateLimit(
  limiter: InMemoryRateLimiter,
  identifier: string
): Promise<{ allowed: true } | { allowed: false; response: Response }> {
  const { success, remaining, reset } = await limiter.limit(identifier);

  if (!success) {
    const resetDate = new Date(reset);

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
            "X-RateLimit-Limit": String(limiter["requests"]),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          },
        }
      ),
    };
  }

  return { allowed: true };
}

export async function getRateLimitStatus(
  limiter: InMemoryRateLimiter,
  identifier: string
): Promise<{ remaining: number; reset: number }> {
  const entry = store[identifier];

  if (!entry || entry.resetTime < Date.now()) {
    return {
      remaining: limiter["requests"],
      reset: Date.now() + limiter["windowMs"],
    };
  }

  return {
    remaining: Math.max(0, limiter["requests"] - entry.count),
    reset: entry.resetTime,
  };
}

export async function getRateLimitForUser(userId: string): Promise<InMemoryRateLimiter> {
  return chatbotRateLimit;
}

let rateLimitHits = 0;
let totalRequests = 0;

export function trackRateLimitHit(endpoint: string, userId: string) {
  rateLimitHits++;
  totalRequests++;

  console.warn(`Rate limit hit: ${endpoint} by user ${userId}`);

  if (totalRequests > 1000 && rateLimitHits / totalRequests > 0.1) {
    console.error(
      `High rate limit hit rate: ${((rateLimitHits / totalRequests) * 100).toFixed(2)}%`
    );
  }
}

export function getRateLimitMetrics() {
  return {
    totalRequests,
    rateLimitHits,
    hitRate: totalRequests > 0 ? rateLimitHits / totalRequests : 0,
  };
}
