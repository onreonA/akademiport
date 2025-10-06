import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// Alt proje görevlerini getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }
    // Kullanıcı bilgilerini al - hem users hem de company_users tablolarından ara
    let user = null;
    let userError = null;
    // Önce users tablosundan ara
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('id, role, company_id')
      .eq('email', userEmail)
      .single();
    if (adminUser) {
      user = adminUser;
    } else {
      // Users tablosunda bulunamadıysa company_users tablosundan ara
      const { data: companyUser, error: companyError } = await supabase
        .from('company_users')
        .select('id, role, company_id')
        .eq('email', userEmail)
        .single();
      if (companyUser) {
        user = companyUser;
      } else {
        userError = companyError;
      }
    }
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Görevleri getir
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(
        `
        id,
        title,
        description,
        status,
        priority,
        due_date,
        notes,
        created_at,
        updated_at,
        completed_at
      `
      )
      .eq('sub_project_id', id)
      .order('created_at', { ascending: false });
    if (tasksError) {
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      tasks: tasks || [],
      total: tasks?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// Yeni görev oluştur
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, priority, due_date, assigned_to } = body;
    const supabase = createClient();

    // Get user info from cookies
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    // Only admin and consultant can create tasks
    if (!['admin', 'consultant', 'master_admin'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    // Gerekli alanları kontrol et
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }
    // Görev oluştur
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        title,
        description,
        due_date: due_date || null,
        assigned_to: assigned_to || null,
        sub_project_id: id,
        status: 'pending',
      })
      .select()
      .single();
    if (taskError) {
      return NextResponse.json(
        { error: 'Failed to create task', details: taskError.message },
        { status: 500 }
      );
    }

    // Auto-assign task to companies assigned to this sub-project
    try {
      const { data: subProjectAssignments } = await supabase
        .from('sub_project_company_assignments')
        .select('company_id')
        .eq('sub_project_id', id)
        .eq('status', 'active');

      if (subProjectAssignments && subProjectAssignments.length > 0) {
        const taskAssignments = subProjectAssignments.map(assignment => ({
          task_id: task.id,
          company_id: assignment.company_id,
          assigned_by: user.id,
          assigned_at: new Date().toISOString(),
          status: 'active',
        }));

        const { error: assignmentError } = await supabase
          .from('task_company_assignments')
          .insert(taskAssignments);

        if (assignmentError) {
          // Don't fail the request, just log the error
        }
      }
    } catch (assignmentError) {
      // Don't fail the request, just log the error
    }
    // Alt proje task_count'unu güncelle - manuel hesaplama
    const { data: currentTasks, error: countError } = await supabase
      .from('tasks')
      .select('id')
      .eq('sub_project_id', id);
    if (!countError && currentTasks) {
      const { error: updateError } = await supabase
        .from('sub_projects')
        .update({
          task_count: currentTasks.length,
        })
        .eq('id', id);
      if (updateError) {
      }
    }
    return NextResponse.json({
      success: true,
      task,
      message: 'Görev başarıyla oluşturuldu',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
