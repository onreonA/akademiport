import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/4-infrastructure/api/helpers/auth';
import { TaskCommentRepository } from '@/4-infrastructure/database/repositories/TaskCommentRepository';
import { DeleteTaskCommentUseCase } from '@/2-application/use-cases/task-comment/DeleteTaskCommentUseCase';

/**
 * DELETE /api/tasks/[id]/comments/[commentId]
 * Delete a task comment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repository = new TaskCommentRepository();
    const useCase = new DeleteTaskCommentUseCase(repository);

    const result = await useCase.execute(params.commentId);

    if (!result.isSuccess) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete comment' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ [Task Comment API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

