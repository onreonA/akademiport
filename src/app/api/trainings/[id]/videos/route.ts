import { NextRequest, NextResponse } from 'next/server';
import { TrainingVideoRepository } from '@/infrastructure/database/repositories/TrainingVideoRepository';
import { TrainingRepository } from '@/infrastructure/database/repositories/TrainingRepository';
import {
  CreateTrainingVideoUseCase,
  ListTrainingVideosUseCase,
} from '@/application/use-cases/training-video';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { logger } from '@/shared/utils/logger';

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
    const listVideosUseCase = new ListTrainingVideosUseCase(
      trainingVideoRepository,
      trainingRepository
    );
    const result = await listVideosUseCase.execute(id);

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json({ videos: result.value });
  } catch (error) {
    logger.error('Error in GET /api/trainings/[id]/videos:', error);
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
      logger.error('❌ CreateTrainingVideoUseCase failed:', {
        error: result.error.message,
        statusCode: result.error.statusCode,
      });
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
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
