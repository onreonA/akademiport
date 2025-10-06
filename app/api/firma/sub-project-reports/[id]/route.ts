import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/firma/sub-project-reports/[id]
 * Firma spesifik rapor detaylarını görüntüler
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;
    const supabase = createClient();

    // Kullanıcı yetkisini kontrol et
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    const userCompanyId = request.cookies.get('auth-user-company-id')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Firma kullanıcısı olmalı
    if (
      !['firma_admin', 'firma_kullanıcı'].includes(userRole || '') ||
      !userCompanyId
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Rapor detaylarını al - sadece kendi firmasının raporu
    const { data: report, error: reportError } = await supabase
      .from('sub_project_completion_reports')
      .select(
        `
        *,
        sub_projects (
          id,
          name,
          description,
          projects (
            id,
            name,
            description
          )
        ),
        users (
          id,
          full_name,
          email
        )
      `
      )
      .eq('id', reportId)
      .eq('company_id', userCompanyId)
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report not found or access denied' },
        { status: 404 }
      );
    }

    // Alt proje görevlerini al
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(
        `
        id,
        title,
        description,
        status,
        priority,
        deadline,
        completed_at,
        created_at
      `
      )
      .eq('sub_project_id', report.sub_project_id)
      .order('created_at', { ascending: true });

    if (tasksError) {
    }

    // Alt proje atama bilgisini al
    const { data: assignment, error: assignmentError } = await supabase
      .from('sub_project_company_assignments')
      .select('*')
      .eq('sub_project_id', report.sub_project_id)
      .eq('company_id', userCompanyId)
      .single();

    if (assignmentError) {
    }

    // Görev istatistiklerini hesapla
    const taskStats = {
      total: tasks?.length || 0,
      completed: tasks?.filter(t => t.status === 'Tamamlandı').length || 0,
      onTime: 0,
      delayed: 0,
      highPriority: tasks?.filter(t => t.priority === 'high').length || 0,
      mediumPriority: tasks?.filter(t => t.priority === 'medium').length || 0,
      lowPriority: tasks?.filter(t => t.priority === 'low').length || 0,
    };

    if (tasks) {
      tasks.forEach(task => {
        if (
          task.status === 'Tamamlandı' &&
          task.deadline &&
          task.completed_at
        ) {
          if (new Date(task.completed_at) <= new Date(task.deadline)) {
            taskStats.onTime++;
          } else {
            taskStats.delayed++;
          }
        }
      });
    }

    // Performans analizi
    const performanceAnalysis = {
      overallGrade: getGradeLetter(report.overall_rating),
      qualityGrade: getGradeLetter(report.quality_score),
      timelinessGrade: getGradeLetter(report.timeliness_score),
      communicationGrade: getGradeLetter(report.communication_score),
      averageScore:
        Math.round(
          (((report.overall_rating || 0) +
            (report.quality_score || 0) +
            (report.timeliness_score || 0) +
            (report.communication_score || 0)) /
            4) *
            10
        ) / 10,
      completionEfficiency:
        taskStats.total > 0
          ? Math.round((taskStats.onTime / taskStats.total) * 100)
          : 0,
      taskSuccessRate: report.task_completion_rate || 0,
    };

    const response = {
      id: report.id,
      subProject: {
        id: report.sub_projects?.id,
        name: report.sub_projects?.name,
        description: report.sub_projects?.description,
        project: {
          id: report.sub_projects?.projects?.id,
          name: report.sub_projects?.projects?.name,
          description: report.sub_projects?.projects?.description,
        },
      },
      consultant: {
        id: report.users?.id,
        name: report.users?.full_name,
        email: report.users?.email,
      },
      ratings: {
        overall: report.overall_rating,
        quality: report.quality_score,
        timeliness: report.timeliness_score,
        communication: report.communication_score,
      },
      feedback: {
        strengths: report.strengths,
        areasForImprovement: report.areas_for_improvement,
        recommendations: report.recommendations,
        generalFeedback: report.general_feedback,
      },
      statistics: {
        taskCompletionRate: report.task_completion_rate,
        totalTasks: report.total_tasks,
        completedTasks: report.completed_tasks,
        delayedTasks: report.delayed_tasks,
        calculatedStats: taskStats,
      },
      performanceAnalysis,
      assignment: assignment
        ? {
            id: assignment.id,
            status: assignment.status,
            completionStatus: assignment.completion_status,
            assignedAt: assignment.assigned_at,
            completedAt: assignment.completed_at,
          }
        : null,
      dates: {
        completionDate: report.completion_date,
        createdAt: report.created_at,
        updatedAt: report.updated_at,
      },
      tasks: tasks || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Yardımcı fonksiyon: Puan harfe çevirme
function getGradeLetter(score: number): string {
  if (!score || score < 1) return 'F';
  if (score >= 4.5) return 'A+';
  if (score >= 4.0) return 'A';
  if (score >= 3.5) return 'B+';
  if (score >= 3.0) return 'B';
  if (score >= 2.5) return 'C+';
  if (score >= 2.0) return 'C';
  if (score >= 1.5) return 'D+';
  return 'D';
}
