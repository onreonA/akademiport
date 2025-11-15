import { NextRequest, NextResponse } from 'next/server';
import { TaskRepository } from '@/infrastructure/database/repositories/TaskRepository';
import { ProjectRepository } from '@/infrastructure/database/repositories/ProjectRepository';
import { SubProjectRepository } from '@/infrastructure/database/repositories/SubProjectRepository';
import { ListConsultantPendingReviewTasksUseCase } from '@/application/use-cases/task';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

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
      return NextResponse.json(
        { error: (result.error as any)?.message || 'Unknown error' },
        { status: (result.error as any)?.statusCode || 500 }
      );
    }

    return NextResponse.json({ success: true, tasks: result.value });
  } catch (error) {
    console.error('Error in GET /api/consultant/tasks/pending-review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
