import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/4-infrastructure/api/helpers/auth';
import { SubProjectRepository } from '@/4-infrastructure/database/repositories/SubProjectRepository';
import { GetSubProjectUseCase } from '@/2-application/use-cases/sub-project/GetSubProjectUseCase';
import { UpdateSubProjectUseCase } from '@/2-application/use-cases/sub-project/UpdateSubProjectUseCase';
import { DeleteSubProjectUseCase } from '@/2-application/use-cases/sub-project/DeleteSubProjectUseCase';

/**
 * GET /api/sub-projects/[id]
 * Get a single sub-project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repository = new SubProjectRepository();
    const useCase = new GetSubProjectUseCase(repository);

    const result = await useCase.execute(params.id);

    if (!result.isSuccess) {
      return NextResponse.json(
        { error: result.error || 'Sub-project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('❌ [Sub-Project API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/sub-projects/[id]
 * Update a sub-project
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only consultants and admins can update sub-projects
    if (!['consultant', 'master_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, status, orderIndex } = body;

    const repository = new SubProjectRepository();
    const useCase = new UpdateSubProjectUseCase(repository);

    const result = await useCase.execute(params.id, {
      name,
      description,
      status,
      orderIndex,
    });

    if (!result.isSuccess) {
      return NextResponse.json(
        { error: result.error || 'Failed to update sub-project' },
        { status: 400 }
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('❌ [Sub-Project API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sub-projects/[id]
 * Delete a sub-project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only consultants and admins can delete sub-projects
    if (!['consultant', 'master_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const repository = new SubProjectRepository();
    const useCase = new DeleteSubProjectUseCase(repository);

    const result = await useCase.execute(params.id);

    if (!result.isSuccess) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete sub-project' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ [Sub-Project API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

