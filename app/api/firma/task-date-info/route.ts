import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/firma/task-date-info
 * Firma görev tarih bilgileri
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Firma kullanıcı kontrolü
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (
      !userEmail ||
      !['firma_admin', 'firma_kullanıcı'].includes(userRole || '')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Kullanıcının firma ID'sini al
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const companyId = user.company_id;

    // Şimdilik basit çözüm - boş array döndür
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
