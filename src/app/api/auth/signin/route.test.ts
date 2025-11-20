/**
 * Integration Tests for /api/auth/signin
 *
 * Tests signin API route with validation and authentication
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest } from '@/shared/test/api-helpers';

// Mock Supabase client
const mockSignInWithPassword = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockUpdate = vi.fn();

vi.mock('@/4-infrastructure/database/supabase-server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
    from: mockFrom,
  }),
}));

describe('POST /api/auth/signin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
  });

  it('returns 400 when email is missing', async () => {
    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      body: {
        password: 'password123',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Email ve şifre zorunludur');
  });

  it('returns 400 when password is missing', async () => {
    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      body: {
        email: 'test@example.com',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Email ve şifre zorunludur');
  });

  it('returns 401 when credentials are invalid', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid credentials' },
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'wrongpassword',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Email veya şifre hatalı');
  });

  it('returns 404 when user is not found in users table', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
        },
      },
      error: null,
    });

    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'User not found' },
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Kullanıcı bulunamadı');
  });

  it('returns 403 when user is not active', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
        },
      },
      error: null,
    });

    mockSingle.mockResolvedValue({
      data: {
        id: 'user-1',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'company_user',
        is_active: false,
        company_id: 'company-1',
      },
      error: null,
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('aktif değil');
  });

  it('signs in successfully and returns user data', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
        },
      },
      error: null,
    });

    mockSingle.mockResolvedValue({
      data: {
        id: 'user-1',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'company_user',
        is_active: true,
        company_id: 'company-1',
        avatar_url: null,
      },
      error: null,
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('user-1');
    expect(data.data.email).toBe('test@example.com');
    expect(data.data.fullName).toBe('Test User');
    expect(data.data.role).toBe('company_user');
    expect(data.message).toBe('Giriş başarılı');
  });

  it('handles errors gracefully', async () => {
    mockSignInWithPassword.mockRejectedValue(new Error('Database error'));

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Giriş sırasında bir hata oluştu');
  });
});
