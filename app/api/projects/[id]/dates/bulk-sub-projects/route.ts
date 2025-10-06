import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

// POST /api/projects/[id]/dates/bulk-sub-projects - Bulk sub-project date assignment
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

    // Get all sub-projects for this project
    const { data: subProjects, error: subProjectsError } = await supabase
      .from('sub_projects')
      .select('id, name')
      .eq('project_id', id);

    if (subProjectsError) {
      console.error('Sub-projects error:', subProjectsError);
      return NextResponse.json(
        { error: 'Failed to fetch sub-projects' },
        { status: 500 }
      );
    }

    if (!subProjects || subProjects.length === 0) {
      return NextResponse.json(
        { error: 'No sub-projects found for this project' },
        { status: 404 }
      );
    }

    // Save dates for all sub-projects
    const results = [];
    for (const subProject of subProjects) {
      const { error: subProjectDatesError } = await supabase
        .from('sub_project_company_dates')
        .upsert({
          sub_project_id: subProject.id,
          company_id: companyId,
          start_date: dates.startDate || null,
          end_date: dates.endDate || null,
          updated_at: new Date().toISOString(),
        });

      if (subProjectDatesError) {
        console.error('Sub-project dates error:', subProjectDatesError);
        return NextResponse.json(
          { error: `Failed to save dates for sub-project: ${subProject.name}` },
          { status: 500 }
        );
      }

      results.push(subProject.name);
    }

    return NextResponse.json({
      success: true,
      message: `Dates applied to ${results.length} sub-projects`,
      subProjects: results,
    });
  } catch (error) {
    console.error('Bulk sub-project date assignment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
