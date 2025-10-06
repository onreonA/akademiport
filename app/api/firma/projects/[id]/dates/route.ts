import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/firma/projects/[id]/dates
 * Firma için proje tarihlerini getir
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id: projectId } = await params;

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

    // Proje tarihlerini getir
    const { data: projectDates, error: projectDatesError } = await supabase
      .from('project_company_dates')
      .select(
        `
        id,
        project_id,
        company_id,
        start_date,
        end_date,
        is_flexible,
        created_at,
        updated_at
      `
      )
      .eq('project_id', projectId)
      .eq('company_id', companyUser.company_id)
      .order('created_at', { ascending: false });

    if (projectDatesError) {
      return NextResponse.json(
        { error: 'Failed to fetch project dates' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: projectDates,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
