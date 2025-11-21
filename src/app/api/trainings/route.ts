import { NextRequest, NextResponse } from 'next/server';
import { TrainingRepository } from '@/infrastructure/database/repositories/TrainingRepository';
import { CreateTrainingUseCase, ListTrainingsUseCase } from '@/application/use-cases/training';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { logger } from '@/shared/utils/logger';
import type { TrainingStatus, TrainingPriority } from '@/domain/entities/Training';
import { AppError } from '@/6-core/errors/AppError';

const trainingRepository = new TrainingRepository();

/**
 * GET /api/trainings
 * List all trainings with filters
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId') || undefined;
    const consultantId = searchParams.get('consultantId') || undefined;
    const isGlobal =
      searchParams.get('isGlobal') === 'true'
        ? true
        : searchParams.get('isGlobal') === 'false'
          ? false
          : undefined;
    const statusParam = searchParams.get('status');
    const status: TrainingStatus | undefined =
      statusParam && ['draft', 'active', 'archived'].includes(statusParam)
        ? (statusParam as TrainingStatus)
        : undefined;
    const priorityParam = searchParams.get('priority');
    const priority: TrainingPriority | undefined =
      priorityParam && ['low', 'medium', 'high', 'critical'].includes(priorityParam)
        ? (priorityParam as TrainingPriority)
        : undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Authorization: Consultants can only see their own trainings
    let finalConsultantId = consultantId;
    if (user.role === 'consultant') {
      finalConsultantId = user.id;
    }

    const listTrainingsUseCase = new ListTrainingsUseCase(trainingRepository);

    // For master admin, use admin client to bypass RLS
    const useAdminClient = user.role === 'master_admin';

    const result = await listTrainingsUseCase.execute(
      {
        programId: programId || undefined, // undefined = no filter, null = filter for null values
        consultantId: finalConsultantId,
        isGlobal,
        status,
        priority,
        search,
        page,
        limit,
      },
      useAdminClient
    );

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({
      trainings: result.value.data,
      total: result.value.total,
    });
  } catch (error) {
    logger.error('Error in GET /api/trainings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/trainings
 * Create a new training
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin and consultant can create trainings
    if (user.role !== 'master_admin' && user.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const createTrainingUseCase = new CreateTrainingUseCase(trainingRepository);
    const result = await createTrainingUseCase.execute(
      {
        name: body.name,
        description: body.description || null,
        programId: body.programId || null,
        consultantId: body.consultantId || (user.role === 'consultant' ? user.id : null),
        isGlobal: body.isGlobal ?? false,
        status: body.status || 'draft',
        priority: body.priority || 'medium',
        isLocked: body.isLocked || false,
        createdBy: user.id,
      },
      user.id
    );

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/trainings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
