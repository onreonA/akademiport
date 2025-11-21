import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { TaskRepository } from '@/infrastructure/database/repositories/TaskRepository';
import { AssignTaskUseCase } from '@/application/use-cases/task';
import { logger } from '@/shared/utils/logger';
import { AppError } from '@/6-core/errors/AppError';

const taskRepository = new TaskRepository();

/**
 * POST /api/tasks/[id]/assign
 * Assign a task to a company user (consultant)
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only consultant and master_admin can assign tasks
    if (user.role !== 'consultant' && user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: taskId } = await params;
    const body = await request.json();
    const { userId } = body ?? {};

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'Görev ataması için kullanıcı seçmelisiniz.' },
        { status: 400 }
      );
    }

    const assignTaskUseCase = new AssignTaskUseCase(taskRepository);
    const result = await assignTaskUseCase.execute(taskId, userId);

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Görev atanamadı.', 400);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({ success: true, message: 'Görev başarıyla atandı.' });
  } catch (error) {
    logger.error('Error in POST /api/tasks/[id]/assign:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
