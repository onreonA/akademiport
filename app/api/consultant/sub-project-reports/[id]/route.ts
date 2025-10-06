import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/consultant/sub-project-reports/[id]
 * Spesifik rapor detaylarını getirir
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

    // Rapor detaylarını al
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
            name
          )
        ),
        companies (
          id,
          name,
          email
        ),
        users (
          id,
          full_name,
          email
        )
      `
      )
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Yetki kontrolü
    const isAdmin = ['admin', 'master_admin', 'danışman'].includes(
      userRole || ''
    );
    const isCompanyUser = userCompanyId === report.company_id;

    if (!isAdmin && !isCompanyUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Alt proje görevlerini al
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(
        `
        id,
        title,
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

    // Görev istatistiklerini hesapla
    const taskStats = {
      total: tasks?.length || 0,
      completed: tasks?.filter(t => t.status === 'Tamamlandı').length || 0,
      onTime: 0,
      delayed: 0,
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

    const response = {
      id: report.id,
      subProject: {
        id: report.sub_projects?.id,
        name: report.sub_projects?.name,
        description: report.sub_projects?.description,
        projectName: report.sub_projects?.projects?.name,
        projectId: report.sub_projects?.projects?.id,
      },
      company: {
        id: report.companies?.id,
        name: report.companies?.name,
        email: report.companies?.email,
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

/**
 * PUT /api/consultant/sub-project-reports/[id]
 * Rapor güncelleme
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;
    const supabase = createClient();
    const body = await request.json();

    const {
      overallRating,
      qualityScore,
      timelinessScore,
      communicationScore,
      strengths,
      areasForImprovement,
      recommendations,
      generalFeedback,
    } = body;

    // Kullanıcı yetkisini kontrol et
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Sadece admin ve danışman rapor güncelleyebilir
    if (!['admin', 'master_admin', 'danışman'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Mevcut raporu kontrol et
    const { data: existingReport, error: reportError } = await supabase
      .from('sub_project_completion_reports')
      .select('id, consultant_id')
      .eq('id', reportId)
      .single();

    if (reportError || !existingReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Kullanıcı bilgisini al
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Sadece raporu oluşturan danışman veya admin güncelleyebilir
    if (userRole === 'danışman' && existingReport.consultant_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only update your own reports' },
        { status: 403 }
      );
    }

    // Raporu güncelle
    const { data: updatedReport, error: updateError } = await supabase
      .from('sub_project_completion_reports')
      .update({
        overall_rating: overallRating,
        quality_score: qualityScore,
        timeliness_score: timelinessScore,
        communication_score: communicationScore,
        strengths,
        areas_for_improvement: areasForImprovement,
        recommendations,
        general_feedback: generalFeedback,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update report' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      report: {
        id: updatedReport.id,
        updatedAt: updatedReport.updated_at,
      },
      message: 'Report updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/consultant/sub-project-reports/[id]
 * Rapor silme (sadece admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;
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

    // Sadece admin rapor silebilir
    if (!['admin', 'master_admin'].includes(userRole || '')) {
      return NextResponse.json(
        { error: 'Only admins can delete reports' },
        { status: 403 }
      );
    }

    // Raporu sil
    const { error: deleteError } = await supabase
      .from('sub_project_completion_reports')
      .delete()
      .eq('id', reportId);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete report' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
