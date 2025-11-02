import { NextRequest, NextResponse } from 'next/server';
import { TaskCommentRepository } from '@/infrastructure/database/repositories/TaskCommentRepository';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

/**
 * GET /api/tasks/[id]/comments
 * Get all comments for a task
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: taskId } = await params;

    const commentRepository = new TaskCommentRepository();
    const comments = await commentRepository.findByTaskId(taskId);

    return NextResponse.json({
      success: true,
      comments: comments || [],
    });
  } catch (error) {
    console.error('Error in GET /api/tasks/[id]/comments:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks/[id]/comments
 * Add a comment to a task
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: taskId } = await params;
    const body = await request.json();

    const { comment, is_question, isQuestion, parentCommentId } = body;

    if (!comment) {
      return NextResponse.json({ error: 'Missing required field: comment' }, { status: 400 });
    }

    // isQuestion değerini doğru al (hem is_question hem isQuestion destekleniyor)
    const isQuestionValue =
      is_question !== undefined ? is_question : isQuestion !== undefined ? isQuestion : false;

    // Eğer parentCommentId varsa, bu bir cevaptır ve isQuestion false olmalı
    const finalIsQuestion = parentCommentId ? false : isQuestionValue;

    console.log('[POST /api/tasks/[id]/comments] Received:', {
      comment: comment?.substring(0, 50),
      is_question,
      isQuestion,
      isQuestionValue,
      parentCommentId,
      finalIsQuestion,
    });

    const commentRepository = new TaskCommentRepository();
    const newComment = await commentRepository.create({
      taskId: taskId,
      userId: user.id,
      comment,
      isQuestion: finalIsQuestion,
      parentCommentId: parentCommentId || null,
    });

    console.log('[POST /api/tasks/[id]/comments] Created comment:', {
      id: newComment.id,
      isQuestion: newComment.isQuestion,
    });

    return NextResponse.json({
      success: true,
      comment: newComment,
    });
  } catch (error) {
    console.error('Error in POST /api/tasks/[id]/comments:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
