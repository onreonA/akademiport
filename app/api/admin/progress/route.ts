import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/progress
 * Admin kullanıcısı için detaylı ilerleme dashboard verilerini getirme
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

    // Admin kontrolü
    if (
      userRole !== 'admin' &&
      userRole !== 'master_admin' &&
      userRole !== 'danışman'
    ) {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    // Query parameters
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30'; // 7, 30, 90, 365 gün
    const projectId = searchParams.get('projectId') || '';
    const companyId = searchParams.get('companyId') || '';

    // Tarih aralığını hesapla
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(timeRange));

    // Genel istatistikler
    const statsPromises = [
      // Toplam projeler
      supabase
        .from('projects')
        .select('id', { count: 'exact' })
        .gte('created_at', startDate.toISOString()),

      // Aktif projeler
      supabase
        .from('projects')
        .select('id', { count: 'exact' })
        .eq('status', 'active')
        .gte('created_at', startDate.toISOString()),

      // Tamamlanan projeler
      supabase
        .from('projects')
        .select('id', { count: 'exact' })
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString()),

      // Toplam görevler
      supabase
        .from('tasks')
        .select('id', { count: 'exact' })
        .gte('created_at', startDate.toISOString()),

      // Tamamlanan görevler
      supabase
        .from('tasks')
        .select('id', { count: 'exact' })
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString()),

      // Onay bekleyen görevler
      supabase
        .from('task_completions')
        .select('id', { count: 'exact' })
        .eq('status', 'pending_approval'),

      // Toplam firmalar
      supabase
        .from('companies')
        .select('id', { count: 'exact' })
        .gte('created_at', startDate.toISOString()),

      // Aktif firmalar
      supabase
        .from('companies')
        .select('id', { count: 'exact' })
        .eq('status', 'active')
        .gte('created_at', startDate.toISOString()),

      // Toplam kullanıcılar
      supabase
        .from('company_users')
        .select('id', { count: 'exact' })
        .gte('created_at', startDate.toISOString()),
    ];

    const statsResults = await Promise.all(statsPromises);

    // Proje detayları
    let projectQuery = supabase
      .from('projects')
      .select(
        `
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
          industry,
          status
        )
      `
      )
      .order('created_at', { ascending: false })
      .limit(20);

    if (projectId) {
      projectQuery = projectQuery.eq('id', projectId);
    }
    if (companyId) {
      projectQuery = projectQuery.eq('companies.id', companyId);
    }

    const { data: projects, error: projectsError } = await projectQuery;

    if (projectsError) {
      // Projects error
    }

    // Firma performans analizi
    const { data: companyPerformance, error: companyPerfError } = await supabase
      .from('companies')
      .select(
        `
        id,
        name,
        city,
        industry,
        status,
        created_at,
        project_company_assignments!inner(
          id,
          status,
          assigned_at,
          projects!inner(
            id,
            name,
            status,
            progress_percentage,
            tasks!inner(
              id,
              status,
              progress
            )
          )
        ),
        task_company_assignments!inner(
          id,
          status,
          assigned_at,
          tasks!inner(
            id,
            title,
            status,
            priority
          )
        )
      `
      )
      .eq('status', 'active')
      .limit(15);

    if (companyPerfError) {
      // Company performance error
    }

    // Firma performans hesaplama
    const companyStats =
      companyPerformance?.map(company => {
        const assignedProjects = company.project_company_assignments || [];
        const assignedTasks = company.task_company_assignments || [];

        const totalProjects = assignedProjects.length;
        const activeProjects = assignedProjects.filter(
          pa => pa.projects.status === 'active'
        ).length;
        const completedProjects = assignedProjects.filter(
          pa => pa.projects.status === 'completed'
        ).length;

        const totalTasks = assignedTasks.length;
        const completedTasks = assignedTasks.filter(
          ta => ta.tasks.status === 'completed'
        ).length;
        const inProgressTasks = assignedTasks.filter(
          ta => ta.tasks.status === 'in_progress'
        ).length;

        const avgProgress =
          assignedProjects.reduce(
            (acc, pa) => acc + (pa.projects.progress_percentage || 0),
            0
          ) / (totalProjects || 1);

        return {
          id: company.id,
          name: company.name,
          city: company.city,
          industry: company.industry,
          status: company.status,
          createdAt: company.created_at,
          totalProjects,
          activeProjects,
          completedProjects,
          totalTasks,
          completedTasks,
          inProgressTasks,
          completionRate:
            totalTasks > 0
              ? Math.round((completedTasks / totalTasks) * 100)
              : 0,
          averageProgress: Math.round(avgProgress),
          projectCompletionRate:
            totalProjects > 0
              ? Math.round((completedProjects / totalProjects) * 100)
              : 0,
        };
      }) || [];

    // Görev durumu dağılımı
    const { data: taskStatusDistribution, error: taskStatusError } =
      await supabase
        .from('tasks')
        .select('status')
        .gte('created_at', startDate.toISOString());

    if (taskStatusError) {
      // Task status distribution error
    }

    const taskStatusStats =
      taskStatusDistribution?.reduce(
        (acc, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ) || {};

    // Aylık ilerleme verileri (son 12 ay)
    const monthlyProgressPromises = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i, 1);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1, 0);

      monthlyProgressPromises.push(
        supabase
          .from('tasks')
          .select('id, status', { count: 'exact' })
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString())
          .then(({ count }) => ({
            month: monthStart.toISOString().substring(0, 7), // YYYY-MM
            total: count || 0,
          }))
      );

      monthlyProgressPromises.push(
        supabase
          .from('tasks')
          .select('id', { count: 'exact' })
          .eq('status', 'completed')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString())
          .then(({ count }) => ({
            month: monthStart.toISOString().substring(0, 7),
            completed: count || 0,
          }))
      );
    }

    const monthlyProgressResults = await Promise.all(monthlyProgressPromises);

    // Aylık verileri birleştir
    const monthlyProgressMap = new Map();
    monthlyProgressResults.forEach(item => {
      if (!monthlyProgressMap.has(item.month)) {
        monthlyProgressMap.set(item.month, {
          month: item.month,
          total: 0,
          completed: 0,
        });
      }
      const existing = monthlyProgressMap.get(item.month);
      if ('total' in item) {
        existing.total = item.total;
      }
      if ('completed' in item) {
        existing.completed = item.completed;
      }
    });

    const monthlyProgress = Array.from(monthlyProgressMap.values()).sort(
      (a, b) => a.month.localeCompare(b.month)
    );

    // Kalite puanları analizi
    const { data: qualityScores, error: qualityError } = await supabase
      .from('task_completions')
      .select(
        `
        quality_score,
        approved_at,
        tasks!inner(
          id,
          title,
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
      .not('quality_score', 'is', null)
      .gte('approved_at', startDate.toISOString())
      .order('approved_at', { ascending: false });

    if (qualityError) {
      // Quality scores error
    }

    const avgQualityScore = qualityScores?.length
      ? Math.round(
          (qualityScores.reduce(
            (acc, item) => acc + (item.quality_score || 0),
            0
          ) /
            qualityScores.length) *
            10
        ) / 10
      : 0;

    // Kalite dağılımı
    const qualityDistribution =
      qualityScores?.reduce(
        (acc, item) => {
          const score = item.quality_score || 0;
          const range = Math.floor(score / 2) * 2; // 0-2, 2-4, 4-6, 6-8, 8-10
          acc[`${range}-${range + 2}`] =
            (acc[`${range}-${range + 2}`] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ) || {};

    // Son aktiviteler (onaylar, redler, tamamlamalar)
    const { data: recentActivities, error: activitiesError } = await supabase
      .from('task_completions')
      .select(
        `
        id,
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
        ),
        company_users!inner(
          id,
          name,
          email
        )
      `
      )
      .gte('completion_date', startDate.toISOString())
      .order('completion_date', { ascending: false })
      .limit(20);

    if (activitiesError) {
      // Recent activities error
    }

    const formattedActivities =
      recentActivities?.map(activity => ({
        id: activity.id,
        type:
          activity.status === 'approved'
            ? 'completed'
            : activity.status === 'rejected'
              ? 'rejected'
              : 'pending',
        taskTitle: activity.tasks.title,
        projectName: activity.tasks.projects.name,
        companyName: activity.tasks.projects.companies.name,
        completedBy: activity.company_users.name,
        completionDate: activity.completion_date,
        approvedAt: activity.approved_at,
        actualHours: activity.actual_hours,
        qualityScore: activity.quality_score,
        status: activity.status,
      })) || [];

    // Proje ilerleme trend analizi
    const projectTrends =
      projects?.map(project => {
        const createdAt = new Date(project.created_at);
        const daysSinceCreation = Math.floor(
          (endDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          id: project.id,
          name: project.name,
          status: project.status,
          progress: project.progress_percentage || 0,
          daysSinceCreation,
          company: {
            id: project.companies.id,
            name: project.companies.name,
            city: project.companies.city,
            industry: project.companies.industry,
          },
          startDate: project.start_date,
          endDate: project.end_date,
          createdAt: project.created_at,
        };
      }) || [];

    const response = {
      success: true,
      data: {
        overview: {
          totalProjects: statsResults[0]?.count || 0,
          activeProjects: statsResults[1]?.count || 0,
          completedProjects: statsResults[2]?.count || 0,
          totalTasks: statsResults[3]?.count || 0,
          completedTasks: statsResults[4]?.count || 0,
          pendingApprovals: statsResults[5]?.count || 0,
          totalCompanies: statsResults[6]?.count || 0,
          activeCompanies: statsResults[7]?.count || 0,
          totalUsers: statsResults[8]?.count || 0,
          averageQualityScore: avgQualityScore,
        },
        projectTrends,
        companyPerformance: companyStats,
        taskStatusDistribution: {
          pending: taskStatusStats.pending || 0,
          in_progress: taskStatusStats.in_progress || 0,
          completed: taskStatusStats.completed || 0,
          cancelled: taskStatusStats.cancelled || 0,
        },
        monthlyProgress: monthlyProgress.map(item => ({
          month: item.month,
          total: item.total,
          completed: item.completed,
          completionRate:
            item.total > 0
              ? Math.round((item.completed / item.total) * 100)
              : 0,
        })),
        qualityDistribution,
        recentActivities: formattedActivities,
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
