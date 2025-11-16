/**
 * Rate Limiter
 *
 * Token bucket algorithm ile rate limiting
 */

import { AIProvider } from '@/3-domain/enums/AIEnums';
import { defaultRateLimits } from '@/4-infrastructure/config/ai.config';
import { logger } from '@/5-shared/utils/logger';

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
  capacity: number;
  refillRate: number; // tokens per second
}

export class RateLimiter {
  private buckets: Map<AIProvider, Map<string, RateLimitBucket>> = new Map();

  /**
   * Rate limit kontrolü yap
   */
  async checkRateLimit(
    provider: AIProvider,
    limitType: 'perMinute' | 'perHour' | 'perDay'
  ): Promise<boolean> {
    const config = defaultRateLimits[provider];
    let capacity: number;
    let refillRate: number;

    switch (limitType) {
      case 'perMinute':
        capacity = config.perMinute;
        refillRate = config.perMinute / 60; // tokens per second
        break;
      case 'perHour':
        capacity = config.perHour;
        refillRate = config.perHour / 3600; // tokens per second
        break;
      case 'perDay':
        capacity = config.perDay;
        refillRate = config.perDay / 86400; // tokens per second
        break;
    }

    const key = `${provider}-${limitType}`;
    const bucket = this.getBucket(provider, key, capacity, refillRate);

    // Refill tokens
    const now = Date.now();
    const elapsed = (now - bucket.lastRefill) / 1000; // seconds
    const tokensToAdd = elapsed * bucket.refillRate;
    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // Check if we have tokens
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }

    logger.warn(`Rate limit exceeded for ${provider} (${limitType})`);
    return false;
  }

  /**
   * Bucket'ı getir veya oluştur
   */
  private getBucket(
    provider: AIProvider,
    key: string,
    capacity: number,
    refillRate: number
  ): RateLimitBucket {
    if (!this.buckets.has(provider)) {
      this.buckets.set(provider, new Map());
    }

    const providerBuckets = this.buckets.get(provider)!;

    if (!providerBuckets.has(key)) {
      providerBuckets.set(key, {
        tokens: capacity,
        lastRefill: Date.now(),
        capacity,
        refillRate,
      });
    }

    return providerBuckets.get(key)!;
  }

  /**
   * Tüm rate limit'leri kontrol et
   */
  async checkAllRateLimits(provider: AIProvider): Promise<boolean> {
    const checks = await Promise.all([
      this.checkRateLimit(provider, 'perMinute'),
      this.checkRateLimit(provider, 'perHour'),
      this.checkRateLimit(provider, 'perDay'),
    ]);

    return checks.every((check) => check === true);
  }

  /**
   * Rate limit'leri resetle (test için)
   */
  reset(): void {
    this.buckets.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();
