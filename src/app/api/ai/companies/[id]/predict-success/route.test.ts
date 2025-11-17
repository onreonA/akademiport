import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { Result } from '@/6-core/result/Result';

// Mock authentication
vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock use case
const mockExecute = vi.fn();
vi.mock('@/2-application/use-cases/ai/PredictCompanySuccessUseCase', () => ({
  PredictCompanySuccessUseCase: class {
    execute = mockExecute;
  },
}));

// Mock services (same as analyze-risk)
vi.mock('@/5-shared/services/ai/ai-router.service', () => ({
  AIRouterService: class {},
}));

vi.mock('@/5-shared/services/ai/prompt-manager.service', () => ({
  PromptManagerService: class {},
}));

vi.mock('@/5-shared/services/ai/token-tracker.service', () => ({
  TokenTrackerService: class {},
}));

vi.mock('@/4-infrastructure/database/repositories/ProjectRepository', () => ({
  ProjectRepository: class {},
}));

vi.mock('@/4-infrastructure/database/repositories/TrainingRepository', () => ({
  TrainingRepository: class {},
}));

vi.mock('@/4-infrastructure/database/repositories/TrainingProgressRepository', () => ({
  TrainingProgressRepository: class {},
}));

vi.mock('@/4-infrastructure/database/repositories/EventRepository', () => ({
  EventRepository: class {},
}));

vi.mock('@/4-infrastructure/database/repositories/CompanyRepository', () => ({
  CompanyRepository: class {},
}));

// Mock logger
vi.mock('@/5-shared/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('POST /api/ai/companies/[id]/predict-success', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should predict company success successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      role: 'consultant',
    } as any);

    mockExecute.mockResolvedValue(
      Result.ok({
        successProbability: 75,
        successLevel: 'high',
        prediction: 'Test prediction',
        factors: [],
        recommendations: [],
      })
    );

    const request = new NextRequest('http://localhost/api/ai/companies/company-1/predict-success', {
      method: 'POST',
    });

    const { POST } = await import('./route');
    const response = await POST(request, {
      params: Promise.resolve({ id: 'company-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.successProbability).toBe(75);
    expect(data.successLevel).toBe('high');
  });

  it('should return 401 when not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/ai/companies/company-1/predict-success', {
      method: 'POST',
    });

    const { POST } = await import('./route');
    const response = await POST(request, {
      params: Promise.resolve({ id: 'company-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });
});
