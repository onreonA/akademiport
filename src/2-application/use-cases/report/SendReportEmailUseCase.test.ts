import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SendReportEmailUseCase } from './SendReportEmailUseCase';
import { IProgressReportRepository } from '@/3-domain/interfaces/repositories/IProgressReportRepository';
import { IEmailService } from '@/3-domain/interfaces/services/IEmailService';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { ProgressReport, ReportType, ReportStatus } from '@/3-domain/entities/ProgressReport';

// Mock logger
vi.mock('@/5-shared/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock EmailTemplateService
const mockRenderTemplate = vi.fn().mockResolvedValue(
  Result.ok({
    html: '<html>Test</html>',
    text: 'Test',
    subject: 'Test Report',
  })
);

vi.mock('@/5-shared/services/email/email-template.service', () => {
  return {
    EmailTemplateService: class {
      renderTemplate = mockRenderTemplate;
    },
  };
});

describe('SendReportEmailUseCase', () => {
  let mockReportRepository: IProgressReportRepository;
  let mockEmailService: IEmailService;
  let useCase: SendReportEmailUseCase;

  beforeEach(() => {
    mockReportRepository = {
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

    mockEmailService = {
      send: vi.fn().mockResolvedValue(Result.ok(undefined)),
    } as any;

    useCase = new SendReportEmailUseCase(mockReportRepository, mockEmailService);
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
    it('should send email successfully', async () => {
      const dto = {
        reportId: 'report-1',
        recipients: ['user1@example.com', 'user2@example.com'],
      };

      const report = createMockReport({ status: 'completed' });
      const updatedReport = createMockReport({
        status: 'completed',
        emailSent: true,
        emailSentAt: new Date(),
        emailRecipients: dto.recipients,
      });

      vi.mocked(mockReportRepository.findById).mockResolvedValue(Result.ok(report));
      vi.mocked(mockReportRepository.update).mockResolvedValue(Result.ok(updatedReport));

      const result = await useCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      expect(mockReportRepository.findById).toHaveBeenCalledWith('report-1');
      expect(mockReportRepository.update).toHaveBeenCalledWith(
        'report-1',
        expect.objectContaining({
          emailSent: true,
          emailRecipients: dto.recipients,
        })
      );
    });

    it('should fail when report not found', async () => {
      const dto = {
        reportId: 'non-existent',
        recipients: ['user@example.com'],
      };

      vi.mocked(mockReportRepository.findById).mockResolvedValue(Result.ok(null));

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Rapor bulunamadı');
      expect((result.error as AppError)?.statusCode).toBe(404);
    });

    it('should fail when report not completed', async () => {
      const dto = {
        reportId: 'report-1',
        recipients: ['user@example.com'],
      };

      const report = createMockReport({ status: 'generating' });

      vi.mocked(mockReportRepository.findById).mockResolvedValue(Result.ok(report));

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('henüz tamamlanmadı');
      expect(result.error?.statusCode).toBe(400);
      expect(mockReportRepository.update).not.toHaveBeenCalled();
    });

    it('should fail when repository findById fails', async () => {
      const dto = {
        reportId: 'report-1',
        recipients: ['user@example.com'],
      };

      vi.mocked(mockReportRepository.findById).mockResolvedValue(
        Result.fail(new AppError('Database error', 500))
      );

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Rapor bulunamadı');
    });

    it('should handle exceptions', async () => {
      const dto = {
        reportId: 'report-1',
        recipients: ['user@example.com'],
      };

      vi.mocked(mockReportRepository.findById).mockRejectedValue(new Error('Unexpected error'));

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Unexpected error');
    });
  });
});
