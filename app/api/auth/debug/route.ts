import { NextRequest, NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/server';

/**
 * Debug endpoint - Production'da kullanıcı kontrolü için
 * Sadece development ve test için kullanılmalı
 */
export async function GET(request: NextRequest) {
  // Security: Sadece development veya özel bir debug key ile erişilebilir
  const debugKey = request.nextUrl.searchParams.get('key');
  const allowedKey = process.env.DEBUG_KEY || 'debug-only-in-dev';

  if (debugKey !== allowedKey && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = request.nextUrl.searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter required' },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();

    // Company users tablosunda ara
    const { data: companyUser, error: companyError } = await supabase
      .from('company_users')
      .select('id, email, name, role, company_id, created_at')
      .eq('email', email)
      .single();

    // Users tablosunda ara
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('id, email, full_name, role, created_at')
      .eq('email', email)
      .single();

    return NextResponse.json({
      email,
      found: !!(companyUser || adminUser),
      companyUser: companyUser
        ? {
            id: companyUser.id,
            email: companyUser.email,
            name: companyUser.name,
            role: companyUser.role,
            company_id: companyUser.company_id,
          }
        : null,
      adminUser: adminUser
        ? {
            id: adminUser.id,
            email: adminUser.email,
            full_name: adminUser.full_name,
            role: adminUser.role,
          }
        : null,
      errors: {
        companyError: companyError?.message || null,
        adminError: adminError?.message || null,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasJwtSecret: !!process.env.JWT_SECRET,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
