import { NextRequest, NextResponse } from 'next/server';
import { TrainingRepository } from '@/4-infrastructure/database/repositories/TrainingRepository';
import {
  GetTrainingUseCase,
  UpdateTrainingUseCase,
  DeleteTrainingUseCase,
} from '@/2-application/use-cases/training';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { AppError } from '@/6-core/errors/AppError';
import { logger } from '@/5-shared/utils/logger';

const trainingRepository = new TrainingRepository();

/**
 * GET /api/trainings/[id]
 * Get training by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    logger.info('📋 [GET /api/trainings/[id]] Request:', {
      trainingId: id,
      userId: user.id,
      userRole: user.role,
    });

    const getTrainingUseCase = new GetTrainingUseCase(trainingRepository);
    const result = await getTrainingUseCase.execute(id);

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      logger.error('❌ [GET /api/trainings/[id]] Use case failed:', {
        trainingId: id,
        error: error.message,
        statusCode: error.statusCode,
      });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    logger.info('✅ [GET /api/trainings/[id]] Success:', { trainingId: id });
    return NextResponse.json(result.value);
  } catch (error) {
    logger.error('❌ [GET /api/trainings/[id]] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/trainings/[id]
 * Update training
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin and consultant can update trainings
    if (user.role !== 'master_admin' && user.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const updateTrainingUseCase = new UpdateTrainingUseCase(trainingRepository);
    const result = await updateTrainingUseCase.execute(id, {
      name: body.name,
      description: body.description,
      programId: body.programId,
      consultantId: body.consultantId,
      isGlobal: body.isGlobal,
      status: body.status,
      priority: body.priority,
      isLocked: body.isLocked,
    });

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /api/trainings/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/trainings/[id]
 * Delete training
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin and consultant can delete trainings
    if (user.role !== 'master_admin' && user.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const deleteTrainingUseCase = new DeleteTrainingUseCase(trainingRepository);
    const result = await deleteTrainingUseCase.execute(id);

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/trainings/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
