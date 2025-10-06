import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('users')
      .select(
        `
        *,
        consultant_profiles (*)
      `
      )
      .eq('id', id)
      .eq('role', 'consultant')
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data) {
      return NextResponse.json(
        { error: 'Consultant not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ consultant: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;
    const body = await request.json();
    const { email, full_name, role, phone, is_active, consultant_profiles } =
      body;
    // Update user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .update({
        email,
        full_name,
        role,
      })
      .eq('id', id)
      .select()
      .single();
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 400 });
    }
    // Update consultant profile
    const { data: profileData, error: profileError } = await supabase
      .from('consultant_profiles')
      .update({
        phone: phone || null,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', id)
      .select()
      .single();
    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }
    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: id,
      action: 'profile_updated',
      details: `Consultant profile updated: ${email}`,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    });
    return NextResponse.json({
      message: 'Consultant updated successfully',
      consultant: userData,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;
    // Get consultant email for logging
    const { data: consultant } = await supabase
      .from('users')
      .select('email')
      .eq('id', id)
      .single();
    // Delete consultant profile first
    await supabase.from('consultant_profiles').delete().eq('user_id', id);
    // Delete user
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: id,
      action: 'consultant_deleted',
      details: `Consultant deleted: ${consultant?.email || 'unknown'}`,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    });
    return NextResponse.json({ message: 'Consultant deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
