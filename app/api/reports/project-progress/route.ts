import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const timeRange = searchParams.get('timeRange') || '30'; // son 30 gün
    // Kullanıcı bilgilerini al
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }
    // Ana proje istatistikleri
    let projectQuery = supabase.from('projects').select(`
        id,
        name,
        description,
        status,
        progress,
        start_date,
        end_date,
        created_at,
        updated_at,
        sub_projects (
          id,
          name,
          status,
          progress,
          task_count,
          completed_tasks
        )
      `);
    if (projectId) {
      projectQuery = projectQuery.eq('id', projectId);
    }
    const { data: projects, error: projectsError } = await projectQuery;
    if (projectsError) {
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }
    // Görev istatistikleri
    const { data: taskStats, error: taskStatsError } = await supabase
      .from('tasks')
      .select(
        `
        id,
        status,
        priority,
        progress,
        created_at,
        updated_at,
        sub_project_id,
        sub_projects!inner (
          project_id
        )
      `
      )
      .gte(
        'created_at',
        new Date(
          Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000
        ).toISOString()
      );
    if (taskStatsError) {
    }
    // Firma istatistikleri
    const { data: companyStats, error: companyStatsError } =
      await supabase.from('company_projects').select(`
        id,
        company_id,
        project_id,
        assigned_date,
        progress,
        companies!inner (
          id,
          name
        ),
        projects!inner (
          id,
          name
        )
      `);
    if (companyStatsError) {
    }
    // Rapor verilerini hazırla
    const reportData = {
      summary: {
        totalProjects: projects?.length || 0,
        activeProjects: projects?.filter(p => p.status === 'Aktif').length || 0,
        completedProjects:
          projects?.filter(p => p.status === 'Tamamlandı').length || 0,
        overallProgress: projects?.length
          ? Math.round(
              projects.reduce((sum, p) => sum + (p.progress || 0), 0) /
                projects.length
            )
          : 0,
        totalSubProjects:
          projects?.reduce(
            (sum, p) => sum + (p.sub_projects?.length || 0),
            0
          ) || 0,
        totalTasks: taskStats?.length || 0,
        completedTasks:
          taskStats?.filter(t => t.status === 'Tamamlandı').length || 0,
        totalCompanies:
          new Set(companyStats?.map(cs => cs.company_id)).size || 0,
      },
      projects:
        projects?.map(project => ({
          id: project.id,
          name: project.name,
          status: project.status,
          progress: project.progress,
          startDate: project.start_date,
          endDate: project.end_date,
          subProjectCount: project.sub_projects?.length || 0,
          completedSubProjects:
            project.sub_projects?.filter(sp => sp.status === 'Tamamlandı')
              .length || 0,
          totalTasks:
            project.sub_projects?.reduce(
              (sum, sp) => sum + (sp.task_count || 0),
              0
            ) || 0,
          completedTasks:
            project.sub_projects?.reduce(
              (sum, sp) => sum + (sp.completed_tasks || 0),
              0
            ) || 0,
          subProjects: project.sub_projects?.map(sp => ({
            id: sp.id,
            name: sp.name,
            status: sp.status,
            progress: sp.progress,
            taskCount: sp.task_count,
            completedTasks: sp.completed_tasks,
          })),
        })) || [],
      taskStatistics: {
        byStatus: {
          Bekliyor: taskStats?.filter(t => t.status === 'Bekliyor').length || 0,
          'Devam Ediyor':
            taskStats?.filter(t => t.status === 'Devam Ediyor').length || 0,
          Tamamlandı:
            taskStats?.filter(t => t.status === 'Tamamlandı').length || 0,
          'İptal Edildi':
            taskStats?.filter(t => t.status === 'İptal Edildi').length || 0,
        },
        byPriority: {
          Düşük: taskStats?.filter(t => t.priority === 'Düşük').length || 0,
          Orta: taskStats?.filter(t => t.priority === 'Orta').length || 0,
          Yüksek: taskStats?.filter(t => t.priority === 'Yüksek').length || 0,
          Kritik: taskStats?.filter(t => t.priority === 'Kritik').length || 0,
        },
        averageProgress: taskStats?.length
          ? Math.round(
              taskStats.reduce((sum, t) => sum + (t.progress || 0), 0) /
                taskStats.length
            )
          : 0,
      },
      companyPerformance:
        companyStats?.reduce((acc, cs) => {
          const companyName = cs.companies?.[0]?.name || 'Bilinmeyen Firma';
          if (!acc[companyName]) {
            acc[companyName] = {
              totalProjects: 0,
              averageProgress: 0,
              projects: [],
            };
          }
          acc[companyName].totalProjects++;
          acc[companyName].projects.push({
            projectName: cs.projects?.[0]?.name || 'Bilinmeyen Proje',
            progress: cs.progress || 0,
            assignedDate: cs.assigned_date,
          });
          return acc;
        }, {} as any) || {},
      timeRange: parseInt(timeRange),
    };
    // Firma performans ortalamalarını hesapla
    Object.keys(reportData.companyPerformance).forEach(companyName => {
      const company = reportData.companyPerformance[companyName];
      company.averageProgress = company.projects.length
        ? Math.round(
            company.projects.reduce(
              (sum: number, p: any) => sum + p.progress,
              0
            ) / company.projects.length
          )
        : 0;
    });
    return NextResponse.json({
      success: true,
      data: reportData,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
