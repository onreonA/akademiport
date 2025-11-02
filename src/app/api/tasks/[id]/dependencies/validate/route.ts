import { NextRequest, NextResponse } from 'next/server';
import { TaskDependencyRepository } from '@/infrastructure/database/repositories/TaskDependencyRepository';
import { TaskRepository } from '@/infrastructure/database/repositories/TaskRepository';
import { ValidateTaskDependencyUseCase } from '@/application/use-cases/task';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

const taskDependencyRepository = new TaskDependencyRepository();
const taskRepository = new TaskRepository();

/**
 * POST /api/tasks/[id]/dependencies/validate
 * Validate if a task dependency can be created
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const validateTaskDependencyUseCase = new ValidateTaskDependencyUseCase(
      taskDependencyRepository,
      taskRepository
    );
    const result = await validateTaskDependencyUseCase.execute(
      id,
      body.dependsOnTaskId || body.depends_on_task_id
    );

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('Error in POST /api/tasks/[id]/dependencies/validate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
