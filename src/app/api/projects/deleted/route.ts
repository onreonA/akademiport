import { NextRequest, NextResponse } from 'next/server';
import { ProjectRepository } from '@/infrastructure/database/repositories/ProjectRepository';
import { ListDeletedProjectsUseCase } from '@/application/use-cases/project/ListDeletedProjectsUseCase';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { AppError } from '@/6-core/errors/AppError';

const projectRepository = new ProjectRepository();

/**
 * GET /api/projects/deleted
 * List all deleted projects (only for master_admin)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin can view deleted projects
    if (user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const listDeletedProjectsUseCase = new ListDeletedProjectsUseCase(projectRepository);
    const result = await listDeletedProjectsUseCase.execute();

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({ success: true, projects: result.value });
  } catch (error) {
    console.error('Error in GET /api/projects/deleted:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
