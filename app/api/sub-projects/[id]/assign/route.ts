import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

// POST /api/sub-projects/[id]/assign - Assign sub-project to companies
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Only admin and consultant can assign sub-projects
    if (!['admin', 'consultant', 'master_admin'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { companyIds, assignedBy } = body;

    if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
      return NextResponse.json(
        { error: 'Company IDs array is required' },
        { status: 400 }
      );
    }

    // Verify sub-project exists
    const { data: subProject, error: subProjectError } = await supabase
      .from('sub_projects')
      .select('id, project_id, name')
      .eq('id', id)
      .single();

    if (subProjectError || !subProject) {
      return NextResponse.json(
        { error: 'Sub-project not found' },
        { status: 404 }
      );
    }

    // Get user ID from email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found', details: userError?.message },
        { status: 404 }
      );
    }

    // Create assignments for each company (minimal fields only)
    const assignments = companyIds.map(companyId => ({
      sub_project_id: id,
      company_id: companyId,
    }));

    // Insert assignments
    const { data: insertedAssignments, error: assignmentError } = await supabase
      .from('sub_project_company_assignments')
      .insert(assignments)
      .select();

    if (assignmentError) {
      return NextResponse.json(
        {
          error: 'Failed to assign sub-project to companies',
          details: assignmentError.message,
        },
        { status: 500 }
      );
    }

    // Also assign the main project to companies (if not already assigned)
    const mainProjectAssignments = companyIds.map(companyId => ({
      project_id: subProject.project_id,
      company_id: companyId,
      assigned_by: user.id,
      assigned_at: new Date().toISOString(),
      status: 'active',
    }));

    // Check if main project is already assigned to these companies
    const { data: existingMainAssignments } = await supabase
      .from('project_company_assignments')
      .select('company_id')
      .eq('project_id', subProject.project_id)
      .in('company_id', companyIds);

    const existingCompanyIds =
      existingMainAssignments?.map(a => a.company_id) || [];
    const newMainProjectAssignments = mainProjectAssignments.filter(
      assignment => !existingCompanyIds.includes(assignment.company_id)
    );

    if (newMainProjectAssignments.length > 0) {
      const { error: mainProjectError } = await supabase
        .from('project_company_assignments')
        .insert(newMainProjectAssignments);

      if (mainProjectError) {
        //   'Error creating main project assignments:',
        //   mainProjectError
        // );
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sub-project assigned to companies successfully',
      subProjectId: id,
      projectId: subProject.project_id,
      assignedCompanies: companyIds,
      assignments: insertedAssignments,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
