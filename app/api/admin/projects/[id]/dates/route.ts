import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/projects/[id]/dates
 * Proje tarihlerini getir (admin için)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id: projectId } = await params;

    // Admin kontrolü
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (
      !userEmail ||
      !['admin', 'master_admin', 'danışman'].includes(userRole || '')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        updated_at,
        companies!inner(
          id,
          name,
          email
        )
      `
      )
      .eq('project_id', projectId)
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

/**
 * POST /api/admin/projects/[id]/dates
 * Proje tarihi ekle/güncelle (admin için)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id: projectId } = await params;

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

    // Tarih kaydını ekle/güncelle
    const { data: projectDate, error: upsertError } = await supabase
      .from('project_company_dates')
      .upsert({
        project_id: projectId,
        company_id: companyId,
        start_date: startDate,
        end_date: endDate,
        is_flexible: isFlexible,
        updated_by: user.id,
      })
      .select(
        `
        id,
        project_id,
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

    if (upsertError) {
      return NextResponse.json(
        { error: 'Failed to save project date', details: upsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: projectDate,
      message: 'Project date saved successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
