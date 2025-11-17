import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import { Result } from '@/6-core/result/Result';

// Mock authentication
vi.mock('@/4-infrastructure/api/helpers/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

// Mock use case
const mockExecute = vi.fn();
vi.mock('@/2-application/use-cases/report', () => ({
  GetReportsUseCase: class {
    execute = mockExecute;
  },
}));

// Mock repository
vi.mock('@/4-infrastructure/database/repositories/SupabaseProgressReportRepository', () => ({
  SupabaseProgressReportRepository: class {},
}));

// Mock logger
vi.mock('@/5-shared/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('GET /api/reports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get reports successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      role: 'consultant',
    } as any);

    mockExecute.mockResolvedValue(
      Result.ok({
        reports: [
          { id: 'report-1', title: 'Report 1' },
          { id: 'report-2', title: 'Report 2' },
        ],
        total: 2,
      })
    );

    const request = new NextRequest('http://localhost/api/reports');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.pagination.total).toBe(2);
  });

  it('should filter reports by query parameters', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      role: 'consultant',
    } as any);

    mockExecute.mockResolvedValue(
      Result.ok({
        reports: [{ id: 'report-1', title: 'Report 1' }],
        total: 1,
      })
    );

    const request = new NextRequest(
      'http://localhost/api/reports?companyId=company-1&reportType=monthly&limit=10&offset=0'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 'company-1',
        reportType: 'monthly',
        limit: 10,
        offset: 0,
      })
    );
  });

  it('should return 401 when not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/reports');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should handle use case failure', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      role: 'consultant',
    } as any);

    mockExecute.mockResolvedValue(
      Result.fail(new (await import('@/6-core/errors/AppError')).AppError('Database error', 500))
    );

    const request = new NextRequest('http://localhost/api/reports');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Database error');
  });
});
