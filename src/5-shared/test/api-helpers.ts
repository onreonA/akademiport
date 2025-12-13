/**
 * API Test Helpers
 * Utilities for testing Next.js API routes
 */

import { NextRequest } from 'next/server';
import { UserRole } from '@/domain/enums/UserRole';
import { vi } from 'vitest';

// Store cookies per test to ensure isolation
let testCookies: Map<string, string> = new Map();

/**
 * Reset test cookies (call in beforeEach)
 */
export function resetTestCookies() {
  testCookies.clear();
}

/**
 * Set a test cookie
 */
export function setTestCookie(name: string, value: string) {
  testCookies.set(name, value);
}

/**
 * Get a test cookie
 */
export function getTestCookie(name: string): string | undefined {
  return testCookies.get(name);
}

// Mock Next.js cookies() function for tests
// This mock is improved to handle async cookies() calls properly
vi.mock('next/headers', async () => {
  const actual = await vi.importActual<typeof import('next/headers')>('next/headers');

  return {
    ...actual,
    cookies: vi.fn(async () => {
      // Return a mock cookie store that uses testCookies
      return {
        get: vi.fn((name: string) => {
          const value = testCookies.get(name);
          return value ? { name, value } : undefined;
        }),
        set: vi.fn((name: string, value: string) => {
          testCookies.set(name, value);
        }),
        getAll: vi.fn(() => {
          return Array.from(testCookies.entries()).map(([name, value]) => ({
            name,
            value,
          }));
        }),
        has: vi.fn((name: string) => testCookies.has(name)),
        delete: vi.fn((name: string) => {
          testCookies.delete(name);
        }),
      };
    }),
  };
});

/**
 * Create a mock NextRequest for testing
 *
 * This function also sets up test cookies for proper isolation
 */
export function createMockRequest(
  url: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    cookies?: Record<string, string>;
  }
): NextRequest {
  const { method = 'GET', headers = {}, body, cookies = {} } = options || {};

  // Set test cookies for this request
  if (cookies) {
    Object.entries(cookies).forEach(([key, value]) => {
      setTestCookie(key, value);
    });
  }

  const requestHeaders = new Headers(headers);
  if (cookies && Object.keys(cookies).length > 0) {
    const cookieString = Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    if (cookieString) {
      requestHeaders.set('cookie', cookieString);
    }
  }

  const requestInit: RequestInit = {
    method,
    headers: requestHeaders,
  };

  let parsedBody: any = null;
  if (body && method !== 'GET') {
    requestInit.body = typeof body === 'string' ? body : JSON.stringify(body);
    if (!requestHeaders.has('Content-Type')) {
      requestHeaders.set('Content-Type', 'application/json');
    }
    // Parse body for json() method
    try {
      parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
    } catch {
      parsedBody = body;
    }
  }

  // Remove null signal to match NextRequest type
  const cleanedInit: any = { ...requestInit };
  if (cleanedInit.signal === null) {
    delete cleanedInit.signal;
  }
  const request = new NextRequest(url, cleanedInit as any);

  // Mock json() method if body exists - use Object.defineProperty for better compatibility
  if (parsedBody !== null && method !== 'GET') {
    Object.defineProperty(request, 'json', {
      value: vi.fn().mockResolvedValue(parsedBody),
      writable: true,
      configurable: true,
      enumerable: false,
    });
  }

  return request;
}

/**
 * Create a mock authenticated user for testing
 */
export function createMockUser(
  overrides?: Partial<{
    id: string;
    email: string;
    role: UserRole;
    fullName: string;
    companyId?: string;
  }>
) {
  return {
    id: overrides?.id || 'test-user-id',
    email: overrides?.email || 'test@example.com',
    role: overrides?.role || UserRole.MASTER_ADMIN,
    full_name: overrides?.fullName || 'Test User',
    company_id: overrides?.companyId,
    ...overrides,
  };
}

/**
 * Mock getAuthenticatedUser helper
 */
export function mockAuthenticatedUser(user: ReturnType<typeof createMockUser>) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { vi } = require('vitest');
  return vi.fn().mockResolvedValue(user);
}
