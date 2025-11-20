/**
 * Integration Tests for /api/auth/me
 *
 * Tests get current user API route
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock AuthService
const mockGetCurrentUser = vi.fn();

vi.mock('@/application/services/auth.service', () => ({
  AuthService: {
    getCurrentUser: mockGetCurrentUser,
  },
}));

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns current user successfully', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'company_user',
      companyId: 'company-1',
    };

    mockGetCurrentUser.mockResolvedValue({
      isFailure: false,
      value: mockUser,
    });

    const { GET } = await import('./route');
    const response = await GET();

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockUser);
    expect(mockGetCurrentUser).toHaveBeenCalled();
  });

  it('returns 401 when user is not found', async () => {
    mockGetCurrentUser.mockResolvedValue({
      isFailure: false,
      value: null,
    });

    const { GET } = await import('./route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Kullanıcı bulunamadı');
  });

  it('handles service failure', async () => {
    mockGetCurrentUser.mockResolvedValue({
      isFailure: true,
      error: 'Service error',
    });

    const { GET } = await import('./route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Service error');
  });

  it('handles errors gracefully', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('Database error'));

    const { GET } = await import('./route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Kullanıcı bilgileri alınırken hata oluştu');
  });
});
