import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { AppError } from '@/6-core/errors/AppError';
import { TaskRepository } from '@/infrastructure/database/repositories/TaskRepository';
import { CompanyTaskDateRepository } from '@/infrastructure/database/repositories/CompanyTaskDateRepository';
import { BulkAssignDatesToCompanyTasksUseCase } from '@/application/use-cases/task/BulkAssignDatesToCompanyTasksUseCase';
import { UserRole } from '@/domain/enums/UserRole';
import { logger } from '@/shared/utils/logger';

const taskRepository = new TaskRepository();
const companyTaskDateRepository = new CompanyTaskDateRepository();

/**
 * POST /api/tasks/[id]/dates/bulk
 * Göreve firma bazlı tarih atamalarını topluca yapar
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== UserRole.MASTER_ADMIN && user.role !== UserRole.CONSULTANT) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: taskId } = await params;
    const body = await request.json().catch(() => ({}));

    const dates = Array.isArray(body.dates) ? body.dates : [];

    const useCase = new BulkAssignDatesToCompanyTasksUseCase(
      taskRepository,
      companyTaskDateRepository
    );

    const result = await useCase.execute({
      taskId,
      dates,
    });

    if (result.isFailure && result.error instanceof AppError) {
      return NextResponse.json(
        {
          error: result.error.message,
          code: result.error.code,
          errors: Array.isArray(result.error.details) ? result.error.details : undefined,
        },
        { status: result.error.statusCode }
      );
    }

    if (result.isFailure) {
      return NextResponse.json({ error: 'Tarih güncelleme işlemi tamamlanamadı' }, { status: 500 });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    logger.error('Error in POST /api/tasks/[id]/dates/bulk:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
