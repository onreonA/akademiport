import { NextRequest, NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/server';

// POST /api/tasks/[id]/dates - Save dates for a specific task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;

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
    const { companyId, startDate, endDate } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS for admin operations
    const supabase = createAdminClient();

    // Verify task exists
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, sub_project_id, sub_projects(project_id)')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify company assignment exists (check multiple levels)
    let assignment = null;

    // Check task level assignment
    const { data: taskAssignment, error: taskAssignmentError } = await supabase
      .from('task_company_assignments')
      .select('id')
      .eq('task_id', taskId)
      .eq('company_id', companyId)
      .eq('status', 'active')
      .single();

    if (!taskAssignmentError && taskAssignment) {
      assignment = taskAssignment;
    } else {
      // Check sub-project level assignment
      const { data: subProjectAssignment, error: subProjectAssignmentError } =
        await supabase
          .from('sub_project_company_assignments')
          .select('id')
          .eq('sub_project_id', task.sub_project_id)
          .eq('company_id', companyId)
          .eq('status', 'active')
          .single();

      if (!subProjectAssignmentError && subProjectAssignment) {
        assignment = subProjectAssignment;
      } else {
        // Check project level assignment (old system)
        const projectId = (task.sub_projects as any)?.project_id;
        const { data: oldProject } = await supabase
          .from('projects')
          .select('company_id')
          .eq('id', projectId)
          .eq('company_id', companyId)
          .single();

        if (oldProject) {
          assignment = { id: 'old_system' };
        }
      }
    }

    if (!assignment) {
      return NextResponse.json(
        { error: 'Company assignment not found or inactive' },
        { status: 404 }
      );
    }

    // Save task dates
    const { data: taskDates, error: taskDatesError } = await supabase
      .from('task_company_dates')
      .upsert(
        {
          task_id: taskId,
          company_id: companyId,
          start_date: startDate || null,
          end_date: endDate || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'task_id,company_id',
        }
      )
      .select();

    if (taskDatesError) {
      console.error('Task dates error:', taskDatesError);
      return NextResponse.json(
        {
          error: 'Failed to save task dates: ' + taskDatesError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task dates saved successfully',
      data: taskDates,
    });
  } catch (error) {
    console.error('Task date saving error:', error);
    return NextResponse.json(
      {
        error:
          'Internal server error: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}

// GET /api/tasks/[id]/dates - Get dates for a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;

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

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS for admin operations
    const supabase = createAdminClient();

    // Get task dates
    const { data: taskDates } = await supabase
      .from('task_company_dates')
      .select(
        `
        *,
        task:tasks(*)
      `
      )
      .eq('task_id', taskId)
      .eq('company_id', companyId)
      .single();

    return NextResponse.json({
      success: true,
      dates: taskDates,
    });
  } catch (error) {
    console.error('Task date fetching error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
