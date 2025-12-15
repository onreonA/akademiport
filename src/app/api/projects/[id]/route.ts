import { NextRequest, NextResponse } from 'next/server';
import { ProjectRepository } from '@/infrastructure/database/repositories/ProjectRepository';
import {
  GetProjectUseCase,
  UpdateProjectUseCase,
  DeleteProjectUseCase,
} from '@/application/use-cases/project';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { AppError } from '@/6-core/errors/AppError';
import { AddLeaderboardScoreUseCase } from '@/2-application/use-cases/leaderboard';
import { SupabaseLeaderboardRepository } from '@/4-infrastructure/database/repositories/SupabaseLeaderboardRepository';
import { CompanyRepository } from '@/4-infrastructure/database/repositories/CompanyRepository';

const projectRepository = new ProjectRepository();
const leaderboardRepository = new SupabaseLeaderboardRepository();
const companyRepository = new CompanyRepository();
const addLeaderboardScore = new AddLeaderboardScoreUseCase(
  leaderboardRepository,
  companyRepository
);

/**
 * GET /api/projects/[id]
 * Get project by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const getProjectUseCase = new GetProjectUseCase(projectRepository);
    const result = await getProjectUseCase.execute(id);

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
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
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Company users can only update their own projects (limited fields)
    if (user.role === 'company_user' || user.role === 'company_admin') {
      if (!user.companyId) {
        return NextResponse.json({ error: 'Firma bilgisi bulunamadı' }, { status: 403 });
      }

      // Verify the project belongs to the company
      const getProjectUseCase = new GetProjectUseCase(projectRepository);
      const projectResult = await getProjectUseCase.execute(id);

      if (projectResult.isFailure) {
        return NextResponse.json(
          { error: (projectResult.error as any)?.message || 'Failed to fetch project' },
          { status: (projectResult.error as any)?.statusCode || 500 }
        );
      }

      const project = projectResult.value;

      // Check if project is assigned to this company via company_project_assignments
      // or if project.companyId matches user.companyId
      const isAssignedToCompany = project.companyId === user.companyId;

      // Also check company_project_assignments
      let isAssignedViaAssignments = false;
      if (!isAssignedToCompany) {
        try {
          const { createClient } = await import('@/infrastructure/database/supabase-server');
          const supabase = await createClient();
          const { data: assignment } = await supabase
            .from('company_project_assignments')
            .select('id')
            .eq('company_id', user.companyId)
            .eq('project_id', id)
            .eq('is_active', true)
            .single();

          isAssignedViaAssignments = !!assignment;
        } catch {
          // Silently fail if assignment check fails
        }
      }

      if (!isAssignedToCompany && !isAssignedViaAssignments) {
        return NextResponse.json({ error: 'Bu projeyi düzenleme yetkiniz yok' }, { status: 403 });
      }

      // Company users can only update limited fields (name, description, dates)
      // They cannot change status, priority, companyId, consultantId
      const updateProjectUseCase = new UpdateProjectUseCase(projectRepository, addLeaderboardScore);
      const result = await updateProjectUseCase.execute(id, {
        name: body.name,
        description: body.description,
        startDate:
          body.startDate || body.start_date
            ? new Date(body.startDate || body.start_date)
            : undefined,
        endDate:
          body.endDate || body.end_date ? new Date(body.endDate || body.end_date) : undefined,
        // Don't allow company users to change these fields
        companyId: project.companyId,
        consultantId: project.consultantId,
        status: project.status,
        priority: project.priority,
      });

      if (result.isFailure) {
        const error =
          result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
        return NextResponse.json({ error: error.message }, { status: error.statusCode });
      }

      return NextResponse.json({ success: true });
    }

    // Master admin and consultant can update all fields
    if (user.role !== 'master_admin' && user.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateProjectUseCase = new UpdateProjectUseCase(projectRepository, addLeaderboardScore);
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
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
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
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if user has permission to delete this project
    if (user.role !== 'master_admin') {
      // Consultants can only delete their own projects
      if (user.role === 'consultant') {
        // First, verify the project belongs to this consultant
        const getProjectUseCase = new GetProjectUseCase(projectRepository);
        const projectResult = await getProjectUseCase.execute(id);

        if (projectResult.isFailure) {
          return NextResponse.json(
            { error: (projectResult.error as any)?.message || 'Failed to fetch project' },
            { status: (projectResult.error as any)?.statusCode || 500 }
          );
        }

        const project = projectResult.value;
        if (project.consultantId !== user.id) {
          return NextResponse.json({ error: 'Bu projeyi silme yetkiniz yok' }, { status: 403 });
        }
      } else {
        // Other roles cannot delete projects
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const deleteProjectUseCase = new DeleteProjectUseCase(projectRepository);
    const result = await deleteProjectUseCase.execute(id);

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/projects/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
