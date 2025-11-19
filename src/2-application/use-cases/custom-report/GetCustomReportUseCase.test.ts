/**
 * Unit Tests for GetCustomReportUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetCustomReportUseCase } from './GetCustomReportUseCase';
import { ICustomReportRepository } from '@/3-domain/interfaces/repositories/ICustomReportRepository';
import { CustomReport, CustomReportEntity } from '@/3-domain/entities/CustomReport';
import { Result } from '@/6-core/result/Result';

describe('GetCustomReportUseCase', () => {
  let mockRepository: ICustomReportRepository;
  let useCase: GetCustomReportUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findWithFilters: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    useCase = new GetCustomReportUseCase(mockRepository);
  });

  const createMockReport = (overrides?: Partial<CustomReport>): CustomReport => {
    return {
      id: 'report-1',
      userId: 'user-1',
      name: 'Test Report',
      description: null,
      programId: null,
      companyId: null,
      reportType: 'monthly',
      templateId: null,
      selectedMetrics: [],
      dateRangeStart: null,
      dateRangeEnd: null,
      dateRangeType: 'last_30_days',
      filters: {},
      isScheduled: false,
      scheduleCron: null,
      scheduleTimezone: 'Europe/Istanbul',
      lastGeneratedAt: null,
      nextGenerationAt: null,
      status: 'saved',
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  it('should get custom report successfully for owner', async () => {
    const reportId = 'report-1';
    const userId = 'user-1';
    const mockReport = createMockReport({ id: reportId, userId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockReport));

    const result = await useCase.execute(reportId, userId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockReport);
    expect(mockRepository.findById).toHaveBeenCalledWith(reportId);
  });

  it('should get custom report successfully for admin', async () => {
    const reportId = 'report-1';
    const userId = 'admin-1';
    const ownerId = 'user-1';
    const mockReport = createMockReport({ id: reportId, userId: ownerId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockReport));

    const result = await useCase.execute(reportId, userId, true);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockReport);
  });

  it('should return error when report not found', async () => {
    const reportId = 'non-existent';
    const userId = 'user-1';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.fail('Not found'));

    const result = await useCase.execute(reportId, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Custom report bulunamadı');
    expect(result.error?.statusCode).toBe(404);
  });

  it('should return error when repository returns null', async () => {
    const reportId = 'report-1';
    const userId = 'user-1';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null as any));

    const result = await useCase.execute(reportId, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Custom report bulunamadı');
    expect(result.error?.statusCode).toBe(404);
  });

  it('should return error when user tries to access another user report', async () => {
    const reportId = 'report-1';
    const userId = 'user-2';
    const ownerId = 'user-1';
    const mockReport = createMockReport({ id: reportId, userId: ownerId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockReport));

    const result = await useCase.execute(reportId, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Bu raporu görüntüleme yetkiniz yok');
    expect(result.error?.statusCode).toBe(403);
  });

  it('should handle repository errors', async () => {
    const reportId = 'report-1';
    const userId = 'user-1';
    const errorMessage = 'Database error';

    vi.mocked(mockRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(reportId, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe(errorMessage);
  });
});
