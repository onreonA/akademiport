/**
 * Analyze Company Risk Use Case
 *
 * AI ile firma risk analizi yapar
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

export interface AnalyzeCompanyRiskDto {
  companyId: string;
  userId?: string;
  programId?: string;
}

export interface CompanyRiskResult {
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  analysis: string;
  factors: Array<{
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
    score: number; // 0-100
  }>;
  recommendations: string[];
  projectProgress: {
    total: number;
    completed: number;
    inProgress: number;
    averageProgress: number;
  };
  trainingProgress: {
    total: number;
    completed: number;
    inProgress: number;
    averageProgress: number;
  };
  eventParticipation: {
    total: number;
    attended: number;
    attendanceRate: number;
  };
}

export class AnalyzeCompanyRiskUseCase {
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

  async execute(dto: AnalyzeCompanyRiskDto): Promise<Result<CompanyRiskResult>> {
    try {
      // Get company
      const companyResult = await this.companyRepository.findById(dto.companyId);
      if (companyResult.isFailure || !companyResult.value) {
        return Result.fail(new AppError('Company not found', 404));
      }
      const company = companyResult.value;

      // Collect company data
      const companyData = await this.collectCompanyData(dto.companyId, dto.programId);

      // Get active prompt for risk analysis
      const promptResult = await this.promptManager.getActivePrompt(AIUseCase.RISK_ANALYSIS);

      if (promptResult.isFailure) {
        return Result.fail(new AppError('Failed to get prompt template', 500));
      }

      const prompt = promptResult.value;

      if (!prompt) {
        return Result.fail(new AppError('No active prompt found for risk analysis', 404));
      }

      // Render prompt with variables
      const renderedPrompt = this.promptManager.renderPrompt(prompt, {
        company_name: company.name,
        company_email: company.email || 'N/A',
        project_data: JSON.stringify(companyData.projects),
        training_data: JSON.stringify(companyData.trainings),
        event_data: JSON.stringify(companyData.events),
        overall_stats: JSON.stringify(companyData.stats),
      });

      // Call AI
      const aiResult = await this.aiRouter.complete(AIUseCase.RISK_ANALYSIS, renderedPrompt, {
        temperature: prompt.temperature,
        maxTokens: prompt.maxTokens,
        topP: prompt.topP,
        userId: dto.userId,
        companyId: dto.companyId,
        programId: dto.programId,
        metadata: {
          companyId: dto.companyId,
          companyName: company.name,
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
          useCase: AIUseCase.RISK_ANALYSIS,
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
          },
        });

        return Result.fail(
          new AppError(aiResult.error?.message || 'Failed to analyze company risk', 500)
        );
      }

      const aiResponse = aiResult.value;

      // Parse AI response (JSON format)
      let parsedResult: CompanyRiskResult;
      try {
        // Try to parse as JSON first
        const jsonMatch =
          aiResponse.text.match(/```json\s*([\s\S]*?)\s*```/) ||
          aiResponse.text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
          // Fallback: parse from structured text
          parsedResult = this.parseStructuredText(aiResponse.text, companyData);
        }
      } catch (parseError) {
        logger.warn('Failed to parse AI response as JSON, using fallback parser', parseError);
        parsedResult = this.parseStructuredText(aiResponse.text, companyData);
      }

      // Log usage
      await this.tokenTracker.logUsage({
        userId: dto.userId || null,
        companyId: dto.companyId || null,
        programId: dto.programId || null,
        provider: aiResponse.provider,
        model: aiResponse.model,
        useCase: AIUseCase.RISK_ANALYSIS,
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
        },
      });

      return Result.ok(parsedResult);
    } catch (error) {
      logger.error('Error in AnalyzeCompanyRiskUseCase:', error);
      return Result.fail(
        new AppError(error instanceof Error ? error.message : 'Failed to analyze company risk', 500)
      );
    }
  }

  /**
   * Collect company data for analysis
   */
  private async collectCompanyData(companyId: string, programId?: string) {
    // Get projects
    const projects = await this.projectRepository.findByCompanyId(companyId);
    const projectStats = {
      total: projects.length,
      completed: projects.filter((p) => p.status === 'done').length,
      inProgress: projects.filter((p) => p.status === 'in_progress').length,
      averageProgress:
        projects.length > 0
          ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
          : 0,
    };

    // Get trainings
    const companyTrainings = await this.trainingRepository.findAll({
      programId: programId || undefined,
    });
    const trainings = companyTrainings.data || [];

    // Calculate training progress
    let trainingStats = {
      total: 0,
      completed: 0,
      inProgress: 0,
      averageProgress: 0,
    };

    if (trainings.length > 0) {
      const trainingProgresses: number[] = [];
      for (const training of trainings) {
        try {
          const progressList = await this.trainingProgressRepository.findByCompanyAndTraining(
            companyId,
            training.id
          );
          const overallProgress =
            progressList.length > 0
              ? Math.round(
                  progressList.reduce((sum, p) => sum + p.progressPercentage, 0) /
                    progressList.length
                )
              : 0;
          trainingProgresses.push(overallProgress);
        } catch (error) {
          logger.warn(`Failed to get training progress for ${training.id}:`, error);
        }
      }

      trainingStats = {
        total: trainings.length,
        completed: trainingProgresses.filter((p) => p === 100).length,
        inProgress: trainingProgresses.filter((p) => p > 0 && p < 100).length,
        averageProgress:
          trainingProgresses.length > 0
            ? Math.round(
                trainingProgresses.reduce((sum, p) => sum + p, 0) / trainingProgresses.length
              )
            : 0,
      };
    }

    // Get events (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const events = await this.eventRepository.findByProgramId(programId || '');
    const recentEvents = events.filter((e) => new Date(e.startTime) >= thirtyDaysAgo);

    // Get event attendances
    let eventStats = {
      total: 0,
      attended: 0,
      attendanceRate: 0,
    };

    if (recentEvents.length > 0) {
      let totalAttendances = 0;
      for (const event of recentEvents) {
        try {
          const attendees = await this.eventRepository.getAttendees(event.id);
          const companyAttendees = attendees.filter((a) => a.companyId === companyId);
          totalAttendances += companyAttendees.length;
        } catch (error) {
          logger.warn(`Failed to get attendees for event ${event.id}:`, error);
        }
      }

      eventStats = {
        total: recentEvents.length,
        attended: totalAttendances,
        attendanceRate:
          recentEvents.length > 0 ? Math.round((totalAttendances / recentEvents.length) * 100) : 0,
      };
    }

    return {
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        progress: p.progress,
        priority: p.priority,
      })),
      trainings: trainings.map((t) => ({
        id: t.id,
        name: t.name,
        status: t.status,
      })),
      events: recentEvents.map((e) => ({
        id: e.id,
        title: e.title,
        startTime: e.startTime.toISOString(),
        status: e.status,
      })),
      stats: {
        project: projectStats,
        training: trainingStats,
        event: eventStats,
      },
    };
  }

  /**
   * Parse structured text response (fallback)
   */
  private parseStructuredText(text: string, companyData: any): CompanyRiskResult {
    // Extract risk score
    const scoreMatch = text.match(/(?:Risk Skoru|Risk Score)[:\s]*(\d+)/i);
    const riskScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 50;

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    if (riskScore >= 80) riskLevel = 'critical';
    else if (riskScore >= 60) riskLevel = 'high';
    else if (riskScore >= 30) riskLevel = 'medium';
    else riskLevel = 'low';

    // Extract analysis
    const analysisMatch = text.match(
      /(?:Analiz|Analysis)[:\s]*([\s\S]*?)(?=Faktörler|Factors|Öneriler|Recommendations|$)/i
    );
    const analysis = analysisMatch ? analysisMatch[1].trim() : text.substring(0, 500);

    // Extract factors
    const factors: Array<{
      name: string;
      impact: 'positive' | 'negative' | 'neutral';
      description: string;
      score: number;
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
      riskScore: Math.min(100, Math.max(0, riskScore)),
      riskLevel,
      analysis,
      factors: factors.slice(0, 10),
      recommendations: recommendations.slice(0, 10),
      projectProgress: companyData.stats.project,
      trainingProgress: companyData.stats.training,
      eventParticipation: companyData.stats.event,
    };
  }
}
