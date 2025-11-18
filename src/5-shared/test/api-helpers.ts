/**
 * API Test Helpers
 * Utilities for testing Next.js API routes
 */

import { NextRequest } from 'next/server';
import { UserRole } from '@/domain/enums/UserRole';
import { vi } from 'vitest';

// Mock Next.js cookies() function for tests
vi.mock('next/headers', async () => {
  const actual = await vi.importActual('next/headers');
  return {
    ...actual,
    cookies: vi.fn(() => ({
      get: vi.fn(),
      set: vi.fn(),
      getAll: vi.fn(() => []),
      has: vi.fn(),
      delete: vi.fn(),
    })),
  };
});

/**
 * Create a mock NextRequest for testing
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

  const requestHeaders = new Headers(headers);
  if (cookies) {
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

  if (body && method !== 'GET') {
    requestInit.body = typeof body === 'string' ? body : JSON.stringify(body);
    if (!requestHeaders.has('Content-Type')) {
      requestHeaders.set('Content-Type', 'application/json');
    }
  }

  // Remove null signal to match NextRequest type
  const cleanedInit: any = { ...requestInit };
  if (cleanedInit.signal === null) {
    delete cleanedInit.signal;
  }
  return new NextRequest(url, cleanedInit as any);
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
  }>
) {
  return {
    id: overrides?.id || 'test-user-id',
    email: overrides?.email || 'test@example.com',
    role: overrides?.role || UserRole.MASTER_ADMIN,
    full_name: overrides?.fullName || 'Test User',
    ...overrides,
  };
}

/**
 * Mock getAuthenticatedUser helper
 */
export function mockAuthenticatedUser(user: ReturnType<typeof createMockUser>) {
  const { vi } = require('vitest');
  return vi.fn().mockResolvedValue(user);
}
