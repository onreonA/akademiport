import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/sub-projects/[id]/dates
 * Alt proje tarihlerini getir (admin için)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id: subProjectId } = await params;

    // Admin kontrolü
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (
      !userEmail ||
      !['admin', 'master_admin', 'danışman'].includes(userRole || '')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        updated_at,
        companies!inner(
          id,
          name,
          email
        )
      `
        )
        .eq('sub_project_id', subProjectId)
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

/**
 * POST /api/admin/sub-projects/[id]/dates
 * Alt proje tarihi ekle/güncelle (admin için)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id: subProjectId } = await params;

    // Admin kontrolü
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (
      !userEmail ||
      !['admin', 'master_admin', 'danışman'].includes(userRole || '')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { companyId, startDate, endDate, isFlexible = false } = body;

    if (!companyId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Company ID, start date, and end date are required' },
        { status: 400 }
      );
    }

    // Kullanıcı ID'sini al
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Önce mevcut kaydı kontrol et
    const { data: existingRecord } = await supabase
      .from('sub_project_company_dates')
      .select('id')
      .eq('sub_project_id', subProjectId)
      .eq('company_id', companyId)
      .single();

    let subProjectDate, upsertError;

    if (existingRecord) {
      // Mevcut kaydı güncelle
      const { data, error } = await supabase
        .from('sub_project_company_dates')
        .update({
          start_date: startDate,
          end_date: endDate,
          is_flexible: isFlexible,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingRecord.id)
        .select(
          `
          id,
          sub_project_id,
          company_id,
          start_date,
          end_date,
          is_flexible,
          companies!inner(
            id,
            name,
            email
          )
        `
        )
        .single();

      subProjectDate = data;
      upsertError = error;
    } else {
      // Yeni kayıt ekle
      const { data, error } = await supabase
        .from('sub_project_company_dates')
        .insert({
          sub_project_id: subProjectId,
          company_id: companyId,
          start_date: startDate,
          end_date: endDate,
          is_flexible: isFlexible,
          created_by: user.id,
          updated_by: user.id,
        })
        .select(
          `
          id,
          sub_project_id,
          company_id,
          start_date,
          end_date,
          is_flexible,
          companies!inner(
            id,
            name,
            email
          )
        `
        )
        .single();

      subProjectDate = data;
      upsertError = error;
    }

    if (upsertError) {
      return NextResponse.json(
        {
          error: 'Failed to save sub-project date',
          details: upsertError.message,
          code: upsertError.code,
          hint: upsertError.hint,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: subProjectDate,
      message: 'Sub-project date saved successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
