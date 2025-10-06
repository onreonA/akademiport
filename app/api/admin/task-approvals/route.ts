import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// GET /api/admin/task-approvals - Get tasks pending approval
export async function GET(request: NextRequest) {
  try {
    // SECURITY: Check authentication and authorization
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı kimlik doğrulaması gerekli' },
        { status: 401 }
      );
    }

    if (!['admin', 'danışman', 'master_admin'].includes(userRole || '')) {
      return NextResponse.json(
        { error: 'Admin erişimi gerekli' },
        { status: 403 }
      );
    }
    const supabase = createClient();

    // Get status filter from query params
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || 'pending_approval';

    // Validate status filter
    const validStatuses = ['pending_approval', 'completed', 'cancelled'];
    if (!validStatuses.includes(statusFilter)) {
      return NextResponse.json(
        { error: 'Geçersiz durum filtresi' },
        { status: 400 }
      );
    }

    // Get tasks that are completed by companies and pending approval
    // Use company_task_statuses to get tasks with "Onaya Gönderildi" status
    const { data: companyTaskStatuses, error: statusError } = await supabase
      .from('company_task_statuses')
      .select(
        `
        task_id,
        company_id,
        status,
        completed_at,
        completion_note,
        completed_by,
        companies!inner(
          id,
          name
        ),
        company_users!inner(
          id,
          name,
          email
        ),
        tasks!inner(
          id,
          title,
          description,
          priority,
          notes,
          created_at,
          assigned_to,
          sub_projects(
            id,
            name,
            project_id,
            projects(
              id,
              name
            )
          )
        )
      `
      )
      .eq(
        'status',
        statusFilter === 'pending_approval' ? 'Onaya Gönderildi' : 'Tamamlandı'
      )
      .order('completed_at', { ascending: false });
    if (statusError) {
      console.error('Database error:', statusError);
      return NextResponse.json(
        { error: 'Failed to fetch tasks', details: statusError.message },
        { status: 500 }
      );
    }
    // Transform the data to match the expected format
    const transformedTasks = (companyTaskStatuses || []).map(
      companyTaskStatus => {
        const task = companyTaskStatus.tasks;
        const subProject = task.sub_projects as any;
        const project = subProject?.projects;
        const company = companyTaskStatus.companies;
        const completedByUser = companyTaskStatus.company_users;

        return {
          id: task.id,
          title: task.title,
          description: task.description,
          status: companyTaskStatus.status, // Use status from company_task_statuses
          priority: task.priority || 'medium',
          company_name: company?.name || 'Firma Bulunamadı',
          company_id: companyTaskStatus.company_id,
          project_name: project?.name || 'Proje Bulunamadı',
          sub_project_name: subProject?.name || 'Alt Proje Bulunamadı',
          assigned_to: task.assigned_to || 'Atanmamış',
          completed_by: completedByUser?.name || 'Bilinmiyor',
          completed_by_email: completedByUser?.email || '',
          created_at: task.created_at,
          completed_at: task.completed_at,
          notes: companyTaskStatus.completion_note,
          approval_notes: companyTaskStatus.approval_note,
        };
      }
    );
    return NextResponse.json({
      success: true,
      tasks: transformedTasks,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
