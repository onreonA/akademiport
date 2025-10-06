import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/firma/progress
 * Firma kullanıcısı için ilerleme dashboard verilerini getirme
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Kullanıcı kimlik doğrulama
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı kimlik doğrulaması gerekli' },
        { status: 401 }
      );
    }

    // Firma kullanıcısı kontrolü
    const COMPANY_ROLES = [
      'user',
      'operator',
      'manager',
      'firma_admin',
      'firma_kullanıcı',
    ];
    if (!COMPANY_ROLES.includes(userRole || '')) {
      return NextResponse.json(
        { error: 'Bu işlem için firma kullanıcısı yetkisi gerekli' },
        { status: 403 }
      );
    }

    // Query parameters
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30'; // 7, 30, 90, 365 gün
    const projectId = searchParams.get('projectId') || '';

    // Kullanıcının company_id'sini al
    const { data: companyUser, error: companyUserError } = await supabase
      .from('company_users')
      .select('company_id, name')
      .eq('email', userEmail)
      .single();

    if (companyUserError || !companyUser) {
      return NextResponse.json(
        { error: 'Firma bilgisi bulunamadı' },
        { status: 404 }
      );
    }

    // Tarih aralığını hesapla
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(timeRange));

    // Firma atanmış projeleri getir
    const { data: assignedProjects, error: assignedProjectsError } =
      await supabase
        .from('project_company_assignments')
        .select(
          `
        id,
        project_id,
        status,
        assigned_at,
        projects!inner(
          id,
          name,
          description,
          status,
          progress_percentage,
          start_date,
          end_date,
          created_at,
          companies!inner(
            id,
            name,
            city,
            industry
          )
        )
      `
        )
        .eq('company_id', companyUser.company_id)
        .eq('status', 'active')
        .gte('assigned_at', startDate.toISOString());

    if (assignedProjectsError) {
      return NextResponse.json(
        { error: 'Atanmış projeler yüklenirken hata oluştu' },
        { status: 500 }
      );
    }

    // Firma atanmış görevleri getir
    const { data: assignedTasks, error: assignedTasksError } = await supabase
      .from('task_company_assignments')
      .select(
        `
        id,
        task_id,
        status,
        assigned_at,
        tasks!inner(
          id,
          title,
          description,
          status,
          priority,
          progress,
          due_date,
          start_date,
          created_at,
          project_id,
          sub_project_id,
          projects!inner(
            id,
            name,
            progress_percentage,
            companies!inner(
              id,
              name
            )
          ),
          sub_projects(
            id,
            name
          )
        )
      `
      )
      .eq('company_id', companyUser.company_id)
      .eq('status', 'active')
      .gte('assigned_at', startDate.toISOString());

    if (assignedTasksError) {
      return NextResponse.json(
        { error: 'Atanmış görevler yüklenirken hata oluştu' },
        { status: 500 }
      );
    }

    // Firma tamamlama istatistikleri
    const { data: taskCompletions, error: completionsError } = await supabase
      .from('task_completions')
      .select(
        `
        id,
        task_id,
        completion_note,
        completion_date,
        actual_hours,
        status,
        quality_score,
        approved_at,
        tasks!inner(
          id,
          title,
          priority,
          projects!inner(
            id,
            name,
            companies!inner(
              id,
              name
            )
          )
        )
      `
      )
      .eq('completed_by', companyUser.company_id)
      .gte('completion_date', startDate.toISOString())
      .order('completion_date', { ascending: false });

    if (completionsError) {
      // Task completions error
    }

    // İstatistik hesaplamaları
    const totalProjects = assignedProjects?.length || 0;
    const activeProjects =
      assignedProjects?.filter(p => p.projects.status === 'active').length || 0;
    const completedProjects =
      assignedProjects?.filter(p => p.projects.status === 'completed').length ||
      0;

    const totalTasks = assignedTasks?.length || 0;
    const completedTasks =
      assignedTasks?.filter(t => t.tasks.status === 'completed').length || 0;
    const inProgressTasks =
      assignedTasks?.filter(t => t.tasks.status === 'in_progress').length || 0;
    const pendingTasks =
      assignedTasks?.filter(t => t.tasks.status === 'pending').length || 0;

    // Tamamlama istatistikleri
    const approvedCompletions =
      taskCompletions?.filter(tc => tc.status === 'approved') || [];
    const pendingApprovals =
      taskCompletions?.filter(tc => tc.status === 'pending_approval') || [];
    const rejectedCompletions =
      taskCompletions?.filter(tc => tc.status === 'rejected') || [];

    // Kalite puanı ortalaması
    const avgQualityScore =
      approvedCompletions.length > 0
        ? Math.round(
            (approvedCompletions.reduce(
              (acc, tc) => acc + (tc.quality_score || 0),
              0
            ) /
              approvedCompletions.length) *
              10
          ) / 10
        : 0;

    // Toplam çalışılan saat
    const totalHours = approvedCompletions.reduce(
      (acc, tc) => acc + (tc.actual_hours || 0),
      0
    );

    // Aylık ilerleme verileri (son 6 ay)
    const monthlyProgressPromises = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i, 1);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1, 0);

      monthlyProgressPromises.push(
        supabase
          .from('task_completions')
          .select('id', { count: 'exact' })
          .eq('completed_by', companyUser.company_id)
          .eq('status', 'approved')
          .gte('completion_date', monthStart.toISOString())
          .lte('completion_date', monthEnd.toISOString())
          .then(({ count }) => ({
            month: monthStart.toISOString().substring(0, 7), // YYYY-MM
            completed: count || 0,
          }))
      );
    }

    const monthlyProgress = await Promise.all(monthlyProgressPromises);

    // Proje bazında detaylı istatistikler
    const projectStats =
      assignedProjects?.map(assignment => {
        const projectTasks =
          assignedTasks?.filter(
            task => task.tasks.project_id === assignment.project_id
          ) || [];
        const projectCompletions =
          taskCompletions?.filter(
            tc => tc.tasks.project_id === assignment.project_id
          ) || [];

        const completedProjectTasks = projectTasks.filter(
          task => task.tasks.status === 'completed'
        ).length;
        const totalProjectTasks = projectTasks.length;

        return {
          id: assignment.project_id,
          name: assignment.projects.name,
          description: assignment.projects.description,
          status: assignment.projects.status,
          progress: assignment.projects.progress_percentage || 0,
          startDate: assignment.projects.start_date,
          endDate: assignment.projects.end_date,
          assignedAt: assignment.assigned_at,
          totalTasks: totalProjectTasks,
          completedTasks: completedProjectTasks,
          completionRate:
            totalProjectTasks > 0
              ? Math.round((completedProjectTasks / totalProjectTasks) * 100)
              : 0,
          totalHours: projectCompletions.reduce(
            (acc, tc) => acc + (tc.actual_hours || 0),
            0
          ),
          avgQualityScore:
            projectCompletions.length > 0
              ? Math.round(
                  (projectCompletions.reduce(
                    (acc, tc) => acc + (tc.quality_score || 0),
                    0
                  ) /
                    projectCompletions.length) *
                    10
                ) / 10
              : 0,
          company: {
            id: assignment.projects.companies.id,
            name: assignment.projects.companies.name,
            city: assignment.projects.companies.city,
            industry: assignment.projects.companies.industry,
          },
        };
      }) || [];

    // Görev durumu dağılımı
    const taskStatusDistribution = {
      pending: pendingTasks,
      in_progress: inProgressTasks,
      completed: completedTasks,
      cancelled:
        assignedTasks?.filter(t => t.tasks.status === 'cancelled').length || 0,
    };

    // Son aktiviteler (son 10 tamamlama)
    const recentActivities = approvedCompletions
      .slice(0, 10)
      .map(completion => ({
        id: completion.id,
        taskTitle: completion.tasks.title,
        projectName: completion.tasks.projects.name,
        completionDate: completion.completion_date,
        actualHours: completion.actual_hours,
        qualityScore: completion.quality_score,
        status: completion.status,
      }));

    const response = {
      success: true,
      data: {
        company: {
          id: companyUser.company_id,
          name: companyUser.name,
        },
        overview: {
          totalProjects,
          activeProjects,
          completedProjects,
          totalTasks,
          completedTasks,
          inProgressTasks,
          pendingTasks,
          approvedCompletions: approvedCompletions.length,
          pendingApprovals: pendingApprovals.length,
          rejectedCompletions: rejectedCompletions.length,
          averageQualityScore: avgQualityScore,
          totalHours,
        },
        projectStats,
        taskStatusDistribution,
        monthlyProgress: monthlyProgress.map(item => ({
          month: item.month,
          completed: item.completed,
        })),
        recentActivities,
        timeRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days: parseInt(timeRange),
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Sunucu hatası',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      },
      { status: 500 }
    );
  }
}
