import { NextRequest, NextResponse } from 'next/server';
import { TrainingProgressRepository } from '@/4-infrastructure/database/repositories/TrainingProgressRepository';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';
import { TrainingRepository } from '@/4-infrastructure/database/repositories/TrainingRepository';
import {
  GetTrainingProgressUseCase,
  UpdateTrainingProgressUseCase,
  CalculateTrainingProgressUseCase,
} from '@/2-application/use-cases/training-progress';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { AddLeaderboardScoreUseCase } from '@/2-application/use-cases/leaderboard';
import { SupabaseLeaderboardRepository } from '@/4-infrastructure/database/repositories/SupabaseLeaderboardRepository';
import { logger } from '@/5-shared/utils/logger';

const trainingProgressRepository = new TrainingProgressRepository();
const companyRepository = new CompanyRepository();
const trainingRepository = new TrainingRepository();
const leaderboardRepository = new SupabaseLeaderboardRepository();
const addLeaderboardScore = new AddLeaderboardScoreUseCase(leaderboardRepository, companyRepository);

/**
 * GET /api/companies/[id]/trainings/[trainingId]/progress
 * Get training progress for a company
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; trainingId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, trainingId } = await params;

    // Authorization: Company users can only see their own company's progress
    if (user.role === 'company_user' || user.role === 'company_admin') {
      if (user.companyId !== id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const { searchParams } = new URL(request.url);
    const calculate = searchParams.get('calculate') === 'true';

    if (calculate) {
      // Calculate overall progress
      const { TrainingVideoRepository } = await import(
        '@/infrastructure/database/repositories/TrainingVideoRepository'
      );
      const { TrainingDocumentRepository } = await import(
        '@/infrastructure/database/repositories/TrainingDocumentRepository'
      );
      const { CompanyTrainingRepository } = await import(
        '@/infrastructure/database/repositories/CompanyTrainingRepository'
      );

      const trainingVideoRepository = new TrainingVideoRepository();
      const trainingDocumentRepository = new TrainingDocumentRepository();
      const companyTrainingRepository = new CompanyTrainingRepository();

      const calculateProgressUseCase = new CalculateTrainingProgressUseCase(
        trainingProgressRepository,
        trainingVideoRepository,
        trainingDocumentRepository
      );
      const result = await calculateProgressUseCase.execute(id, trainingId);

      if (result.isFailure) {
        logger.error('❌ CalculateTrainingProgressUseCase failed:', {
          companyId: id,
          trainingId,
          error: (result.error as any)?.message || "Unknown error",
          statusCode: (result.error as any)?.statusCode || 500,
        });
        return NextResponse.json(
          { error: (result.error as any)?.message || "Unknown error" },
          { status: (result.error as any)?.statusCode || 500 }
        );
      }

      return NextResponse.json(result.value);
    }

    // Get detailed progress
    const getProgressUseCase = new GetTrainingProgressUseCase(
      trainingProgressRepository,
      companyRepository,
      trainingRepository
    );
    const result = await getProgressUseCase.execute(id, trainingId);

    if (result.isFailure) {
      return NextResponse.json(
        { error: (result.error as any)?.message || "Unknown error" },
        { status: (result.error as any)?.statusCode || 500 }
      );
    }

    return NextResponse.json({ progress: result.value });
  } catch (error) {
    logger.error('❌ Error in GET /api/companies/[id]/trainings/[trainingId]/progress:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error('Error details:', { errorMessage, errorStack });
    return NextResponse.json({ error: errorMessage, details: errorStack }, { status: 500 });
  }
}

/**
 * POST /api/companies/[id]/trainings/[trainingId]/progress
 * Update training progress for a company
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; trainingId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, trainingId } = await params;

    // Authorization: Company users can only update their own company's progress
    if (user.role === 'company_user' || user.role === 'company_admin') {
      if (user.companyId !== id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const body = await request.json();

    const updateProgressUseCase = new UpdateTrainingProgressUseCase(
      trainingProgressRepository,
      companyRepository,
      trainingRepository,
      addLeaderboardScore
    );
    const result = await updateProgressUseCase.execute(id, trainingId, {
      companyId: id,
      trainingId,
      videoId: body.videoId || null,
      documentId: body.documentId || null,
      progressPercentage: body.progressPercentage || 0,
      watchedAt: body.watchedAt ? new Date(body.watchedAt) : null,
      readAt: body.readAt ? new Date(body.readAt) : null,
      completedAt: body.completedAt ? new Date(body.completedAt) : null,
    });

    if (result.isFailure) {
      return NextResponse.json(
        { error: (result.error as any)?.message || "Unknown error" },
        { status: (result.error as any)?.statusCode || 500 }
      );
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/companies/[id]/trainings/[trainingId]/progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
