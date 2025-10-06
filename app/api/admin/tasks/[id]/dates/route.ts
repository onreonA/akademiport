import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/tasks/[id]/dates
 * Görev tarihlerini getir (admin için)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id: taskId } = await params;

    // Admin kontrolü
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (
      !userEmail ||
      !['admin', 'master_admin', 'danışman'].includes(userRole || '')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        updated_at,
        companies!inner(
          id,
          name,
          email
        )
      `
      )
      .eq('task_id', taskId)
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

/**
 * POST /api/admin/tasks/[id]/dates
 * Görev tarihi ekle/güncelle (admin için)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id: taskId } = await params;

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

    if (!companyId || !endDate) {
      return NextResponse.json(
        { error: 'Company ID and end date are required' },
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
      .from('task_company_dates')
      .select('id')
      .eq('task_id', taskId)
      .eq('company_id', companyId)
      .maybeSingle();

    let taskDate, upsertError;

    if (existingRecord) {
      // Mevcut kaydı güncelle
      const { data, error } = await supabase
        .from('task_company_dates')
        .update({
          start_date: startDate || null,
          end_date: endDate,
          is_flexible: isFlexible,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingRecord.id)
        .select(
          `
          id,
          task_id,
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

      taskDate = data;
      upsertError = error;
    } else {
      // Yeni kayıt ekle
      const { data, error } = await supabase
        .from('task_company_dates')
        .insert({
          task_id: taskId,
          company_id: companyId,
          start_date: startDate || null,
          end_date: endDate,
          is_flexible: isFlexible,
          created_by: user.id,
          updated_by: user.id,
        })
        .select(
          `
          id,
          task_id,
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

      taskDate = data;
      upsertError = error;
    }

    if (upsertError) {
      return NextResponse.json(
        { error: 'Failed to save task date', details: upsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: taskDate,
      message: 'Task date saved successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
