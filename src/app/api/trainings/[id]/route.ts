import { NextRequest, NextResponse } from 'next/server';
import { TrainingRepository } from '@/infrastructure/database/repositories/TrainingRepository';
import {
  GetTrainingUseCase,
  UpdateTrainingUseCase,
  DeleteTrainingUseCase,
} from '@/application/use-cases/training';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

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
    const getTrainingUseCase = new GetTrainingUseCase(trainingRepository);
    const result = await getTrainingUseCase.execute(id);

    if (result.isFailure) {
      return NextResponse.json(
        { error: (result.error as any)?.message || 'Unknown error' },
        { status: (result.error as any)?.statusCode || 500 }
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('Error in GET /api/trainings/[id]:', error);
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
      return NextResponse.json(
        { error: (result.error as any)?.message || 'Unknown error' },
        { status: (result.error as any)?.statusCode || 500 }
      );
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
      return NextResponse.json(
        { error: (result.error as any)?.message || 'Unknown error' },
        { status: (result.error as any)?.statusCode || 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/trainings/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
