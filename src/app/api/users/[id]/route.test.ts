/**
 * Integration Tests for /api/users/[id]
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  requireAuth: vi.fn(),
}));

// Mock use cases - use class mock pattern
const mockGetUserExecute = vi.fn();
const mockUpdateUserExecute = vi.fn();
const mockDeleteUserExecute = vi.fn();

vi.mock('@/application/use-cases/user', () => ({
  GetUserUseCase: class {
    execute = mockGetUserExecute;
  },
  UpdateUserUseCase: class {
    execute = mockUpdateUserExecute;
  },
  DeleteUserUseCase: class {
    execute = mockDeleteUserExecute;
  },
}));

describe('GET /api/users/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 500 when user is not authenticated (caught by try-catch)', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(requireAuth).mockRejectedValue(new Error('Unauthorized'));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/users/user-1');

    // Mock params
    const params = Promise.resolve({ id: 'user-1' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });

  it('returns user successfully', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    const mockUser = {
      id: 'user-1',
      email: 'user1@example.com',
      fullName: 'User 1',
      role: UserRole.COMPANY_USER,
    };

    mockGetUserExecute.mockResolvedValue({
      isFailure: false,
      value: mockUser,
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/users/user-1');
    const response = await GET(request, { params: Promise.resolve({ id: 'user-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('user-1');
    expect(mockGetUserExecute).toHaveBeenCalled();
  });

  it('handles use case failure', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    mockGetUserExecute.mockResolvedValue({
      isFailure: true,
      error: { message: 'Kullanıcı bulunamadı' },
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/users/non-existent');
    const response = await GET(request, { params: Promise.resolve({ id: 'non-existent' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toContain('bulunamadı');
  });
});

describe('PATCH /api/users/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates user successfully', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    const { NextRequest } = await import('next/server');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    const mockUpdatedUser = {
      id: 'user-1',
      email: 'user1@example.com',
      fullName: 'Updated User',
      role: UserRole.COMPANY_USER,
      updatedAt: new Date(),
    };

    mockUpdateUserExecute.mockResolvedValue({
      isFailure: false,
      value: mockUpdatedUser,
    });

    const requestBody = {
      fullName: 'Updated User',
    };

    const { PATCH } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/users/user-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Mock json() method using Object.defineProperty
    Object.defineProperty(request, 'json', {
      value: vi.fn().mockResolvedValue(requestBody),
      writable: true,
      configurable: true,
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: 'user-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.fullName).toBe('Updated User');
    expect(mockUpdateUserExecute).toHaveBeenCalled();
  });

  it('handles use case failure', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    const { NextRequest } = await import('next/server');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    mockUpdateUserExecute.mockResolvedValue({
      isFailure: true,
      error: 'Update failed',
    });

    const requestBody = {
      fullName: 'Updated User',
    };

    const { PATCH } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/users/user-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Mock json() method using Object.defineProperty
    Object.defineProperty(request, 'json', {
      value: vi.fn().mockResolvedValue(requestBody),
      writable: true,
      configurable: true,
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: 'user-1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Update failed');
  });
});

describe('DELETE /api/users/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes user successfully', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    mockDeleteUserExecute.mockResolvedValue({
      isFailure: false,
      value: undefined,
    });

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/users/user-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'user-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDeleteUserExecute).toHaveBeenCalled();
  });

  it('handles use case failure', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    mockDeleteUserExecute.mockResolvedValue({
      isFailure: true,
      error: 'Delete failed',
    });

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/users/user-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'user-1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Delete failed');
  });
});
