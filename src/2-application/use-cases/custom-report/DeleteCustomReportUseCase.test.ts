/**
 * Unit Tests for DeleteCustomReportUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteCustomReportUseCase } from './DeleteCustomReportUseCase';
import { ICustomReportRepository } from '@/3-domain/interfaces/repositories/ICustomReportRepository';
import { CustomReport } from '@/3-domain/entities/CustomReport';
import { Result } from '@/6-core/result/Result';

describe('DeleteCustomReportUseCase', () => {
  let mockRepository: ICustomReportRepository;
  let useCase: DeleteCustomReportUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findWithFilters: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    useCase = new DeleteCustomReportUseCase(mockRepository);
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

  it('should delete custom report successfully', async () => {
    const reportId = 'report-1';
    const userId = 'user-1';
    const mockReport = createMockReport({ id: reportId, userId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockReport));
    vi.mocked(mockRepository.delete).mockResolvedValue(Result.ok(undefined));

    const result = await useCase.execute(reportId, userId);

    expect(result.isSuccess).toBe(true);
    expect(mockRepository.findById).toHaveBeenCalledWith(reportId);
    expect(mockRepository.delete).toHaveBeenCalledWith(reportId);
  });

  it('should return error when report not found', async () => {
    const reportId = 'non-existent';
    const userId = 'user-1';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.fail('Not found'));

    const result = await useCase.execute(reportId, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Custom report bulunamadı');
    expect(result.error?.statusCode).toBe(404);
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('should return error when repository returns null', async () => {
    const reportId = 'report-1';
    const userId = 'user-1';

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null as any));

    const result = await useCase.execute(reportId, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Custom report bulunamadı');
    expect(result.error?.statusCode).toBe(404);
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('should return error when user tries to delete another user report', async () => {
    const reportId = 'report-1';
    const userId = 'user-2';
    const ownerId = 'user-1';
    const mockReport = createMockReport({ id: reportId, userId: ownerId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockReport));

    const result = await useCase.execute(reportId, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Bu raporu silme yetkiniz yok');
    expect(result.error?.statusCode).toBe(403);
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('should handle delete repository errors', async () => {
    const reportId = 'report-1';
    const userId = 'user-1';
    const mockReport = createMockReport({ id: reportId, userId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(mockReport));
    vi.mocked(mockRepository.delete).mockResolvedValue(Result.fail('Delete failed'));

    const result = await useCase.execute(reportId, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe('Delete failed');
  });

  it('should handle exceptions', async () => {
    const reportId = 'report-1';
    const userId = 'user-1';
    const errorMessage = 'Unexpected error';

    vi.mocked(mockRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(reportId, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
