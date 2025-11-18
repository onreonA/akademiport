/**
 * Generate Report Use Case
 *
 * AI destekli rapor üretimi - Verileri toplar, AI analizi yapar ve raporu oluşturur
 */

import { IProgressReportRepository } from '@/3-domain/interfaces/repositories/IProgressReportRepository';
import { IReportTemplateRepository } from '@/3-domain/interfaces/repositories/IReportTemplateRepository';
import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { ICompanyTrainingRepository } from '@/3-domain/interfaces/repositories/ICompanyTrainingRepository';
import { IEcommerceRepository } from '@/3-domain/interfaces/repositories/IEcommerceRepository';
import { IAIRouter } from '@/3-domain/interfaces/services/IAIRouter';
import { IPromptManager } from '@/3-domain/interfaces/services/IPromptManager';
import { ITokenTracker } from '@/3-domain/interfaces/services/ITokenTracker';
import { AIUseCase, AIProvider } from '@/3-domain/enums/AIEnums';
import { EcommercePlatformType } from '@/3-domain/enums/EcommerceEnums';
import { ReportType, ReportStatus, AIAnalysis } from '@/3-domain/entities/ProgressReport';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/5-shared/utils/logger';

export interface GenerateReportDto {
  reportType: ReportType;
  companyId?: string;
  programId?: string;
  projectId?: string;
  subProjectId?: string;
  consultantId?: string;
  periodYear?: number;
  periodMonth?: number;
  templateId?: string;
  userId?: string;
}

export interface GenerateReportResult {
  reportId: string;
  status: ReportStatus;
  aiAnalysis?: AIAnalysis;
}

export class GenerateReportUseCase {
  constructor(
    private reportRepository: IProgressReportRepository,
    private templateRepository: IReportTemplateRepository,
    private projectRepository: IProjectRepository,
    private trainingRepository: ITrainingRepository,
    private companyTrainingRepository: ICompanyTrainingRepository,
    private ecommerceRepository: IEcommerceRepository,
    private aiRouter: IAIRouter,
    private promptManager: IPromptManager,
    private tokenTracker: ITokenTracker
  ) {}

  async execute(dto: GenerateReportDto): Promise<Result<GenerateReportResult>> {
    try {
      // 1. Validation
      if (dto.reportType === 'monthly' && (!dto.periodYear || !dto.periodMonth)) {
        return Result.fail(new AppError('Aylık raporlar için dönem bilgisi zorunludur', 400));
      }

      // 2. Get template
      let template;
      if (dto.templateId) {
        const templateResult = await this.templateRepository.findById(dto.templateId);
        if (templateResult.isFailure || !templateResult.value) {
          return Result.fail(new AppError('Template bulunamadı', 404));
        }
        template = templateResult.value;
      } else {
        const templateResult = await this.templateRepository.findActiveByType(dto.reportType);
        if (templateResult.isFailure || !templateResult.value) {
          return Result.fail(new AppError('Aktif template bulunamadı', 404));
        }
        template = templateResult.value;
      }

      // 3. Check if monthly report already exists
      if (
        dto.reportType === 'monthly' &&
        dto.companyId &&
        dto.programId &&
        dto.periodYear &&
        dto.periodMonth
      ) {
        const existsResult = await this.reportRepository.existsMonthlyReport(
          dto.companyId,
          dto.programId,
          dto.periodYear,
          dto.periodMonth
        );
        if (existsResult.isSuccess && existsResult.value) {
          return Result.fail(new AppError('Bu dönem için rapor zaten mevcut', 409));
        }
      }

      // 4. Collect report data
      const contentResult = await this.collectReportData(dto);
      if (contentResult.isFailure) {
        return Result.fail(contentResult.error || new AppError('Rapor verileri toplanamadı', 500));
      }

      const content = contentResult.value;

      // 5. Generate title
      const title = this.generateTitle(dto, content);

      // 6. Create report with pending status
      const createResult = await this.reportRepository.create({
        companyId: dto.companyId || null,
        programId: dto.programId || null,
        projectId: dto.projectId || null,
        subProjectId: dto.subProjectId || null,
        consultantId: dto.consultantId || null,
        reportType: dto.reportType,
        title,
        periodYear: dto.periodYear || null,
        periodMonth: dto.periodMonth || null,
        templateId: template.id,
        content,
        metadata: {
          generatedBy: dto.userId || null,
          templateVersion: template.version,
        },
      });

      if (createResult.isFailure) {
        return Result.fail(createResult.error || new AppError('Rapor oluşturulamadı', 500));
      }

      const report = createResult.value;

      // 7. Update status to generating
      await this.reportRepository.update(report.id, { status: 'generating' });

      // 8. Generate AI analysis if enabled
      let aiAnalysis: AIAnalysis | null = null;
      if (template.aiEnabled) {
        const aiResult = await this.generateAIAnalysis(dto, content, template);
        if (aiResult.isSuccess && aiResult.value) {
          aiAnalysis = aiResult.value;
          await this.reportRepository.update(report.id, {
            aiAnalysis,
            status: 'completed',
          });
        } else {
          // AI analizi başarısız olsa bile raporu tamamla
          logger.error('AI analysis failed', { error: aiResult.error, reportId: report.id });
          await this.reportRepository.update(report.id, {
            status: 'completed',
            errorMessage: 'AI analizi oluşturulamadı',
          });
        }
      } else {
        // AI disabled, mark as completed
        await this.reportRepository.update(report.id, { status: 'completed' });
      }

      return Result.ok({
        reportId: report.id,
        status: 'completed',
        aiAnalysis: aiAnalysis || undefined,
      });
    } catch (error) {
      logger.error('GenerateReportUseCase error', { error, dto });
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Rapor oluşturulamadı', 500)
      );
    }
  }

  private async collectReportData(dto: GenerateReportDto): Promise<Result<Record<string, any>>> {
    const content: Record<string, any> = {
      reportType: dto.reportType,
      period:
        dto.periodYear && dto.periodMonth ? { year: dto.periodYear, month: dto.periodMonth } : null,
    };

    try {
      // Collect projects data
      if (dto.companyId || dto.projectId) {
        try {
          const projectsResult = await this.projectRepository.findAll({
            companyId: dto.companyId || undefined,
            limit: 100,
          });
          content.projects = projectsResult.data.map((p) => ({
            id: p.id,
            name: p.name,
            status: p.status,
            progress: p.progress,
            priority: p.priority,
            startDate: p.startDate,
            endDate: p.endDate,
          }));
        } catch (error) {
          logger.warn('Failed to collect projects data', { error, companyId: dto.companyId });
          content.projects = [];
        }
      }

      // Collect trainings data
      if (dto.companyId) {
        try {
          // Get company trainings (assignments)
          const companyTrainings = await this.companyTrainingRepository.findByCompanyId(
            dto.companyId
          );

          // Get training details for each assignment
          const trainings = await Promise.all(
            companyTrainings.map(async (ct) => {
              const training = await this.trainingRepository.findById(ct.trainingId);
              if (!training) return null;

              return {
                id: training.id,
                name: training.name,
                type: training.priority, // Using priority as type
                progress: 0, // Progress would need to come from TrainingProgressRepository
                status: ct.status,
              };
            })
          );

          content.trainings = trainings.filter((t) => t !== null);
        } catch (error) {
          logger.warn('Failed to collect trainings data', { error, companyId: dto.companyId });
          content.trainings = [];
        }
      }

      // Collect ecommerce metrics
      if (dto.companyId && dto.programId) {
        if (dto.reportType === 'monthly' && dto.periodYear && dto.periodMonth) {
          const metricsResult = await this.ecommerceRepository.findMetricsByCompanyAndPeriod(
            dto.companyId,
            dto.programId,
            dto.periodYear,
            dto.periodMonth,
            EcommercePlatformType.ALIBABA // Default platform
          );
          if (metricsResult.isSuccess && metricsResult.value) {
            content.ecommerceMetrics = {
              visitors: metricsResult.value.totalVisitors,
              products: metricsResult.value.totalProducts,
              orders: metricsResult.value.totalOrders,
              revenue: metricsResult.value.totalRevenue,
            };
          }
        }
      }

      return Result.ok(content);
    } catch (error) {
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Veri toplama hatası', 500)
      );
    }
  }

  private generateTitle(dto: GenerateReportDto, content: Record<string, any>): string {
    const typeLabels: Record<ReportType, string> = {
      interim: 'Ara Rapor',
      monthly: 'Aylık Rapor',
      program: 'Program Raporu',
      company: 'Firma Raporu',
      ministry: 'Bakanlık Raporu',
    };

    let title = typeLabels[dto.reportType];

    if (dto.reportType === 'monthly' && dto.periodYear && dto.periodMonth) {
      const monthNames = [
        'Ocak',
        'Şubat',
        'Mart',
        'Nisan',
        'Mayıs',
        'Haziran',
        'Temmuz',
        'Ağustos',
        'Eylül',
        'Ekim',
        'Kasım',
        'Aralık',
      ];
      title += ` - ${monthNames[dto.periodMonth - 1]} ${dto.periodYear}`;
    }

    if (content.companyName) {
      title += ` - ${content.companyName}`;
    }

    return title;
  }

  private async generateAIAnalysis(
    dto: GenerateReportDto,
    content: Record<string, any>,
    template: any
  ): Promise<Result<AIAnalysis | null>> {
    try {
      // Get prompt for report generation
      const promptResult = await this.promptManager.getActivePrompt(AIUseCase.REPORT_GENERATION);

      if (promptResult.isFailure || !promptResult.value) {
        return Result.fail(new AppError('Prompt bulunamadı', 404));
      }

      const prompt = promptResult.value;

      // Prepare context for AI
      const context = {
        report_type: dto.reportType,
        company_id: dto.companyId || '',
        program_id: dto.programId || '',
        period:
          dto.periodYear && dto.periodMonth
            ? `${dto.periodYear}-${String(dto.periodMonth).padStart(2, '0')}`
            : '',
        projects_count: content.projects?.length || 0,
        trainings_count: content.trainings?.length || 0,
        ecommerce_revenue: content.ecommerceMetrics?.revenue || 0,
        report_data: JSON.stringify(content, null, 2),
      };

      // Render prompt
      const renderedPrompt = this.promptManager.renderPrompt(prompt, context);

      // Call AI
      const aiResult = await this.aiRouter.complete(AIUseCase.REPORT_GENERATION, renderedPrompt, {
        temperature: prompt.temperature,
        maxTokens: prompt.maxTokens,
        topP: prompt.topP,
        userId: dto.userId || undefined,
        companyId: dto.companyId || undefined,
        programId: dto.programId || undefined,
        metadata: {
          reportType: dto.reportType,
          promptId: prompt.id,
          promptVersion: prompt.version,
        },
      });

      if (aiResult.isFailure) {
        return Result.fail(aiResult.error || new AppError('AI analizi oluşturulamadı', 500));
      }

      // Parse AI response
      const aiResponse = aiResult.value;
      // AI router returns { text: string, ... } structure
      const responseText =
        typeof aiResponse === 'string'
          ? aiResponse
          : (aiResponse as any)?.text || JSON.stringify(aiResponse);
      let analysis: AIAnalysis;

      try {
        // Try to parse as JSON
        const parsed = JSON.parse(responseText);
        analysis = {
          summary: parsed.summary || '',
          strengths: parsed.strengths || [],
          weaknesses: parsed.weaknesses || [],
          recommendations: parsed.recommendations || [],
          riskScore: parsed.riskScore || 0,
          successProbability: parsed.successProbability || 0,
        };
      } catch {
        // If not JSON, treat as summary only
        analysis = {
          summary: responseText,
          strengths: [],
          weaknesses: [],
          recommendations: [],
          riskScore: 50,
          successProbability: 50,
        };
      }

      return Result.ok(analysis);
    } catch (error) {
      logger.error('AI analysis generation error', { error, dto });
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'AI analizi oluşturulamadı', 500)
      );
    }
  }
}
