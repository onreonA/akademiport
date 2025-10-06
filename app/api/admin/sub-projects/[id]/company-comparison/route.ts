import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/sub-projects/[id]/company-comparison
 * Alt proje için firma karşılaştırması verilerini getirir
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: subProjectId } = await params;
    const supabase = createClient();

    // Kullanıcı yetkisini kontrol et
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (!userEmail || !userRole) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!['admin', 'master_admin', 'danışman'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Alt proje bilgilerini getir
    const { data: subProject, error: subProjectError } = await supabase
      .from('sub_projects')
      .select(
        `
        id,
        name,
        description,
        status,
        start_date,
        end_date,
        projects!inner(
          id,
          name
        )
      `
      )
      .eq('id', subProjectId)
      .single();

    if (subProjectError) {
      return NextResponse.json(
        { error: 'Alt proje bulunamadı' },
        { status: 404 }
      );
    }

    // Alt projeye atanmış firmaları ve ilerlemelerini getir
    const { data: assignments, error: assignmentsError } = await supabase
      .from('sub_project_company_assignments')
      .select(
        `
        id,
        company_id,
        status,
        completion_status,
        companies!inner(
          id,
          name
        )
      `
      )
      .eq('sub_project_id', subProjectId);

    if (assignmentsError) {
      return NextResponse.json(
        { error: 'Firma atamaları bulunamadı' },
        { status: 404 }
      );
    }

    // Her firma için görev ilerlemelerini getir
    const comparisons = await Promise.all(
      assignments.map(async assignment => {
        // Alt projeye ait görevleri getir
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('id, title, status')
          .eq('sub_project_id', subProjectId);

        if (tasksError) {
          return null;
        }

        // Firma-spesifik görev ilerlemelerini getir
        const { data: progressData, error: progressError } = await supabase
          .from('task_company_progress')
          .select(
            `
            task_id,
            status,
            progress_percentage,
            started_at,
            completed_at,
            progress_notes
          `
          )
          .eq('company_id', assignment.company_id)
          .in(
            'task_id',
            tasks.map(task => task.id)
          );

        if (progressError) {
          return null;
        }

        // İstatistikleri hesapla
        const totalTasks = tasks.length;
        const completedTasks = progressData.filter(
          p => p.status === 'completed'
        ).length;
        const completionRate =
          totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Ortalama puanları hesapla (şimdilik varsayılan değerler)
        const avgQualityScore = 4.2;
        const avgTimelinessScore = 3.8;
        const avgCommunicationScore = 4.0;
        const overallRating =
          (avgQualityScore + avgTimelinessScore + avgCommunicationScore) / 3;

        // Başlangıç ve tamamlanma tarihleri
        const startedAt =
          progressData.length > 0
            ? progressData.find(p => p.started_at)?.started_at ||
              new Date().toISOString()
            : new Date().toISOString();

        const completedAt =
          completionRate === 100
            ? progressData.find(p => p.completed_at)?.completed_at || null
            : null;

        return {
          company_id: assignment.company_id,
          company_name: assignment.companies.name,
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          completion_rate: Math.round(completionRate),
          avg_quality_score: avgQualityScore,
          avg_timeliness_score: avgTimelinessScore,
          avg_communication_score: avgCommunicationScore,
          overall_rating: Math.round(overallRating * 10) / 10,
          started_at: startedAt,
          completed_at: completedAt,
          progress_notes:
            progressData
              .map(p => p.progress_notes)
              .filter(Boolean)
              .join('; ') || null,
        };
      })
    );

    // Null değerleri filtrele
    const validComparisons = comparisons.filter(Boolean);

    return NextResponse.json({
      subProject: {
        id: subProject.id,
        name: subProject.name,
        description: subProject.description,
        project_name: subProject.projects.name,
        status: subProject.status,
        start_date: subProject.start_date,
        end_date: subProject.end_date,
      },
      comparisons: validComparisons,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Karşılaştırma verileri yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}
