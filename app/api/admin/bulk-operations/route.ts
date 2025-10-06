import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

// POST: Bulk operations for assignments
export async function POST(request: NextRequest) {
  try {
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

    const { operation, data } = body;

    if (!operation || !data) {
      return NextResponse.json(
        { error: 'Invalid operation data' },
        { status: 400 }
      );
    }

    // Get current user ID for audit trail
    const { data: currentUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    const results = [];
    const errors = [];

    switch (operation) {
      case 'assign_projects_to_companies':
        await handleProjectBulkAssignment(
          supabase,
          data,
          currentUser?.id,
          results,
          errors
        );
        break;

      case 'assign_sub_projects_to_companies':
        await handleSubProjectBulkAssignment(
          supabase,
          data,
          currentUser?.id,
          results,
          errors
        );
        break;

      case 'change_assignment_status':
        await handleStatusChange(
          supabase,
          data,
          currentUser?.id,
          results,
          errors
        );
        break;

      case 'generate_assignment_report':
        await handleGenerateReport(supabase, data, results, errors);
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown operation' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      operation,
      results,
      errors,
      summary: {
        total: results.length + errors.length,
        successful: results.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function for project bulk assignment
async function handleProjectBulkAssignment(
  supabase: any,
  data: any,
  userId: string,
  results: any[],
  errors: any[]
) {
  const { projectIds, companyIds, status = 'active' } = data;

  for (const projectId of projectIds) {
    for (const companyId of companyIds) {
      try {
        // Check if assignment exists
        const { data: existing } = await supabase
          .from('project_company_assignments')
          .select('id')
          .eq('project_id', projectId)
          .eq('company_id', companyId)
          .single();

        if (existing) {
          // Update existing
          const { data: updated, error } = await supabase
            .from('project_company_assignments')
            .update({
              status,
              assigned_by: userId,
              assigned_at: new Date().toISOString(),
            })
            .eq('id', existing.id)
            .select()
            .single();

          if (error) {
            errors.push({ projectId, companyId, error: error.message });
          } else {
            results.push({
              projectId,
              companyId,
              action: 'updated',
              assignment: updated,
            });
          }
        } else {
          // Create new
          const { data: created, error } = await supabase
            .from('project_company_assignments')
            .insert({
              project_id: projectId,
              company_id: companyId,
              status,
              assigned_by: userId,
              assigned_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) {
            errors.push({ projectId, companyId, error: error.message });
          } else {
            results.push({
              projectId,
              companyId,
              action: 'created',
              assignment: created,
            });
          }
        }
      } catch (error) {
        errors.push({
          projectId,
          companyId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }
}

// Helper function for sub-project bulk assignment
async function handleSubProjectBulkAssignment(
  supabase: any,
  data: any,
  userId: string,
  results: any[],
  errors: any[]
) {
  const {
    subProjectIds,
    companyIds,
    status = 'active',
    autoAssignParent = true,
  } = data;

  for (const subProjectId of subProjectIds) {
    // Get parent project ID
    const { data: subProject } = await supabase
      .from('sub_projects')
      .select('project_id')
      .eq('id', subProjectId)
      .single();

    for (const companyId of companyIds) {
      try {
        // Assign sub-project
        const { data: existing } = await supabase
          .from('sub_project_company_assignments')
          .select('id')
          .eq('sub_project_id', subProjectId)
          .eq('company_id', companyId)
          .single();

        let assignment;
        if (existing) {
          const { data: updated, error } = await supabase
            .from('sub_project_company_assignments')
            .update({
              status,
              assigned_by: userId,
              assigned_at: new Date().toISOString(),
            })
            .eq('id', existing.id)
            .select()
            .single();

          if (error) {
            errors.push({ subProjectId, companyId, error: error.message });
            continue;
          }
          assignment = updated;
        } else {
          const { data: created, error } = await supabase
            .from('sub_project_company_assignments')
            .insert({
              sub_project_id: subProjectId,
              company_id: companyId,
              status,
              assigned_by: userId,
              assigned_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) {
            errors.push({ subProjectId, companyId, error: error.message });
            continue;
          }
          assignment = created;
        }

        results.push({
          subProjectId,
          companyId,
          action: 'assigned',
          assignment,
        });

        // Auto-assign parent project if requested
        if (autoAssignParent && status === 'active' && subProject?.project_id) {
          const { data: parentExists } = await supabase
            .from('project_company_assignments')
            .select('id')
            .eq('project_id', subProject.project_id)
            .eq('company_id', companyId)
            .single();

          if (!parentExists) {
            const { data: parentAssigned, error: parentError } = await supabase
              .from('project_company_assignments')
              .insert({
                project_id: subProject.project_id,
                company_id: companyId,
                status: 'active',
                assigned_by: userId,
                assigned_at: new Date().toISOString(),
              })
              .select()
              .single();

            if (!parentError) {
              results.push({
                subProjectId,
                companyId,
                action: 'parent_auto_assigned',
                assignment: parentAssigned,
              });
            }
          }
        }
      } catch (error) {
        errors.push({
          subProjectId,
          companyId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }
}

// Helper function for status change
async function handleStatusChange(
  supabase: any,
  data: any,
  userId: string,
  results: any[],
  errors: any[]
) {
  const { assignments, newStatus } = data;

  for (const assignment of assignments) {
    try {
      const { type, id, companyId } = assignment;

      if (type === 'project') {
        const { data: updated, error } = await supabase
          .from('project_company_assignments')
          .update({
            status: newStatus,
            assigned_by: userId,
            assigned_at: new Date().toISOString(),
          })
          .eq('project_id', id)
          .eq('company_id', companyId)
          .select()
          .single();

        if (error) {
          errors.push({ type, id, companyId, error: error.message });
        } else {
          results.push({
            type,
            id,
            companyId,
            action: 'status_updated',
            assignment: updated,
          });
        }
      } else if (type === 'sub_project') {
        const { data: updated, error } = await supabase
          .from('sub_project_company_assignments')
          .update({
            status: newStatus,
            assigned_by: userId,
            assigned_at: new Date().toISOString(),
          })
          .eq('sub_project_id', id)
          .eq('company_id', companyId)
          .select()
          .single();

        if (error) {
          errors.push({ type, id, companyId, error: error.message });
        } else {
          results.push({
            type,
            id,
            companyId,
            action: 'status_updated',
            assignment: updated,
          });
        }
      }
    } catch (error) {
      errors.push({
        ...assignment,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

// Helper function for report generation
async function handleGenerateReport(
  supabase: any,
  data: any,
  results: any[],
  errors: any[]
) {
  const { type, filters = {} } = data;

  try {
    let reportData;

    if (type === 'assignment_summary') {
      // Get assignment summary
      const { data: assignments, error } = await supabase
        .from('assignment_status_summary')
        .select('*');

      if (error) {
        errors.push({ error: error.message });
        return;
      }

      // Group by status
      const summary = assignments.reduce((acc: any, assignment: any) => {
        if (!acc[assignment.status]) {
          acc[assignment.status] = 0;
        }
        acc[assignment.status]++;
        return acc;
      }, {});

      reportData = {
        type: 'assignment_summary',
        total: assignments.length,
        summary,
        assignments: assignments.slice(0, 100), // Limit for performance
      };
    } else if (type === 'company_projects') {
      // Get company project assignments
      const { data: assignments, error } = await supabase.from(
        'project_company_assignments'
      ).select(`
          *,
          projects (name, type, status),
          companies (name, industry, city)
        `);

      if (error) {
        errors.push({ error: error.message });
        return;
      }

      reportData = {
        type: 'company_projects',
        total: assignments.length,
        assignments,
      };
    }

    results.push({ action: 'report_generated', data: reportData });
  } catch (error) {
    errors.push({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
