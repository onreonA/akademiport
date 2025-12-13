/**
 * Integration Tests for /api/projects
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

const mockFindByProjectId = vi.fn();
const mockCreateAssignment = vi.fn();

vi.mock('@/4-infrastructure/database/repositories/ProjectRepository', () => {
  return {
    ProjectRepository: class {
      // Mock methods as needed
    },
  };
});

vi.mock('@/4-infrastructure/database/repositories/SubProjectRepository', () => {
  return {
    SubProjectRepository: class {
      findByProjectId = mockFindByProjectId;
    },
  };
});

vi.mock('@/4-infrastructure/database/repositories/CompanyProjectAssignmentRepository', () => {
  return {
    CompanyProjectAssignmentRepository: class {
      create = mockCreateAssignment;
    },
  };
});

// Mock use cases - use class mock pattern
const mockCreateProjectExecute = vi.fn();
const mockListProjectsExecute = vi.fn();

vi.mock('@/application/use-cases/project', () => ({
  CreateProjectUseCase: class {
    execute = mockCreateProjectExecute;
  },
  ListProjectsUseCase: class {
    execute = mockListProjectsExecute;
  },
}));

describe('GET /api/projects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock sub-project repository
    mockFindByProjectId.mockResolvedValue([]);
    mockCreateAssignment.mockResolvedValue({ id: 'assignment-1' });
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

    mockListProjectsExecute.mockResolvedValue({
      isFailure: false,
      value: {
        data: [], // Route expects 'data' not 'projects'
        total: 0,
        page: 1,
        limit: 20,
      },
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/projects');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.projects).toBeDefined();
    expect(data.total).toBeDefined();
    expect(data.page).toBeDefined();
    expect(data.limit).toBeDefined();
  });

  it('handles query parameters correctly', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockListProjectsExecute.mockResolvedValue({
      isFailure: false,
      value: {
        data: [], // Route expects 'data' not 'projects'
        total: 0,
        page: 2,
        limit: 10,
      },
    });

    const { GET } = await import('./route');
    const request = createMockRequest(
      'http://localhost:3000/api/projects?page=2&limit=10&status=active'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.page).toBe(2);
    expect(data.limit).toBe(10);
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

    mockCreateProjectExecute.mockResolvedValue({
      isFailure: false,
      value: mockProject,
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      body: {
        name: 'Test Project',
        consultantId: 'consultant-1',
        companyId: 'company-1', // Required field - route checks for companyId or companyIds
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

    // Mock use case to return validation error
    mockCreateProjectExecute.mockResolvedValue({
      isFailure: true,
      error: { message: 'Proje adı gereklidir', statusCode: 400 },
    });

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
