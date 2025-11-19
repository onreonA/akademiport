/**
 * Unit Tests for UpdateCustomReportUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateCustomReportUseCase } from './UpdateCustomReportUseCase';
import { ICustomReportRepository } from '@/3-domain/interfaces/repositories/ICustomReportRepository';
import { CustomReport } from '@/3-domain/entities/CustomReport';
import { Result } from '@/6-core/result/Result';

describe('UpdateCustomReportUseCase', () => {
  let mockRepository: ICustomReportRepository;
  let useCase: UpdateCustomReportUseCase;

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

    useCase = new UpdateCustomReportUseCase(mockRepository);
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

  it('should update custom report successfully', async () => {
    const reportId = 'report-1';
    const userId = 'user-1';
    // Update with valid data that passes validation
    const updateDto = {
      name: 'Updated Report Name',
      selectedMetrics: ['metric-1', 'metric-2'],
      reportType: 'monthly' as const,
      dateRangeType: 'last_30_days' as const,
    };
    const existingReport = createMockReport({ id: reportId, userId });
    const updatedReport = createMockReport({
      id: reportId,
      userId,
      name: 'Updated Report Name',
      selectedMetrics: ['metric-1', 'metric-2'],
    });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingReport));
    vi.mocked(mockRepository.update).mockResolvedValue(Result.ok(updatedReport));

    const result = await useCase.execute(reportId, updateDto, userId);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(updatedReport);
    expect(mockRepository.findById).toHaveBeenCalledWith(reportId);
    expect(mockRepository.update).toHaveBeenCalledWith(reportId, updateDto);
  });

  it('should return error when report not found', async () => {
    const reportId = 'non-existent';
    const userId = 'user-1';
    const updateDto = { name: 'Updated Name' };

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.fail('Not found'));

    const result = await useCase.execute(reportId, updateDto, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Custom report bulunamadı');
    expect(result.error?.statusCode).toBe(404);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should return error when repository returns null', async () => {
    const reportId = 'report-1';
    const userId = 'user-1';
    const updateDto = { name: 'Updated Name' };

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null as any));

    const result = await useCase.execute(reportId, updateDto, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Custom report bulunamadı');
    expect(result.error?.statusCode).toBe(404);
  });

  it('should return error when user tries to update another user report', async () => {
    const reportId = 'report-1';
    const userId = 'user-2';
    const ownerId = 'user-1';
    const updateDto = { name: 'Updated Name' };
    const existingReport = createMockReport({ id: reportId, userId: ownerId });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingReport));

    const result = await useCase.execute(reportId, updateDto, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain('Bu raporu güncelleme yetkiniz yok');
    expect(result.error?.statusCode).toBe(403);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should return error when validation fails', async () => {
    const reportId = 'report-1';
    const userId = 'user-1';
    // Invalid update - empty name will fail validation
    const updateDto = { name: '' };
    const existingReport = createMockReport({ id: reportId, userId, name: 'Original Name' });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingReport));

    const result = await useCase.execute(reportId, updateDto, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.statusCode).toBe(400);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should handle repository update errors', async () => {
    const reportId = 'report-1';
    const userId = 'user-1';
    // Valid update that passes validation
    const updateDto = { selectedMetrics: ['metric-1'] };
    const existingReport = createMockReport({ id: reportId, userId, name: 'Original Name' });

    vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(existingReport));
    vi.mocked(mockRepository.update).mockResolvedValue(Result.fail('Update failed'));

    const result = await useCase.execute(reportId, updateDto, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe('Update failed');
  });

  it('should handle exceptions', async () => {
    const reportId = 'report-1';
    const userId = 'user-1';
    const updateDto = { name: 'Updated Name' };
    const errorMessage = 'Unexpected error';

    vi.mocked(mockRepository.findById).mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(reportId, updateDto, userId);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message || result.error).toBe(errorMessage);
  });
});
