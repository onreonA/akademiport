import { NextRequest, NextResponse } from 'next/server';
import { TaskDependencyRepository } from '@/infrastructure/database/repositories/TaskDependencyRepository';
import { DeleteTaskDependencyUseCase } from '@/application/use-cases/task';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { AppError } from '@/6-core/errors/AppError';

const taskDependencyRepository = new TaskDependencyRepository();

/**
 * DELETE /api/tasks/[id]/dependencies/[dependencyId]
 * Delete a task dependency
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dependencyId: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only consultant and master_admin can delete dependencies
    if (user.role !== 'master_admin' && user.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { dependencyId } = await params;

    const deleteTaskDependencyUseCase = new DeleteTaskDependencyUseCase(taskDependencyRepository);
    const result = await deleteTaskDependencyUseCase.execute(dependencyId);

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({ success: true, message: 'Bağımlılık başarıyla silindi' });
  } catch (error) {
    console.error('Error in DELETE /api/tasks/[id]/dependencies/[dependencyId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
