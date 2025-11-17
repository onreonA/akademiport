/**
 * POST /api/ai/companies/[id]/predict-success
 *
 * AI ile firma başarı tahmini yapar
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { PredictCompanySuccessUseCase } from '@/2-application/use-cases/ai/PredictCompanySuccessUseCase';
import { AIRouterService } from '@/5-shared/services/ai/ai-router.service';
import { PromptManagerService } from '@/5-shared/services/ai/prompt-manager.service';
import { TokenTrackerService } from '@/5-shared/services/ai/token-tracker.service';
import { ProjectRepository } from '@/4-infrastructure/database/repositories/ProjectRepository';
import { TrainingRepository } from '@/4-infrastructure/database/repositories/TrainingRepository';
import { TrainingProgressRepository } from '@/4-infrastructure/database/repositories/TrainingProgressRepository';
import { EventRepository } from '@/4-infrastructure/database/repositories/EventRepository';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';
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

    const { id: companyId } = await params;

    // Initialize repositories
    const projectRepository = new ProjectRepository();
    const trainingRepository = new TrainingRepository();
    const trainingProgressRepository = new TrainingProgressRepository();
    const eventRepository = new EventRepository();
    const companyRepository = new CompanyRepository();

    // Initialize services
    const aiRouter = new AIRouterService();
    const promptManager = new PromptManagerService();
    const tokenTracker = new TokenTrackerService();

    // Create use case
    const useCase = new PredictCompanySuccessUseCase(
      aiRouter,
      promptManager,
      tokenTracker,
      projectRepository,
      trainingRepository,
      trainingProgressRepository,
      eventRepository,
      companyRepository
    );

    // Get programId from request body if available
    const body = await request.json().catch(() => ({}));

    // Execute
    const result = await useCase.execute({
      companyId,
      userId: user.id,
      programId: body.programId,
    });

    if (result.isFailure) {
      logger.error('Failed to predict company success:', result.error);
      return NextResponse.json(
        {
          error:
            result.error instanceof AppError
              ? result.error.message
              : 'Failed to predict company success',
        },
        {
          status: result.error instanceof AppError ? result.error.statusCode : 500,
        }
      );
    }

    return NextResponse.json(result.value, { status: 200 });
  } catch (error) {
    logger.error('Error in POST /api/ai/companies/[id]/predict-success:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
