import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/projects/[id]/sub-project-assignments
 * Projeye ait alt proje atamalarını getirir
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = createClient();

    // Kullanıcı yetkisini kontrol et
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Sadece admin ve danışman erişebilir
    if (!['admin', 'master_admin', 'danışman'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Önce bu projeye ait alt projelerin ID'lerini al
    const { data: subProjectIds, error: subProjectIdsError } = await supabase
      .from('sub_projects')
      .select('id')
      .eq('project_id', projectId);

    if (subProjectIdsError) {
      return NextResponse.json(
        { error: 'Failed to fetch sub-project IDs' },
        { status: 500 }
      );
    }

    const subProjectIdList = subProjectIds?.map(sp => sp.id) || [];

    // Alt proje atamalarını al
    const { data: assignments, error: assignmentsError } = await supabase
      .from('sub_project_company_assignments')
      .select(
        `
        id,
        sub_project_id,
        company_id,
        status,
        assigned_at,
        completed_at,
        completion_status,
        consultant_review_required,
        all_tasks_completed,
        sub_projects (
          id,
          name,
          description
        ),
        companies (
          id,
          name,
          email
        )
      `
      )
      .in('sub_project_id', subProjectIdList);

    if (assignmentsError) {
      return NextResponse.json(
        { error: 'Failed to fetch sub-project assignments' },
        { status: 500 }
      );
    }

    // Alt projeleri al
    const { data: subProjects, error: subProjectsError } = await supabase
      .from('sub_projects')
      .select(
        `
        id,
        name,
        description,
        status,
        progress_percentage
      `
      )
      .eq('project_id', projectId);

    if (subProjectsError) {
      // Alt projeler hatası kritik değil, devam et
    }

    // Formatlanmış atamalar
    const formattedAssignments =
      assignments?.map(assignment => ({
        id: assignment.id,
        sub_project_id: assignment.sub_project_id,
        company_id: assignment.company_id,
        status: assignment.status,
        assigned_at: assignment.assigned_at,
        completed_at: assignment.completed_at,
        completion_status: assignment.completion_status,
        consultant_review_required: assignment.consultant_review_required,
        all_tasks_completed: assignment.all_tasks_completed,
        sub_project: {
          id: assignment.sub_projects?.id,
          name: assignment.sub_projects?.name,
          description: assignment.sub_projects?.description,
        },
        company: {
          id: assignment.companies?.id,
          name: assignment.companies?.name,
          email: assignment.companies?.email,
        },
      })) || [];

    return NextResponse.json({
      assignments: formattedAssignments,
      subProjects: subProjects || [],
      total: formattedAssignments.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
