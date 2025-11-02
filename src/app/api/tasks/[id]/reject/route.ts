import { NextRequest, NextResponse } from 'next/server';
import { TaskRepository } from '@/infrastructure/database/repositories/TaskRepository';
import { RejectTaskUseCase } from '@/application/use-cases/task';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

const taskRepository = new TaskRepository();

/**
 * POST /api/tasks/[id]/reject
 * Reject a task (consultant)
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only consultant and master_admin can reject tasks
    if (user.role !== 'consultant' && user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const rejectTaskUseCase = new RejectTaskUseCase(taskRepository);
    const result = await rejectTaskUseCase.execute(id);

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task rejected and sent back for revision',
    });
  } catch (error) {
    console.error('Error in POST /api/tasks/[id]/reject:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
