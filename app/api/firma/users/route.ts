import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
export async function GET(request: NextRequest) {
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
    // Get company ID for the user
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('email', userEmail)
      .single();
    if (companyError || !companyData) {
      return NextResponse.json({ error: 'Firma bulunamadı' }, { status: 404 });
    }
    const companyId = companyData.id;
    // Get all users for this company
    const { data: users, error: usersError } = await supabase
      .from('company_users')
      .select(
        `
        id,
        email,
        name,
        role,
        status,
        created_at,
        last_login,
        user_permissions (
          id,
          module,
          can_read,
          can_create,
          can_update,
          can_delete
        )
      `
      )
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    if (usersError) {
      return NextResponse.json(
        { error: 'Kullanıcılar getirilemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: users || [],
      total: users?.length || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
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
    // Check user limit (max 2 sub-users per company)
    const { data: existingUsers, error: countError } = await supabase
      .from('company_users')
      .select('id')
      .eq('company_id', companyId)
      .neq('role', 'admin');
    if (countError) {
      return NextResponse.json(
        { error: 'Kullanıcı sayısı kontrol edilemedi' },
        { status: 500 }
      );
    }
    if (existingUsers && existingUsers.length >= 2) {
      return NextResponse.json(
        { error: 'Maksimum 2 alt kullanıcı ekleyebilirsiniz' },
        { status: 400 }
      );
    }
    // Get request body
    const body = await request.json();
    const { name, email, password, role, permissions } = body;
    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }
    // Validate role
    if (!['manager', 'operator'].includes(role)) {
      return NextResponse.json({ error: 'Geçersiz rol' }, { status: 400 });
    }
    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('company_users')
      .select('id')
      .eq('email', email)
      .single();
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('company_users')
      .insert({
        company_id: companyId,
        email,
        password_hash: passwordHash,
        name,
        role,
        status: 'active',
        created_by: currentUser.id,
      })
      .select('id')
      .single();
    if (createError) {
      return NextResponse.json(
        { error: 'Kullanıcı oluşturulamadı' },
        { status: 500 }
      );
    }
    // Create permissions for the new user
    if (permissions && Array.isArray(permissions)) {
      const permissionData = permissions.map((perm: any) => ({
        user_id: newUser.id,
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
      message: 'Kullanıcı başarıyla oluşturuldu',
      data: { id: newUser.id },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
