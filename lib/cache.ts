
import { Redis } from "@upstash/redis";
import { logger } from "./logger";


let redis: Redis | null = null;
let useRedis = false;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    useRedis = true;
    logger.info("Redis cache initialized");
  } else {
    logger.warn("Redis not configured, using in-memory cache", {
      hasUrl: !!process.env.UPSTASH_REDIS_REST_URL,
      hasToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (error) {
  logger.error("Failed to initialize Redis cache", error);
}


interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const inMemoryCache = new Map<string, CacheEntry<unknown>>();


export async function get<T>(key: string): Promise<T | null> {
  try {
    if (useRedis && redis) {
      const value = await redis.get<T>(key);
      return value;
    } else {

      const entry = inMemoryCache.get(key) as CacheEntry<T> | undefined;
      if (!entry) {
        return null;
      }

      if (entry.expiresAt < Date.now()) {
        inMemoryCache.delete(key);
        return null;
      }

      return entry.value;
    }
  } catch (error) {
    logger.error("Cache get error", error, { key });
    return null;
  }
}


export async function set<T>(
  key: string,
  value: T,
  ttlSeconds: number = 3600
): Promise<boolean> {
  try {
    if (useRedis && redis) {
      await redis.setex(key, ttlSeconds, value);
      return true;
    } else {
      inMemoryCache.set(key, {
        value,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });

      if (inMemoryCache.size > 1000) {
        const now = Date.now();
        for (const [k, entry] of inMemoryCache.entries()) {
          if (entry.expiresAt < now) {
            inMemoryCache.delete(k);
          }
        }
      }

      return true;
    }
  } catch (error) {
    logger.error("Cache set error", error, { key });
    return false;
  }
}

export async function del(key: string): Promise<boolean> {
  try {
    if (useRedis && redis) {
      await redis.del(key);
      return true;
    } else {
      inMemoryCache.delete(key);
      return true;
    }
  } catch (error) {
    logger.error("Cache delete error", error, { key });
    return false;
  }
}

export async function delPattern(pattern: string): Promise<number> {
  try {
    if (useRedis && redis) {
      logger.warn("Pattern deletion not fully supported with Upstash Redis", { pattern });
      return 0;
    } else {
      let deleted = 0;
      const regex = new RegExp(pattern.replace("*", ".*"));
      for (const key of inMemoryCache.keys()) {
        if (regex.test(key)) {
          inMemoryCache.delete(key);
          deleted++;
        }
      }
      return deleted;
    }
  } catch (error) {
    logger.error("Cache pattern delete error", error, { pattern });
    return 0;
  }
}

export function getSummaryCacheKey(textHash: string, language: string): string {
  return `summary:${textHash}:${language}`;
}

export function getClassificationCacheKey(textHash: string): string {
  return `classification:${textHash}`;
}

export function getQueryCacheKey(table: string, params: Record<string, unknown>): string {
  const paramsHash = Buffer.from(JSON.stringify(params)).toString("base64");
  return `query:${table}:${paramsHash}`;
}

export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  const cached = await get<T>(key);
  if (cached !== null) {
    logger.info("Cache hit", { key });
    return cached;
  }

  logger.info("Cache miss, computing value", { key });
  const value = await fn();
  await set(key, value, ttlSeconds);
  return value;
}
