import { NextRequest, NextResponse } from 'next/server';
import { ProjectRepository } from '@/infrastructure/database/repositories/ProjectRepository';
import {
  GetProjectUseCase,
  UpdateProjectUseCase,
  DeleteProjectUseCase,
} from '@/application/use-cases/project';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

const projectRepository = new ProjectRepository();

/**
 * GET /api/projects/[id]
 * Get project by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const getProjectUseCase = new GetProjectUseCase(projectRepository);
    const result = await getProjectUseCase.execute(id);

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('Error in GET /api/projects/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/projects/[id]
 * Update project
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin and consultant can update projects
    if (user.role !== 'master_admin' && user.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const updateProjectUseCase = new UpdateProjectUseCase(projectRepository);
    const result = await updateProjectUseCase.execute(id, {
      companyId: body.companyId || body.company_id,
      consultantId: body.consultantId || body.consultant_id,
      name: body.name,
      description: body.description,
      status: body.status,
      priority: body.priority,
      startDate:
        body.startDate || body.start_date ? new Date(body.startDate || body.start_date) : undefined,
      endDate: body.endDate || body.end_date ? new Date(body.endDate || body.end_date) : undefined,
      progress: body.progress,
    });

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /api/projects/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin can delete projects
    if (user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const deleteProjectUseCase = new DeleteProjectUseCase(projectRepository);
    const result = await deleteProjectUseCase.execute(id);

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/projects/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
