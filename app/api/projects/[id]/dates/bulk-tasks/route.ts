import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

// POST /api/projects/[id]/dates/bulk-tasks - Bulk task date assignment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Authentication check
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!['admin', 'master_admin', 'danışman'].includes(userRole || '')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { companyId, dates } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    if (!dates.startDate && !dates.endDate) {
      return NextResponse.json(
        { error: 'At least one date is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify company assignment exists
    const { data: assignment, error: assignmentError } = await supabase
      .from('project_company_assignments')
      .select('id')
      .eq('project_id', id)
      .eq('company_id', companyId)
      .eq('status', 'active')
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Company assignment not found or inactive' },
        { status: 404 }
      );
    }

    // Get all tasks for this project's sub-projects
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(
        `
        id, 
        title,
        sub_projects!inner(
          id,
          project_id
        )
      `
      )
      .eq('sub_projects.project_id', id);

    if (tasksError) {
      console.error('Tasks error:', tasksError);
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      );
    }

    if (!tasks || tasks.length === 0) {
      return NextResponse.json(
        { error: 'No tasks found for this project' },
        { status: 404 }
      );
    }

    // Save dates for all tasks
    const results = [];
    for (const task of tasks) {
      const { error: taskDatesError } = await supabase
        .from('task_company_dates')
        .upsert({
          task_id: task.id,
          company_id: companyId,
          start_date: dates.startDate || null,
          end_date: dates.endDate || null,
          updated_at: new Date().toISOString(),
        });

      if (taskDatesError) {
        console.error('Task dates error:', taskDatesError);
        return NextResponse.json(
          { error: `Failed to save dates for task: ${task.title}` },
          { status: 500 }
        );
      }

      results.push(task.title);
    }

    return NextResponse.json({
      success: true,
      message: `Dates applied to ${results.length} tasks`,
      tasks: results,
    });
  } catch (error) {
    console.error('Bulk task date assignment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
