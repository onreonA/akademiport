/**
 * Generate Task Description Use Case
 *
 * AI ile görev açıklaması ve alt görev önerileri üretir
 */

import { IAIRouter } from '@/3-domain/interfaces/services/IAIRouter';
import { IPromptManager } from '@/3-domain/interfaces/services/IPromptManager';
import { ITokenTracker } from '@/3-domain/interfaces/services/ITokenTracker';
import { AIUseCase, AIRequestStatus, AIProvider } from '@/3-domain/enums/AIEnums';
import { Result } from '@/6-core/result/Result';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/5-shared/utils/logger';

export interface GenerateTaskDescriptionDto {
  taskTitle: string;
  programName?: string;
  companyName?: string;
  projectName?: string;
  subProjectName?: string;
  userId?: string;
  companyId?: string;
  programId?: string;
}

export interface TaskDescriptionResult {
  description: string;
  subTasks: Array<{
    title: string;
    description: string;
  }>;
  estimatedDuration?: string;
  keyPoints: string[];
}

export class GenerateTaskDescriptionUseCase {
  constructor(
    private aiRouter: IAIRouter,
    private promptManager: IPromptManager,
    private tokenTracker: ITokenTracker
  ) {}

  async execute(dto: GenerateTaskDescriptionDto): Promise<Result<TaskDescriptionResult>> {
    try {
      // Get active prompt for task description
      const promptResult = await this.promptManager.getActivePrompt(AIUseCase.TASK_DESCRIPTION);

      if (promptResult.isFailure) {
        return Result.fail(new AppError('Failed to get prompt template', 500));
      }

      const prompt = promptResult.value;

      if (!prompt) {
        return Result.fail(new AppError('No active prompt found for task description', 404));
      }

      // Render prompt with variables
      const renderedPrompt = this.promptManager.renderPrompt(prompt, {
        task_title: dto.taskTitle,
        program_name: dto.programName || 'Genel Program',
        company_name: dto.companyName || 'Firma',
        project_name: dto.projectName || 'Proje',
        sub_project_name: dto.subProjectName || 'Alt Proje',
      });

      // Call AI
      const aiResult = await this.aiRouter.complete(AIUseCase.TASK_DESCRIPTION, renderedPrompt, {
        temperature: prompt.temperature,
        maxTokens: prompt.maxTokens,
        topP: prompt.topP,
        userId: dto.userId,
        companyId: dto.companyId,
        programId: dto.programId,
        metadata: {
          taskTitle: dto.taskTitle,
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
          provider: AIProvider.OPENAI, // Default fallback
          model: prompt.model,
          useCase: AIUseCase.TASK_DESCRIPTION,
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
          metadata: {},
        });

        return Result.fail(
          new AppError(aiResult.error?.message || 'Failed to generate task description', 500)
        );
      }

      const aiResponse = aiResult.value;

      // Parse AI response (JSON format)
      let parsedResult: TaskDescriptionResult;
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
        useCase: AIUseCase.TASK_DESCRIPTION,
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
          taskTitle: dto.taskTitle,
        },
      });

      return Result.ok(parsedResult);
    } catch (error) {
      logger.error('Error in GenerateTaskDescriptionUseCase:', error);
      return Result.fail(
        new AppError(
          error instanceof Error ? error.message : 'Failed to generate task description',
          500
        )
      );
    }
  }

  /**
   * Parse structured text response (fallback)
   */
  private parseStructuredText(text: string): TaskDescriptionResult {
    // Extract description (first paragraph or until "Alt Görevler")
    const descriptionMatch = text.match(
      /(?:Açıklama|Description|Görev Açıklaması)[:\s]*([\s\S]*?)(?=Alt Görevler|Sub Tasks|Anahtar Noktalar|Key Points|$)/i
    );
    const description = descriptionMatch
      ? descriptionMatch[1].trim()
      : text.split('\n\n')[0] || text.substring(0, 500);

    // Extract sub tasks
    const subTasks: Array<{ title: string; description: string }> = [];
    const subTaskMatches = text.matchAll(/(?:^\d+\.|^[-*])\s*(.+?)(?:\n|$)/gm);
    for (const match of subTaskMatches) {
      const taskText = match[1].trim();
      const [title, ...descParts] = taskText.split(':');
      subTasks.push({
        title: title.trim(),
        description: descParts.join(':').trim() || '',
      });
    }

    // Extract key points
    const keyPoints: string[] = [];
    const keyPointMatches = text.match(
      /(?:Anahtar Noktalar|Key Points)[:\s]*([\s\S]*?)(?=Alt Görevler|Sub Tasks|$)/i
    );
    if (keyPointMatches) {
      const pointsText = keyPointMatches[1];
      const pointMatches = pointsText.matchAll(/(?:^\d+\.|^[-*])\s*(.+?)(?:\n|$)/gm);
      for (const match of pointMatches) {
        keyPoints.push(match[1].trim());
      }
    }

    return {
      description,
      subTasks: subTasks.slice(0, 5), // Max 5 sub tasks
      keyPoints: keyPoints.slice(0, 5), // Max 5 key points
    };
  }
}
