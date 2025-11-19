/**
 * Get AI Insights Use Case
 *
 * Dashboard için AI destekli analiz ve öneriler üretir
 */

import { IAIRouter } from '@/3-domain/interfaces/services/IAIRouter';
import { IPromptManager } from '@/3-domain/interfaces/services/IPromptManager';
import { ITokenTracker } from '@/3-domain/interfaces/services/ITokenTracker';
import { IUserRepository } from '@/3-domain/interfaces/IUserRepository';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { ITaskRepository } from '@/3-domain/interfaces/repositories/ITaskRepository';
import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { IEventRepository } from '@/3-domain/interfaces/repositories/IEventRepository';
import { AIUseCase, AIRequestStatus } from '@/3-domain/enums/AIEnums';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/5-shared/utils/logger';

export interface GetAIInsightsDto {
  userId: string;
  dashboardType: 'master' | 'consultant' | 'company';
  companyId?: string;
  programId?: string;
}

export interface AIInsight {
  type: 'trend' | 'anomaly' | 'recommendation';
  title: string;
  description: string;
  severity?: 'low' | 'medium' | 'high';
  category: string;
  data?: Record<string, any>;
}

export interface AIInsightsResult {
  insights: AIInsight[];
  trends: Array<{
    metric: string;
    direction: 'up' | 'down' | 'stable';
    change: number;
    period: string;
  }>;
  anomalies: Array<{
    metric: string;
    expectedValue: number;
    actualValue: number;
    deviation: number;
    description: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    actionItems: string[];
  }>;
}

export class GetAIInsightsUseCase {
  constructor(
    private aiRouter: IAIRouter,
    private promptManager: IPromptManager,
    private tokenTracker: ITokenTracker,
    private userRepository: IUserRepository,
    private companyRepository: ICompanyRepository,
    private projectRepository: IProjectRepository,
    private taskRepository: ITaskRepository,
    private trainingRepository: ITrainingRepository,
    private eventRepository: IEventRepository
  ) {}

  async execute(dto: GetAIInsightsDto): Promise<Result<AIInsightsResult>> {
    try {
      // Collect dashboard data
      const dashboardData = await this.collectDashboardData(dto);

      // Get active prompt for AI insights
      const promptResult = await this.promptManager.getActivePrompt(AIUseCase.TREND_ANALYSIS);

      if (promptResult.isFailure) {
        return Result.fail(new AppError('Failed to get prompt template', 500));
      }

      const prompt = promptResult.value;

      if (!prompt) {
        return Result.fail(new AppError('No active prompt found for AI insights', 404));
      }

      // Render prompt with dashboard data
      const renderedPrompt = this.promptManager.renderPrompt(prompt, {
        dashboard_type: dto.dashboardType,
        dashboard_data: JSON.stringify(dashboardData),
        user_id: dto.userId,
        company_id: dto.companyId || '',
        program_id: dto.programId || '',
      });

      // Call AI
      const aiResult = await this.aiRouter.complete(AIUseCase.TREND_ANALYSIS, renderedPrompt, {
        temperature: 0.7,
        maxTokens: 2000,
        userId: dto.userId,
        companyId: dto.companyId,
        programId: dto.programId,
        metadata: {
          dashboardType: dto.dashboardType,
          promptId: prompt.id,
          promptVersion: prompt.version,
        },
      });

      if (aiResult.isFailure) {
        logger.error('AI insights generation failed:', aiResult.error);
        return Result.fail(
          new AppError(
            aiResult.error instanceof Error
              ? aiResult.error.message
              : 'Failed to generate AI insights',
            500
          )
        );
      }

      // Parse AI response
      const aiResponse = aiResult.value;
      let parsedInsights: AIInsightsResult;

      try {
        // Try to parse JSON from AI response
        const jsonMatch = aiResponse.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedInsights = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: Generate structured response from text
          parsedInsights = this.parseAIResponse(aiResponse.text, dashboardData);
        }
      } catch (parseError) {
        logger.warn('Failed to parse AI response as JSON, using fallback parser');
        parsedInsights = this.parseAIResponse(aiResponse.text, dashboardData);
      }

      // Track token usage
      await this.tokenTracker.logUsage({
        provider: aiResponse.provider,
        model: aiResponse.model,
        useCase: AIUseCase.TREND_ANALYSIS,
        userId: dto.userId,
        companyId: dto.companyId,
        programId: dto.programId,
        promptId: prompt.id,
        promptVersion: prompt.version,
        requestText: renderedPrompt,
        responseText: aiResponse.text,
        requestTokens: aiResponse.requestTokens || 0,
        responseTokens: aiResponse.responseTokens || 0,
        totalTokens: aiResponse.totalTokens || 0,
        costUsd: aiResponse.costUsd || 0,
        status: AIRequestStatus.SUCCESS,
        durationMs: aiResponse.durationMs || 0,
        metadata: {
          dashboardType: dto.dashboardType,
        },
      });

      return Result.ok(parsedInsights);
    } catch (error: any) {
      logger.error('GetAIInsightsUseCase error:', error);
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private async collectDashboardData(dto: GetAIInsightsDto): Promise<any> {
    const data: any = {
      dashboardType: dto.dashboardType,
      timestamp: new Date().toISOString(),
    };

    try {
      if (dto.dashboardType === 'master') {
        // Master Admin Dashboard data
        const usersResult = await this.userRepository.findAll();
        const companiesResult = await this.companyRepository.findWithFilters({
          isActive: true,
          page: 1,
          limit: 1000,
          sortBy: 'name',
          sortOrder: 'asc',
        });
        const projectsResult = await this.projectRepository.findAll();
        // Note: ITaskRepository doesn't have findAll method, skipping task stats for master dashboard
        // Tasks are accessed through sub-projects in the actual implementation

        data.totalUsers = usersResult.isSuccess ? usersResult.value?.length || 0 : 0;
        data.totalCompanies = companiesResult.isSuccess
          ? companiesResult.value?.companies?.length || 0
          : 0;
        data.totalProjects = projectsResult.data?.length || 0;
        data.totalTasks = 0; // Not available through ITaskRepository interface
        data.completedTasks = 0; // Not available through ITaskRepository interface
      } else if (dto.dashboardType === 'consultant') {
        // Consultant Dashboard data
        if (dto.companyId) {
          const companyResult = await this.companyRepository.findById(dto.companyId);
          if (companyResult.isSuccess && companyResult.value) {
            const company = companyResult.value;
            data.companyName = company.name;
            data.companyStatus = company.isActive ? 'active' : 'inactive';
          }
        }

        if (dto.programId) {
          // Note: IProjectRepository doesn't have findByProgramId method
          // Use findAll and filter manually if needed, or skip project stats for consultant dashboard
          const trainingsResult = await this.trainingRepository.findByProgramId(dto.programId);
          const eventsResult = await this.eventRepository.findByProgramId(dto.programId);

          data.totalProjects = 0; // Not available through IProjectRepository interface
          data.totalTrainings = trainingsResult?.length || 0;
          data.totalEvents = eventsResult?.length || 0;
        }
      } else if (dto.dashboardType === 'company') {
        // Company Dashboard data
        if (dto.companyId) {
          const companyResult = await this.companyRepository.findById(dto.companyId);
          if (companyResult.isSuccess && companyResult.value) {
            const company = companyResult.value;
            data.companyName = company.name;
            data.companyStatus = company.isActive ? 'active' : 'inactive';
          }

          const projectsResult = await this.projectRepository.findByCompanyId(dto.companyId);
          // Note: ITaskRepository, ITrainingRepository, and IEventRepository don't have findByCompanyId methods
          // These are accessed through other relationships in the actual implementation
          // const trainingsResult = await this.trainingRepository.findByCompanyId(dto.companyId);
          // const eventsResult = await this.eventRepository.findByCompanyId(dto.companyId);

          data.totalProjects = projectsResult?.length || 0;
          data.totalTasks = 0; // Not available through ITaskRepository interface
          data.totalTrainings = 0; // Not available through ITrainingRepository interface
          data.totalEvents = 0; // Not available through IEventRepository interface
          data.completedTasks = 0; // Not available through ITaskRepository interface
        }
      }
    } catch (error) {
      logger.error('Error collecting dashboard data:', error);
    }

    return data;
  }

  private parseAIResponse(text: string, dashboardData: any): AIInsightsResult {
    // Fallback parser for when AI doesn't return structured JSON
    const insights: AIInsight[] = [];
    const trends: AIInsightsResult['trends'] = [];
    const anomalies: AIInsightsResult['anomalies'] = [];
    const recommendations: AIInsightsResult['recommendations'] = [];

    // Simple parsing logic - extract key insights from text
    const lines = text.split('\n').filter((line) => line.trim());

    lines.forEach((line) => {
      const lowerLine = line.toLowerCase();
      if (
        lowerLine.includes('trend') ||
        lowerLine.includes('artış') ||
        lowerLine.includes('azalış')
      ) {
        trends.push({
          metric: 'general',
          direction: lowerLine.includes('artış') || lowerLine.includes('increase') ? 'up' : 'down',
          change: 0,
          period: 'recent',
        });
      }

      if (
        lowerLine.includes('anomali') ||
        lowerLine.includes('anomaly') ||
        lowerLine.includes('dikkat')
      ) {
        insights.push({
          type: 'anomaly',
          title: 'Anomali Tespiti',
          description: line,
          severity: 'medium',
          category: 'general',
        });
      }

      if (
        lowerLine.includes('öneri') ||
        lowerLine.includes('recommendation') ||
        lowerLine.includes('tavsiye')
      ) {
        recommendations.push({
          title: 'Öneri',
          description: line,
          priority: 'medium',
          actionItems: [],
        });
      }
    });

    return {
      insights,
      trends,
      anomalies,
      recommendations,
    };
  }
}
