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
vi.mock('@/2-application/use-cases/ai/AnalyzeCompanyRiskUseCase', () => ({
  AnalyzeCompanyRiskUseCase: class {
    execute = mockExecute;
  },
}));

// Mock services
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

describe('POST /api/ai/companies/[id]/analyze-risk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should analyze company risk successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      role: 'consultant',
    } as any);

    mockExecute.mockResolvedValue(
      Result.ok({
        riskScore: 45,
        riskLevel: 'medium',
        analysis: 'Test analysis',
        factors: [],
        recommendations: [],
        projectProgress: { total: 0, completed: 0, inProgress: 0, averageProgress: 0 },
        trainingProgress: { total: 0, completed: 0, inProgress: 0, averageProgress: 0 },
        eventParticipation: { total: 0, attended: 0, attendanceRate: 0 },
      })
    );

    const request = new NextRequest('http://localhost/api/ai/companies/company-1/analyze-risk', {
      method: 'POST',
    });

    const { POST } = await import('./route');
    const response = await POST(request, {
      params: Promise.resolve({ id: 'company-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.riskScore).toBe(45);
    expect(data.riskLevel).toBe('medium');
  });

  it('should return 401 when not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/ai/companies/company-1/analyze-risk', {
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

  it('should return 500 when use case fails', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      role: 'consultant',
    } as any);

    mockExecute.mockResolvedValue(Result.fail(new Error('Use case error')));

    const request = new NextRequest('http://localhost/api/ai/companies/company-1/analyze-risk', {
      method: 'POST',
    });

    const { POST } = await import('./route');
    const response = await POST(request, {
      params: Promise.resolve({ id: 'company-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });
});
