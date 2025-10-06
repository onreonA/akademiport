import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

// DELETE /api/sub-projects/[id] - Delete sub-project
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

    // Only admin and master_admin can delete sub-projects
    if (!['admin', 'master_admin'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if sub-project exists
    const { data: subProject, error: subProjectError } = await supabase
      .from('sub_projects')
      .select('id, project_id')
      .eq('id', id)
      .single();

    if (subProjectError || !subProject) {
      return NextResponse.json(
        { error: 'Sub-project not found' },
        { status: 404 }
      );
    }

    // 🛡️ SILME KISITLAMASI: Firma atamaları ve işlem takibi kontrolü
    const [assignmentsResult, tasksWithActivityResult] = await Promise.all([
      // Alt proje firma atamaları kontrolü
      supabase
        .from('sub_project_company_assignments')
        .select('id, company_id, status')
        .eq('sub_project_id', id)
        .eq('status', 'active'),

      // Alt proje görevlerinde firma aktivitesi kontrolü
      supabase
        .from('tasks')
        .select(
          `
          id,
          task_company_assignments!inner(id, status),
          task_completions(id),
          task_comments(id),
          task_files(id)
        `
        )
        .eq('sub_project_id', id),
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
              'Bu alt proje aktif firma atamalarına sahip olduğu için silinemez. Önce tüm firma atamalarını kaldırın.',
            details: {
              activeAssignments: activeAssignments.length,
              companies: activeAssignments.map(a => a.company_id),
            },
          },
          { status: 400 }
        );
      }
    }

    // Görevlerde firma aktivitesi varsa silme işlemini engelle
    if (
      tasksWithActivityResult.data &&
      tasksWithActivityResult.data.length > 0
    ) {
      const tasksWithActivity = tasksWithActivityResult.data.filter(
        task =>
          (task.task_company_assignments &&
            task.task_company_assignments.length > 0) ||
          (task.task_completions && task.task_completions.length > 0) ||
          (task.task_comments && task.task_comments.length > 0) ||
          (task.task_files && task.task_files.length > 0)
      );

      if (tasksWithActivity.length > 0) {
        return NextResponse.json(
          {
            error:
              'Bu alt proje görevlerinde firma aktiviteleri bulunduğu için silinemez. Görev atamaları, tamamlama, yorum veya dosya yükleme işlemleri mevcut.',
            details: {
              tasksWithActivity: tasksWithActivity.length,
              totalTasks: tasksWithActivityResult.data.length,
            },
          },
          { status: 400 }
        );
      }
    }

    // Delete sub-project (cascade will handle related tasks and assignments)
    const { error } = await supabase.from('sub_projects').delete().eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete sub-project' },
        { status: 500 }
      );
    }

    // Update project sub-project count
    if (subProject.project_id) {
      const { data: currentSubProjects } = await supabase
        .from('sub_projects')
        .select('id')
        .eq('project_id', subProject.project_id);

      await supabase
        .from('projects')
        .update({
          sub_project_count: currentSubProjects?.length || 0,
        })
        .eq('id', subProject.project_id);
    }

    return NextResponse.json({ message: 'Sub-project deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/sub-projects/[id] - Update sub-project
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createClient();

    // Get user email from cookies (middleware sets this)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin, consultant and master_admin can update sub-projects
    if (!['admin', 'consultant', 'master_admin'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if sub-project exists
    const { data: subProject } = await supabase
      .from('sub_projects')
      .select('id')
      .eq('id', id)
      .single();

    if (!subProject) {
      return NextResponse.json(
        { error: 'Sub-project not found' },
        { status: 404 }
      );
    }

    // Update sub-project
    const { data: updatedSubProject, error } = await supabase
      .from('sub_projects')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update sub-project' },
        { status: 500 }
      );
    }

    return NextResponse.json({ subProject: updatedSubProject });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
