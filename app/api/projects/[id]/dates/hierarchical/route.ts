import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

// POST /api/projects/[id]/dates/hierarchical - Hierarchical date distribution
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
    const { companyId, mainProjectDates, subProjectDates, taskDates } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
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

    const results = [];

    // Save main project dates
    if (mainProjectDates.startDate || mainProjectDates.endDate) {
      const { error: projectDatesError } = await supabase
        .from('project_company_dates')
        .upsert({
          project_id: id,
          company_id: companyId,
          start_date: mainProjectDates.startDate || null,
          end_date: mainProjectDates.endDate || null,
          updated_at: new Date().toISOString(),
        });

      if (projectDatesError) {
        console.error('Project dates error:', projectDatesError);
        return NextResponse.json(
          { error: 'Failed to save project dates' },
          { status: 500 }
        );
      }

      results.push('Main project dates saved');
    }

    // Hierarchical distribution: Calculate sub-project dates based on main project dates
    if (mainProjectDates.startDate && mainProjectDates.endDate) {
      const mainStart = new Date(mainProjectDates.startDate);
      const mainEnd = new Date(mainProjectDates.endDate);
      const duration = mainEnd.getTime() - mainStart.getTime();

      // Get all sub-projects
      const { data: subProjects, error: subProjectsError } = await supabase
        .from('sub_projects')
        .select('id, name, created_at')
        .eq('project_id', id)
        .order('created_at');

      if (subProjectsError) {
        console.error('Sub-projects error:', subProjectsError);
        return NextResponse.json(
          { error: 'Failed to fetch sub-projects' },
          { status: 500 }
        );
      }

      // Distribute dates evenly across sub-projects
      const subProjectCount = subProjects.length;
      if (subProjectCount > 0) {
        const subProjectDuration = duration / subProjectCount;

        for (let i = 0; i < subProjects.length; i++) {
          const subStart = new Date(
            mainStart.getTime() + i * subProjectDuration
          );
          const subEnd = new Date(
            mainStart.getTime() + (i + 1) * subProjectDuration
          );

          // Use provided dates if available, otherwise use calculated dates
          const finalStartDate =
            subProjectDates.startDate || subStart.toISOString().split('T')[0];
          const finalEndDate =
            subProjectDates.endDate || subEnd.toISOString().split('T')[0];

          const { error: subProjectDatesError } = await supabase
            .from('sub_project_company_dates')
            .upsert({
              sub_project_id: subProjects[i].id,
              company_id: companyId,
              start_date: finalStartDate,
              end_date: finalEndDate,
              updated_at: new Date().toISOString(),
            });

          if (subProjectDatesError) {
            console.error('Sub-project dates error:', subProjectDatesError);
            return NextResponse.json(
              { error: 'Failed to save sub-project dates' },
              { status: 500 }
            );
          }
        }

        results.push(
          `Sub-project dates distributed for ${subProjectCount} sub-projects`
        );
      }
    }

    // Hierarchical distribution: Calculate task dates based on sub-project dates
    const { data: subProjectDatesData } = await supabase
      .from('sub_project_company_dates')
      .select('sub_project_id, start_date, end_date')
      .eq('company_id', companyId)
      .in(
        'sub_project_id',
        (
          await supabase.from('sub_projects').select('id').eq('project_id', id)
        ).data?.map(sp => sp.id) || []
      );

    if (subProjectDatesData && subProjectDatesData.length > 0) {
      for (const subProjectDate of subProjectDatesData) {
        if (subProjectDate.start_date && subProjectDate.end_date) {
          const subStart = new Date(subProjectDate.start_date);
          const subEnd = new Date(subProjectDate.end_date);
          const subDuration = subEnd.getTime() - subStart.getTime();

          // Get tasks for this sub-project
          const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('id, title, created_at')
            .eq('sub_project_id', subProjectDate.sub_project_id)
            .order('created_at');

          if (tasksError) {
            console.error('Tasks error:', tasksError);
            continue; // Skip this sub-project if tasks can't be fetched
          }

          // Distribute dates evenly across tasks
          const taskCount = tasks.length;
          if (taskCount > 0) {
            const taskDuration = subDuration / taskCount;

            for (let i = 0; i < tasks.length; i++) {
              const taskStart = new Date(subStart.getTime() + i * taskDuration);
              const taskEnd = new Date(
                subStart.getTime() + (i + 1) * taskDuration
              );

              // Use provided dates if available, otherwise use calculated dates
              const finalStartDate =
                taskDates.startDate || taskStart.toISOString().split('T')[0];
              const finalEndDate =
                taskDates.endDate || taskEnd.toISOString().split('T')[0];

              const { error: taskDatesError } = await supabase
                .from('task_company_dates')
                .upsert({
                  task_id: tasks[i].id,
                  company_id: companyId,
                  start_date: finalStartDate,
                  end_date: finalEndDate,
                  updated_at: new Date().toISOString(),
                });

              if (taskDatesError) {
                console.error('Task dates error:', taskDatesError);
                return NextResponse.json(
                  { error: 'Failed to save task dates' },
                  { status: 500 }
                );
              }
            }

            results.push(
              `Task dates distributed for ${taskCount} tasks in sub-project`
            );
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Dates distributed hierarchically',
      results,
    });
  } catch (error) {
    console.error('Hierarchical date distribution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
