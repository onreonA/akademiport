import { NextRequest, NextResponse } from 'next/server';
import { TrainingVideoRepository } from '@/infrastructure/database/repositories/TrainingVideoRepository';
import {
  UpdateTrainingVideoUseCase,
  DeleteTrainingVideoUseCase,
} from '@/application/use-cases/training-video';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { logger } from '@/shared/utils/logger';

const trainingVideoRepository = new TrainingVideoRepository();

/**
 * GET /api/trainings/[id]/videos/[videoId]
 * Get training video by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoId } = await params;
    const video = await trainingVideoRepository.findById(videoId);

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json(video);
  } catch (error) {
    logger.error('Error in GET /api/trainings/[id]/videos/[videoId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/trainings/[id]/videos/[videoId]
 * Update training video
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin and consultant can update videos
    if (user.role !== 'master_admin' && user.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { videoId } = await params;
    const body = await request.json();

    const updateVideoUseCase = new UpdateTrainingVideoUseCase(trainingVideoRepository);
    const result = await updateVideoUseCase.execute(videoId, {
      title: body.title,
      description: body.description,
      youtubeUrl: body.youtubeUrl,
      orderIndex: body.orderIndex,
      isLocked: body.isLocked,
      durationSeconds: body.durationSeconds,
    });

    if (result.isFailure) {
      return NextResponse.json(
        { error: (result.error as any)?.message || "Unknown error" },
        { status: (result.error as any)?.statusCode || 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in PUT /api/trainings/[id]/videos/[videoId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/trainings/[id]/videos/[videoId]
 * Delete training video
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin and consultant can delete videos
    if (user.role !== 'master_admin' && user.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { videoId } = await params;

    const deleteVideoUseCase = new DeleteTrainingVideoUseCase(trainingVideoRepository);
    const result = await deleteVideoUseCase.execute(videoId);

    if (result.isFailure) {
      return NextResponse.json(
        { error: (result.error as any)?.message || "Unknown error" },
        { status: (result.error as any)?.statusCode || 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in DELETE /api/trainings/[id]/videos/[videoId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
