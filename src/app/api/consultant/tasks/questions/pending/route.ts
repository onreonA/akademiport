import { NextRequest, NextResponse } from 'next/server';
import { TaskRepository } from '@/infrastructure/database/repositories/TaskRepository';
import { ProjectRepository } from '@/infrastructure/database/repositories/ProjectRepository';
import { SubProjectRepository } from '@/infrastructure/database/repositories/SubProjectRepository';
import { TaskCommentRepository } from '@/infrastructure/database/repositories/TaskCommentRepository';
import { ListConsultantPendingQuestionsUseCase } from '@/application/use-cases/task';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

const taskRepository = new TaskRepository();
const projectRepository = new ProjectRepository();
const subProjectRepository = new SubProjectRepository();
const taskCommentRepository = new TaskCommentRepository();

/**
 * GET /api/consultant/tasks/questions/pending
 * Get all pending questions for consultant's assigned projects
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[GET /api/consultant/tasks/questions/pending] Starting...');

    const user = await getAuthenticatedUser(request);
    if (!user) {
      console.log('[GET /api/consultant/tasks/questions/pending] Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[GET /api/consultant/tasks/questions/pending] User:', {
      id: user.id,
      role: user.role,
    });

    // Only consultants and master_admins can view pending questions
    if (user.role !== 'consultant' && user.role !== 'master_admin') {
      console.log('[GET /api/consultant/tasks/questions/pending] Forbidden - role:', user.role);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.log('[GET /api/consultant/tasks/questions/pending] Creating UseCase...');
    const useCase = new ListConsultantPendingQuestionsUseCase(
      taskRepository,
      projectRepository,
      subProjectRepository,
      taskCommentRepository
    );

    console.log(
      '[GET /api/consultant/tasks/questions/pending] Executing UseCase with consultantId:',
      user.id
    );
    const result = await useCase.execute(user.id);
    console.log('[GET /api/consultant/tasks/questions/pending] UseCase result:', {
      isFailure: result.isFailure,
      valueLength: result.value?.length || 0,
    });

    if (result.isFailure) {
      console.error('ListConsultantPendingQuestionsUseCase failed:', result.error);
      return NextResponse.json(
        { error: (result.error as any)?.message || 'Unknown error' },
        { status: (result.error as any)?.statusCode || 500 }
      );
    }

    console.log('Questions found:', result.value?.length || 0);
    return NextResponse.json({ success: true, questions: result.value || [] });
  } catch (error) {
    console.error('Error in GET /api/consultant/tasks/questions/pending:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
