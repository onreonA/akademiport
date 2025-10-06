import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// GET - Get all sub-project assignments
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
    // Get all sub-projects with their company assignments
    const { data: subProjects, error } = await supabase
      .from('sub_projects')
      .select(
        `
        *,
        sub_project_company_assignments!inner(
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
        ),
        projects!inner(
          id,
          name
        )
      `
      )
      .order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch sub-project assignments' },
        { status: 500 }
      );
    }
    return NextResponse.json({ subProjects });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// POST - Assign sub-project to multiple companies
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
    // Only admin and consultant can assign sub-projects
    if (!['admin', 'consultant'].includes(userRole)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    const body = await request.json();
    const { subProjectId, companyIds } = body;
    if (!subProjectId || !companyIds || !Array.isArray(companyIds)) {
      return NextResponse.json(
        { error: 'Sub-project ID and company IDs are required' },
        { status: 400 }
      );
    }
    // Get the current user ID
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();
    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Create assignments for each company
    const assignments = companyIds.map((companyId: string) => ({
      sub_project_id: subProjectId,
      company_id: companyId,
      assigned_by: currentUser.id,
      status: 'active',
    }));
    const { data: newAssignments, error: assignmentError } = await supabase
      .from('sub_project_company_assignments')
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
        { error: 'Failed to assign sub-project to companies' },
        { status: 500 }
      );
    }
    // Create notifications for assigned companies
    const notifications = companyIds.map((companyId: string) => ({
      user_id: companyId, // This will be the company admin
      title: 'Yeni Alt Proje Atandı',
      message: 'Size yeni bir alt proje atandı',
      type: 'sub_project_assigned',
      entity_type: 'sub_project',
      entity_id: subProjectId,
    }));
    await supabase.from('notifications').insert(notifications);
    return NextResponse.json({
      assignments: newAssignments,
      message: 'Sub-project assigned to companies successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
