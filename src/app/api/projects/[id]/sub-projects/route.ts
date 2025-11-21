import { NextRequest, NextResponse } from 'next/server';
import { SubProjectRepository } from '@/infrastructure/database/repositories/SubProjectRepository';
import { ProjectRepository } from '@/infrastructure/database/repositories/ProjectRepository';
import {
  CreateSubProjectUseCase,
  ListSubProjectsUseCase,
} from '@/application/use-cases/sub-project';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { AppError } from '@/6-core/errors/AppError';

const subProjectRepository = new SubProjectRepository();
const projectRepository = new ProjectRepository();

/**
 * GET /api/projects/[id]/sub-projects
 * List sub-projects for a project
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const listSubProjectsUseCase = new ListSubProjectsUseCase(subProjectRepository);
    const result = await listSubProjectsUseCase.execute(id);

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({ data: result.value });
  } catch (error) {
    console.error('Error in GET /api/projects/[id]/sub-projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/projects/[id]/sub-projects
 * Create a new sub-project
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin and consultant can create sub-projects
    if (user.role !== 'master_admin' && user.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const createSubProjectUseCase = new CreateSubProjectUseCase(
      subProjectRepository,
      projectRepository
    );

    const result = await createSubProjectUseCase.execute({
      projectId: id,
      name: body.name,
      description: body.description,
      status: body.status,
      orderIndex: body.orderIndex,
    });

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/projects/[id]/sub-projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
