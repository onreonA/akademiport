import { NextRequest, NextResponse } from 'next/server';
import { TaskRepository } from '@/infrastructure/database/repositories/TaskRepository';
import { ProjectRepository } from '@/infrastructure/database/repositories/ProjectRepository';
import { SubProjectRepository } from '@/infrastructure/database/repositories/SubProjectRepository';
import { ListConsultantPendingReviewTasksUseCase } from '@/application/use-cases/task';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { AppError } from '@/6-core/errors/AppError';

const taskRepository = new TaskRepository();
const projectRepository = new ProjectRepository();
const subProjectRepository = new SubProjectRepository();

/**
 * GET /api/consultant/tasks/pending-review
 * Get all tasks pending review in consultant's projects
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

    const consultantId =
      user.role === 'master_admin'
        ? request.nextUrl.searchParams.get('consultantId') || user.id
        : user.id;

    const useCase = new ListConsultantPendingReviewTasksUseCase(
      taskRepository,
      projectRepository,
      subProjectRepository
    );

    const result = await useCase.execute(consultantId);

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({ success: true, tasks: result.value });
  } catch (error) {
    console.error('Error in GET /api/consultant/tasks/pending-review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
