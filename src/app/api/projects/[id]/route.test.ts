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

// Mock use cases - use class mock pattern
const mockGetProjectExecute = vi.fn();
const mockUpdateProjectExecute = vi.fn();
const mockDeleteProjectExecute = vi.fn();

vi.mock('@/application/use-cases/project', () => ({
  GetProjectUseCase: class {
    execute = mockGetProjectExecute;
  },
  UpdateProjectUseCase: class {
    execute = mockUpdateProjectExecute;
  },
  DeleteProjectUseCase: class {
    execute = mockDeleteProjectExecute;
  },
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

    mockGetProjectExecute.mockResolvedValue({
      isFailure: false,
      value: mockProject,
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/projects/project-1');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'project-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe('project-1');
    expect(data.name).toBe('Test Project');
  });

  it('returns 404 when project not found', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockGetProjectExecute.mockResolvedValue({
      isFailure: true,
      error: { message: 'Project not found', statusCode: 404 },
    });

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

    // Mock GetProjectUseCase for permission check
    mockGetProjectExecute.mockResolvedValue({
      isFailure: false,
      value: updatedProject,
    });

    mockUpdateProjectExecute.mockResolvedValue({
      isFailure: false,
      value: updatedProject,
    });

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

    // Mock GetProjectUseCase for permission check
    mockGetProjectExecute.mockResolvedValue({
      isFailure: false,
      value: mockProject,
    });

    mockDeleteProjectExecute.mockResolvedValue({
      isFailure: false,
      value: undefined,
    });

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
