/**
 * CSRF Protection Middleware
 *
 * Double Submit Cookie pattern ile CSRF koruması
 * Next.js App Router için optimize edilmiş
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const CSRF_TOKEN_COOKIE_NAME = 'csrf-token';
const CSRF_TOKEN_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get CSRF token from cookie
 */
export async function getCsrfTokenFromCookie(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CSRF_TOKEN_COOKIE_NAME);
    return token?.value || null;
  } catch {
    return null;
  }
}

/**
 * Set CSRF token in cookie
 */
export function setCsrfTokenCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_TOKEN_COOKIE_NAME, token, {
    httpOnly: false, // Must be accessible to JavaScript for Double Submit Cookie pattern
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CSRF_TOKEN_EXPIRY / 1000,
    path: '/',
  });
}

/**
 * Verify CSRF token
 */
export async function verifyCsrfToken(
  request: NextRequest,
  tokenFromHeader?: string
): Promise<boolean> {
  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }

  // Get token from header
  const headerToken = tokenFromHeader || request.headers.get(CSRF_TOKEN_HEADER_NAME);
  if (!headerToken) {
    return false;
  }

  // Get token from cookie
  const cookieToken = await getCsrfTokenFromCookie();
  if (!cookieToken) {
    return false;
  }

  // Compare tokens (constant-time comparison to prevent timing attacks)
  // Ensure both tokens are same length to prevent timing leaks
  if (headerToken.length !== cookieToken.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(Buffer.from(headerToken), Buffer.from(cookieToken));
  } catch {
    return false;
  }
}

/**
 * CSRF protection middleware
 */
export async function csrfProtection(
  request: NextRequest
): Promise<{ valid: boolean; response?: NextResponse }> {
  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return { valid: true };
  }

  // Skip CSRF check for public endpoints
  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith('/api/public') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/webhook') // Webhooks typically use other auth methods
  ) {
    return { valid: true };
  }

  // Verify CSRF token
  const isValid = await verifyCsrfToken(request);

  if (!isValid) {
    return {
      valid: false,
      response: NextResponse.json({ error: 'CSRF token validation failed' }, { status: 403 }),
    };
  }

  return { valid: true };
}

/**
 * Initialize CSRF token for new sessions
 */
export async function initializeCsrfToken(
  request: NextRequest,
  response: NextResponse
): Promise<void> {
  // Check if token already exists
  const existingToken = await getCsrfTokenFromCookie();
  if (existingToken) {
    return;
  }

  // Generate and set new token
  const token = generateCsrfToken();
  setCsrfTokenCookie(response, token);
}

/**
 * Get CSRF token for client-side use
 */
export async function getCsrfToken(): Promise<string | null> {
  return await getCsrfTokenFromCookie();
}
