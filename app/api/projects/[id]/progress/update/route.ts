import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
// Görev tamamlandığında otomatik ilerleme güncelleme
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { companyId, taskId, subProjectId } = await request.json();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
        'https://frylotuwbjhqybcxvvzs.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWxvdHV3YmpocXliY3h2dnpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3ODE4OCwiZXhwIjoyMDcxMjU0MTg4fQ.kvHMECvHePaa07whhElHb11tFArkv85UwAGNPZ3qGNY'
    );
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    const userCompanyId = request.cookies.get('auth-user-company-id')?.value;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }
    // Kullanıcı yetkisini kontrol et
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role, company_id')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Firma kullanıcıları sadece kendi firmalarının ilerlemesini güncelleyebilir
    if (['firma_admin', 'firma_kullanıcı'].includes(userRole || '')) {
      if (userCompanyId !== companyId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }
    // Proje atamasının var olduğunu kontrol et
    const { data: assignment, error: assignmentError } = await supabase
      .from('project_assignments')
      .select('id, status')
      .eq('project_id', projectId)
      .eq('company_id', companyId)
      .eq('status', 'active')
      .single();
    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Project assignment not found' },
        { status: 404 }
      );
    }
    // Görev sayılarını hesapla
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, status')
      .eq('project_id', projectId);
    if (tasksError) {
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      );
    }
    const totalTasks = tasks?.length || 0;
    const completedTasks =
      tasks?.filter(task => task.status === 'completed').length || 0;
    // Alt proje sayılarını hesapla
    const { data: subProjects, error: subProjectsError } = await supabase
      .from('sub_projects')
      .select('id, status')
      .eq('project_id', projectId);
    if (subProjectsError) {
      return NextResponse.json(
        { error: 'Failed to fetch sub-projects' },
        { status: 500 }
      );
    }
    const totalSubProjects = subProjects?.length || 0;
    const completedSubProjects =
      subProjects?.filter(subProject => subProject.status === 'completed')
        .length || 0;
    // İlerleme yüzdesini hesapla
    const progressPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    // Ana proje ilerlemesini güncelle
    const { data: updatedProgress, error: updateError } = await supabase
      .from('company_project_progress')
      .update({
        progress_percentage: progressPercentage,
        completed_tasks: completedTasks,
        total_tasks: totalTasks,
        completed_sub_projects: completedSubProjects,
        total_sub_projects: totalSubProjects,
        last_updated: new Date().toISOString(),
        last_activity: new Date().toISOString(),
      })
      .eq('project_id', projectId)
      .eq('company_id', companyId)
      .select()
      .single();
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update progress' },
        { status: 500 }
      );
    }
    // Alt proje ilerlemesini de güncelle (eğer subProjectId varsa)
    if (subProjectId) {
      const { data: subProjectTasks, error: subProjectTasksError } =
        await supabase
          .from('tasks')
          .select('id, status')
          .eq('sub_project_id', subProjectId);
      if (!subProjectTasksError && subProjectTasks) {
        const subProjectTotalTasks = subProjectTasks.length;
        const subProjectCompletedTasks = subProjectTasks.filter(
          task => task.status === 'completed'
        ).length;
        const subProjectProgressPercentage =
          subProjectTotalTasks > 0
            ? Math.round(
                (subProjectCompletedTasks / subProjectTotalTasks) * 100
              )
            : 0;
        await supabase
          .from('company_sub_project_progress')
          .update({
            progress_percentage: subProjectProgressPercentage,
            completed_tasks: subProjectCompletedTasks,
            total_tasks: subProjectTotalTasks,
            last_updated: new Date().toISOString(),
            last_activity: new Date().toISOString(),
          })
          .eq('sub_project_id', subProjectId)
          .eq('company_id', companyId);
      }
    }
    return NextResponse.json({
      success: true,
      progress: updatedProgress,
      message: 'İlerleme otomatik olarak güncellendi',
      stats: {
        completedTasks,
        totalTasks,
        completedSubProjects,
        totalSubProjects,
        progressPercentage,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
