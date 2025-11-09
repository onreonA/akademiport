/**
 * Integration Tests for /api/consultant/tasks
 *
 * Note: These tests verify the API route structure and authentication/authorization.
 * For full integration tests, you would need to set up a test database.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

// Mock all dependencies before importing the route
vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/4-infrastructure/database/repositories/TaskRepository', () => ({
  TaskRepository: vi.fn(),
}));

vi.mock('@/4-infrastructure/database/repositories/ProjectRepository', () => ({
  ProjectRepository: vi.fn(),
}));

vi.mock('@/4-infrastructure/database/repositories/SubProjectRepository', () => ({
  SubProjectRepository: vi.fn(),
}));

vi.mock('@/application/use-cases/task', () => ({
  ListConsultantTasksUseCase: vi.fn(),
}));

describe('GET /api/consultant/tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/consultant/tasks');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 403 when user is not consultant or master_admin', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const user = createMockUser({ role: UserRole.COMPANY_USER });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/consultant/tasks');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('allows consultant role to access endpoint', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const { ListConsultantTasksUseCase } = await import('@/application/use-cases/task');

    const user = createMockUser({ role: UserRole.CONSULTANT });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    // Mock use case
    vi.mocked(ListConsultantTasksUseCase).mockImplementation(
      () =>
        ({
          execute: vi.fn().mockResolvedValue({
            isFailure: false,
            value: {
              tasks: [],
              total: 0,
              page: 1,
              limit: 12,
              totalPages: 0,
            },
          }),
        }) as any
    );

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/consultant/tasks');
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('allows master_admin role to access endpoint', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const { ListConsultantTasksUseCase } = await import('@/application/use-cases/task');

    const user = createMockUser({ role: UserRole.MASTER_ADMIN });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    vi.mocked(ListConsultantTasksUseCase).mockImplementation(
      () =>
        ({
          execute: vi.fn().mockResolvedValue({
            isFailure: false,
            value: {
              tasks: [],
              total: 0,
              page: 1,
              limit: 12,
              totalPages: 0,
            },
          }),
        }) as any
    );

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/consultant/tasks');
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('handles query parameters correctly', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    const { ListConsultantTasksUseCase } = await import('@/application/use-cases/task');

    const user = createMockUser({ role: UserRole.CONSULTANT });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const executeMock = vi.fn().mockResolvedValue({
      isFailure: false,
      value: {
        tasks: [],
        total: 0,
        page: 2,
        limit: 20,
        totalPages: 0,
      },
    });

    vi.mocked(ListConsultantTasksUseCase).mockImplementation(
      () =>
        ({
          execute: executeMock,
        }) as any
    );

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/consultant/tasks?page=2&limit=20&status=review'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination).toBeDefined();
    expect(data.pagination.page).toBe(2);
    expect(data.pagination.limit).toBe(20);
  });
});
