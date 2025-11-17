/**
 * Analyze Trends Use Case
 *
 * AI ile firma trend analizi yapar
 */

import { IAIRouter } from '@/3-domain/interfaces/services/IAIRouter';
import { IPromptManager } from '@/3-domain/interfaces/services/IPromptManager';
import { ITokenTracker } from '@/3-domain/interfaces/services/ITokenTracker';
import { IProjectRepository } from '@/3-domain/interfaces/repositories/IProjectRepository';
import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { ITrainingProgressRepository } from '@/3-domain/interfaces/repositories/ITrainingProgressRepository';
import { IEventRepository } from '@/3-domain/interfaces/repositories/IEventRepository';
import { ICompanyRepository } from '@/3-domain/interfaces/ICompanyRepository';
import { AIUseCase, AIRequestStatus, AIProvider } from '@/3-domain/enums/AIEnums';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/5-shared/utils/logger';

export interface AnalyzeTrendsDto {
  companyId: string;
  userId?: string;
  programId?: string;
  period?: 'week' | 'month' | 'quarter' | 'year'; // Default: month
}

export interface TrendAnalysisResult {
  trends: Array<{
    category: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    description: string;
    changePercentage: number;
    dataPoints: Array<{
      date: string;
      value: number;
    }>;
  }>;
  insights: string[];
  predictions: Array<{
    metric: string;
    predictedValue: number;
    confidence: number; // 0-100
    timeframe: string;
  }>;
  recommendations: string[];
}

export class AnalyzeTrendsUseCase {
  constructor(
    private aiRouter: IAIRouter,
    private promptManager: IPromptManager,
    private tokenTracker: ITokenTracker,
    private projectRepository: IProjectRepository,
    private trainingRepository: ITrainingRepository,
    private trainingProgressRepository: ITrainingProgressRepository,
    private eventRepository: IEventRepository,
    private companyRepository: ICompanyRepository
  ) {}

  async execute(dto: AnalyzeTrendsDto): Promise<Result<TrendAnalysisResult>> {
    try {
      // Get company
      const companyResult = await this.companyRepository.findById(dto.companyId);
      if (companyResult.isFailure || !companyResult.value) {
        return Result.fail(new AppError('Company not found', 404));
      }
      const company = companyResult.value;

      // Collect historical data
      const period = dto.period || 'month';
      const trendData = await this.collectTrendData(dto.companyId, dto.programId, period);

      // Get active prompt for trend analysis
      const promptResult = await this.promptManager.getActivePrompt(AIUseCase.TREND_ANALYSIS);

      if (promptResult.isFailure) {
        return Result.fail(new AppError('Failed to get prompt template', 500));
      }

      const prompt = promptResult.value;

      if (!prompt) {
        return Result.fail(new AppError('No active prompt found for trend analysis', 404));
      }

      // Render prompt with variables
      const renderedPrompt = this.promptManager.renderPrompt(prompt, {
        company_name: company.name,
        period: period,
        trend_data: JSON.stringify(trendData),
      });

      // Call AI
      const aiResult = await this.aiRouter.complete(AIUseCase.TREND_ANALYSIS, renderedPrompt, {
        temperature: prompt.temperature,
        maxTokens: prompt.maxTokens,
        topP: prompt.topP,
        userId: dto.userId,
        companyId: dto.companyId,
        programId: dto.programId,
        metadata: {
          companyId: dto.companyId,
          companyName: company.name,
          period,
          promptId: prompt.id,
          promptVersion: prompt.version,
        },
      });

      if (aiResult.isFailure) {
        // Log error
        await this.tokenTracker.logUsage({
          userId: dto.userId || null,
          companyId: dto.companyId || null,
          programId: dto.programId || null,
          provider: AIProvider.CLAUDE, // Default fallback
          model: prompt.model,
          useCase: AIUseCase.TREND_ANALYSIS,
          promptId: prompt.id,
          promptVersion: prompt.version,
          requestText: renderedPrompt,
          responseText: null,
          requestTokens: 0,
          responseTokens: 0,
          totalTokens: 0,
          costUsd: 0,
          status: AIRequestStatus.ERROR,
          errorMessage: aiResult.error?.message || 'Unknown error',
          errorCode: aiResult.error?.code,
          durationMs: null,
          metadata: {
            companyId: dto.companyId,
            period,
          },
        });

        return Result.fail(
          new AppError(aiResult.error?.message || 'Failed to analyze trends', 500)
        );
      }

      const aiResponse = aiResult.value;

      // Parse AI response (JSON format)
      let parsedResult: TrendAnalysisResult;
      try {
        // Try to parse as JSON first
        const jsonMatch =
          aiResponse.text.match(/```json\s*([\s\S]*?)\s*```/) ||
          aiResponse.text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
          // Fallback: parse from structured text
          parsedResult = this.parseStructuredText(aiResponse.text, trendData);
        }
      } catch (parseError) {
        logger.warn('Failed to parse AI response as JSON, using fallback parser', parseError);
        parsedResult = this.parseStructuredText(aiResponse.text, trendData);
      }

      // Log usage
      await this.tokenTracker.logUsage({
        userId: dto.userId || null,
        companyId: dto.companyId || null,
        programId: dto.programId || null,
        provider: aiResponse.provider,
        model: aiResponse.model,
        useCase: AIUseCase.TREND_ANALYSIS,
        promptId: prompt.id,
        promptVersion: prompt.version,
        requestText: renderedPrompt,
        responseText: aiResponse.text,
        requestTokens: aiResponse.requestTokens,
        responseTokens: aiResponse.responseTokens,
        totalTokens: aiResponse.totalTokens,
        costUsd: aiResponse.costUsd,
        status: AIRequestStatus.SUCCESS,
        durationMs: aiResponse.durationMs,
        metadata: {
          companyId: dto.companyId,
          companyName: company.name,
          period,
        },
      });

      return Result.ok(parsedResult);
    } catch (error) {
      logger.error('Error in AnalyzeTrendsUseCase:', error);
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to analyze trends', 500)
      );
    }
  }

  /**
   * Collect trend data for analysis
   */
  private async collectTrendData(companyId: string, programId?: string, period: string = 'month') {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Get projects over time
    const projects = await this.projectRepository.findByCompanyId(companyId);
    const projectsOverTime = projects
      .filter((p) => new Date(p.createdAt) >= startDate)
      .map((p) => ({
        date: p.createdAt.toISOString().split('T')[0],
        progress: p.progress,
        status: p.status,
      }));

    // Get training progress over time
    const trainings = await this.trainingRepository.findAll({
      programId: programId || undefined,
    });

    const trainingProgressOverTime: Array<{ date: string; progress: number }> = [];
    for (const training of trainings.data || []) {
      try {
        const progressList = await this.trainingProgressRepository.findByCompanyAndTraining(
          companyId,
          training.id
        );
        if (progressList.length > 0) {
          const latestProgress = progressList[progressList.length - 1];
          trainingProgressOverTime.push({
            date: latestProgress.updatedAt.toISOString().split('T')[0],
            progress: latestProgress.progressPercentage,
          });
        }
      } catch (error) {
        logger.warn(`Failed to get training progress for ${training.id}:`, error);
      }
    }

    // Get events over time
    const events = await this.eventRepository.findByProgramId(programId || '');
    const eventsOverTime = events
      .filter((e) => new Date(e.startTime) >= startDate)
      .map((e) => ({
        date: e.startTime.toISOString().split('T')[0],
        attended: false, // Will be updated below
      }));

    // Get event attendances
    for (const event of eventsOverTime) {
      try {
        const attendees = await this.eventRepository.getAttendees(
          events.find((e) => e.startTime.toISOString().split('T')[0] === event.date)?.id || ''
        );
        event.attended = attendees.some((a) => a.companyId === companyId);
      } catch (error) {
        logger.warn(`Failed to get attendees for event:`, error);
      }
    }

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      projects: projectsOverTime,
      trainingProgress: trainingProgressOverTime,
      events: eventsOverTime,
    };
  }

  /**
   * Parse structured text response (fallback)
   */
  private parseStructuredText(text: string, trendData: any): TrendAnalysisResult {
    // Extract trends
    const trends: Array<{
      category: string;
      trend: 'increasing' | 'decreasing' | 'stable';
      description: string;
      changePercentage: number;
      dataPoints: Array<{ date: string; value: number }>;
    }> = [];

    // Extract insights
    const insights: string[] = [];
    const insightsMatches = text.match(
      /(?:İçgörüler|Insights)[:\s]*([\s\S]*?)(?=Tahminler|Predictions|Öneriler|Recommendations|$)/i
    );
    if (insightsMatches) {
      const insightsText = insightsMatches[1];
      const insightsMatches2 = insightsText.matchAll(/(?:^\d+\.|^[-*])\s*(.+?)(?:\n|$)/gm);
      for (const match of insightsMatches2) {
        insights.push(match[1].trim());
      }
    }

    // Extract predictions
    const predictions: Array<{
      metric: string;
      predictedValue: number;
      confidence: number;
      timeframe: string;
    }> = [];

    // Extract recommendations
    const recommendations: string[] = [];
    const recMatches = text.match(/(?:Öneriler|Recommendations)[:\s]*([\s\S]*?)(?=$)/i);
    if (recMatches) {
      const recText = recMatches[1];
      const recMatches2 = recText.matchAll(/(?:^\d+\.|^[-*])\s*(.+?)(?:\n|$)/gm);
      for (const match of recMatches2) {
        recommendations.push(match[1].trim());
      }
    }

    return {
      trends: trends.slice(0, 10),
      insights: insights.slice(0, 10),
      predictions: predictions.slice(0, 5),
      recommendations: recommendations.slice(0, 10),
    };
  }
}
