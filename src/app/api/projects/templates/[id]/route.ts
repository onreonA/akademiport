import { NextRequest, NextResponse } from 'next/server';
import { ProjectRepository } from '@/infrastructure/database/repositories/ProjectRepository';
import { GetProjectUseCase } from '@/application/use-cases/project';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { AppError } from '@/6-core/errors/AppError';

const projectRepository = new ProjectRepository();

/**
 * GET /api/projects/templates/[id]
 * Get project template by ID with sub-projects and tasks
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin, program_manager, and consultant can view templates
    if (
      user.role !== 'master_admin' &&
      user.role !== 'program_manager' &&
      user.role !== 'consultant'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const getProjectUseCase = new GetProjectUseCase(projectRepository);
    const result = await getProjectUseCase.execute(id);

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    // Verify it's a template
    if (!result.value.isTemplate) {
      return NextResponse.json({ error: 'Project is not a template' }, { status: 400 });
    }

    return NextResponse.json({ success: true, template: result.value });
  } catch (error) {
    console.error('Error in GET /api/projects/templates/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
