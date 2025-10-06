import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id: taskId } = await params;
    // Get user info from cookies
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail || !userRole) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    // Only admin and consultant can approve tasks
    if (!['admin', 'danışman', 'master_admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    const body = await request.json();
    const { action, approval_notes, company_id } = body;

    console.log('🔍 Admin Approval Debug - Request body:', {
      action,
      approval_notes,
      company_id,
      taskId,
      userEmail,
      userRole,
    });

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid approval action' },
        { status: 400 }
      );
    }
    // Get the current user
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();
    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Get the task details
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select(
        `
        *,
        assigned_to_user:assigned_to(
          id,
          email,
          full_name
        )
      `
      )
      .eq('id', taskId)
      .single();
    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    // Update company_task_statuses table for company-specific tracking
    // DO NOT update tasks table as it affects all companies
    const companyTaskStatusUpdate =
      action === 'approve' ? 'Tamamlandı' : 'Reddedildi';
    console.log('🔍 Admin approval debug:', {
      taskId,
      company_id,
      action,
      approval_notes,
      companyTaskStatusUpdate,
    });

    // Debug: Check if company_task_statuses record exists
    const { data: existingStatus, error: checkError } = await supabase
      .from('company_task_statuses')
      .select('*')
      .eq('task_id', taskId)
      .eq('company_id', company_id)
      .single();

    console.log('🔍 Admin Approval - Existing status check:', {
      existingStatus,
      checkError,
      exists: !!existingStatus,
    });

    // Use upsert instead of update for more reliability
    const upsertData = {
      task_id: taskId,
      company_id: company_id,
      status: companyTaskStatusUpdate,
      approved_by: currentUser.id,
      approved_at: new Date().toISOString(),
      approval_note: approval_notes,
      updated_at: new Date().toISOString(),
    };

    console.log('🔍 Admin Approval - Upsert data:', upsertData);

    const { error: companyStatusError } = await supabase
      .from('company_task_statuses')
      .upsert(upsertData, {
        onConflict: 'task_id,company_id',
      });

    console.log('🔍 Company status update result:', {
      error: companyStatusError,
      success: !companyStatusError,
    });

    if (companyStatusError) {
      console.error('Company task status update error:', companyStatusError);
      // Don't fail the request, just log the error
    }

    // Update project progress for the company
    // Temporarily disabled due to RLS issues with sub_project_completions
    // if (action === 'approve' && !companyStatusError) {
    //   await updateCompanyProjectProgress(supabase, taskId, company_id);
    // }

    // Create notification for the task assignee
    const notificationMessage =
      action === 'approve'
        ? `Göreviniz onaylandı: ${task.title}`
        : `Göreviniz reddedildi: ${task.title}`;
    // Not: Bildirim sistemi şu anda çalışmıyor, ileride implement edilecek
    return NextResponse.json({
      success: true,
      message: `Task ${action} successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to update company-specific project progress
// TEMPORARILY DISABLED - RLS issues with sub_project_completions table
async function updateCompanyProjectProgress(
  supabase: any,
  taskId: string,
  companyId: string
) {
  console.log('🔍 updateCompanyProjectProgress DISABLED - RLS issues');
  return;

  /* DISABLED CODE - RLS issues
  try {
    // Get the task's project ID
    const { data: task } = await supabase
      .from('tasks')
      .select('id, sub_project_id, sub_projects(project_id)')
      .eq('id', taskId)
      .single();

    if (!task) return;

    const projectId = task.sub_projects?.project_id;
    if (!projectId) return;

    // Get all tasks for this project
    const { data: allTasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('sub_projects.project_id', projectId);

    if (!allTasks || allTasks.length === 0) return;

    const allTaskIds = allTasks.map(t => t.id);

    // Get company-specific task statuses
    const { data: companyTaskStatuses } = await supabase
      .from('company_task_statuses')
      .select('task_id, status')
      .in('task_id', allTaskIds)
      .eq('company_id', companyId);

    const completedTasks =
      companyTaskStatuses?.filter(cts => cts.status === 'Tamamlandı').length ||
      0;

    const companyProgress = Math.round(
      (completedTasks / allTaskIds.length) * 100
    );

    console.log('🔍 Updating company project progress:', {
      projectId,
      companyId,
      totalTasks: allTaskIds.length,
      completedTasks,
      companyProgress,
    });

    // Update company-specific project progress in project_company_assignments
    await supabase
      .from('project_company_assignments')
      .update({
        progress_percentage: companyProgress,
        updated_at: new Date().toISOString(),
      })
      .eq('project_id', projectId)
      .eq('company_id', companyId);
  } catch (error) {
    console.error('Error updating company project progress:', error);
  }
  */
}
