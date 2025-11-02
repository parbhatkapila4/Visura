import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRateLimiter, checkRateLimit } from '@/lib/rate-limit';

describe('Rate Limiting', () => {
  describe('InMemoryRateLimiter', () => {
    let limiter: InMemoryRateLimiter;

    beforeEach(() => {
      // 3 requests per 1 second window
      limiter = new InMemoryRateLimiter(3, 1000);
    });

    it('should allow requests within limit', async () => {
      const result1 = await limiter.limit('user123');
      const result2 = await limiter.limit('user123');
      const result3 = await limiter.limit('user123');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);
    });

    it('should block requests over limit', async () => {
      await limiter.limit('user123');
      await limiter.limit('user123');
      await limiter.limit('user123');
      
      const result4 = await limiter.limit('user123');
      expect(result4.success).toBe(false);
    });

    it('should track remaining requests correctly', async () => {
      const result1 = await limiter.limit('user123');
      expect(result1.remaining).toBe(2);
      
      const result2 = await limiter.limit('user123');
      expect(result2.remaining).toBe(1);
      
      const result3 = await limiter.limit('user123');
      expect(result3.remaining).toBe(0);
    });

    it('should reset after window expires', async () => {
      await limiter.limit('user123');
      await limiter.limit('user123');
      await limiter.limit('user123');
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const result = await limiter.limit('user123');
      expect(result.success).toBe(true);
    });

    it('should handle different users separately', async () => {
      await limiter.limit('user1');
      await limiter.limit('user1');
      await limiter.limit('user1');
      
      // User 2 should still have full quota
      const result = await limiter.limit('user2');
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(2);
    });
  });

  describe('checkRateLimit', () => {
    it('should return allowed:true when under limit', async () => {
      const limiter = new InMemoryRateLimiter(5, 60000);
      const result = await checkRateLimit(limiter, 'user123');
      
      expect(result.allowed).toBe(true);
    });

    it('should return Response with 429 status when over limit', async () => {
      const limiter = new InMemoryRateLimiter(1, 60000);
      
      await limiter.limit('user123');
      const result = await checkRateLimit(limiter, 'user123');
      
      expect(result.allowed).toBe(false);
      if (!result.allowed) {
        expect(result.response).toBeInstanceOf(Response);
        expect(result.response.status).toBe(429);
      }
    });

    it('should include rate limit headers in response', async () => {
      const limiter = new InMemoryRateLimiter(1, 60000);
      
      await limiter.limit('user123');
      const result = await checkRateLimit(limiter, 'user123');
      
      if (!result.allowed) {
        expect(result.response.headers.get('X-RateLimit-Limit')).toBeTruthy();
        expect(result.response.headers.get('X-RateLimit-Remaining')).toBeTruthy();
        expect(result.response.headers.get('Retry-After')).toBeTruthy();
      }
    });
  });
});

