/**
 * CSRF Protection Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { generateCsrfToken, verifyCsrfToken, csrfProtection, getCsrfTokenFromCookie } from './csrf';

// Mock cookies
const mockCookies = new Map<string, string>();

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: (name: string) => {
      const value = mockCookies.get(name);
      return value ? { value } : undefined;
    },
    set: vi.fn(),
  })),
}));

describe('CSRF Protection', () => {
  beforeEach(() => {
    mockCookies.clear();
    vi.clearAllMocks();
  });

  describe('generateCsrfToken', () => {
    it('should generate a valid token', () => {
      const token = generateCsrfToken();
      expect(token).toBeDefined();
      expect(token.length).toBe(64); // 32 bytes = 64 hex characters
    });

    it('should generate unique tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyCsrfToken', () => {
    it('should allow safe methods without token', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      });
      const result = await verifyCsrfToken(request);
      expect(result).toBe(true);
    });

    it('should reject POST without token', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
      });
      const result = await verifyCsrfToken(request);
      expect(result).toBe(false);
    });

    it('should accept valid token', async () => {
      const token = generateCsrfToken();
      mockCookies.set('csrf-token', token);

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': token,
        },
      });
      const result = await verifyCsrfToken(request);
      expect(result).toBe(true);
    });

    it('should reject mismatched token', async () => {
      const cookieToken = generateCsrfToken();
      const headerToken = generateCsrfToken();
      mockCookies.set('csrf-token', cookieToken);

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': headerToken,
        },
      });
      const result = await verifyCsrfToken(request);
      expect(result).toBe(false);
    });
  });

  describe('csrfProtection', () => {
    it('should allow safe methods', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      });
      const result = await csrfProtection(request);
      expect(result.valid).toBe(true);
    });

    it('should allow public endpoints', async () => {
      const request = new NextRequest('http://localhost:3000/api/public/test', {
        method: 'POST',
      });
      const result = await csrfProtection(request);
      expect(result.valid).toBe(true);
    });

    it('should reject POST without token', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
      });
      const result = await csrfProtection(request);
      expect(result.valid).toBe(false);
      expect(result.response?.status).toBe(403);
    });

    it('should accept valid token', async () => {
      const token = generateCsrfToken();
      mockCookies.set('csrf-token', token);

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'x-csrf-token': token,
        },
      });
      const result = await csrfProtection(request);
      expect(result.valid).toBe(true);
    });
  });
});
