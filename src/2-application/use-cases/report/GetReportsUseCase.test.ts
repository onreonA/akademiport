import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetReportsUseCase } from './GetReportsUseCase';
import { IProgressReportRepository } from '@/3-domain/interfaces/repositories/IProgressReportRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { ProgressReport, ReportType, ReportStatus } from '@/3-domain/entities/ProgressReport';

describe('GetReportsUseCase', () => {
  let mockRepository: IProgressReportRepository;
  let useCase: GetReportsUseCase;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
      existsMonthlyReport: vi.fn(),
      findByCompany: vi.fn(),
      findByProgram: vi.fn(),
      findByProject: vi.fn(),
      findBySubProject: vi.fn(),
      count: vi.fn(),
    } as any;

    useCase = new GetReportsUseCase(mockRepository);
  });

  const createMockReport = (overrides?: Partial<ProgressReport>): ProgressReport => ({
    id: 'report-1',
    companyId: 'company-1',
    programId: 'program-1',
    projectId: null,
    subProjectId: null,
    consultantId: null,
    reportType: 'monthly' as ReportType,
    status: 'completed' as ReportStatus,
    title: 'Test Report',
    periodYear: 2025,
    periodMonth: 1,
    templateId: 'template-1',
    content: {},
    aiAnalysis: null,
    pdfUrl: null,
    pdfGeneratedAt: null,
    emailSent: false,
    emailSentAt: null,
    emailRecipients: [],
    errorMessage: null,
    errorDetails: null,
    metadata: {},
    generatedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe('execute', () => {
    it('should get reports successfully', async () => {
      const reports = [createMockReport({ id: 'report-1' }), createMockReport({ id: 'report-2' })];

      vi.mocked(mockRepository.findMany).mockResolvedValue(Result.ok(reports));
      vi.mocked(mockRepository.count).mockResolvedValue(Result.ok(2));

      const result = await useCase.execute({});

      expect(result.isSuccess).toBe(true);
      expect(result.value?.reports).toHaveLength(2);
      expect(result.value?.total).toBe(2);
    });

    it('should filter reports by companyId', async () => {
      const reports = [createMockReport({ companyId: 'company-1' })];

      vi.mocked(mockRepository.findMany).mockResolvedValue(Result.ok(reports));
      vi.mocked(mockRepository.count).mockResolvedValue(Result.ok(1));

      const result = await useCase.execute({ companyId: 'company-1' });

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ companyId: 'company-1' })
      );
    });

    it('should filter reports by reportType', async () => {
      const reports = [createMockReport({ reportType: 'monthly' })];

      vi.mocked(mockRepository.findMany).mockResolvedValue(Result.ok(reports));
      vi.mocked(mockRepository.count).mockResolvedValue(Result.ok(1));

      const result = await useCase.execute({ reportType: 'monthly' });

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ reportType: 'monthly' })
      );
    });

    it('should filter reports by status', async () => {
      const reports = [createMockReport({ status: 'completed' })];

      vi.mocked(mockRepository.findMany).mockResolvedValue(Result.ok(reports));
      vi.mocked(mockRepository.count).mockResolvedValue(Result.ok(1));

      const result = await useCase.execute({ status: 'completed' });

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'completed' })
      );
    });

    it('should handle pagination', async () => {
      const reports = [createMockReport()];

      vi.mocked(mockRepository.findMany).mockResolvedValue(Result.ok(reports));
      vi.mocked(mockRepository.count).mockResolvedValue(Result.ok(10));

      const result = await useCase.execute({ limit: 10, offset: 20 });

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10, offset: 20 })
      );
    });

    it('should use default pagination values', async () => {
      const reports = [createMockReport()];

      vi.mocked(mockRepository.findMany).mockResolvedValue(Result.ok(reports));
      vi.mocked(mockRepository.count).mockResolvedValue(Result.ok(1));

      await useCase.execute({});

      expect(mockRepository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 50, offset: 0 })
      );
    });

    it('should fail when repository fails', async () => {
      vi.mocked(mockRepository.findMany).mockResolvedValue(
        Result.fail(new AppError('Database error', 500))
      );

      const result = await useCase.execute({});

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Database error');
    });

    it('should handle count failure gracefully', async () => {
      const reports = [createMockReport()];

      vi.mocked(mockRepository.findMany).mockResolvedValue(Result.ok(reports));
      vi.mocked(mockRepository.count).mockResolvedValue(
        Result.fail(new AppError('Count error', 500))
      );

      const result = await useCase.execute({});

      expect(result.isSuccess).toBe(true);
      expect(result.value?.total).toBe(1); // Falls back to reports length
    });
  });
});
