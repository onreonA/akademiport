import { NextRequest, NextResponse } from 'next/server';
import { TaskDependencyRepository } from '@/infrastructure/database/repositories/TaskDependencyRepository';
import { TaskRepository } from '@/infrastructure/database/repositories/TaskRepository';
import {
  CreateTaskDependencyUseCase,
  GetTaskDependenciesUseCase,
} from '@/application/use-cases/task';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

const taskDependencyRepository = new TaskDependencyRepository();
const taskRepository = new TaskRepository();

/**
 * GET /api/tasks/[id]/dependencies
 * Get task dependencies (bu görev hangi görevlere bağımlı ve bu göreve hangi görevler bağımlı)
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const getTaskDependenciesUseCase = new GetTaskDependenciesUseCase(
      taskDependencyRepository,
      taskRepository
    );
    const result = await getTaskDependenciesUseCase.execute(id);

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      dependencies: result.value.dependencies,
      dependents: result.value.dependents,
    });
  } catch (error) {
    console.error('Error in GET /api/tasks/[id]/dependencies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/tasks/[id]/dependencies
 * Create a task dependency
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only consultant and master_admin can create dependencies
    if (user.role !== 'master_admin' && user.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const createTaskDependencyUseCase = new CreateTaskDependencyUseCase(
      taskDependencyRepository,
      taskRepository
    );
    const result = await createTaskDependencyUseCase.execute({
      taskId: id,
      dependsOnTaskId: body.dependsOnTaskId || body.depends_on_task_id,
      dependencyType: body.dependencyType || body.dependency_type || 'blocks',
    });

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json({ success: true, dependency: result.value });
  } catch (error) {
    console.error('Error in POST /api/tasks/[id]/dependencies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
