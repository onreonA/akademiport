import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/sub-projects/[id]/completion-status/[companyId]
 * Alt proje tamamlama durumunu kontrol et
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; companyId: string }> }
) {
  try {
    const { id: subProjectId, companyId } = await params;
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

    // Admin, danışman veya ilgili firma kullanıcısı olması gerekir
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role, company_id')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Yetki kontrolü
    const isAdmin = ['admin', 'master_admin', 'danışman'].includes(
      userRole || ''
    );
    const isCompanyUser = user.company_id === companyId;

    if (!isAdmin && !isCompanyUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Alt proje tamamlama istatistiklerini al
    const { data: completionStats, error: statsError } = await supabase.rpc(
      'get_sub_project_completion_stats',
      {
        p_sub_project_id: subProjectId,
        p_company_id: companyId,
      }
    );

    if (statsError) {
      return NextResponse.json(
        { error: 'Failed to get completion statistics' },
        { status: 500 }
      );
    }

    if (!completionStats || completionStats.length === 0) {
      return NextResponse.json(
        { error: 'Sub-project assignment not found' },
        { status: 404 }
      );
    }

    const stats = completionStats[0];

    // Alt proje ve firma bilgilerini al
    const { data: subProject, error: subProjectError } = await supabase
      .from('sub_projects')
      .select(
        `
        id,
        name,
        description,
        project_id,
        projects (
          id,
          name
        )
      `
      )
      .eq('id', subProjectId)
      .single();

    if (subProjectError || !subProject) {
      return NextResponse.json(
        { error: 'Sub-project not found' },
        { status: 404 }
      );
    }

    // Firma bilgisini al
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Atama durumunu al
    const { data: assignment, error: assignmentError } = await supabase
      .from('sub_project_company_assignments')
      .select('*')
      .eq('sub_project_id', subProjectId)
      .eq('company_id', companyId)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Mevcut rapor var mı kontrol et
    const { data: existingReport, error: reportError } = await supabase
      .from('sub_project_completion_reports')
      .select('id, created_at, overall_rating')
      .eq('sub_project_id', subProjectId)
      .eq('company_id', companyId)
      .single();

    // Görev detaylarını al
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(
        `
        id,
        title,
        status,
        completed_at,
        created_at
      `
      )
      .eq('sub_project_id', subProjectId)
      .order('created_at', { ascending: true });

    if (tasksError) {
    }

    const response = {
      subProject: {
        id: subProject.id,
        name: subProject.name,
        description: subProject.description,
        projectName: subProject.projects?.name,
      },
      company: {
        id: company.id,
        name: company.name,
      },
      assignment: {
        id: assignment.id,
        status: assignment.status,
        completionStatus: assignment.completion_status,
        completedAt: assignment.completed_at,
        consultantReviewRequired: assignment.consultant_review_required,
        allTasksCompleted: assignment.all_tasks_completed,
      },
      statistics: {
        totalTasks: stats.total_tasks,
        completedTasks: stats.completed_tasks,
        completionRate: stats.completion_rate,
        allCompleted: stats.all_completed,
        completionDate: stats.completion_date,
      },
      existingReport: reportError
        ? null
        : {
            id: existingReport.id,
            createdAt: existingReport.created_at,
            rating: existingReport.overall_rating,
          },
      tasks: tasks || [],
      canCreateReport: stats.all_completed && !existingReport,
      canViewReport: !!existingReport,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
