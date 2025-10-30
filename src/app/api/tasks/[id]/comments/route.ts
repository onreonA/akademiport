import { NextRequest, NextResponse } from 'next/server';
import { TaskCommentRepository } from '@/infrastructure/database/repositories/TaskCommentRepository';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

/**
 * GET /api/tasks/[id]/comments
 * Get all comments for a task
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    const { id: taskId } = await params;

    const commentRepository = new TaskCommentRepository();
    const result = await commentRepository.findByTaskId(taskId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      comments: result.data,
    });
  } catch (error) {
    console.error('Error in GET /api/tasks/[id]/comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/tasks/[id]/comments
 * Add a comment to a task
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    const { id: taskId } = await params;
    const body = await request.json();

    const { comment, is_question } = body;

    if (!comment) {
      return NextResponse.json({ error: 'Missing required field: comment' }, { status: 400 });
    }

    const commentRepository = new TaskCommentRepository();
    const result = await commentRepository.create({
      task_id: taskId,
      user_id: user.id,
      comment,
      is_question: is_question || false,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      comment: result.data,
    });
  } catch (error) {
    console.error('Error in POST /api/tasks/[id]/comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
