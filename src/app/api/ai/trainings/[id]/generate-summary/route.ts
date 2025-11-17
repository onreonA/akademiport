/**
 * POST /api/ai/trainings/[id]/generate-summary
 *
 * AI ile eğitim özeti üretir
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { GenerateTrainingSummaryUseCase } from '@/2-application/use-cases/ai/GenerateTrainingSummaryUseCase';
import { AIRouterService } from '@/5-shared/services/ai/ai-router.service';
import { PromptManagerService } from '@/5-shared/services/ai/prompt-manager.service';
import { TokenTrackerService } from '@/5-shared/services/ai/token-tracker.service';
import { TrainingRepository } from '@/4-infrastructure/database/repositories/TrainingRepository';
import { TrainingVideoRepository } from '@/4-infrastructure/database/repositories/TrainingVideoRepository';
import { TrainingDocumentRepository } from '@/4-infrastructure/database/repositories/TrainingDocumentRepository';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/5-shared/utils/logger';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only consultant and master_admin can use AI features
    if (user.role !== 'consultant' && user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: trainingId } = await params;

    // Initialize repositories
    const trainingRepository = new TrainingRepository();
    const trainingVideoRepository = new TrainingVideoRepository();
    const trainingDocumentRepository = new TrainingDocumentRepository();

    // Initialize services
    const aiRouter = new AIRouterService();
    const promptManager = new PromptManagerService();
    const tokenTracker = new TokenTrackerService();

    // Create use case
    const useCase = new GenerateTrainingSummaryUseCase(
      aiRouter,
      promptManager,
      tokenTracker,
      trainingRepository,
      trainingVideoRepository,
      trainingDocumentRepository
    );

    // Get companyId and programId from request body if available
    const body = await request.json().catch(() => ({}));

    // Execute
    const result = await useCase.execute({
      trainingId,
      userId: user.id,
      companyId: body.companyId,
      programId: body.programId,
    });

    if (result.isFailure) {
      logger.error('Failed to generate training summary:', result.error);
      return NextResponse.json(
        {
          error:
            result.error instanceof AppError
              ? result.error.message
              : 'Failed to generate training summary',
        },
        {
          status: result.error instanceof AppError ? result.error.statusCode : 500,
        }
      );
    }

    return NextResponse.json(result.value, { status: 200 });
  } catch (error) {
    logger.error('Error in POST /api/ai/trainings/[id]/generate-summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
