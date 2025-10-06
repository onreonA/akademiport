import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/admin/validate-dates
 * Tarih hiyerarşisi validasyonu
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

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
    const { level, parentId, companyId, startDate, endDate } = body;

    if (!level || !parentId || !companyId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'All parameters are required' },
        { status: 400 }
      );
    }

    let isValid = true;
    let message = '';
    let suggestedDates = null;

    if (level === 'sub-project') {
      // Alt proje için ana proje tarihlerini kontrol et
      const { data: projectDates, error: projectDatesError } = await supabase
        .from('project_company_dates')
        .select('start_date, end_date')
        .eq('project_id', parentId)
        .eq('company_id', companyId)
        .single();

      if (projectDatesError || !projectDates) {
        return NextResponse.json({
          isValid: false,
          message:
            'Ana proje tarihleri bulunamadı. Önce ana projeye tarih ataması yapın.',
          suggestedDates: null,
        });
      }

      if (
        startDate < projectDates.start_date ||
        endDate > projectDates.end_date
      ) {
        isValid = false;
        message = `Alt proje tarihleri ana proje tarihleri dışında olamaz. Ana proje: ${projectDates.start_date} - ${projectDates.end_date}`;
        suggestedDates = {
          start: projectDates.start_date,
          end: projectDates.end_date,
        };
      }
    } else if (level === 'task') {
      // Görev için alt proje tarihlerini kontrol et
      const { data: subProjectDates, error: subProjectDatesError } =
        await supabase
          .from('sub_project_company_dates')
          .select('start_date, end_date')
          .eq('sub_project_id', parentId)
          .eq('company_id', companyId)
          .single();

      if (subProjectDatesError || !subProjectDates) {
        return NextResponse.json({
          isValid: false,
          message:
            'Alt proje tarihleri bulunamadı. Önce alt projeye tarih ataması yapın.',
          suggestedDates: null,
        });
      }

      if (
        (startDate && startDate < subProjectDates.start_date) ||
        endDate > subProjectDates.end_date
      ) {
        isValid = false;
        message = `Görev tarihleri alt proje tarihleri dışında olamaz. Alt proje: ${subProjectDates.start_date} - ${subProjectDates.end_date}`;
        suggestedDates = {
          start: subProjectDates.start_date,
          end: subProjectDates.end_date,
        };
      }
    }

    return NextResponse.json({
      isValid,
      message: isValid ? 'Tarihler geçerli' : message,
      suggestedDates,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
