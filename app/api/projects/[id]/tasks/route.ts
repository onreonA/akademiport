import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// GET /api/projects/[id]/tasks - Get project tasks
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    // Get user email from cookies (middleware sets this)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    const userCompanyId = request.cookies.get('auth-user-company-id')?.value;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Check permissions - Admin users can access all projects
    if (!['admin', 'consultant', 'master_admin'].includes(userRole || '')) {
      // Firma kullanıcıları için proje yetkisi kontrolü
      if (userRole === 'user' && userCompanyId) {
        // Projenin bu firmaya ait olup olmadığını kontrol et
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('company_id')
          .eq('id', id)
          .single();
        if (projectError || !project) {
          return NextResponse.json(
            { error: 'Project not found' },
            { status: 404 }
          );
        }
        if (project.company_id !== userCompanyId) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }
    // Get tasks from sub_projects for this project
    const { data: subProjects, error: subProjectsError } = await supabase
      .from('sub_projects')
      .select('id')
      .eq('project_id', id);
    if (subProjectsError) {
      return NextResponse.json(
        { error: 'Failed to fetch sub-projects' },
        { status: 500 }
      );
    }
    const subProjectIds = subProjects?.map(sp => sp.id) || [];
    if (subProjectIds.length === 0) {
      return NextResponse.json({ tasks: [] });
    }
    // Get tasks for these sub-projects
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .in('sub_project_id', subProjectIds)
      .order('created_at', { ascending: false });
    if (tasksError) {
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      );
    }
    return NextResponse.json({ tasks: tasks || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// POST /api/projects/[id]/tasks - Create new task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      priority = 'Orta',
      startDate,
      endDate,
      sub_project_id,
    } = body;
    const supabase = createClient();
    // Get user email from cookies (middleware sets this)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Check permissions - Only admin and consultant can create tasks
    if (!['admin', 'consultant', 'master_admin'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    if (!title) {
      return NextResponse.json(
        { error: 'Task title is required' },
        { status: 400 }
      );
    }
    if (!sub_project_id) {
      return NextResponse.json(
        { error: 'Sub-project ID is required' },
        { status: 400 }
      );
    }
    // Create task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        sub_project_id: sub_project_id,
        title,
        description,
        priority,
        status: 'Bekliyor',
      })
      .select()
      .single();

    if (taskError) {
      return NextResponse.json(
        { error: 'Failed to create task', details: taskError },
        { status: 500 }
      );
    }
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
