/**
 * Integration Tests for /api/trainings/[id]
 *
 * Tests training detail API routes with authentication, authorization, and validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

// Mock all dependencies before importing the route
vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock use cases - use class mock pattern
const mockGetTrainingExecute = vi.fn();
const mockUpdateTrainingExecute = vi.fn();
const mockDeleteTrainingExecute = vi.fn();

vi.mock('@/application/use-cases/training', () => ({
  GetTrainingUseCase: class {
    execute = mockGetTrainingExecute;
  },
  UpdateTrainingUseCase: class {
    execute = mockUpdateTrainingExecute;
  },
  DeleteTrainingUseCase: class {
    execute = mockDeleteTrainingExecute;
  },
}));

describe('GET /api/trainings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings/training-1');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'training-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns training successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.MASTER_ADMIN,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockTraining = {
      id: 'training-1',
      name: 'Test Training',
      description: 'Test Description',
      programId: 'program-1',
      consultantId: 'consultant-1',
      isGlobal: false,
      status: 'draft',
      priority: 'medium',
      isLocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-1',
    };

    mockGetTrainingExecute.mockResolvedValue({
      isFailure: false,
      value: mockTraining,
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings/training-1');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'training-1' }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.id).toBe('training-1');
    expect(data.name).toBe('Test Training');
    expect(mockGetTrainingExecute).toHaveBeenCalledWith('training-1');
  });

  it('returns 404 when training is not found', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.MASTER_ADMIN,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    // Import NotFoundError for proper error instance
    const { NotFoundError } = await import('@/6-core/errors/AppError');
    const error = new NotFoundError('Training not found');

    mockGetTrainingExecute.mockResolvedValue({
      isFailure: true,
      error: error,
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings/non-existent');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'non-existent' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Training not found');
  });
});

describe('PUT /api/trainings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { PUT } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings/training-1', {
      method: 'PUT',
      body: {
        name: 'Updated Training',
      },
    });
    const response = await PUT(request, {
      params: Promise.resolve({ id: 'training-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 403 when user is not authorized', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.COMPANY_USER,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const { PUT } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings/training-1', {
      method: 'PUT',
      body: {
        name: 'Updated Training',
      },
    });
    const response = await PUT(request, {
      params: Promise.resolve({ id: 'training-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('updates training successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.MASTER_ADMIN,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockUpdateTrainingExecute.mockResolvedValue({
      isFailure: false,
      value: { id: 'training-1' },
    });

    const { PUT } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings/training-1', {
      method: 'PUT',
      body: {
        name: 'Updated Training',
        description: 'Updated Description',
      },
    });
    const response = await PUT(request, {
      params: Promise.resolve({ id: 'training-1' }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(mockUpdateTrainingExecute).toHaveBeenCalledWith(
      'training-1',
      expect.objectContaining({
        name: 'Updated Training',
        description: 'Updated Description',
      })
    );
  });

  it('handles use case failure', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.MASTER_ADMIN,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    // Import NotFoundError for proper error instance
    const { NotFoundError } = await import('@/6-core/errors/AppError');
    const error = new NotFoundError('Training not found');

    mockUpdateTrainingExecute.mockResolvedValue({
      isFailure: true,
      error: error,
    });

    const { PUT } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings/non-existent', {
      method: 'PUT',
      body: {
        name: 'Updated Training',
      },
    });
    const response = await PUT(request, {
      params: Promise.resolve({ id: 'non-existent' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Training not found');
  });
});

describe('DELETE /api/trainings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings/training-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'training-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 403 when user is not authorized', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.COMPANY_USER,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings/training-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'training-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('deletes training successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.MASTER_ADMIN,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockDeleteTrainingExecute.mockResolvedValue({
      isFailure: false,
      value: undefined,
    });

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings/training-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'training-1' }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(mockDeleteTrainingExecute).toHaveBeenCalledWith('training-1');
  });

  it('handles use case failure', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.MASTER_ADMIN,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    // Import NotFoundError for proper error instance
    const { NotFoundError } = await import('@/6-core/errors/AppError');
    const error = new NotFoundError('Training not found');

    mockDeleteTrainingExecute.mockResolvedValue({
      isFailure: true,
      error: error,
    });

    const { DELETE } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings/non-existent', {
      method: 'DELETE',
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'non-existent' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Training not found');
  });
});
