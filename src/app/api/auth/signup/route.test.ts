/**
 * Integration Tests for /api/auth/signup
 *
 * Tests signup API route with validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest } from '@/shared/test/api-helpers';

// Mock AuthService
const mockSignUp = vi.fn();

vi.mock('@/application/services/auth.service', () => ({
  AuthService: {
    signUp: mockSignUp,
  },
}));

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when email is missing', async () => {
    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: {
        password: 'password123',
        fullName: 'Test User',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Email, şifre ve tam ad zorunludur');
  });

  it('returns 400 when password is missing', async () => {
    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        fullName: 'Test User',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Email, şifre ve tam ad zorunludur');
  });

  it('returns 400 when fullName is missing', async () => {
    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Email, şifre ve tam ad zorunludur');
  });

  it('signs up successfully', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      fullName: 'Test User',
    };

    mockSignUp.mockResolvedValue({
      isFailure: false,
      value: mockUser,
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      },
    });
    const response = await POST(request);

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockUser);
    expect(data.message).toBe('Kayıt başarılı! Email adresinizi doğrulayın.');
    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      })
    );
  });

  it('signs up with optional fields', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      fullName: 'Test User',
      phone: '555-1234',
      role: 'company_user',
      companyId: 'company-1',
    };

    mockSignUp.mockResolvedValue({
      isFailure: false,
      value: mockUser,
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        phone: '555-1234',
        role: 'company_user',
        companyId: 'company-1',
      },
    });
    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        phone: '555-1234',
        role: 'company_user',
        companyId: 'company-1',
      })
    );
  });

  it('handles signup failure', async () => {
    mockSignUp.mockResolvedValue({
      isFailure: true,
      error: 'Email already exists',
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: {
        email: 'existing@example.com',
        password: 'password123',
        fullName: 'Test User',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Email already exists');
  });

  it('handles errors gracefully', async () => {
    mockSignUp.mockRejectedValue(new Error('Service error'));

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Kayıt sırasında bir hata oluştu');
  });
});
