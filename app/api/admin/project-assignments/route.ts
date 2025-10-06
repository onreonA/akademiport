import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// GET - Get all project assignments
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    // Get user info from cookies
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail || !userRole) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    // Only admin and consultant can access
    if (!['admin', 'consultant'].includes(userRole)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    // Get all projects with their company assignments
    const { data: projects, error } = await supabase
      .from('projects')
      .select(
        `
        *,
        project_company_assignments!inner(
          id,
          company_id,
          status,
          assigned_at,
          assigned_by,
          companies!inner(
            id,
            name,
            email
          )
        )
      `
      )
      .order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch project assignments' },
        { status: 500 }
      );
    }
    return NextResponse.json({ projects });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// POST - Assign project to multiple companies
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    // Get user info from cookies
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail || !userRole) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    // Only admin and consultant can assign projects
    if (!['admin', 'consultant'].includes(userRole)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    const body = await request.json();
    const { projectId, companyIds } = body;
    if (!projectId || !companyIds || !Array.isArray(companyIds)) {
      return NextResponse.json(
        { error: 'Project ID and company IDs are required' },
        { status: 400 }
      );
    }
    // Get the current user ID (try both tables)
    let currentUser = null;
    let userError = null;

    // Try users table first
    const { data: adminUser, error: adminUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (adminUser && !adminUserError) {
      currentUser = adminUser;
    } else {
      // Try company_users table
      const { data: companyAdminUser, error: companyAdminUserError } =
        await supabase
          .from('company_users')
          .select('id')
          .eq('email', userEmail)
          .single();

      if (companyAdminUser && !companyAdminUserError) {
        currentUser = companyAdminUser;
      } else {
        userError = companyAdminUserError;
      }
    }

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Check for existing assignments first
    const { data: existingAssignments, error: checkError } = await supabase
      .from('project_company_assignments')
      .select('company_id')
      .eq('project_id', projectId)
      .in('company_id', companyIds);

    if (checkError) {
      return NextResponse.json(
        {
          error: 'Failed to check existing assignments',
          details: checkError.message,
        },
        { status: 500 }
      );
    }

    // Filter out already assigned companies
    const existingCompanyIds =
      existingAssignments?.map(a => a.company_id) || [];
    const newCompanyIds = companyIds.filter(
      id => !existingCompanyIds.includes(id)
    );

    if (newCompanyIds.length === 0) {
      return NextResponse.json(
        { error: 'All companies are already assigned to this project' },
        { status: 400 }
      );
    }

    // Create assignments for new companies only
    const assignments = newCompanyIds.map((companyId: string) => ({
      project_id: projectId,
      company_id: companyId,
      assigned_by: currentUser.id,
      assigned_at: new Date().toISOString(),
      status: 'active',
    }));
    const { data: newAssignments, error: assignmentError } = await supabase
      .from('project_company_assignments')
      .insert(assignments).select(`
        *,
        companies!inner(
          id,
          name,
          email
        )
      `);
    if (assignmentError) {
      return NextResponse.json(
        {
          error: 'Failed to assign project to companies',
          details: assignmentError.message,
        },
        { status: 500 }
      );
    }
    // Create notifications for newly assigned companies
    for (const companyId of newCompanyIds) {
      // Find company admin user
      const { data: companyAdmin, error: adminError } = await supabase
        .from('company_users')
        .select('id')
        .eq('company_id', companyId)
        .eq('role', 'firma_admin')
        .single();

      if (companyAdmin && !adminError) {
        await supabase.from('notifications').insert({
          user_id: companyAdmin.id,
          title: 'Yeni Proje Atandı',
          message: 'Size yeni bir proje atandı',
          type: 'project_assigned',
          entity_type: 'project',
          entity_id: projectId,
        });
      }
    }
    return NextResponse.json({
      assignments: newAssignments,
      message: 'Project assigned to companies successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
