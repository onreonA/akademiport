import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// POST /api/tasks/[id]/approve - Approve or reject task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Get user role
    const { data: userData } = await supabase
      .from('company_users')
      .select('role, company_id')
      .eq('email', user.email)
      .single();
    if (!userData || !['admin'].includes(userData.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { action, notes } = body; // action: 'approve' or 'reject'
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve or reject' },
        { status: 400 }
      );
    }
    // Get task info
    const { data: task } = await supabase
      .from('tasks')
      .select('*, projects!inner(company_id)')
      .eq('id', id)
      .single();
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    // Check permissions
    if (
      userData.role !== 'admin' &&
      task.projects.company_id !== userData.company_id
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    // Update task status
    const newStatus = action === 'approve' ? 'completed' : 'rejected';
    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update({
        status: newStatus,
        approved_by: user.email,
        approval_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 500 }
      );
    }
    // Create approval record
    const { error: approvalError } = await supabase
      .from('task_approvals')
      .insert({
        task_id: id,
        approver_id: user.email,
        status: action,
        notes,
      });
    if (approvalError) {
      // Don't fail the request, just log the error
    }
    // Update project progress if task was approved
    if (action === 'approve') {
      await updateProjectProgress(supabase, task.project_id);
    }
    return NextResponse.json({
      task: updatedTask,
      message: `Task ${action}d successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// Helper function to update project progress
async function updateProjectProgress(supabase: any, projectId: string) {
  try {
    // Get all tasks for the project
    const { data: tasks } = await supabase
      .from('tasks')
      .select('status')
      .eq('project_id', projectId);
    if (!tasks || tasks.length === 0) return;
    // Calculate progress
    const completedTasks = tasks.filter(
      task => task.status === 'completed'
    ).length;
    const progressPercentage = Math.round(
      (completedTasks / tasks.length) * 100
    );
    // Update project progress
    await supabase
      .from('projects')
      .update({
        progress_percentage: progressPercentage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);
  } catch (error) {}
}
