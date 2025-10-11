import { NextRequest, NextResponse } from 'next/server';

import { requireCompany, createAuthErrorResponse } from '@/lib/jwt-utils';
import { createAdminClient, createClient } from '@/lib/supabase/server';

/**
 * GET /api/firma/assigned-projects
 * Firma kullanıcısının atanmış projelerini getirir
 */
export async function GET(request: NextRequest) {
  try {
    // JWT Authentication - Company users only
    const user = await requireCompany(request);

    const supabase = createClient();

    // Kullanıcının company_id'sini JWT'den al
    const companyId = user.company_id;

    if (!companyId) {
      return NextResponse.json(
        { error: 'Firma bilgisi bulunamadı' },
        { status: 404 }
      );
    }

    // Atanmış projeleri getir (basit query)
    const { data: assignedProjects, error: projectsError } = await supabase
      .from('project_company_assignments')
      .select('id, project_id, assigned_at, status')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .order('assigned_at', { ascending: false });

    //   assignedProjects,
    //   projectsError,
    // });

    if (projectsError) {
      return NextResponse.json(
        { error: 'Proje verileri alınırken hata oluştu' },
        { status: 500 }
      );
    }

    // Projeleri manuel olarak getir
    const projectIds = assignedProjects?.map(p => p.project_id) || [];

    if (projectIds.length === 0) {
      return NextResponse.json({
        success: true,
        projects: [],
        message: 'Atanmış proje bulunamadı',
      });
    }

    // Projeleri tek tek getir ve firma bazlı tarihleri + progress ekle
    const projects = [];
    for (const projectId of projectIds) {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select(
          'id, name, description, status, start_date, end_date, progress, created_at'
        )
        .eq('id', projectId)
        .single();

      if (project && !projectError) {
        // Firma bazlı tarihleri getir - Use admin client for bypassing RLS when reading company dates
        const adminSupabase = createAdminClient();
        const { data: companyDates, error: datesError } = await adminSupabase
          .from('project_company_dates')
          .select('start_date, end_date')
          .eq('project_id', projectId)
          .eq('company_id', companyUser.company_id)
          .single();

        // Eğer firma bazlı tarihler varsa, bunları kullan
        if (companyDates && !datesError) {
          project.start_date = companyDates.start_date;
          project.end_date = companyDates.end_date;
        }

        // Firma bazlı progress hesapla
        const { data: projectTasks, error: tasksError } = await supabase
          .from('tasks')
          .select('id')
          .eq('project_id', projectId);

        let companyProgress = project.progress || 0;
        if (projectTasks && projectTasks.length > 0) {
          const taskIds = projectTasks.map(task => task.id);

          const { data: companyTaskStatuses } = await supabase
            .from('company_task_statuses')
            .select('task_id, status')
            .in('task_id', taskIds)
            .eq('company_id', companyUser.company_id);

          const completedTasks =
            companyTaskStatuses?.filter(cts => cts.status === 'Tamamlandı')
              .length || 0;

          companyProgress =
            taskIds.length > 0
              ? Math.round((completedTasks / taskIds.length) * 100)
              : 0;
        }

        // Progress'i güncelle
        project.progress = companyProgress;
        project.progress_percentage = companyProgress;

        projects.push(project);
      }
    }

    // Basit response döndür
    return NextResponse.json({
      success: true,
      projects: projects,
      message: 'Atanmış projeler başarıyla getirildi',
    });
  } catch (error: any) {
    // Handle authentication errors specifically
    if (
      error.message === 'Authentication required' ||
      error.message === 'Company access required'
    ) {
      return createAuthErrorResponse(error.message, 401);
    }

    return NextResponse.json(
      { error: 'Sunucu hatası oluştu' },
      { status: 500 }
    );
  }
}
