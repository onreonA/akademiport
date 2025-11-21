/**
 * GET /api/dashboard/ai-insights
 *
 * Dashboard için AI destekli analiz ve öneriler
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { GetAIInsightsUseCase } from '@/2-application/use-cases/analytics';
import { UserRepository } from '@/4-infrastructure/database/repositories/UserRepository';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';
import { ProjectRepository } from '@/4-infrastructure/database/repositories/ProjectRepository';
import { TaskRepository } from '@/4-infrastructure/database/repositories/TaskRepository';
import { TrainingRepository } from '@/4-infrastructure/database/repositories/TrainingRepository';
import { EventRepository } from '@/4-infrastructure/database/repositories/EventRepository';
import { AIRouterService } from '@/5-shared/services/ai/ai-router.service';
import { PromptManagerService } from '@/5-shared/services/ai/prompt-manager.service';
import { TokenTrackerService } from '@/5-shared/services/ai/token-tracker.service';
import { logger } from '@/5-shared/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const dashboardType = (searchParams.get('dashboardType') || 'master') as
      | 'master'
      | 'consultant'
      | 'company';
    const companyId = searchParams.get('companyId') || undefined;
    const programId = searchParams.get('programId') || undefined;

    // Initialize repositories
    const userRepository = new UserRepository();
    const companyRepository = new CompanyRepository();
    const projectRepository = new ProjectRepository();
    const taskRepository = new TaskRepository();
    const trainingRepository = new TrainingRepository();
    const eventRepository = new EventRepository();

    // Initialize services
    const aiRouter = new AIRouterService();
    const promptManager = new PromptManagerService();
    const tokenTracker = new TokenTrackerService();

    // Create use case
    const useCase = new GetAIInsightsUseCase(
      aiRouter,
      promptManager,
      tokenTracker,
      userRepository,
      companyRepository,
      projectRepository,
      taskRepository,
      trainingRepository,
      eventRepository
    );

    // Execute
    const result = await useCase.execute({
      userId: user.id,
      dashboardType,
      companyId,
      programId,
    });

    if (result.isFailure) {
      const errorMessage =
        result.error instanceof Error ? result.error.message : 'Failed to get AI insights';

      // AI servisi yoksa veya prompt yoksa 503 (Service Unavailable) döndür
      // Bu durumda widget sessizce gizlenecek
      if (
        errorMessage.includes('Service not available') ||
        errorMessage.includes('No active prompt') ||
        errorMessage.includes('OPENAI_API_KEY') ||
        errorMessage.includes('API_KEY') ||
        errorMessage.includes('Provider selection failed')
      ) {
        logger.warn('AI insights service unavailable:', errorMessage);
        return NextResponse.json(
          { error: errorMessage },
          { status: 503 } // Service Unavailable
        );
      }

      logger.error('Failed to get AI insights:', result.error);
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    return NextResponse.json(result.value, { status: 200 });
  } catch (error: any) {
    logger.error('Error in GET /api/dashboard/ai-insights:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
