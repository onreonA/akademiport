import { NextRequest, NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/server';

// POST /api/projects/[id]/dates - Save project dates for a company
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
    const {
      companyId,
      startDate,
      endDate,
      mainProjectDates,
      subProjectDates,
      taskDates,
    } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS for admin operations
    const supabase = createAdminClient();

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify company assignment exists (check both old and new systems)
    let assignment = null;

    // Check old system: projects.company_id
    const { data: oldProject } = await supabase
      .from('projects')
      .select('company_id')
      .eq('id', id)
      .eq('company_id', companyId)
      .single();

    if (oldProject) {
      assignment = { id: 'old_system' };
    } else {
      // Check new system: project_company_assignments
      const { data: newAssignment, error: assignmentError } = await supabase
        .from('project_company_assignments')
        .select('id')
        .eq('project_id', id)
        .eq('company_id', companyId)
        .eq('status', 'active')
        .single();

      if (!assignmentError && newAssignment) {
        assignment = newAssignment;
      }
    }

    if (!assignment) {
      return NextResponse.json(
        { error: 'Company assignment not found or inactive' },
        { status: 404 }
      );
    }

    const results = [];

    // Save main project dates if provided (support both formats)
    const projectStartDate = startDate || mainProjectDates?.startDate;
    const projectEndDate = endDate || mainProjectDates?.endDate;

    if (projectStartDate || projectEndDate) {
      const { data: projectDates, error: projectDatesError } = await supabase
        .from('project_company_dates')
        .upsert(
          {
            project_id: id,
            company_id: companyId,
            start_date: projectStartDate || null,
            end_date: projectEndDate || null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'project_id,company_id',
          }
        )
        .select();

      if (projectDatesError) {
        console.error('Project dates error:', projectDatesError);
        return NextResponse.json(
          {
            error: 'Failed to save project dates: ' + projectDatesError.message,
          },
          { status: 500 }
        );
      }

      results.push('Project dates saved');
    }

    // Save sub-project dates if provided (only for selected sub-projects)
    if (
      subProjectDates &&
      (subProjectDates.startDate || subProjectDates.endDate) &&
      subProjectDates.selectedSubProjectIds &&
      subProjectDates.selectedSubProjectIds.length > 0
    ) {
      // Save dates only for selected sub-projects
      for (const subProjectId of subProjectDates.selectedSubProjectIds) {
        const { error: subProjectDatesError } = await supabase
          .from('sub_project_company_dates')
          .upsert(
            {
              sub_project_id: subProjectId,
              company_id: companyId,
              start_date: subProjectDates.startDate || null,
              end_date: subProjectDates.endDate || null,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'sub_project_id,company_id',
            }
          );

        if (subProjectDatesError) {
          console.error('Sub-project dates error:', subProjectDatesError);
          return NextResponse.json(
            { error: 'Failed to save sub-project dates' },
            { status: 500 }
          );
        }
      }

      results.push(
        `Sub-project dates saved for ${subProjectDates.selectedSubProjectIds.length} selected sub-projects`
      );
    }

    // Save task dates if provided (only for selected tasks)
    if (
      taskDates &&
      (taskDates.startDate || taskDates.endDate) &&
      taskDates.selectedTaskIds &&
      taskDates.selectedTaskIds.length > 0
    ) {
      // Save dates only for selected tasks
      for (const taskId of taskDates.selectedTaskIds) {
        const { error: taskDatesError } = await supabase
          .from('task_company_dates')
          .upsert(
            {
              task_id: taskId,
              company_id: companyId,
              start_date: taskDates.startDate || null,
              end_date: taskDates.endDate || null,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'task_id,company_id',
            }
          );

        if (taskDatesError) {
          console.error('Task dates error:', taskDatesError);
          return NextResponse.json(
            { error: 'Failed to save task dates' },
            { status: 500 }
          );
        }
      }

      results.push(
        `Task dates saved for ${taskDates.selectedTaskIds.length} selected tasks`
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Dates saved successfully',
      results,
    });
  } catch (error) {
    console.error('Date saving error:', error);
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

// GET /api/projects/[id]/dates - Get project dates for a company
export async function GET(
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

    // Get project dates
    const { data: projectDates } = await supabase
      .from('project_company_dates')
      .select('*')
      .eq('project_id', id)
      .eq('company_id', companyId)
      .single();

    // Get sub-project dates
    const { data: subProjectDates } = await supabase
      .from('sub_project_company_dates')
      .select(
        `
        *,
        sub_project:sub_projects(*)
      `
      )
      .eq('company_id', companyId)
      .in(
        'sub_project_id',
        (
          await supabase.from('sub_projects').select('id').eq('project_id', id)
        ).data?.map(sp => sp.id) || []
      );

    // Get task dates
    const { data: taskDates } = await supabase
      .from('task_company_dates')
      .select(
        `
        *,
        task:tasks(*)
      `
      )
      .eq('company_id', companyId)
      .in(
        'task_id',
        (
          await supabase
            .from('tasks')
            .select('id')
            .in(
              'sub_project_id',
              (
                await supabase
                  .from('sub_projects')
                  .select('id')
                  .eq('project_id', id)
              ).data?.map(sp => sp.id) || []
            )
        ).data?.map(t => t.id) || []
      );

    return NextResponse.json({
      success: true,
      dates: {
        project: projectDates,
        subProjects: subProjectDates || [],
        tasks: taskDates || [],
      },
    });
  } catch (error) {
    console.error('Date fetching error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
