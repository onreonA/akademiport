/**
 * Integration Tests for /api/trainings
 *
 * Tests training API routes with authentication, authorization, and validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

// Mock all dependencies before importing the route
vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock use cases - use class mock pattern
const mockListTrainingsExecute = vi.fn();
const mockCreateTrainingExecute = vi.fn();

vi.mock('@/application/use-cases/training', () => ({
  ListTrainingsUseCase: class {
    execute = mockListTrainingsExecute;
  },
  CreateTrainingUseCase: class {
    execute = mockCreateTrainingExecute;
  },
}));

describe('GET /api/trainings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns trainings for authenticated user', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.MASTER_ADMIN,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockListTrainingsExecute.mockResolvedValue({
      isFailure: false,
      value: {
        data: [
          {
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
          },
        ],
        total: 1,
      },
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.trainings).toBeDefined();
    expect(data.total).toBe(1);
  });

  it('filters trainings by programId', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.MASTER_ADMIN,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockListTrainingsExecute.mockResolvedValue({
      isFailure: false,
      value: {
        data: [],
        total: 0,
      },
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings?programId=program-1');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockListTrainingsExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        programId: 'program-1',
      }),
      true
    );
  });

  it('filters trainings by consultantId for consultant role', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.CONSULTANT,
      id: 'consultant-1',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockListTrainingsExecute.mockResolvedValue({
      isFailure: false,
      value: {
        data: [],
        total: 0,
      },
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockListTrainingsExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        consultantId: 'consultant-1',
      }),
      false
    );
  });

  it('handles use case failure', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.MASTER_ADMIN,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    // Import AppError for proper error instance
    const { AppError } = await import('@/6-core/errors/AppError');
    const error = new AppError('Failed to list trainings', 500);

    mockListTrainingsExecute.mockResolvedValue({
      isFailure: true,
      error: error,
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to list trainings');
  });
});

describe('POST /api/trainings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings', {
      method: 'POST',
      body: {
        name: 'Test Training',
        programId: 'program-1',
        isGlobal: false,
      },
    });
    const response = await POST(request);
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

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings', {
      method: 'POST',
      body: {
        name: 'Test Training',
        programId: 'program-1',
        isGlobal: false,
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('creates training successfully for master_admin', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.MASTER_ADMIN,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockCreateTrainingExecute.mockResolvedValue({
      isFailure: false,
      value: { id: 'training-1' },
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings', {
      method: 'POST',
      body: {
        name: 'Test Training',
        description: 'Test Description',
        programId: 'program-1',
        isGlobal: false,
        status: 'draft',
        priority: 'medium',
      },
    });
    const response = await POST(request);

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.id).toBe('training-1');
    expect(mockCreateTrainingExecute).toHaveBeenCalled();
  });

  it('creates training successfully for consultant', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.CONSULTANT,
      id: 'consultant-1',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockCreateTrainingExecute.mockResolvedValue({
      isFailure: false,
      value: { id: 'training-1' },
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings', {
      method: 'POST',
      body: {
        name: 'Test Training',
        programId: 'program-1',
        isGlobal: false,
      },
    });
    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mockCreateTrainingExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        consultantId: 'consultant-1',
      }),
      'consultant-1'
    );
  });

  it('handles use case failure', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.MASTER_ADMIN,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    // Import AppError for proper error instance
    const { AppError } = await import('@/6-core/errors/AppError');
    const error = new AppError('Training name is required', 400);

    mockCreateTrainingExecute.mockResolvedValue({
      isFailure: true,
      error: error,
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/trainings', {
      method: 'POST',
      body: {
        name: '',
        programId: 'program-1',
        isGlobal: false,
      },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Training name is required');
  });
});
