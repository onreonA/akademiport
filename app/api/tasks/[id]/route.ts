import { NextRequest, NextResponse } from 'next/server';

import { createAdminClient, createClient } from '@/lib/supabase/server';

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();

    // Get user email from cookies (middleware sets this)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and master_admin can delete tasks
    if (!['admin', 'master_admin'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if task exists
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, sub_project_id')
      .eq('id', id)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // 🛡️ SILME KISITLAMASI: Firma atamaları ve işlem takibi kontrolü
    const [assignmentsResult, completionsResult, commentsResult, filesResult] =
      await Promise.all([
        // Firma atamaları kontrolü
        supabase
          .from('task_company_assignments')
          .select('id, company_id, status')
          .eq('task_id', id)
          .eq('status', 'active'),

        // Görev tamamlama kayıtları kontrolü
        supabase.from('task_completions').select('id').eq('task_id', id),

        // Görev yorumları kontrolü
        supabase.from('task_comments').select('id').eq('task_id', id),

        // Görev dosyaları kontrolü
        supabase.from('task_files').select('id').eq('task_id', id),
      ]);

    // Aktif firma atamaları varsa silme işlemini engelle
    if (assignmentsResult.data && assignmentsResult.data.length > 0) {
      const activeAssignments = assignmentsResult.data.filter(
        a => a.status === 'active'
      );
      if (activeAssignments.length > 0) {
        return NextResponse.json(
          {
            error:
              'Bu görev aktif firma atamalarına sahip olduğu için silinemez. Önce tüm firma atamalarını kaldırın.',
            details: {
              activeAssignments: activeAssignments.length,
              companies: activeAssignments.map(a => a.company_id),
            },
          },
          { status: 400 }
        );
      }
    }

    // İşlem geçmişi varsa silme işlemini engelle
    const hasActivity =
      (completionsResult.data && completionsResult.data.length > 0) ||
      (commentsResult.data && commentsResult.data.length > 0) ||
      (filesResult.data && filesResult.data.length > 0);

    if (hasActivity) {
      return NextResponse.json(
        {
          error:
            'Bu görev üzerinde firma aktiviteleri bulunduğu için silinemez. Görev tamamlama, yorum veya dosya yükleme işlemleri mevcut.',
          details: {
            completions: completionsResult.data?.length || 0,
            comments: commentsResult.data?.length || 0,
            files: filesResult.data?.length || 0,
          },
        },
        { status: 400 }
      );
    }

    // Delete task (cascade will handle related records)
    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete task' },
        { status: 500 }
      );
    }

    // Update sub-project task count
    if (task.sub_project_id) {
      const { data: currentTasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('sub_project_id', task.sub_project_id);

      await supabase
        .from('sub_projects')
        .update({
          task_count: currentTasks?.length || 0,
        })
        .eq('id', task.sub_project_id);
    }

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id] - Update task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    // Get user email from cookies (middleware sets this)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin, consultant and master_admin can update tasks
    if (!['admin', 'consultant', 'master_admin'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if task exists
    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', id)
      .single();

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update task
    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Task update error:', error);
      return NextResponse.json(
        { error: 'Failed to update task', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
