import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
// GET /api/consultants - Get all consultants with stats
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    // TEMPORARY: Allow access for testing (remove this in production)
    if (authError || !user) {
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Check if user is master_admin
    if (user) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email)
        .single();
      if (userError || userData?.role !== 'master_admin') {
        // return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    // Get consultants with profiles
    const { data: consultants, error: consultantsError } = await supabase
      .from('users')
      .select(
        `
        id,
        email,
        full_name,
        role,
        created_at,
        consultant_profiles (
          id,
          phone,
          specialization,
          experience_years,
          bio,
          hourly_rate,
          is_active,
          last_login_at
        )
      `
      )
      .eq('role', 'consultant')
      .order('created_at', { ascending: false });
    if (consultantsError) {
      return NextResponse.json(
        { error: 'Failed to fetch consultants' },
        { status: 500 }
      );
    }
    // Get assignments and reports separately to avoid relationship conflicts
    const consultantIds = consultants?.map(c => c.id) || [];
    const { data: assignments } = await supabase
      .from('consultant_assignments')
      .select('consultant_id, company_id, is_active')
      .in('consultant_id', consultantIds);
    const { data: reports } = await supabase
      .from('consultant_reports')
      .select('consultant_id, status')
      .in('consultant_id', consultantIds);
    // Combine the data
    const consultantsWithData =
      consultants?.map(consultant => ({
        ...consultant,
        consultant_assignments:
          assignments?.filter(a => a.consultant_id === consultant.id) || [],
        consultant_reports:
          reports?.filter(r => r.consultant_id === consultant.id) || [],
      })) || [];
    // Calculate stats
    const activeConsultants =
      consultantsWithData?.filter(
        c => c.consultant_profiles?.[0]?.is_active !== false
      ).length || 0;
    const totalAssignments =
      consultantsWithData?.reduce(
        (sum, c) => sum + (c.consultant_assignments?.length || 0),
        0
      ) || 0;
    const totalReports =
      consultantsWithData?.reduce(
        (sum, c) => sum + (c.consultant_reports?.length || 0),
        0
      ) || 0;
    // Get recent activities
    const { data: recentActivities } = await supabase
      .from('consultant_activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    const stats = {
      total_consultants: consultantsWithData?.length || 0,
      active_consultants: activeConsultants,
      total_assignments: totalAssignments,
      total_reports: totalReports,
      recent_activities: recentActivities || [],
    };
    return NextResponse.json({
      consultants: consultantsWithData || [],
      stats,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// POST /api/consultants - Create new consultant
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    // TEMPORARY: Allow access for testing (remove this in production)
    if (authError || !user) {
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Check if user is master_admin
    if (user) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email)
        .single();
      if (userError || userData?.role !== 'master_admin') {
        // return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    const body = await request.json();
    const {
      email,
      full_name,
      phone,
      specialization,
      experience_years,
      bio,
      hourly_rate,
      initial_permissions,
    } = body;
    if (!email || !full_name) {
      return NextResponse.json(
        { error: 'Email and full name are required' },
        { status: 400 }
      );
    }
    // Create auth user
    const { data: authData, error: authCreateError } =
      await supabase.auth.admin.createUser({
        email,
        password: 'tempPassword123!', // This should be changed on first login
        email_confirm: true,
        user_metadata: { full_name },
      });
    if (authCreateError) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }
    const userId = authData.user.id;
    // Create user record
    const { error: userCreateError } = await supabase.from('users').insert({
      id: userId,
      email,
      full_name,
      role: 'consultant',
    });
    if (userCreateError) {
      return NextResponse.json(
        { error: 'Failed to create user record' },
        { status: 500 }
      );
    }
    // Create consultant profile
    const { error: profileError } = await supabase
      .from('consultant_profiles')
      .insert({
        user_id: userId,
        phone,
        specialization,
        experience_years: experience_years || 0,
        bio,
        hourly_rate,
        is_active: true,
      });
    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to create consultant profile' },
        { status: 500 }
      );
    }
    // Create default permissions if provided
    if (initial_permissions && initial_permissions.length > 0) {
      const permissions = initial_permissions.map(permission => ({
        consultant_id: userId,
        module: permission.module,
        can_view: permission.can_view || false,
        can_create: permission.can_create || false,
        can_edit: permission.can_edit || false,
        can_delete: permission.can_delete || false,
        company_visibility: permission.company_visibility || 'assigned',
      }));
      const { error: permissionsError } = await supabase
        .from('consultant_permissions')
        .insert(permissions);
      if (permissionsError) {
        // Don't fail the entire operation for permissions
      }
    }
    return NextResponse.json({
      message: 'Consultant created successfully',
      consultant: {
        id: userId,
        email,
        full_name,
        role: 'consultant',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
