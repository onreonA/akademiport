/**
 * POST /api/ai/tasks/generate-description
 *
 * AI ile görev açıklaması üretir
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { GenerateTaskDescriptionUseCase } from '@/2-application/use-cases/ai/GenerateTaskDescriptionUseCase';
import { AIRouterService } from '@/5-shared/services/ai/ai-router.service';
import { PromptManagerService } from '@/5-shared/services/ai/prompt-manager.service';
import { TokenTrackerService } from '@/5-shared/services/ai/token-tracker.service';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/5-shared/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only consultant and master_admin can use AI features
    if (user.role !== 'consultant' && user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.taskTitle || typeof body.taskTitle !== 'string') {
      return NextResponse.json(
        { error: 'taskTitle is required and must be a string' },
        { status: 400 }
      );
    }

    // Initialize services
    const aiRouter = new AIRouterService();
    const promptManager = new PromptManagerService();
    const tokenTracker = new TokenTrackerService();

    // Create use case
    const useCase = new GenerateTaskDescriptionUseCase(aiRouter, promptManager, tokenTracker);

    // Execute
    const result = await useCase.execute({
      taskTitle: body.taskTitle,
      programName: body.programName,
      companyName: body.companyName,
      projectName: body.projectName,
      subProjectName: body.subProjectName,
      userId: user.id,
      companyId: body.companyId,
      programId: body.programId,
    });

    if (result.isFailure) {
      logger.error('Failed to generate task description:', result.error);
      return NextResponse.json(
        {
          error:
            result.error instanceof AppError
              ? result.error.message
              : 'Failed to generate task description',
        },
        { status: result.error instanceof AppError ? result.error.statusCode : 500 }
      );
    }

    return NextResponse.json(result.value, { status: 200 });
  } catch (error) {
    logger.error('Error in POST /api/ai/tasks/generate-description:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
