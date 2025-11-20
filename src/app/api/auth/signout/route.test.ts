/**
 * Integration Tests for /api/auth/signout
 *
 * Tests signout API route
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock AuthService
const mockSignOut = vi.fn();

vi.mock('@/application/services/auth.service', () => ({
  AuthService: {
    signOut: mockSignOut,
  },
}));

describe('POST /api/auth/signout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('signs out successfully', async () => {
    mockSignOut.mockResolvedValue({
      isFailure: false,
      value: undefined,
    });

    const { POST } = await import('./route');
    const response = await POST();

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toBe('Çıkış başarılı');
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('handles signout failure', async () => {
    mockSignOut.mockResolvedValue({
      isFailure: true,
      error: 'Signout failed',
    });

    const { POST } = await import('./route');
    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Signout failed');
  });

  it('handles errors gracefully', async () => {
    mockSignOut.mockRejectedValue(new Error('Service error'));

    const { POST } = await import('./route');
    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Çıkış sırasında bir hata oluştu');
  });
});
