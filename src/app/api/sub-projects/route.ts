import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/4-infrastructure/api/helpers/auth';
import { SubProjectRepository } from '@/4-infrastructure/database/repositories/SubProjectRepository';
import { CreateSubProjectUseCase } from '@/2-application/use-cases/sub-project/CreateSubProjectUseCase';
import { ListSubProjectsUseCase } from '@/2-application/use-cases/sub-project/ListSubProjectsUseCase';

/**
 * GET /api/sub-projects?projectId=xxx
 * List sub-projects by project
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const repository = new SubProjectRepository();
    const useCase = new ListSubProjectsUseCase(repository);

    const result = await useCase.execute(projectId);

    if (!result.isSuccess) {
      return NextResponse.json(
        { error: result.error || 'Failed to list sub-projects' },
        { status: 400 }
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('❌ [Sub-Projects API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/sub-projects
 * Create a new sub-project
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only consultants and admins can create sub-projects
    if (!['consultant', 'master_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { projectId, name, description, status, orderIndex } = body;

    if (!projectId || !name) {
      return NextResponse.json({ error: 'Project ID and name are required' }, { status: 400 });
    }

    const repository = new SubProjectRepository();
    const useCase = new CreateSubProjectUseCase(repository);

    const result = await useCase.execute({
      projectId,
      name,
      description,
      status: status || 'todo',
      orderIndex: orderIndex || 0,
    });

    if (!result.isSuccess) {
      return NextResponse.json(
        { error: result.error || 'Failed to create sub-project' },
        { status: 400 }
      );
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (error) {
    console.error('❌ [Sub-Projects API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
