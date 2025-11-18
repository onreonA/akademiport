/**
 * Generate Training Summary Use Case
 *
 * AI ile eğitim özeti ve anahtar kelimeler üretir
 */

import { IAIRouter } from '@/3-domain/interfaces/services/IAIRouter';
import { IPromptManager } from '@/3-domain/interfaces/services/IPromptManager';
import { ITokenTracker } from '@/3-domain/interfaces/services/ITokenTracker';
import { ITrainingRepository } from '@/3-domain/interfaces/repositories/ITrainingRepository';
import { ITrainingVideoRepository } from '@/3-domain/interfaces/repositories/ITrainingVideoRepository';
import { ITrainingDocumentRepository } from '@/3-domain/interfaces/repositories/ITrainingDocumentRepository';
import { AIUseCase, AIRequestStatus, AIProvider } from '@/3-domain/enums/AIEnums';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/5-shared/utils/logger';

export interface GenerateTrainingSummaryDto {
  trainingId: string;
  userId?: string;
  companyId?: string;
  programId?: string;
}

export interface TrainingSummaryResult {
  summary: string;
  keyPoints: string[];
  estimatedDuration?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  learningOutcomes: string[];
}

export class GenerateTrainingSummaryUseCase {
  constructor(
    private aiRouter: IAIRouter,
    private promptManager: IPromptManager,
    private tokenTracker: ITokenTracker,
    private trainingRepository: ITrainingRepository,
    private trainingVideoRepository: ITrainingVideoRepository,
    private trainingDocumentRepository: ITrainingDocumentRepository
  ) {}

  async execute(dto: GenerateTrainingSummaryDto): Promise<Result<TrainingSummaryResult>> {
    try {
      // Get training
      const training = await this.trainingRepository.findById(dto.trainingId);
      if (!training) {
        return Result.fail(new AppError('Training not found', 404));
      }

      // Get training videos
      const videos = await this.trainingVideoRepository.findByTrainingId(dto.trainingId);

      // Get training documents
      const documents = await this.trainingDocumentRepository.findByTrainingId(dto.trainingId);

      // Build content context
      const contentContext = this.buildContentContext(training, videos, documents);

      // Get active prompt for document summary
      const promptResult = await this.promptManager.getActivePrompt(AIUseCase.DOCUMENT_SUMMARY);

      if (promptResult.isFailure) {
        return Result.fail(new AppError('Failed to get prompt template', 500));
      }

      const prompt = promptResult.value;

      if (!prompt) {
        return Result.fail(new AppError('No active prompt found for document summary', 404));
      }

      // Render prompt with variables
      const renderedPrompt = this.promptManager.renderPrompt(prompt, {
        training_name: training.name,
        training_description: training.description || 'Açıklama yok',
        content_context: contentContext,
        video_count: videos.length,
        document_count: documents.length,
      });

      // Call AI
      const aiResult = await this.aiRouter.complete(AIUseCase.DOCUMENT_SUMMARY, renderedPrompt, {
        temperature: prompt.temperature,
        maxTokens: prompt.maxTokens,
        topP: prompt.topP,
        userId: dto.userId,
        companyId: dto.companyId,
        programId: dto.programId,
        metadata: {
          trainingId: dto.trainingId,
          trainingName: training.name,
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
          useCase: AIUseCase.DOCUMENT_SUMMARY,
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
          errorCode: (aiResult.error as any)?.code || null,
          durationMs: null,
          metadata: {
            trainingId: dto.trainingId,
          },
        });

        return Result.fail(
          new AppError(aiResult.error?.message || 'Failed to generate training summary', 500)
        );
      }

      const aiResponse = aiResult.value;

      // Parse AI response (JSON format)
      let parsedResult: TrainingSummaryResult;
      try {
        // Try to parse as JSON first
        const jsonMatch =
          aiResponse.text.match(/```json\s*([\s\S]*?)\s*```/) ||
          aiResponse.text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
          // Fallback: parse from structured text
          parsedResult = this.parseStructuredText(aiResponse.text);
        }
      } catch (parseError) {
        logger.warn('Failed to parse AI response as JSON, using fallback parser', parseError);
        parsedResult = this.parseStructuredText(aiResponse.text);
      }

      // Log usage
      await this.tokenTracker.logUsage({
        userId: dto.userId || null,
        companyId: dto.companyId || null,
        programId: dto.programId || null,
        provider: aiResponse.provider,
        model: aiResponse.model,
        useCase: AIUseCase.DOCUMENT_SUMMARY,
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
          trainingId: dto.trainingId,
          trainingName: training.name,
        },
      });

      return Result.ok(parsedResult);
    } catch (error) {
      logger.error('Error in GenerateTrainingSummaryUseCase:', error);
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to generate training summary',
          500
        )
      );
    }
  }

  /**
   * Build content context from training, videos, and documents
   */
  private buildContentContext(training: any, videos: any[], documents: any[]): string {
    let context = `Eğitim: ${training.name}\n`;
    if (training.description) {
      context += `Açıklama: ${training.description}\n`;
    }
    context += '\n';

    // Videos
    if (videos.length > 0) {
      context += 'Videolar:\n';
      videos.forEach((video, index) => {
        context += `${index + 1}. ${video.title}\n`;
        if (video.description) {
          context += `   ${video.description}\n`;
        }
      });
      context += '\n';
    }

    // Documents
    if (documents.length > 0) {
      context += 'Dökümanlar:\n';
      documents.forEach((doc, index) => {
        context += `${index + 1}. ${doc.title}\n`;
        if (doc.description) {
          context += `   ${doc.description}\n`;
        }
        if (doc.fileType) {
          context += `   Tip: ${doc.fileType}\n`;
        }
      });
    }

    return context;
  }

  /**
   * Parse structured text response (fallback)
   */
  private parseStructuredText(text: string): TrainingSummaryResult {
    // Extract summary (first paragraph or until "Anahtar Noktalar")
    const summaryMatch = text.match(
      /(?:Özet|Summary|Eğitim Özeti)[:\s]*([\s\S]*?)(?=Anahtar Noktalar|Key Points|Öğrenme Çıktıları|Learning Outcomes|$)/i
    );
    const summary = summaryMatch
      ? summaryMatch[1].trim()
      : text.split('\n\n')[0] || text.substring(0, 500);

    // Extract key points
    const keyPoints: string[] = [];
    const keyPointMatches = text.match(
      /(?:Anahtar Noktalar|Key Points)[:\s]*([\s\S]*?)(?=Öğrenme Çıktıları|Learning Outcomes|Ön Koşullar|Prerequisites|$)/i
    );
    if (keyPointMatches) {
      const pointsText = keyPointMatches[1];
      const pointMatches = pointsText.matchAll(/(?:^\d+\.|^[-*])\s*(.+?)(?:\n|$)/gm);
      for (const match of pointMatches) {
        keyPoints.push(match[1].trim());
      }
    }

    // Extract learning outcomes
    const learningOutcomes: string[] = [];
    const outcomesMatches = text.match(
      /(?:Öğrenme Çıktıları|Learning Outcomes)[:\s]*([\s\S]*?)(?=Ön Koşullar|Prerequisites|$)/i
    );
    if (outcomesMatches) {
      const outcomesText = outcomesMatches[1];
      const outcomeMatches = outcomesText.matchAll(/(?:^\d+\.|^[-*])\s*(.+?)(?:\n|$)/gm);
      for (const match of outcomeMatches) {
        learningOutcomes.push(match[1].trim());
      }
    }

    // Extract prerequisites
    const prerequisites: string[] = [];
    const prereqMatches = text.match(/(?:Ön Koşullar|Prerequisites)[:\s]*([\s\S]*?)(?=$)/i);
    if (prereqMatches) {
      const prereqText = prereqMatches[1];
      const prereqMatches2 = prereqText.matchAll(/(?:^\d+\.|^[-*])\s*(.+?)(?:\n|$)/gm);
      for (const match of prereqMatches2) {
        prerequisites.push(match[1].trim());
      }
    }

    return {
      summary,
      keyPoints: keyPoints.slice(0, 10), // Max 10 key points
      learningOutcomes: learningOutcomes.slice(0, 10), // Max 10 outcomes
      prerequisites: prerequisites.slice(0, 5), // Max 5 prerequisites
    };
  }
}
