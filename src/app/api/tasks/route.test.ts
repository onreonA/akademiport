/**
 * Integration Tests for /api/tasks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

vi.mock('@/infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock repositories - create mock instances
const mockTaskRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findBySubProject: vi.fn(),
  findByAssignedUser: vi.fn(),
  findByAssignedUserId: vi.fn(),
  complete: vi.fn(),
  approve: vi.fn(),
  reject: vi.fn(),
  assign: vi.fn(),
  assignTo: vi.fn(),
  exists: vi.fn(),
  findBySubProjectIds: vi.fn(),
};

const mockSubProjectRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findByProjectId: vi.fn(),
  exists: vi.fn(),
};

// Mock repositories - these will be used by the use cases
vi.mock('@/infrastructure/database/repositories/TaskRepository', () => ({
  TaskRepository: class {
    constructor() {
      return mockTaskRepository;
    }
  },
}));

vi.mock('@/infrastructure/database/repositories/SubProjectRepository', () => ({
  SubProjectRepository: class {
    constructor() {
      return mockSubProjectRepository;
    }
  },
}));

// Mock use cases - route creates new instances, so we need to mock the class constructor
const mockListUserTasksExecute = vi.fn();
const mockCreateTaskExecute = vi.fn();

vi.mock('@/application/use-cases/task', async () => {
  const actual = await vi.importActual('@/application/use-cases/task');
  return {
    ...actual,
    ListUserTasksUseCase: class {
      constructor() {
        // Constructor accepts repository but we don't need it for mocking
      }
      execute = mockListUserTasksExecute;
    },
    CreateTaskUseCase: class {
      constructor() {
        // Constructor accepts repositories but we don't need them for mocking
      }
      execute = mockCreateTaskExecute;
    },
  };
});

describe('GET /api/tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/tasks');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns tasks list successfully', async () => {
    const { getAuthenticatedUser } = await import('@/infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.COMPANY_USER });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockListUserTasksExecute.mockResolvedValue({
      isFailure: false,
      value: [
        {
          id: 'task-1',
          title: 'Test Task',
          status: 'todo',
          priority: 'normal',
        },
      ],
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/tasks');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].id).toBe('task-1');
    expect(mockListUserTasksExecute).toHaveBeenCalled();
  });

  it('handles query parameters', async () => {
    const { getAuthenticatedUser } = await import('@/infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.COMPANY_USER });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockListUserTasksExecute.mockResolvedValue({
      isFailure: false,
      isSuccess: true,
      value: [],
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/tasks?status=done&priority=high');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockListUserTasksExecute).toHaveBeenCalled();
  });

  it('handles use case failure', async () => {
    const { getAuthenticatedUser } = await import('@/infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.COMPANY_USER });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockListUserTasksExecute.mockResolvedValue({
      isFailure: true,
      error: { message: 'Database error', statusCode: 500 },
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/tasks');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });
});

describe('POST /api/tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { POST } = await import('./route');
    const { NextRequest } = await import('next/server');
    const request = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'New Task',
        subProjectId: 'subproject-1',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('creates task successfully', async () => {
    const { getAuthenticatedUser } = await import('@/infrastructure/api/helpers/auth');
    const { NextRequest } = await import('next/server');

    const user = createMockUser({ role: UserRole.CONSULTANT });
    (user as any).role = 'consultant'; // Route uses string comparison
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockTask = {
      id: 'task-1',
      title: 'New Task',
      subProjectId: 'subproject-1',
      status: 'todo',
      createdAt: new Date(),
    };

    mockCreateTaskExecute.mockResolvedValue({
      isFailure: false,
      isSuccess: true,
      value: mockTask,
    });

    const requestBody = {
      title: 'New Task',
      subProjectId: 'subproject-1',
    };

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/tasks', {
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
    expect(data.id).toBe('task-1');
    expect(mockCreateTaskExecute).toHaveBeenCalled();
  });

  it('handles use case failure', async () => {
    const { getAuthenticatedUser } = await import('@/infrastructure/api/helpers/auth');
    const { NextRequest } = await import('next/server');

    const user = createMockUser({ role: UserRole.CONSULTANT });
    (user as any).role = 'consultant'; // Route uses string comparison
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockCreateTaskExecute.mockResolvedValue({
      isFailure: true,
      error: { message: 'Task creation failed', statusCode: 400 },
    });

    const requestBody = {
      title: 'New Task',
      subProjectId: 'subproject-1',
    };

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/tasks', {
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
    expect(data.error).toBeDefined();
  });
});
