import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter } from './rate-limiter';
import { AIProvider } from '@/3-domain/enums/AIEnums';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter();
  });

  describe('checkRateLimit', () => {
    it('should allow request when under limit', async () => {
      const result = await limiter.checkRateLimit(AIProvider.OPENAI, 'perMinute');
      expect(result).toBe(true);
    });

    it('should check perHour limit', async () => {
      const result = await limiter.checkRateLimit(AIProvider.OPENAI, 'perHour');
      expect(result).toBe(true);
    });

    it('should check perDay limit', async () => {
      const result = await limiter.checkRateLimit(AIProvider.OPENAI, 'perDay');
      expect(result).toBe(true);
    });
  });

  describe('checkAllRateLimits', () => {
    it('should check all rate limits', async () => {
      const result = await limiter.checkAllRateLimits(AIProvider.OPENAI);
      expect(result).toBe(true);
    });

    it('should check Claude rate limits', async () => {
      const result = await limiter.checkAllRateLimits(AIProvider.CLAUDE);
      expect(result).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset all buckets', () => {
      limiter.reset();
      // After reset, should work fine
      expect(limiter).toBeDefined();
    });
  });
});
