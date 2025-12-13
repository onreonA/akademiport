/**
 * Integration Tests for /api/tasks/[id]
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

vi.mock('@/infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock use cases - use class mock pattern
const mockGetTaskExecute = vi.fn();
const mockUpdateTaskExecute = vi.fn();
const mockDeleteTaskExecute = vi.fn();

vi.mock('@/application/use-cases/task', () => ({
  GetTaskUseCase: class {
    execute = mockGetTaskExecute;
  },
  UpdateTaskUseCase: class {
    execute = mockUpdateTaskExecute;
  },
  DeleteTaskUseCase: class {
    execute = mockDeleteTaskExecute;
  },
}));

describe('GET /api/tasks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/tasks/task-1');
    const response = await GET(request, { params: Promise.resolve({ id: 'task-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns task successfully', async () => {
    const { getAuthenticatedUser } = await import('@/infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.COMPANY_USER });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockTask = {
      id: 'task-1',
      title: 'Test Task',
      status: 'todo',
      priority: 'normal',
    };

    mockGetTaskExecute.mockResolvedValue({
      isFailure: false,
      value: mockTask,
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/tasks/task-1');
    const response = await GET(request, { params: Promise.resolve({ id: 'task-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe('task-1');
    expect(mockGetTaskExecute).toHaveBeenCalledWith('task-1');
  });

  it('handles use case failure', async () => {
    const { getAuthenticatedUser } = await import('@/infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.COMPANY_USER });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    // Import NotFoundError for proper error instance
    const { NotFoundError } = await import('@/6-core/errors/AppError');
    const error = new NotFoundError('Task not found');

    mockGetTaskExecute.mockResolvedValue({
      isFailure: true,
      error: error,
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/tasks/non-existent');
    const response = await GET(request, { params: Promise.resolve({ id: 'non-existent' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBeDefined();
  });
});

describe('PUT /api/tasks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { PUT } = await import('./route');
    const { NextRequest } = await import('next/server');
    const request = new NextRequest('http://localhost:3000/api/tasks/task-1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Updated Task',
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'task-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('updates task successfully', async () => {
    const { getAuthenticatedUser } = await import('@/infrastructure/api/helpers/auth');
    const { NextRequest } = await import('next/server');

    const user = createMockUser({ role: UserRole.COMPANY_USER });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockUpdatedTask = {
      id: 'task-1',
      title: 'Updated Task',
      status: 'in_progress',
      updatedAt: new Date(),
    };

    mockUpdateTaskExecute.mockResolvedValue({
      isFailure: false,
      value: mockUpdatedTask,
    });

    const requestBody = {
      title: 'Updated Task',
      status: 'in_progress',
    };

    const { PUT } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/tasks/task-1', {
      method: 'PUT',
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

    const response = await PUT(request, { params: Promise.resolve({ id: 'task-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockUpdateTaskExecute).toHaveBeenCalled();
  });

  it('handles use case failure', async () => {
    const { getAuthenticatedUser } = await import('@/infrastructure/api/helpers/auth');
    const { NextRequest } = await import('next/server');

    const user = createMockUser({ role: UserRole.COMPANY_USER });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    // Import AppError for proper error instance
    const { AppError } = await import('@/6-core/errors/AppError');
    const error = new AppError('Update failed', 400);

    mockUpdateTaskExecute.mockResolvedValue({
      isFailure: true,
      error: error,
    });

    const requestBody = {
      title: 'Updated Task',
    };

    const { PUT } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/tasks/task-1', {
      method: 'PUT',
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

    const response = await PUT(request, { params: Promise.resolve({ id: 'task-1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});

describe('DELETE /api/tasks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/tasks/task-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'task-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('deletes task successfully', async () => {
    const { getAuthenticatedUser } = await import('@/infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockDeleteTaskExecute.mockResolvedValue({
      isFailure: false,
      value: undefined,
    });

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/tasks/task-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'task-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDeleteTaskExecute).toHaveBeenCalled();
  });

  it('handles use case failure', async () => {
    const { getAuthenticatedUser } = await import('@/infrastructure/api/helpers/auth');

    const user = createMockUser({ role: UserRole.CONSULTANT });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    // Import AppError for proper error instance
    const { AppError } = await import('@/6-core/errors/AppError');
    const error = new AppError('Delete failed', 400);

    mockDeleteTaskExecute.mockResolvedValue({
      isFailure: true,
      error: error,
    });

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/tasks/task-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'task-1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
