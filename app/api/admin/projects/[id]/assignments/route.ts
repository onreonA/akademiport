import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

// GET: Get project assignments with status
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

    // Get project assignments with company details
    const { data: assignments, error: assignmentsError } = await supabase
      .from('project_company_assignments')
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
      .eq('project_id', id)
      .order('assigned_at', { ascending: false });

    if (assignmentsError) {
      return NextResponse.json(
        { error: 'Failed to fetch assignments' },
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
      projectId: id,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Update project assignments
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

    const { assignments } = body; // Array of { companyId, status }

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

    // OPTIMIZED: Batch operations to avoid N+1 queries
    const results = [];
    const errors = [];
    const companyIds = assignments.map(a => a.companyId);
    const assignedAt = new Date().toISOString();

    // Get all existing assignments in one query
    const { data: existingAssignments, error: existingError } = await supabase
      .from('project_company_assignments')
      .select('id, company_id, status')
      .eq('project_id', id)
      .in('company_id', companyIds);

    if (existingError) {
      return NextResponse.json(
        { error: 'Failed to check existing assignments' },
        { status: 500 }
      );
    }

    // Create lookup map for existing assignments
    const existingMap = new Map();
    existingAssignments?.forEach(assignment => {
      existingMap.set(assignment.company_id, assignment);
    });

    // Separate updates and inserts
    const updates = [];
    const inserts = [];

    assignments.forEach(assignment => {
      const { companyId, status } = assignment;

      if (!companyId || !status) {
        errors.push({ companyId, error: 'Missing companyId or status' });
        return;
      }

      const existing = existingMap.get(companyId);
      if (existing) {
        updates.push({
          id: existing.id,
          companyId,
          status,
          assigned_by: currentUser?.id,
          assigned_at: assignedAt,
        });
      } else {
        inserts.push({
          project_id: id,
          company_id: companyId,
          status,
          assigned_by: currentUser?.id,
          assigned_at: assignedAt,
        });
      }
    });

    // Batch update existing assignments
    if (updates.length > 0) {
      for (const update of updates) {
        const { data: updatedAssignment, error: updateError } = await supabase
          .from('project_company_assignments')
          .update({
            status: update.status,
            assigned_by: update.assigned_by,
            assigned_at: update.assigned_at,
          })
          .eq('id', update.id)
          .select()
          .single();

        if (updateError) {
          errors.push({
            companyId: update.companyId,
            error: updateError.message,
          });
        } else {
          results.push({
            companyId: update.companyId,
            action: 'updated',
            assignment: updatedAssignment,
          });
        }
      }
    }

    // Batch insert new assignments
    if (inserts.length > 0) {
      const { data: newAssignments, error: insertError } = await supabase
        .from('project_company_assignments')
        .insert(inserts)
        .select();

      if (insertError) {
        // If batch insert fails, try individual inserts
        for (const insert of inserts) {
          const { data: newAssignment, error: individualError } = await supabase
            .from('project_company_assignments')
            .insert(insert)
            .select()
            .single();

          if (individualError) {
            errors.push({
              companyId: insert.company_id,
              error: individualError.message,
            });
          } else {
            results.push({
              companyId: insert.company_id,
              action: 'created',
              assignment: newAssignment,
            });
          }
        }
      } else {
        // Batch insert succeeded
        newAssignments?.forEach(assignment => {
          results.push({
            companyId: assignment.company_id,
            action: 'created',
            assignment,
          });
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      message: `Updated ${results.length} assignments${errors.length > 0 ? `, ${errors.length} errors` : ''}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
