import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GenerateReportUseCase } from './GenerateReportUseCase';
import { IProgressReportRepository } from '@/3-domain/interfaces/repositories/IProgressReportRepository';
import { IReportTemplateRepository } from '@/3-domain/interfaces/repositories/IReportTemplateRepository';
import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { ICompanyTrainingRepository } from '@/3-domain/interfaces/repositories/ICompanyTrainingRepository';
import { IEcommerceRepository } from '@/3-domain/interfaces/repositories/IEcommerceRepository';
import { IAIRouter } from '@/3-domain/interfaces/services/IAIRouter';
import { IPromptManager } from '@/3-domain/interfaces/services/IPromptManager';
import { ITokenTracker } from '@/3-domain/interfaces/services/ITokenTracker';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import {
  ReportType,
  ReportStatus,
  ProgressReport,
  AIAnalysis,
} from '@/3-domain/entities/ProgressReport';
import { ReportTemplate } from '@/3-domain/entities/ReportTemplate';
import { AIUseCase, AIProvider, AIModel } from '@/3-domain/enums/AIEnums';
import { AIPrompt } from '@/3-domain/entities/AI';

// Mock logger
vi.mock('@/5-shared/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('GenerateReportUseCase', () => {
  let mockReportRepository: IProgressReportRepository;
  let mockTemplateRepository: IReportTemplateRepository;
  let mockProjectRepository: IProjectRepository;
  let mockTrainingRepository: ITrainingRepository;
  let mockCompanyTrainingRepository: ICompanyTrainingRepository;
  let mockEcommerceRepository: IEcommerceRepository;
  let mockAIRouter: IAIRouter;
  let mockPromptManager: IPromptManager;
  let mockTokenTracker: ITokenTracker;
  let useCase: GenerateReportUseCase;

  beforeEach(() => {
    mockReportRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
      existsMonthlyReport: vi.fn(),
    } as any;

    mockTemplateRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByType: vi.fn(),
      findActiveByType: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
    } as any;

    mockProjectRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findTemplates: vi.fn(),
      updateProgress: vi.fn(),
      findByCompanyId: vi.fn(),
    } as any;

    mockTrainingRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findByProgramId: vi.fn(),
      findByConsultantId: vi.fn(),
      findGlobal: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;

    mockCompanyTrainingRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByCompanyId: vi.fn(),
      findByTrainingId: vi.fn(),
      findByCompanyAndTraining: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteByCompanyAndTraining: vi.fn(),
    } as any;

    mockEcommerceRepository = {
      createMetrics: vi.fn(),
      findMetricsByCompanyAndPeriod: vi.fn(),
      findAllMetrics: vi.fn(),
      updateMetrics: vi.fn(),
      deleteMetrics: vi.fn(),
      getPerformance: vi.fn(),
      getMinistryDashboard: vi.fn(),
    } as any;

    mockAIRouter = {
      complete: vi.fn(),
      stream: vi.fn(),
      selectProvider: vi.fn(),
      checkProviderHealth: vi.fn(),
    } as any;

    mockPromptManager = {
      getActivePrompt: vi.fn(),
      renderPrompt: vi.fn(),
      createPrompt: vi.fn(),
      updatePrompt: vi.fn(),
      listPromptVersions: vi.fn(),
    } as any;

    mockTokenTracker = {
      logUsage: vi.fn(),
      getTotalTokens: vi.fn(),
      getUsageStats: vi.fn(),
    } as any;

    useCase = new GenerateReportUseCase(
      mockReportRepository,
      mockTemplateRepository,
      mockProjectRepository,
      mockTrainingRepository,
      mockCompanyTrainingRepository,
      mockEcommerceRepository,
      mockAIRouter,
      mockPromptManager,
      mockTokenTracker
    );
  });

  const createMockTemplate = (overrides?: Partial<ReportTemplate>): ReportTemplate => ({
    id: 'template-1',
    name: 'Test Template',
    description: 'Test Description',
    reportType: 'monthly' as ReportType,
    templateContent: {},
    sections: [],
    aiEnabled: true,
    aiUseCase: 'report_generation',
    version: 1,
    isActive: true,
    metadata: {},
    createdBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const createMockReport = (overrides?: Partial<ProgressReport>): ProgressReport => ({
    id: 'report-1',
    companyId: 'company-1',
    programId: 'program-1',
    projectId: null,
    subProjectId: null,
    consultantId: null,
    reportType: 'monthly' as ReportType,
    status: 'pending' as ReportStatus,
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
    it('should generate monthly report successfully with AI analysis', async () => {
      const dto = {
        reportType: 'monthly' as ReportType,
        companyId: 'company-1',
        programId: 'program-1',
        periodYear: 2025,
        periodMonth: 1,
        userId: 'user-1',
      };

      const template = createMockTemplate();
      const report = createMockReport();
      const aiAnalysis: AIAnalysis = {
        summary: 'Test summary',
        strengths: ['Strength 1'],
        weaknesses: ['Weakness 1'],
        recommendations: ['Recommendation 1'],
        riskScore: 30,
        successProbability: 80,
      };

      const mockPrompt: AIPrompt = {
        id: 'prompt-1',
        name: 'Report Generation',
        template: 'Generate report for {{report_type}}',
        useCase: AIUseCase.REPORT_GENERATION,
        variables: {},
        version: 1,
        isActive: true,
        provider: AIProvider.OPENAI,
        model: AIModel.GPT_4,
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockTemplateRepository.findActiveByType).mockResolvedValue(Result.ok(template));
      vi.mocked(mockReportRepository.existsMonthlyReport).mockResolvedValue(Result.ok(false));
      vi.mocked(mockProjectRepository.findAll).mockResolvedValue({ data: [], total: 0 });
      vi.mocked(mockCompanyTrainingRepository.findByCompanyId).mockResolvedValue([]);
      vi.mocked(mockEcommerceRepository.findMetricsByCompanyAndPeriod).mockResolvedValue(
        Result.ok(null)
      );
      vi.mocked(mockReportRepository.create).mockResolvedValue(Result.ok(report));
      vi.mocked(mockReportRepository.update).mockResolvedValue(Result.ok(report));
      vi.mocked(mockPromptManager.getActivePrompt).mockResolvedValue(Result.ok(mockPrompt));
      vi.mocked(mockPromptManager.renderPrompt).mockReturnValue('Rendered prompt');
      vi.mocked(mockAIRouter.complete).mockResolvedValue(
        Result.ok({
          text: JSON.stringify(aiAnalysis),
          requestTokens: 100,
          responseTokens: 200,
          totalTokens: 300,
          costUsd: 0.001,
          durationMs: 500,
          model: AIModel.GPT_4,
          provider: AIProvider.OPENAI,
        })
      );
      vi.mocked(mockTokenTracker.logUsage).mockResolvedValue(Result.ok({ id: 'log-1' } as any));

      const result = await useCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.reportId).toBe('report-1');
      expect(result.value?.status).toBe('completed');
      expect(result.value?.aiAnalysis).toEqual(aiAnalysis);
      expect(mockReportRepository.create).toHaveBeenCalled();
      expect(mockReportRepository.update).toHaveBeenCalledTimes(2); // generating, then completed
    });

    it('should fail when monthly report missing period info', async () => {
      const dto = {
        reportType: 'monthly' as ReportType,
        companyId: 'company-1',
        programId: 'program-1',
        userId: 'user-1',
      };

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('dönem bilgisi zorunludur');
    });

    it('should fail when template not found', async () => {
      const dto = {
        reportType: 'monthly' as ReportType,
        companyId: 'company-1',
        programId: 'program-1',
        periodYear: 2025,
        periodMonth: 1,
        userId: 'user-1',
      };

      vi.mocked(mockTemplateRepository.findActiveByType).mockResolvedValue(
        Result.fail(new AppError('Template not found', 404))
      );

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('template');
    });

    it('should fail when monthly report already exists', async () => {
      const dto = {
        reportType: 'monthly' as ReportType,
        companyId: 'company-1',
        programId: 'program-1',
        periodYear: 2025,
        periodMonth: 1,
        userId: 'user-1',
      };

      const template = createMockTemplate();
      vi.mocked(mockTemplateRepository.findActiveByType).mockResolvedValue(Result.ok(template));
      vi.mocked(mockReportRepository.existsMonthlyReport).mockResolvedValue(Result.ok(true));

      const result = await useCase.execute(dto);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('zaten mevcut');
    });

    it('should generate report without AI when AI is disabled', async () => {
      const dto = {
        reportType: 'company' as ReportType,
        companyId: 'company-1',
        userId: 'user-1',
      };

      const template = createMockTemplate({ aiEnabled: false });
      const report = createMockReport({ reportType: 'company' });

      vi.mocked(mockTemplateRepository.findActiveByType).mockResolvedValue(Result.ok(template));
      vi.mocked(mockProjectRepository.findAll).mockResolvedValue({ data: [], total: 0 });
      vi.mocked(mockCompanyTrainingRepository.findByCompanyId).mockResolvedValue([]);
      vi.mocked(mockReportRepository.create).mockResolvedValue(Result.ok(report));
      vi.mocked(mockReportRepository.update).mockResolvedValue(Result.ok(report));

      const result = await useCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.status).toBe('completed');
      expect(result.value?.aiAnalysis).toBeUndefined();
      expect(mockAIRouter.complete).not.toHaveBeenCalled();
    });

    it('should handle AI analysis failure gracefully', async () => {
      const dto = {
        reportType: 'monthly' as ReportType,
        companyId: 'company-1',
        programId: 'program-1',
        periodYear: 2025,
        periodMonth: 1,
        userId: 'user-1',
      };

      const template = createMockTemplate();
      const report = createMockReport();

      vi.mocked(mockTemplateRepository.findActiveByType).mockResolvedValue(Result.ok(template));
      vi.mocked(mockReportRepository.existsMonthlyReport).mockResolvedValue(Result.ok(false));
      vi.mocked(mockProjectRepository.findAll).mockResolvedValue({ data: [], total: 0 });
      vi.mocked(mockCompanyTrainingRepository.findByCompanyId).mockResolvedValue([]);
      vi.mocked(mockEcommerceRepository.findMetricsByCompanyAndPeriod).mockResolvedValue(
        Result.ok(null)
      );
      vi.mocked(mockReportRepository.create).mockResolvedValue(Result.ok(report));
      vi.mocked(mockReportRepository.update).mockResolvedValue(Result.ok(report));
      vi.mocked(mockPromptManager.getActivePrompt).mockResolvedValue(
        Result.fail(new AppError('Prompt not found', 404))
      );

      const result = await useCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      expect(result.value?.status).toBe('completed');
      expect(result.value?.aiAnalysis).toBeUndefined();
    });

    it('should use custom template when templateId provided', async () => {
      const dto = {
        reportType: 'monthly' as ReportType,
        companyId: 'company-1',
        programId: 'program-1',
        periodYear: 2025,
        periodMonth: 1,
        templateId: 'custom-template-1',
        userId: 'user-1',
      };

      const template = createMockTemplate({ id: 'custom-template-1' });
      const report = createMockReport();

      vi.mocked(mockTemplateRepository.findById).mockResolvedValue(Result.ok(template));
      vi.mocked(mockReportRepository.existsMonthlyReport).mockResolvedValue(Result.ok(false));
      vi.mocked(mockProjectRepository.findAll).mockResolvedValue({ data: [], total: 0 });
      vi.mocked(mockCompanyTrainingRepository.findByCompanyId).mockResolvedValue([]);
      vi.mocked(mockEcommerceRepository.findMetricsByCompanyAndPeriod).mockResolvedValue(
        Result.ok(null)
      );
      vi.mocked(mockReportRepository.create).mockResolvedValue(Result.ok(report));
      vi.mocked(mockReportRepository.update).mockResolvedValue(Result.ok(report));
      vi.mocked(mockPromptManager.getActivePrompt).mockResolvedValue(
        Result.fail(new AppError('Prompt not found', 404))
      );

      const result = await useCase.execute(dto);

      expect(result.isSuccess).toBe(true);
      expect(mockTemplateRepository.findById).toHaveBeenCalledWith('custom-template-1');
      expect(mockTemplateRepository.findActiveByType).not.toHaveBeenCalled();
    });
  });
});
