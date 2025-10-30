import { NextRequest, NextResponse } from 'next/server';
import { TaskRepository } from '@/infrastructure/database/repositories/TaskRepository';
import { ApproveTaskUseCase } from '@/application/use-cases/task';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

const taskRepository = new TaskRepository();

/**
 * POST /api/tasks/[id]/approve
 * Approve a task (consultant)
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only consultant and master_admin can approve tasks
    if (user.userRole !== 'consultant' && user.userRole !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const approveTaskUseCase = new ApproveTaskUseCase(taskRepository);
    const result = await approveTaskUseCase.execute(id, user.userId);

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json({ success: true, message: 'Task approved successfully' });
  } catch (error) {
    console.error('Error in POST /api/tasks/[id]/approve:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
