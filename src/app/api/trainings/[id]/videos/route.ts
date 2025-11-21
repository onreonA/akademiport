import { NextRequest, NextResponse } from 'next/server';
import { TrainingVideoRepository } from '@/4-infrastructure/database/repositories/TrainingVideoRepository';
import { TrainingRepository } from '@/4-infrastructure/database/repositories/TrainingRepository';
import {
  CreateTrainingVideoUseCase,
  ListTrainingVideosUseCase,
} from '@/2-application/use-cases/training-video';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { logger } from '@/5-shared/utils/logger';
import { AppError } from '@/6-core/errors/AppError';

const trainingVideoRepository = new TrainingVideoRepository();
const trainingRepository = new TrainingRepository();

/**
 * GET /api/trainings/[id]/videos
 * List all videos for a training
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    logger.info('📋 [GET /api/trainings/[id]/videos] Request:', {
      trainingId: id,
      userId: user.id,
      userRole: user.role,
      userCompanyId: user.companyId,
    });

    const listVideosUseCase = new ListTrainingVideosUseCase(
      trainingVideoRepository,
      trainingRepository
    );
    const result = await listVideosUseCase.execute(id);

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      logger.error('❌ [GET /api/trainings/[id]/videos] Use case failed:', {
        trainingId: id,
        error: error.message,
        statusCode: error.statusCode,
      });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    logger.info('✅ [GET /api/trainings/[id]/videos] Success:', {
      trainingId: id,
      videosCount: result.value?.length || 0,
    });
    return NextResponse.json({ videos: result.value });
  } catch (error) {
    logger.error('❌ [GET /api/trainings/[id]/videos] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/trainings/[id]/videos
 * Create a new video for a training
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin and consultant can create videos
    if (user.role !== 'master_admin' && user.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    logger.info('🔍 POST /api/trainings/[id]/videos:', {
      trainingId: id,
      body: {
        title: body.title,
        youtubeUrl: body.youtubeUrl,
        orderIndex: body.orderIndex,
        isLocked: body.isLocked,
      },
    });

    const createVideoUseCase = new CreateTrainingVideoUseCase(
      trainingVideoRepository,
      trainingRepository
    );
    const result = await createVideoUseCase.execute({
      trainingId: id,
      title: body.title,
      description: body.description || null,
      youtubeUrl: body.youtubeUrl,
      orderIndex: body.orderIndex || 0,
      isLocked: body.isLocked || false,
      durationSeconds: body.durationSeconds || null,
    });

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      logger.error('❌ CreateTrainingVideoUseCase failed:', {
        error: error.message,
        statusCode: error.statusCode,
      });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    logger.info('✅ CreateTrainingVideoUseCase success:', result.value);
    return NextResponse.json(result.value, { status: 201 });
  } catch (error) {
    logger.error('❌ Error in POST /api/trainings/[id]/videos:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
