/**
 * API Route: Sign In
 *
 * POST /api/auth/signin
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/database/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email ve şifre zorunludur' }, { status: 400 });
    }

    // Create Supabase client (this will handle cookies automatically)
    const supabase = await createClient();

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Email veya şifre hatalı' }, { status: 401 });
    }

    // Get user data from public.users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Check if user is active
    if (!userData.is_active) {
      return NextResponse.json(
        { error: 'Hesabınız aktif değil. Lütfen yönetici ile iletişime geçin.' },
        { status: 403 }
      );
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', authData.user.id);

    // Return user data
    return NextResponse.json({
      success: true,
      data: {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        role: userData.role,
        avatarUrl: userData.avatar_url,
        companyId: userData.company_id,
      },
      message: 'Giriş başarılı',
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json({ error: 'Giriş sırasında bir hata oluştu' }, { status: 500 });
  }
}
