/**
 * Unit Tests for CreateCustomReportUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateCustomReportUseCase } from './CreateCustomReportUseCase';
import { ICustomReportRepository } from '@/3-domain/interfaces/repositories/ICustomReportRepository';
import { CustomReport } from '@/3-domain/entities/CustomReport';
import { Result } from '@/6-core/result/Result';

describe('CreateCustomReportUseCase', () => {
  let mockRepository: ICustomReportRepository;
  let useCase: CreateCustomReportUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findWithFilters: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByUserId: vi.fn(),
      findScheduledReports: vi.fn(),
      findReportsToGenerate: vi.fn(),
      updateGenerationTime: vi.fn(),
    };

    useCase = new CreateCustomReportUseCase(mockRepository);
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

  const createValidDto = () => ({
    name: 'Test Report',
    reportType: 'monthly' as const,
    selectedMetrics: ['metric-1', 'metric-2'],
    dateRangeType: 'last_30_days' as const,
    isScheduled: false,
  });

  it('should create custom report successfully', async () => {
    const userId = 'user-1';
    const dto = createValidDto();
    const mockReport = createMockReport({ userId });

    vi.mocked(mockRepository.create).mockResolvedValue(Result.ok(mockReport));

    const result = await useCase.execute(dto, userId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockReport);
    expect(mockRepository.create).toHaveBeenCalledWith(dto, userId);
  });

  it('should return error when validation fails', async () => {
    const userId = 'user-1';
    // Invalid DTO - missing required fields
    const dto = {
      name: '',
      reportType: 'monthly' as const,
      selectedMetrics: [],
      dateRangeType: 'last_30_days' as const,
    };

    const result = await useCase.execute(dto, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.statusCode).toBe(400);
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should handle repository creation errors', async () => {
    const userId = 'user-1';
    const dto = createValidDto();
    const mockReport = createMockReport({ userId });

    // Mock validation to pass, but repository fails
    vi.mocked(mockRepository.create).mockResolvedValue(Result.fail('Database error'));

    const result = await useCase.execute(dto, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe('Database error');
  });

  it('should handle exceptions', async () => {
    const userId = 'user-1';
    const dto = createValidDto();
    const errorMessage = 'Unexpected error';

    // Mock validation to pass, but throw exception
    vi.mocked(mockRepository.create).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(dto, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
