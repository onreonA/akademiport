/**
 * Integration Tests for /api/projects
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/4-infrastructure/database/repositories/ProjectRepository', () => ({
  ProjectRepository: vi.fn(),
}));

vi.mock('@/application/use-cases/project', () => ({
  CreateProjectUseCase: vi.fn(),
  ListProjectsUseCase: vi.fn(),
}));

describe('GET /api/projects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/projects');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns projects for consultant', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const executeMock = vi.fn().mockResolvedValue({
      isFailure: false,
      value: {
        projects: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      },
    });

    mockListProjectsUseCase.mockImplementation(
      () =>
        ({
          execute: executeMock,
        }) as any
    );

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/projects');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.projects).toBeDefined();
    expect(data.pagination).toBeDefined();
  });

  it('handles query parameters correctly', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const executeMock = vi.fn().mockResolvedValue({
      isFailure: false,
      value: {
        projects: [],
        total: 0,
        page: 2,
        limit: 10,
        totalPages: 0,
      },
    });

    mockListProjectsUseCase.mockImplementation(
      () =>
        ({
          execute: executeMock,
        }) as any
    );

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/projects?page=2&limit=10&status=active'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.page).toBe(2);
    expect(data.pagination.limit).toBe(10);
  });
});

describe('POST /api/projects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      body: {
        name: 'Test Project',
        consultantId: 'consultant-1',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 403 when user is not consultant or admin', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.COMPANY_USER });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      body: {
        name: 'Test Project',
        consultantId: 'consultant-1',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('creates project successfully for consultant', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.CONSULTANT,
      id: 'consultant-1',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockProject = {
      id: 'project-1',
      name: 'Test Project',
      consultantId: 'consultant-1',
      status: 'planning' as const,
    };

    const executeMock = vi.fn().mockResolvedValue({
      isFailure: false,
      value: mockProject,
    });

    mockCreateProjectUseCase.mockImplementation(
      () =>
        ({
          execute: executeMock,
        }) as any
    );

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      body: {
        name: 'Test Project',
        consultantId: 'consultant-1',
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBe('project-1');
    expect(data.name).toBe('Test Project');
  });

  it('validates required fields', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.CONSULTANT,
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      body: {
        // Missing required fields
        name: '',
      },
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });
});
