import { NextRequest, NextResponse } from 'next/server';
import { TrainingRepository } from '@/infrastructure/database/repositories/TrainingRepository';
import { ListTrainingsUseCase } from '@/application/use-cases/training';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { logger } from '@/shared/utils/logger';
import type { TrainingStatus } from '@/domain/entities/Training';

const trainingRepository = new TrainingRepository();

/**
 * GET /api/consultant/trainings
 * List trainings for a consultant
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only consultants can access this endpoint
    if (user.role !== 'consultant' && user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const programIdParam = searchParams.get('programId');
    const programId = programIdParam && programIdParam.trim() !== '' ? programIdParam : undefined;
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const listTrainingsUseCase = new ListTrainingsUseCase(trainingRepository);
    const result = await listTrainingsUseCase.execute(
      {
        // Don't filter by consultantId - let RLS policy handle it
        // RLS will show: global trainings, own trainings, program trainings
        programId: programId, // undefined = no filter, null = filter for null values
        consultantId: undefined, // RLS policy will filter by consultant_id automatically
        isGlobal,
        status,
        page,
        limit,
        // priority ve search parametreleri şimdilik kullanılmıyor
      },
      false // useAdminClient = false for consultant
    );

    if (result.isFailure) {
      return NextResponse.json(
        { error: (result.error as any)?.message || 'Unknown error' },
        { status: (result.error as any)?.statusCode || 500 }
      );
    }

    return NextResponse.json({
      trainings: result.value.data,
      total: result.value.total,
    });
  } catch (error) {
    logger.error('Error in GET /api/consultant/trainings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
