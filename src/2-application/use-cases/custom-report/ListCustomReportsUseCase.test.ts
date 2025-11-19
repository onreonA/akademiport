/**
 * Unit Tests for ListCustomReportsUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListCustomReportsUseCase } from './ListCustomReportsUseCase';
import { ICustomReportRepository } from '@/3-domain/interfaces/repositories/ICustomReportRepository';
import { CustomReport } from '@/3-domain/entities/CustomReport';
import { Result } from '@/6-core/result/Result';

describe('ListCustomReportsUseCase', () => {
  let mockRepository: ICustomReportRepository;
  let useCase: ListCustomReportsUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findWithFilters: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    useCase = new ListCustomReportsUseCase(mockRepository);
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

  it('should list custom reports successfully for user', async () => {
    const userId = 'user-1';
    const mockReports = [
      createMockReport({ id: 'report-1', userId }),
      createMockReport({ id: 'report-2', userId }),
    ];

    const filter = { page: 1, limit: 10 };

    vi.mocked(mockRepository.findWithFilters).mockResolvedValue(
      Result.ok({ reports: mockReports, total: 2 })
    );

    const result = await useCase.execute(filter, userId);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.reports).toEqual(mockReports);
    expect(result.value?.total).toBe(2);
    expect(result.value?.page).toBe(1);
    expect(result.value?.limit).toBe(10);
    expect(mockRepository.findWithFilters).toHaveBeenCalledWith({ ...filter, userId });
  });

  it('should list all custom reports for admin', async () => {
    const userId = 'admin-1';
    const mockReports = [
      createMockReport({ id: 'report-1', userId: 'user-1' }),
      createMockReport({ id: 'report-2', userId: 'user-2' }),
    ];

    const filter = { page: 1, limit: 10 };

    vi.mocked(mockRepository.findWithFilters).mockResolvedValue(
      Result.ok({ reports: mockReports, total: 2 })
    );

    const result = await useCase.execute(filter, userId, true);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.reports).toEqual(mockReports);
    expect(mockRepository.findWithFilters).toHaveBeenCalledWith(filter);
  });

  it('should use default pagination values', async () => {
    const userId = 'user-1';
    const mockReports = [createMockReport({ userId })];

    const filter = {};

    vi.mocked(mockRepository.findWithFilters).mockResolvedValue(
      Result.ok({ reports: mockReports, total: 1 })
    );

    const result = await useCase.execute(filter, userId);

    expect(result.isSuccess).toBe(true);
    expect(result.value?.page).toBe(1);
    expect(result.value?.limit).toBe(10);
  });

  it('should handle repository errors', async () => {
    const userId = 'user-1';
    const filter = { page: 1, limit: 10 };

    vi.mocked(mockRepository.findWithFilters).mockResolvedValue(Result.fail('Database error'));

    const result = await useCase.execute(filter, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe('Database error');
  });

  it('should handle exceptions', async () => {
    const userId = 'user-1';
    const filter = { page: 1, limit: 10 };
    const errorMessage = 'Unexpected error';

    vi.mocked(mockRepository.findWithFilters).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(filter, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
