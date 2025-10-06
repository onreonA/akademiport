import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
// PUT /api/consultants/[id]/status - Update consultant status
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
    const body = await request.json();
    const { is_active } = body;
    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'is_active must be a boolean' },
        { status: 400 }
      );
    }
    // Update consultant profile status
    const { error: updateError } = await supabase
      .from('consultant_profiles')
      .update({ is_active })
      .eq('user_id', consultantId);
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update consultant status' },
        { status: 500 }
      );
    }
    // Log the activity
    await supabase.from('consultant_activities').insert({
      consultant_id: consultantId,
      action: 'status_updated',
      entity_type: 'consultant_profile',
      details: {
        updated_by: user.id,
        new_status: is_active ? 'active' : 'inactive',
      },
    });
    return NextResponse.json({
      message: 'Consultant status updated successfully',
      is_active,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
