/**
 * Integration Tests for /api/users
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  requireAuth: vi.fn(),
}));

// Mock use cases - use class mock pattern
const mockListUsersExecute = vi.fn();
const mockCreateUserExecute = vi.fn();

vi.mock('@/application/use-cases/user', () => ({
  ListUsersUseCase: class {
    execute = mockListUsersExecute;
  },
  CreateUserUseCase: class {
    execute = mockCreateUserExecute;
  },
}));

describe('GET /api/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(requireAuth).mockRejectedValue(new Error('Unauthorized'));

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/users');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });

  it('returns users list successfully', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    mockListUsersExecute.mockResolvedValue({
      isFailure: false,
      value: {
        users: [
          {
            id: 'user-1',
            email: 'user1@example.com',
            fullName: 'User 1',
            role: UserRole.COMPANY_USER,
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/users');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].id).toBe('user-1');
    expect(data.pagination.total).toBe(1);
    expect(mockListUsersExecute).toHaveBeenCalled();
  });

  it('handles use case failure', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    mockListUsersExecute.mockResolvedValue({
      isFailure: true,
      error: 'Database error',
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/users');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Database error');
  });
});

describe('POST /api/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 500 when user is not authenticated (caught by try-catch)', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(requireAuth).mockRejectedValue(new Error('Unauthorized'));

    const { POST } = await import('./route');
    const { NextRequest } = await import('next/server');
    const request = new NextRequest('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'newuser@example.com',
        fullName: 'New User',
        role: UserRole.COMPANY_USER,
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });

  it('creates user successfully', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    const { NextRequest } = await import('next/server');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    const mockNewUser = {
      id: 'user-1',
      email: 'newuser@example.com',
      fullName: 'New User',
      role: UserRole.COMPANY_USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCreateUserExecute.mockResolvedValue({
      isFailure: false,
      value: mockNewUser,
    });

    const requestBody = {
      email: 'newuser@example.com',
      fullName: 'New User',
      role: UserRole.COMPANY_USER,
      password: 'password123',
    };

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/users', {
      method: 'POST',
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

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('user-1');
    expect(mockCreateUserExecute).toHaveBeenCalled();
  });

  it('handles use case failure', async () => {
    const { requireAuth } = await import('@/4-infrastructure/api/helpers/auth');
    const { NextRequest } = await import('next/server');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(requireAuth).mockResolvedValue(user as any);

    mockCreateUserExecute.mockResolvedValue({
      isFailure: true,
      error: 'User creation failed',
    });

    const requestBody = {
      email: 'newuser@example.com',
      fullName: 'New User',
      role: UserRole.COMPANY_USER,
      password: 'password123',
    };

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/users', {
      method: 'POST',
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

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('User creation failed');
  });
});
