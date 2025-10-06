import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/progress/dashboard
 * Genel ilerleme dashboard verilerini getirme
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

    // Query parameters
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30'; // 7, 30, 90, 365 gün
    const projectId = searchParams.get('projectId') || '';
    const companyId = searchParams.get('companyId') || '';

    // Tarih aralığını hesapla
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(timeRange));

    // Temel istatistikler
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
    ];

    const statsResults = await Promise.all(statsPromises);

    // Proje ilerlemesi verileri
    const { data: projectProgress, error: progressError } = await supabase
      .from('projects')
      .select(
        `
        id,
        name,
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
      `
      )
      .order('created_at', { ascending: false })
      .limit(10);

    if (progressError) {
      // Project progress error
    }

    // Görev durumu dağılımı
    const { data: taskStatusDistribution, error: taskStatusError } =
      await supabase
        .from('tasks')
        .select('status')
        .gte('created_at', startDate.toISOString());

    if (taskStatusError) {
      // Task status distribution error
    }

    // Görev durumu istatistikleri
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
            completed: count || 0,
          }))
      );
    }

    const monthlyProgress = await Promise.all(monthlyProgressPromises);

    // Firma performans verileri
    const { data: companyPerformance, error: companyPerfError } = await supabase
      .from('companies')
      .select(
        `
        id,
        name,
        city,
        industry,
        status,
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
      `
      )
      .eq('status', 'active')
      .limit(10);

    if (companyPerfError) {
      // Company performance error
    }

    // Firma performans hesaplama
    const companyStats =
      companyPerformance?.map(company => {
        const totalTasks = company.projects.reduce(
          (acc, project) => acc + project.tasks.length,
          0
        );
        const completedTasks = company.projects.reduce(
          (acc, project) =>
            acc +
            project.tasks.filter(task => task.status === 'completed').length,
          0
        );
        const avgProgress =
          company.projects.reduce(
            (acc, project) => acc + (project.progress_percentage || 0),
            0
          ) / (company.projects.length || 1);

        return {
          id: company.id,
          name: company.name,
          city: company.city,
          industry: company.industry,
          totalProjects: company.projects.length,
          totalTasks,
          completedTasks,
          completionRate:
            totalTasks > 0
              ? Math.round((completedTasks / totalTasks) * 100)
              : 0,
          averageProgress: Math.round(avgProgress),
          status: company.status,
        };
      }) || [];

    // Görev tamamlama süreleri
    const { data: taskDurations, error: durationError } = await supabase
      .from('task_completions')
      .select(
        `
        id,
        completion_date,
        actual_hours,
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
      .eq('status', 'approved')
      .gte('completion_date', startDate.toISOString())
      .order('completion_date', { ascending: false })
      .limit(50);

    if (durationError) {
      // Task duration error
    }

    // Kalite puanları
    const { data: qualityScores, error: qualityError } = await supabase
      .from('task_completions')
      .select('quality_score')
      .not('quality_score', 'is', null)
      .gte('approved_at', startDate.toISOString());

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
          averageQualityScore: avgQualityScore,
        },
        projectProgress:
          projectProgress?.map(project => ({
            id: project.id,
            name: project.name,
            status: project.status,
            progress: project.progress_percentage || 0,
            startDate: project.start_date,
            endDate: project.end_date,
            createdAt: project.created_at,
            company: {
              id: project.companies.id,
              name: project.companies.name,
              city: project.companies.city,
              industry: project.companies.industry,
            },
          })) || [],
        taskStatusDistribution: {
          pending: taskStatusStats.pending || 0,
          in_progress: taskStatusStats.in_progress || 0,
          completed: taskStatusStats.completed || 0,
          cancelled: taskStatusStats.cancelled || 0,
        },
        monthlyProgress: monthlyProgress.map(item => ({
          month: item.month,
          completed: item.completed,
        })),
        companyPerformance: companyStats,
        taskDurations:
          taskDurations?.map(task => ({
            id: task.id,
            title: task.tasks.title,
            priority: task.tasks.priority,
            completionDate: task.completion_date,
            actualHours: task.actual_hours,
            project: {
              id: task.tasks.projects.id,
              name: task.tasks.projects.name,
              company: {
                id: task.tasks.projects.companies.id,
                name: task.tasks.projects.companies.name,
              },
            },
          })) || [],
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
