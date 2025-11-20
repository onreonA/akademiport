import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetReportUseCase } from './GetReportUseCase';
import { IProgressReportRepository } from '@/3-domain/interfaces/repositories/IProgressReportRepository';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { ProgressReport, ReportType, ReportStatus } from '@/3-domain/entities/ProgressReport';

describe('GetReportUseCase', () => {
  let mockRepository: IProgressReportRepository;
  let useCase: GetReportUseCase;

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

    useCase = new GetReportUseCase(mockRepository);
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
    it('should get report successfully', async () => {
      const report = createMockReport();

      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(report));

      const result = await useCase.execute('report-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(report);
      expect(mockRepository.findById).toHaveBeenCalledWith('report-1');
    });

    it('should fail when report not found', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(Result.ok(null));

      const result = await useCase.execute('non-existent');

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Rapor bulunamadı');
      expect((result.error as AppError)?.statusCode).toBe(404);
    });

    it('should fail when repository fails', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(
        Result.fail(new AppError('Database error', 500))
      );

      const result = await useCase.execute('report-1');

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Database error');
    });

    it('should handle exceptions', async () => {
      vi.mocked(mockRepository.findById).mockRejectedValue(new Error('Unexpected error'));

      const result = await useCase.execute('report-1');

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Unexpected error');
    });
  });
});
