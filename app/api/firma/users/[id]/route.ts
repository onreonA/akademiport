import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = createClient();
    // Get user email from header
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı bilgisi bulunamadı' },
        { status: 401 }
      );
    }
    // Get company ID and check if user is admin
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('email', userEmail)
      .single();
    if (companyError || !companyData) {
      return NextResponse.json({ error: 'Firma bulunamadı' }, { status: 404 });
    }
    const companyId = companyData.id;
    // Check if current user is admin
    const { data: currentUser, error: currentUserError } = await supabase
      .from('company_users')
      .select('role')
      .eq('company_id', companyId)
      .eq('email', userEmail)
      .single();
    if (currentUserError || !currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }
    // Check if target user exists and belongs to the same company
    const { data: targetUser, error: targetError } = await supabase
      .from('company_users')
      .select('id, role')
      .eq('id', id)
      .eq('company_id', companyId)
      .single();
    if (targetError || !targetUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    // Prevent updating admin users
    if (targetUser.role === 'admin') {
      return NextResponse.json(
        { error: 'Admin kullanıcıları güncellenemez' },
        { status: 403 }
      );
    }
    // Get request body
    const body = await request.json();
    const { name, email, password, role, status, permissions } = body;
    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role && ['manager', 'operator'].includes(role)) updateData.role = role;
    if (status && ['active', 'inactive'].includes(status))
      updateData.status = status;
    // Hash password if provided
    if (password) {
      const saltRounds = 10;
      updateData.password_hash = await bcrypt.hash(password, saltRounds);
    }
    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('company_users')
      .update(updateData)
      .eq('id', id)
      .select('id')
      .single();
    if (updateError) {
      return NextResponse.json(
        { error: 'Kullanıcı güncellenemedi' },
        { status: 500 }
      );
    }
    // Update permissions if provided
    if (permissions && Array.isArray(permissions)) {
      // Delete existing permissions
      const { id } = await params;
      await supabase.from('user_permissions').delete().eq('user_id', id);
      // Insert new permissions
      const permissionData = permissions.map((perm: any) => ({
        user_id: id,
        module: perm.module,
        can_read: perm.can_read || false,
        can_create: perm.can_create || false,
        can_update: perm.can_update || false,
        can_delete: perm.can_delete || false,
      }));
      const { error: permError } = await supabase
        .from('user_permissions')
        .insert(permissionData);
      if (permError) {
        // Don't fail the request, just log the error
      }
    }
    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi',
      data: { id: updatedUser.id },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = createClient();
    // Get user email from header
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı bilgisi bulunamadı' },
        { status: 401 }
      );
    }
    // Get company ID and check if user is admin
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('email', userEmail)
      .single();
    if (companyError || !companyData) {
      return NextResponse.json({ error: 'Firma bulunamadı' }, { status: 404 });
    }
    const companyId = companyData.id;
    // Check if current user is admin
    const { data: currentUser, error: currentUserError } = await supabase
      .from('company_users')
      .select('role')
      .eq('company_id', companyId)
      .eq('email', userEmail)
      .single();
    if (currentUserError || !currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }
    // Check if target user exists and belongs to the same company
    const { data: targetUser, error: targetError } = await supabase
      .from('company_users')
      .select('id, role')
      .eq('id', id)
      .eq('company_id', companyId)
      .single();
    if (targetError || !targetUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    // Prevent deleting admin users
    if (targetUser.role === 'admin') {
      return NextResponse.json(
        { error: 'Admin kullanıcıları silinemez' },
        { status: 403 }
      );
    }
    // Delete user (permissions will be deleted automatically due to CASCADE)
    const { error: deleteError } = await supabase
      .from('company_users')
      .delete()
      .eq('id', id);
    if (deleteError) {
      return NextResponse.json(
        { error: 'Kullanıcı silinemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla silindi',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
