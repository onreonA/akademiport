import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth, createAuthErrorResponse } from '@/lib/jwt-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // JWT Authentication
    const user = await requireAuth(request);
    
    const supabase = createClient();
    const { id: taskId } = await params;
    const body = await request.json();
    const { completionNotes, files } = body;
    // Get the current user
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, company_id')
      .eq('email', user.email)
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
        sub_projects!inner(
          id,
          project_id,
          projects!inner(
            id,
            company_id
          )
        )
      `
      )
      .eq('id', taskId)
      .single();
    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    // Check if user has permission to complete this task
    const companyRoles = ['firma_admin', 'firma_kullanici'];
    if (
      companyRoles.includes(user.role) &&
      task.sub_projects.projects.company_id !== user.company_id
    ) {
      return createAuthErrorResponse('Access denied', 403);
    }
    // Update task status to completed
    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update({
        status: 'Tamamlandı',
        completed_at: new Date().toISOString(),
        notes: completionNotes || task.notes,
      })
      .eq('id', taskId)
      .select()
      .single();
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to complete task' },
        { status: 500 }
      );
    }
    // Create notification for admin/consultant
    const { data: admins, error: adminError } = await supabase
      .from('users')
      .select('id')
      .in('role', ['admin', 'consultant']);
    if (!adminError && admins) {
      const notifications = admins.map(admin => ({
        user_id: admin.id,
        title: 'Görev Tamamlandı',
        message: `${task.title} görevi tamamlandı ve onay bekliyor`,
        type: 'task_completed',
        entity_type: 'task',
        entity_id: taskId,
      }));
      await supabase.from('notifications').insert(notifications);
    }
    // Handle file uploads if any
    if (files && files.length > 0) {
      const fileRecords = files.map((file: any) => ({
        task_id: taskId,
        uploaded_by: currentUser.id,
        file_name: file.name,
        file_url: file.url,
        file_size: file.size,
        file_type: file.type,
        description: file.description || null,
      }));
      await supabase.from('task_files').insert(fileRecords);
    }
    return NextResponse.json({
      task: updatedTask,
      message: 'Task completed successfully and sent for approval',
    });
  } catch (error: any) {
    // Handle authentication errors specifically
    if (error.message === 'Authentication required') {
      return createAuthErrorResponse(error.message, 401);
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
