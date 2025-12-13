/**
 * Integration Tests for /api/companies/[id]/trainings
 *
 * Tests company training API routes with authentication, authorization, and validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, createMockUser } from '@/shared/test/api-helpers';
import { UserRole } from '@/domain/enums/UserRole';

// Mock all dependencies before importing the route
vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock use cases - use class mock pattern
const mockListCompanyTrainingsExecute = vi.fn();
const mockAssignTrainingToCompanyExecute = vi.fn();

vi.mock('@/application/use-cases/company-training', () => ({
  ListCompanyTrainingsUseCase: class {
    execute = mockListCompanyTrainingsExecute;
  },
  AssignTrainingToCompanyUseCase: class {
    execute = mockAssignTrainingToCompanyExecute;
  },
}));

describe('GET /api/companies/[id]/trainings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/companies/company-1/trainings');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'company-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 403 when company user tries to access another company', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.COMPANY_USER,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    (user as any).companyId = 'company-2';
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/companies/company-1/trainings');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'company-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('returns trainings successfully for authorized user', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.MASTER_ADMIN,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    const mockTrainings = [
      {
        id: 'training-1',
        name: 'Test Training',
        assignedAt: new Date(),
      },
    ];

    mockListCompanyTrainingsExecute.mockResolvedValue({
      isFailure: false,
      value: mockTrainings,
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/companies/company-1/trainings');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'company-1' }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.trainings).toHaveLength(1);
    expect(data.trainings[0].id).toBe('training-1');
    expect(data.trainings[0].name).toBe('Test Training');
    expect(mockListCompanyTrainingsExecute).toHaveBeenCalledWith('company-1');
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
    const error = new NotFoundError('Company not found');

    mockListCompanyTrainingsExecute.mockResolvedValue({
      isFailure: true,
      error: error,
    });

    const { GET } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/companies/non-existent/trainings');
    const response = await GET(request, {
      params: Promise.resolve({ id: 'non-existent' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Company not found');
  });
});

describe('POST /api/companies/[id]/trainings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/companies/company-1/trainings', {
      method: 'POST',
      body: {
        trainingId: 'training-1',
      },
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: 'company-1' }),
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

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/companies/company-1/trainings', {
      method: 'POST',
      body: {
        trainingId: 'training-1',
      },
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: 'company-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('assigns training successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');

    const user = createMockUser({
      role: UserRole.MASTER_ADMIN,
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    vi.mocked(getAuthenticatedUser).mockResolvedValue(user as any);

    mockAssignTrainingToCompanyExecute.mockResolvedValue({
      isFailure: false,
      value: { id: 'assignment-1' },
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/companies/company-1/trainings', {
      method: 'POST',
      body: {
        trainingId: 'training-1',
      },
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: 'company-1' }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.id).toBe('assignment-1');
    expect(mockAssignTrainingToCompanyExecute).toHaveBeenCalledWith(
      {
        companyId: 'company-1',
        trainingId: 'training-1',
      },
      user.id
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

    mockAssignTrainingToCompanyExecute.mockResolvedValue({
      isFailure: true,
      error: error,
    });

    const { POST } = await import('./route');
    const request = createMockRequest('http://localhost:3000/api/companies/company-1/trainings', {
      method: 'POST',
      body: {
        trainingId: 'non-existent',
      },
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: 'company-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Training not found');
  });
});
