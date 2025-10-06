import { NextRequest, NextResponse } from 'next/server';

import { logger } from './logger';

// Security headers configuration
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Skip counting successful requests
  skipFailedRequests?: boolean; // Skip counting failed requests
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000
    );
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  private generateKey(request: NextRequest): string {
    // Use IP address as default key
    const ip =
      request.ip ||
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Add user email if available for authenticated requests
    const userEmail = request.cookies.get('auth-user-email')?.value;
    return userEmail ? `${ip}:${userEmail}` : ip;
  }

  check(
    config: RateLimitConfig,
    request: NextRequest
  ): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    const key = config.keyGenerator
      ? config.keyGenerator(request)
      : this.generateKey(request);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get or create entry
    let entry = this.store[key];
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
      };
      this.store[key] = entry;
    }

    // Check if request should be allowed
    const allowed = entry.count < config.maxRequests;

    if (allowed) {
      entry.count++;
    }

    return {
      allowed,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      retryAfter: !allowed
        ? Math.ceil((entry.resetTime - now) / 1000)
        : undefined,
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

// Default rate limit configurations
export const rateLimitConfigs = {
  // General API rate limiting
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
  },

  // Authentication endpoints (more restrictive)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 requests per 15 minutes
  },

  // File upload endpoints
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20, // 20 uploads per hour
  },

  // Bulk operations (very restrictive)
  bulk: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 bulk operations per hour
  },

  // Search endpoints
  search: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 50, // 50 searches per 5 minutes
  },
};

// Rate limiting middleware
export function withRateLimit(config: RateLimitConfig) {
  return function (
    handler: (request: NextRequest, context?: any) => Promise<NextResponse>
  ) {
    return async (
      request: NextRequest,
      context?: any
    ): Promise<NextResponse> => {
      const result = rateLimiter.check(config, request);

      // Add rate limit headers to response
      const response = await handler(request, context);

      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      response.headers.set(
        'X-RateLimit-Remaining',
        result.remaining.toString()
      );
      response.headers.set(
        'X-RateLimit-Reset',
        new Date(result.resetTime).toISOString()
      );

      if (!result.allowed) {
        logger.warn('Rate limit exceeded', {
          endpoint: request.nextUrl.pathname,
          method: request.method,
          ip: request.ip || request.headers.get('x-forwarded-for'),
          retryAfter: result.retryAfter,
        });

        return new NextResponse(
          JSON.stringify({
            error: 'Too many requests',
            message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
            retryAfter: result.retryAfter,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': result.retryAfter?.toString() || '60',
              ...response.headers,
            },
          }
        );
      }

      return response;
    };
  };
}

// Security headers middleware
export function withSecurityHeaders(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const response = await handler(request, context);

    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add HSTS header for HTTPS
    if (request.nextUrl.protocol === 'https:') {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    return response;
  };
}

// Request size limiting middleware
export function withRequestSizeLimit(maxSize: number = 10 * 1024 * 1024) {
  // 10MB default
  return function (
    handler: (request: NextRequest, context?: any) => Promise<NextResponse>
  ) {
    return async (
      request: NextRequest,
      context?: any
    ): Promise<NextResponse> => {
      const contentLength = request.headers.get('content-length');

      if (contentLength && parseInt(contentLength) > maxSize) {
        logger.warn('Request size exceeded', {
          endpoint: request.nextUrl.pathname,
          method: request.method,
          contentLength: parseInt(contentLength),
          maxSize,
        });

        return new NextResponse(
          JSON.stringify({
            error: 'Request too large',
            message: `Request size exceeds maximum allowed size of ${maxSize} bytes`,
          }),
          {
            status: 413,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return handler(request, context);
    };
  };
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T;

  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
}

// SQL injection prevention (basic)
export function sanitizeSqlInput(input: string): string {
  return input
    .replace(/['"]/g, '') // Remove quotes
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comments start
    .replace(/\*\//g, '') // Remove block comments end
    .replace(
      /\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi,
      ''
    ); // Remove SQL keywords
}

// XSS prevention
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// CSRF protection helper
export function generateCSRFToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function validateCSRFToken(
  token: string,
  sessionToken: string
): boolean {
  return token === sessionToken && token.length > 0;
}

// IP whitelist/blacklist
export function isIPAllowed(
  ip: string,
  whitelist?: string[],
  blacklist?: string[]
): boolean {
  // Check blacklist first
  if (blacklist && blacklist.includes(ip)) {
    return false;
  }

  // Check whitelist if provided
  if (whitelist && !whitelist.includes(ip)) {
    return false;
  }

  return true;
}

// Request validation middleware
export function withRequestValidation(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    // Check IP whitelist/blacklist
    const ip =
      request.ip ||
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      'unknown';

    // Add your IP whitelist/blacklist here
    const blacklistedIPs = [
      // Add blacklisted IPs here
    ];

    const whitelistedIPs = [
      // Add whitelisted IPs here (leave empty to allow all)
    ];

    if (
      !isIPAllowed(
        ip,
        whitelistedIPs.length > 0 ? whitelistedIPs : undefined,
        blacklistedIPs
      )
    ) {
      logger.warn('Blocked request from IP', {
        ip,
        endpoint: request.nextUrl.pathname,
      });

      return new NextResponse(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate User-Agent (basic bot detection)
    const userAgent = request.headers.get('user-agent');
    if (!userAgent || userAgent.length < 10) {
      logger.warn('Request with suspicious User-Agent', { userAgent, ip });

      return new NextResponse(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return handler(request, context);
  };
}

// Combined security middleware
export function withSecurity(
  rateLimitConfig: RateLimitConfig = rateLimitConfigs.api,
  maxRequestSize: number = 10 * 1024 * 1024
) {
  return function (
    handler: (request: NextRequest, context?: any) => Promise<NextResponse>
  ) {
    return withSecurityHeaders(
      withRateLimit(rateLimitConfig)(
        withRequestSizeLimit(maxRequestSize)(withRequestValidation(handler))
      )
    );
  };
}

// Cleanup function for graceful shutdown
export function cleanupSecurity(): void {
  rateLimiter.destroy();
}
