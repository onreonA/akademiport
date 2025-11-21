import { NextRequest, NextResponse } from 'next/server';
import { TaskDependencyRepository } from '@/infrastructure/database/repositories/TaskDependencyRepository';
import { TaskRepository } from '@/infrastructure/database/repositories/TaskRepository';
import { CheckTaskDependenciesCompleteUseCase } from '@/application/use-cases/task';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { AppError } from '@/6-core/errors/AppError';

const taskDependencyRepository = new TaskDependencyRepository();
const taskRepository = new TaskRepository();

/**
 * GET /api/tasks/[id]/dependencies/check
 * Check if all blocking dependencies of a task are complete
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const checkTaskDependenciesCompleteUseCase = new CheckTaskDependenciesCompleteUseCase(
      taskDependencyRepository,
      taskRepository
    );
    const result = await checkTaskDependenciesCompleteUseCase.execute(id);

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('Error in GET /api/tasks/[id]/dependencies/check:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
