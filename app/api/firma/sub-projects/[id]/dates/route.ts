import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/firma/sub-projects/[id]/dates
 * Firma için alt proje tarihlerini getir
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id: subProjectId } = await params;

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

    // Alt proje tarihlerini getir
    const { data: subProjectDates, error: subProjectDatesError } =
      await supabase
        .from('sub_project_company_dates')
        .select(
          `
        id,
        sub_project_id,
        company_id,
        start_date,
        end_date,
        is_flexible,
        created_at,
        updated_at
      `
        )
        .eq('sub_project_id', subProjectId)
        .eq('company_id', companyUser.company_id)
        .order('created_at', { ascending: false });

    if (subProjectDatesError) {
      return NextResponse.json(
        { error: 'Failed to fetch sub-project dates' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: subProjectDates,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
