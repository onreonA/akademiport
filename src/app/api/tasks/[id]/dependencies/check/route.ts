import { NextRequest, NextResponse } from 'next/server';
import { TaskDependencyRepository } from '@/infrastructure/database/repositories/TaskDependencyRepository';
import { TaskRepository } from '@/infrastructure/database/repositories/TaskRepository';
import { CheckTaskDependenciesCompleteUseCase } from '@/application/use-cases/task';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

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
      return NextResponse.json(
        { error: (result.error as any)?.message || "Unknown error" },
        { status: (result.error as any)?.statusCode || 500 }
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('Error in GET /api/tasks/[id]/dependencies/check:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
