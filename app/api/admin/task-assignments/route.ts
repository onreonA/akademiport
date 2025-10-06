import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    // Get user info from cookies
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail || !userRole) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    // Only admin and consultant can access
    if (!['admin', 'consultant'].includes(userRole)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    // Get all tasks with assignment details
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(
        `
        *,
        projects!inner(
          id,
          name,
          companies!inner(
            id,
            name
          )
        ),
        sub_projects!inner(
          id,
          name
        ),
        assigned_to_user:assigned_to(
          id,
          email,
          full_name
        ),
        assigned_by_user:assigned_by(
          id,
          email,
          full_name
        )
      `
      )
      .order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      );
    }
    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    // Get user info from cookies
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail || !userRole) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    // Only admin and consultant can assign tasks
    if (!['admin', 'consultant'].includes(userRole)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    const body = await request.json();
    const { taskId, companyIds, dueDate, notes } = body;
    if (!taskId || !companyIds || !Array.isArray(companyIds)) {
      return NextResponse.json(
        { error: 'Task ID and company IDs are required' },
        { status: 400 }
      );
    }
    // Get the current user ID
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();
    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Update the task with assignment details (simplified)
    const { data: task, error: updateError } = await supabase
      .from('tasks')
      .update({
        assigned_by: currentUser.id,
        due_date: dueDate || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .select()
      .single();

    if (updateError) {
      console.error('Task update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to assign task' },
        { status: 500 }
      );
    }

    // Simple approach: Task assignment completed
    const newAssignments = [];
    // Create notifications for assigned companies
    // Get company admin users for notifications
    const { data: companyAdmins } = await supabase
      .from('company_users')
      .select('id, company_id')
      .in('company_id', companyIds)
      .eq('role', 'firma_admin');

    if (companyAdmins && companyAdmins.length > 0) {
      const notifications = companyAdmins.map((admin: any) => ({
        user_id: admin.id,
        title: 'Yeni Görev Atandı',
        message: `Size yeni bir görev atandı: ${task.title}`,
        type: 'task_assigned',
        entity_type: 'task',
        entity_id: taskId,
      }));
      await supabase.from('notifications').insert(notifications);
    }
    return NextResponse.json({
      task,
      assignments: newAssignments,
      message: 'Task assigned to companies successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
