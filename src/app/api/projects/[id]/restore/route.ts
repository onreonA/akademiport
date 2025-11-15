import { NextRequest, NextResponse } from 'next/server';
import { ProjectRepository } from '@/infrastructure/database/repositories/ProjectRepository';
import { RestoreProjectUseCase } from '@/application/use-cases/project/RestoreProjectUseCase';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';

const projectRepository = new ProjectRepository();

/**
 * POST /api/projects/[id]/restore
 * Restore a deleted project (soft delete'den geri yükle)
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only master_admin can restore deleted projects
    if (user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const restoreProjectUseCase = new RestoreProjectUseCase(projectRepository);
    const result = await restoreProjectUseCase.execute(id);

    if (result.isFailure) {
      return NextResponse.json(
        { error: (result.error as any)?.message || "Unknown error" },
        { status: (result.error as any)?.statusCode || 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Proje başarıyla geri yüklendi' });
  } catch (error) {
    console.error('Error in POST /api/projects/[id]/restore:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
