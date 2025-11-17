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
vi.mock('@/2-application/use-cases/report', () => ({
  GenerateReportUseCase: class {
    execute = mockExecute;
  },
}));

// Mock repositories and services
vi.mock('@/4-infrastructure/database/repositories/SupabaseProgressReportRepository', () => ({
  SupabaseProgressReportRepository: class {},
}));

vi.mock('@/4-infrastructure/database/repositories/SupabaseReportTemplateRepository', () => ({
  SupabaseReportTemplateRepository: class {},
}));

vi.mock('@/4-infrastructure/database/repositories/ProjectRepository', () => ({
  ProjectRepository: class {},
}));

vi.mock('@/4-infrastructure/database/repositories/TrainingRepository', () => ({
  TrainingRepository: class {},
}));

vi.mock('@/4-infrastructure/database/repositories/CompanyTrainingRepository', () => ({
  CompanyTrainingRepository: class {},
}));

vi.mock('@/4-infrastructure/database/repositories/SupabaseEcommerceRepository', () => ({
  SupabaseEcommerceRepository: class {},
}));

vi.mock('@/5-shared/services/ai/ai-router.service', () => ({
  AIRouterService: class {},
}));

vi.mock('@/5-shared/services/ai/prompt-manager.service', () => ({
  PromptManagerService: class {},
}));

vi.mock('@/5-shared/services/ai/token-tracker.service', () => ({
  TokenTrackerService: class {},
}));

// Mock logger
vi.mock('@/5-shared/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('POST /api/reports/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate report successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      role: 'consultant',
    } as any);

    mockExecute.mockResolvedValue(
      Result.ok({
        reportId: 'report-1',
        status: 'completed',
      })
    );

    const request = new NextRequest('http://localhost/api/reports/generate', {
      method: 'POST',
      body: JSON.stringify({
        reportType: 'monthly',
        companyId: 'company-1',
        programId: 'program-1',
        periodYear: 2025,
        periodMonth: 1,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.reportId).toBe('report-1');
    expect(data.status).toBe('completed');
  });

  it('should return 401 when not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/reports/generate', {
      method: 'POST',
      body: JSON.stringify({
        reportType: 'monthly',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 403 when user is not authorized', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      role: 'company_user',
    } as any);

    const request = new NextRequest('http://localhost/api/reports/generate', {
      method: 'POST',
      body: JSON.stringify({
        reportType: 'monthly',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('should return 400 when reportType is missing', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      role: 'consultant',
    } as any);

    const request = new NextRequest('http://localhost/api/reports/generate', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('reportType');
  });

  it('should return 400 when monthly report missing period info', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      role: 'consultant',
    } as any);

    const request = new NextRequest('http://localhost/api/reports/generate', {
      method: 'POST',
      body: JSON.stringify({
        reportType: 'monthly',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('periodYear');
  });

  it('should handle use case failure', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      role: 'consultant',
    } as any);

    mockExecute.mockResolvedValue(
      Result.fail(
        new (await import('@/6-core/errors/AppError')).AppError('Template not found', 404)
      )
    );

    const request = new NextRequest('http://localhost/api/reports/generate', {
      method: 'POST',
      body: JSON.stringify({
        reportType: 'monthly',
        periodYear: 2025,
        periodMonth: 1,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('Template not found');
  });
});
