import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

// GET: Get sub-project assignments with status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();

    // Get current user
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (
      !userEmail ||
      !['admin', 'master_admin', 'danışman'].includes(userRole || '')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get sub-project assignments with company details
    const { data: assignments, error: assignmentsError } = await supabase
      .from('sub_project_company_assignments')
      .select(
        `
        id,
        company_id,
        status,
        assigned_at,
        assigned_by,
        companies (
          id,
          name,
          email,
          city,
          industry
        )
      `
      )
      .eq('sub_project_id', id)
      .order('assigned_at', { ascending: false });

    if (assignmentsError) {
      return NextResponse.json(
        { error: 'Failed to fetch assignments' },
        { status: 500 }
      );
    }

    // Get sub-project details
    const { data: subProject, error: subProjectError } = await supabase
      .from('sub_projects')
      .select(
        `
        id,
        name,
        project_id,
        projects (
          id,
          name
        )
      `
      )
      .eq('id', id)
      .single();

    if (subProjectError) {
      return NextResponse.json(
        { error: 'Failed to fetch sub-project' },
        { status: 500 }
      );
    }

    // Get all companies for selection
    const { data: allCompanies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, email, city, industry')
      .order('name');

    if (companiesError) {
      return NextResponse.json(
        { error: 'Failed to fetch companies' },
        { status: 500 }
      );
    }

    // Format response
    const response = {
      assignments: assignments || [],
      allCompanies: allCompanies || [],
      subProject,
      projectId: subProject?.project_id,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Update sub-project assignments with auto-assignment logic
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const body = await request.json();

    // Get current user
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (
      !userEmail ||
      !['admin', 'master_admin', 'danışman'].includes(userRole || '')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assignments, autoAssignParent = true } = body; // Array of { companyId, status }

    if (!assignments || !Array.isArray(assignments)) {
      return NextResponse.json(
        { error: 'Invalid assignments data' },
        { status: 400 }
      );
    }

    // Get current user ID for audit trail
    const { data: currentUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    // Get sub-project details
    const { data: subProject, error: subProjectError } = await supabase
      .from('sub_projects')
      .select('id, name, project_id, projects(id, name)')
      .eq('id', id)
      .single();

    if (subProjectError) {
      return NextResponse.json(
        { error: 'Sub-project not found' },
        { status: 404 }
      );
    }

    const results = [];
    const errors = [];
    const autoAssignments = [];

    for (const assignment of assignments) {
      try {
        const { companyId, status } = assignment;

        if (!companyId || !status) {
          errors.push({ companyId, error: 'Missing companyId or status' });
          continue;
        }

        // Check if sub-project assignment exists
        const { data: existingAssignment } = await supabase
          .from('sub_project_company_assignments')
          .select('id, status')
          .eq('sub_project_id', id)
          .eq('company_id', companyId)
          .single();

        if (existingAssignment) {
          // Update existing assignment
          const { data: updatedAssignment, error: updateError } = await supabase
            .from('sub_project_company_assignments')
            .update({
              status,
              assigned_by: currentUser?.id,
              assigned_at: new Date().toISOString(),
            })
            .eq('id', existingAssignment.id)
            .select()
            .single();

          if (updateError) {
            errors.push({ companyId, error: updateError.message });
          } else {
            results.push({
              companyId,
              action: 'updated',
              assignment: updatedAssignment,
            });
          }
        } else {
          // Create new assignment
          const { data: newAssignment, error: insertError } = await supabase
            .from('sub_project_company_assignments')
            .insert({
              sub_project_id: id,
              company_id: companyId,
              status,
              assigned_by: currentUser?.id,
              assigned_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (insertError) {
            errors.push({ companyId, error: insertError.message });
          } else {
            results.push({
              companyId,
              action: 'created',
              assignment: newAssignment,
            });
          }
        }

        // Auto-assign parent project if requested and status is 'active'
        if (autoAssignParent && status === 'active') {
          const { data: parentAssignment } = await supabase
            .from('project_company_assignments')
            .select('id, status')
            .eq('project_id', subProject.project_id)
            .eq('company_id', companyId)
            .single();

          if (!parentAssignment) {
            // Auto-assign parent project
            const { data: autoAssignedParent, error: autoAssignError } =
              await supabase
                .from('project_company_assignments')
                .insert({
                  project_id: subProject.project_id,
                  company_id: companyId,
                  status: 'active',
                  assigned_by: currentUser?.id,
                  assigned_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (!autoAssignError) {
              autoAssignments.push({
                type: 'parent_project',
                companyId,
                projectId: subProject.project_id,
                assignment: autoAssignedParent,
              });
            }
          } else if (parentAssignment.status !== 'active') {
            // Update parent project status to active
            const { data: updatedParent, error: updateParentError } =
              await supabase
                .from('project_company_assignments')
                .update({
                  status: 'active',
                  assigned_by: currentUser?.id,
                  assigned_at: new Date().toISOString(),
                })
                .eq('id', parentAssignment.id)
                .select()
                .single();

            if (!updateParentError) {
              autoAssignments.push({
                type: 'parent_project_updated',
                companyId,
                projectId: subProject.project_id,
                assignment: updatedParent,
              });
            }
          }
        }
      } catch (error) {
        errors.push({
          companyId: assignment.companyId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      autoAssignments,
      errors,
      message: `Updated ${results.length} sub-project assignments${autoAssignments.length > 0 ? `, ${autoAssignments.length} auto-assignments` : ''}${errors.length > 0 ? `, ${errors.length} errors` : ''}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
