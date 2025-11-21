import { NextRequest, NextResponse } from 'next/server';
import { TrainingProgressRepository } from '@/4-infrastructure/database/repositories/TrainingProgressRepository';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';
import { TrainingRepository } from '@/4-infrastructure/database/repositories/TrainingRepository';
import { UpdateTrainingProgressUseCase } from '@/2-application/use-cases/training-progress';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { AddLeaderboardScoreUseCase } from '@/2-application/use-cases/leaderboard';
import { SupabaseLeaderboardRepository } from '@/4-infrastructure/database/repositories/SupabaseLeaderboardRepository';
import { AppError } from '@/6-core/errors/AppError';

const trainingProgressRepository = new TrainingProgressRepository();
const companyRepository = new CompanyRepository();
const trainingRepository = new TrainingRepository();
const leaderboardRepository = new SupabaseLeaderboardRepository();
const addLeaderboardScore = new AddLeaderboardScoreUseCase(
  leaderboardRepository,
  companyRepository
);

/**
 * POST /api/trainings/[id]/videos/[videoId]/watch
 * Mark a video as watched
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only company users can mark videos as watched
    if (user.role !== 'company_user' && user.role !== 'company_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!user.companyId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 403 });
    }

    const { id, videoId } = await params;
    const body = await request.json();

    const updateProgressUseCase = new UpdateTrainingProgressUseCase(
      trainingProgressRepository,
      companyRepository,
      trainingRepository,
      addLeaderboardScore
    );

    const progressPercentage = body.progressPercentage || 100;
    const result = await updateProgressUseCase.execute(user.companyId, id, {
      companyId: user.companyId,
      trainingId: id,
      videoId,
      progressPercentage,
      watchedAt: new Date(),
      completedAt: progressPercentage === 100 ? new Date() : null,
    });

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/trainings/[id]/videos/[videoId]/watch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
