/**
 * API Rate Limiter
 *
 * Token bucket algorithm ile genel API rate limiting
 * User-based ve IP-based rate limiting desteği
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/5-shared/utils/logger';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
}

interface RateLimitBucket {
  count: number;
  resetTime: number;
}

// In-memory store (production'da Redis kullanılmalı)
const rateLimitStore = new Map<string, RateLimitBucket>();

// Default rate limit configurations
const defaultRateLimits: Record<string, RateLimitConfig> = {
  // Public endpoints - more lenient
  public: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: 'Too many requests. Please try again later.',
  },
  // Authenticated endpoints
  authenticated: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200,
    message: 'Too many requests. Please try again later.',
  },
  // Write operations (POST, PUT, DELETE)
  write: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50,
    message: 'Too many write requests. Please slow down.',
  },
  // AI endpoints - stricter
  ai: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    message: 'AI endpoint rate limit exceeded. Please try again later.',
  },
};

/**
 * Get identifier for rate limiting (user ID or IP)
 */
function getIdentifier(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  // Fallback to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

/**
 * Clean up expired entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, bucket] of rateLimitStore.entries()) {
    if (bucket.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}

/**
 * Check rate limit
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  userId?: string
): { allowed: boolean; remaining: number; resetTime: number } {
  const identifier = getIdentifier(request, userId);
  const key = `${identifier}:${config.windowMs}`;
  const now = Date.now();

  // Cleanup old entries periodically
  if (Math.random() < 0.01) {
    // 1% chance to cleanup
    cleanupExpiredEntries();
  }

  let bucket = rateLimitStore.get(key);

  // Create new bucket or reset expired bucket
  if (!bucket || bucket.resetTime < now) {
    bucket = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, bucket);
  }

  // Check if limit exceeded
  if (bucket.count >= config.maxRequests) {
    logger.warn(`Rate limit exceeded for ${identifier}`, {
      count: bucket.count,
      maxRequests: config.maxRequests,
      resetTime: bucket.resetTime,
    });

    return {
      allowed: false,
      remaining: 0,
      resetTime: bucket.resetTime,
    };
  }

  // Increment count
  bucket.count += 1;
  rateLimitStore.set(key, bucket);

  return {
    allowed: true,
    remaining: config.maxRequests - bucket.count,
    resetTime: bucket.resetTime,
  };
}

/**
 * Rate limit middleware
 */
export function rateLimitMiddleware(
  request: NextRequest,
  type: keyof typeof defaultRateLimits = 'authenticated',
  userId?: string
): NextResponse | null {
  const config = defaultRateLimits[type] || defaultRateLimits.authenticated;
  const result = checkRateLimit(request, config, userId);

  if (!result.allowed) {
    const response = NextResponse.json(
      {
        error: config.message || 'Too many requests',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      },
      { status: 429 }
    );

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
    response.headers.set(
      'Retry-After',
      Math.ceil((result.resetTime - Date.now()) / 1000).toString()
    );

    return response;
  }

  // Add rate limit headers even on success
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

  return null; // null means continue
}

/**
 * Get rate limit config for endpoint
 */
export function getRateLimitConfig(
  endpoint: string,
  method: string
): keyof typeof defaultRateLimits {
  // AI endpoints
  if (endpoint.includes('/ai/')) {
    return 'ai';
  }

  // Write operations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return 'write';
  }

  // Public endpoints
  if (endpoint.includes('/api/public') || endpoint.includes('/api/auth')) {
    return 'public';
  }

  // Default authenticated
  return 'authenticated';
}
