import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/4-infrastructure/api/helpers/auth';
import { TaskCommentRepository } from '@/4-infrastructure/database/repositories/TaskCommentRepository';
import { DeleteTaskCommentUseCase } from '@/2-application/use-cases/task-comment/DeleteTaskCommentUseCase';
import { logger } from '@/shared/utils/logger';

/**
 * DELETE /api/tasks/[id]/comments/[commentId]
 * Delete a task comment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { commentId } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repository = new TaskCommentRepository();
    const useCase = new DeleteTaskCommentUseCase(repository);

    const result = await useCase.execute(commentId);

    if (!result.isSuccess) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete comment' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('❌ [Task Comment API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
