import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { UpdateConsultantPermissionsRequest } from '@/types';
export const dynamic = 'force-dynamic';
// GET /api/consultants/[id]/permissions - Get consultant permissions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id: consultantId } = await params;
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
    // Get consultant permissions
    const { data: permissions, error: permissionsError } = await supabase
      .from('consultant_permissions')
      .select('*')
      .eq('consultant_id', consultantId)
      .order('module');
    if (permissionsError) {
      return NextResponse.json(
        { error: 'Failed to fetch permissions' },
        { status: 500 }
      );
    }
    return NextResponse.json({ permissions: permissions || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// PUT /api/consultants/[id]/permissions - Update consultant permissions
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id: consultantId } = await params;
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
    const body: UpdateConsultantPermissionsRequest = await request.json();
    const { permissions } = body;
    if (!permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'Permissions array is required' },
        { status: 400 }
      );
    }
    // Update permissions
    const { error: updateError } = await supabase
      .from('consultant_permissions')
      .upsert(
        permissions.map(permission => ({
          consultant_id: consultantId,
          module: permission.module,
          can_view: permission.can_view || false,
          can_create: permission.can_create || false,
          can_edit: permission.can_edit || false,
          can_delete: permission.can_delete || false,
          company_visibility: permission.company_visibility || 'assigned',
        })),
        { onConflict: 'consultant_id,module' }
      );
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update permissions' },
        { status: 500 }
      );
    }
    // Log the activity
    await supabase.from('consultant_activities').insert({
      consultant_id: consultantId,
      action: 'permissions_updated',
      entity_type: 'permissions',
      details: {
        updated_by: user.id,
        permissions_count: permissions.length,
        permissions: permissions,
      },
    });
    return NextResponse.json({
      message: 'Permissions updated successfully',
      permissions: permissions,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
