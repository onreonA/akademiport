import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/firma/tasks/[id]/dates
 * Firma için görev tarihlerini getir
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id: taskId } = await params;

    // Kullanıcı kimlik doğrulama
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Kullanıcı kimlik doğrulaması gerekli' },
        { status: 401 }
      );
    }

    // Firma kullanıcısı kontrolü
    const COMPANY_ROLES = [
      'user',
      'operator',
      'manager',
      'firma_admin',
      'firma_kullanıcı',
    ];
    if (!COMPANY_ROLES.includes(userRole || '')) {
      return NextResponse.json(
        { error: 'Bu işlem için firma kullanıcısı yetkisi gerekli' },
        { status: 403 }
      );
    }

    // Kullanıcının company_id'sini al
    const { data: companyUser, error: companyUserError } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('email', userEmail)
      .single();

    if (companyUserError || !companyUser) {
      return NextResponse.json(
        { error: 'Firma bilgisi bulunamadı' },
        { status: 404 }
      );
    }

    // Görev tarihlerini getir
    const { data: taskDates, error: taskDatesError } = await supabase
      .from('task_company_dates')
      .select(
        `
        id,
        task_id,
        company_id,
        start_date,
        end_date,
        is_flexible,
        created_at,
        updated_at
      `
      )
      .eq('task_id', taskId)
      .eq('company_id', companyUser.company_id)
      .order('created_at', { ascending: false });

    if (taskDatesError) {
      return NextResponse.json(
        { error: 'Failed to fetch task dates' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: taskDates,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
