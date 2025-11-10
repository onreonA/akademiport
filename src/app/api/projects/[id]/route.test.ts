/**
 * Integration Tests for /api/projects/[id]
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

// Mock use cases with vi.fn() that returns a constructor
const mockGetProjectUseCase = vi.fn();
const mockUpdateProjectUseCase = vi.fn();
const mockDeleteProjectUseCase = vi.fn();

vi.mock('@/application/use-cases/project', () => ({
  GetProjectUseCase: mockGetProjectUseCase,
  UpdateProjectUseCase: mockUpdateProjectUseCase,
  DeleteProjectUseCase: mockDeleteProjectUseCase,
}));

describe('GET /api/projects/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/projects/project-1');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'project-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns project for consultant when they own it', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT, id: 'consultant-1' });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockProject = {
      id: 'project-1',
      consultantId: 'consultant-1',
      name: 'Test Project',
    };

    // Mock GetProjectUseCase constructor to return an instance with mocked execute
    mockGetProjectUseCase.mockImplementation(
      () =>
        ({
          execute: vi.fn().mockResolvedValue({
            isFailure: false,
            value: mockProject,
          }),
        }) as any
    );

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/projects/project-1');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'project-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe('project-1');
  });

  it('returns 404 when project not found', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockGetProjectUseCase.mockImplementation(
      () =>
        ({
          execute: vi.fn().mockResolvedValue({
            isFailure: true,
            error: { message: 'Project not found', statusCode: 404 },
          }),
        }) as any
    );

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/projects/non-existent');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'non-existent' }),
    });

    expect(response.status).toBe(404);
  });
});

describe('PUT /api/projects/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { PUT } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/projects/project-1', {
      method: 'PUT',
      body: { name: 'Updated Name' },
    });
    const response = await PUT(request, {
      params: Promise.resolve({ id: 'project-1' }),
    });

    expect(response.status).toBe(401);
  });

  it('updates project successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT, id: 'consultant-1' });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const updatedProject = {
      id: 'project-1',
      name: 'Updated Name',
      consultantId: 'consultant-1',
    };

    // Create shared execute mocks
    const getProjectExecuteMock = vi.fn().mockResolvedValue({
      isFailure: false,
      value: updatedProject,
    });

    const updateProjectExecuteMock = vi.fn().mockResolvedValue({
      isFailure: false,
      value: updatedProject,
    });

    // Mock GetProjectUseCase for permission check
    mockGetProjectUseCase.mockImplementation(
      () =>
        ({
          execute: getProjectExecuteMock,
        }) as any
    );

    mockUpdateProjectUseCase.mockImplementation(
      () =>
        ({
          execute: updateProjectExecuteMock,
        }) as any
    );

    const { PUT } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/projects/project-1', {
      method: 'PUT',
      body: { name: 'Updated Name' },
    });
    const response = await PUT(request, {
      params: Promise.resolve({ id: 'project-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

describe('DELETE /api/projects/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/projects/project-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'project-1' }),
    });

    expect(response.status).toBe(401);
  });

  it('deletes project successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT, id: 'consultant-1' });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockProject = {
      id: 'project-1',
      consultantId: 'consultant-1',
      name: 'Test Project',
    };

    // Create a shared execute mock for GetProjectUseCase
    const getProjectExecuteMock = vi.fn().mockResolvedValue({
      isFailure: false,
      value: mockProject,
    });

    // Mock GetProjectUseCase to return the same instance with shared execute mock
    mockGetProjectUseCase.mockImplementation(
      () =>
        ({
          execute: getProjectExecuteMock,
        }) as any
    );

    // Create a shared execute mock for DeleteProjectUseCase
    const deleteProjectExecuteMock = vi.fn().mockResolvedValue({
      isFailure: false,
      value: undefined,
    });

    mockDeleteProjectUseCase.mockImplementation(
      () =>
        ({
          execute: deleteProjectExecuteMock,
        }) as any
    );

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/projects/project-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'project-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
