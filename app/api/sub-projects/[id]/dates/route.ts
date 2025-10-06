import { NextRequest, NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/server';

// POST /api/sub-projects/[id]/dates - Save dates for a specific sub-project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: subProjectId } = await params;

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

    // Verify sub-project exists
    const { data: subProject, error: subProjectError } = await supabase
      .from('sub_projects')
      .select('id, project_id')
      .eq('id', subProjectId)
      .single();

    if (subProjectError || !subProject) {
      return NextResponse.json(
        { error: 'Sub-project not found' },
        { status: 404 }
      );
    }

    // Verify company assignment exists
    let assignment = null;

    // Check old system: projects.company_id
    const { data: oldProject } = await supabase
      .from('projects')
      .select('company_id')
      .eq('id', subProject.project_id)
      .eq('company_id', companyId)
      .single();

    if (oldProject) {
      assignment = { id: 'old_system' };
    } else {
      // Check new system: sub_project_company_assignments
      const { data: newAssignment, error: assignmentError } = await supabase
        .from('sub_project_company_assignments')
        .select('id')
        .eq('sub_project_id', subProjectId)
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

    // Save sub-project dates
    const { data: subProjectDates, error: subProjectDatesError } =
      await supabase
        .from('sub_project_company_dates')
        .upsert(
          {
            sub_project_id: subProjectId,
            company_id: companyId,
            start_date: startDate || null,
            end_date: endDate || null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'sub_project_id,company_id',
          }
        )
        .select();

    if (subProjectDatesError) {
      console.error('Sub-project dates error:', subProjectDatesError);
      return NextResponse.json(
        {
          error:
            'Failed to save sub-project dates: ' + subProjectDatesError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sub-project dates saved successfully',
      data: subProjectDates,
    });
  } catch (error) {
    console.error('Sub-project date saving error:', error);
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

// GET /api/sub-projects/[id]/dates - Get dates for a specific sub-project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: subProjectId } = await params;

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

    // Get sub-project dates
    const { data: subProjectDates } = await supabase
      .from('sub_project_company_dates')
      .select(
        `
        *,
        sub_project:sub_projects(*)
      `
      )
      .eq('sub_project_id', subProjectId)
      .eq('company_id', companyId)
      .single();

    return NextResponse.json({
      success: true,
      dates: subProjectDates,
    });
  } catch (error) {
    console.error('Sub-project date fetching error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
