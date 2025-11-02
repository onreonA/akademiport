import { NextRequest, NextResponse } from 'next/server';
import { TaskDependencyRepository } from '@/infrastructure/database/repositories/TaskDependencyRepository';
import { DeleteTaskDependencyUseCase } from '@/application/use-cases/task';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

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
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json({ success: true, message: 'Bağımlılık başarıyla silindi' });
  } catch (error) {
    console.error('Error in DELETE /api/tasks/[id]/dependencies/[dependencyId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
