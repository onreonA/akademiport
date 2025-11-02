import { NextRequest, NextResponse } from 'next/server';
import { TaskRepository } from '@/infrastructure/database/repositories/TaskRepository';
import { ProjectRepository } from '@/infrastructure/database/repositories/ProjectRepository';
import { SubProjectRepository } from '@/infrastructure/database/repositories/SubProjectRepository';
import { ListConsultantTasksUseCase } from '@/application/use-cases/task';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

const taskRepository = new TaskRepository();
const projectRepository = new ProjectRepository();
const subProjectRepository = new SubProjectRepository();

/**
 * GET /api/consultant/tasks
 * Get all tasks in consultant's projects (all statuses or filtered)
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

    // Get status filter from query params
    const status = request.nextUrl.searchParams.get('status') || undefined;

    const useCase = new ListConsultantTasksUseCase(
      taskRepository,
      projectRepository,
      subProjectRepository
    );

    const result = await useCase.execute(consultantId, { status });

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json({ success: true, tasks: result.value });
  } catch (error) {
    console.error('Error in GET /api/consultant/tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
