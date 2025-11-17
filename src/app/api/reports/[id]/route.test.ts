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
  GetReportUseCase: class {
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

describe('GET /api/reports/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get report successfully', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      role: 'consultant',
    } as any);

    const mockReport = {
      id: 'report-1',
      title: 'Test Report',
      reportType: 'monthly',
      status: 'completed',
    };

    mockExecute.mockResolvedValue(Result.ok(mockReport));

    const request = new NextRequest('http://localhost/api/reports/report-1');
    const params = Promise.resolve({ id: 'report-1' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockReport);
    expect(mockExecute).toHaveBeenCalledWith('report-1');
  });

  it('should return 401 when not authenticated', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/reports/report-1');
    const params = Promise.resolve({ id: 'report-1' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 404 when report not found', async () => {
    const { getAuthenticatedUser } = await import('@/4-infrastructure/api/helpers/auth');
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'user-1',
      role: 'consultant',
    } as any);

    mockExecute.mockResolvedValue(
      Result.fail(new (await import('@/6-core/errors/AppError')).AppError('Rapor bulunamadı', 404))
    );

    const request = new NextRequest('http://localhost/api/reports/non-existent');
    const params = Promise.resolve({ id: 'non-existent' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('Rapor bulunamadı');
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

    const request = new NextRequest('http://localhost/api/reports/report-1');
    const params = Promise.resolve({ id: 'report-1' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Database error');
  });
});
