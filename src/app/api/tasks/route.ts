import { NextRequest, NextResponse } from 'next/server';
import { TaskRepository } from '@/infrastructure/database/repositories/TaskRepository';
import { SubProjectRepository } from '@/infrastructure/database/repositories/SubProjectRepository';
import { CreateTaskUseCase, ListUserTasksUseCase } from '@/application/use-cases/task';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { AppError } from '@/6-core/errors/AppError';

const taskRepository = new TaskRepository();
const subProjectRepository = new SubProjectRepository();

/**
 * GET /api/tasks
 * List user's tasks
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;

    const listUserTasksUseCase = new ListUserTasksUseCase(taskRepository);
    const result = await listUserTasksUseCase.execute(user.id, { status, priority });

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({ data: result.value });
  } catch (error) {
    console.error('Error in GET /api/tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin and consultant can create tasks
    if (user.role !== 'master_admin' && user.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const createTaskUseCase = new CreateTaskUseCase(taskRepository, subProjectRepository);
    const result = await createTaskUseCase.execute({
      subProjectId: body.subProjectId,
      assignedTo: body.assignedTo,
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      orderIndex: body.orderIndex,
    });

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
