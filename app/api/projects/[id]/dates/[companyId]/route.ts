import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

// GET /api/projects/[id]/dates/[companyId] - Get existing dates for a company
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; companyId: string }> }
) {
  try {
    const { id, companyId } = await params;
    const supabase = createClient();

    // Authentication check
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (!userEmail || !userRole) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only admin, consultant, and company users can access
    if (
      ![
        'admin',
        'consultant',
        'master_admin',
        'firma_admin',
        'firma_kullanıcı',
      ].includes(userRole)
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if company is assigned to project (old system)
    const isAssigned = project.company_id === companyId;

    // Get sub-projects with their dates
    const { data: subProjects, error: subProjectsError } = await supabase
      .from('sub_projects')
      .select(
        `
        id,
        name,
        start_date,
        end_date,
        tasks (
          id,
          title,
          due_date
        )
      `
      )
      .eq('project_id', id);

    if (subProjectsError) {
      return NextResponse.json(
        { error: 'Failed to fetch sub-projects' },
        { status: 500 }
      );
    }

    // Return existing dates
    const existingDates = {
      mainProject: {
        startDate: project.start_date
          ? new Date(project.start_date).toISOString().split('T')[0]
          : '',
        endDate: project.end_date
          ? new Date(project.end_date).toISOString().split('T')[0]
          : '',
      },
      subProjects:
        subProjects?.map(subProject => ({
          id: subProject.id,
          name: subProject.name,
          startDate: subProject.start_date
            ? new Date(subProject.start_date).toISOString().split('T')[0]
            : '',
          endDate: subProject.end_date
            ? new Date(subProject.end_date).toISOString().split('T')[0]
            : '',
          tasks:
            subProject.tasks?.map(task => ({
              id: task.id,
              title: task.title,
              dueDate: task.due_date
                ? new Date(task.due_date).toISOString().split('T')[0]
                : '',
            })) || [],
        })) || [],
      isAssigned,
    };

    return NextResponse.json(existingDates);
  } catch (error) {
    console.error('Get existing dates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
