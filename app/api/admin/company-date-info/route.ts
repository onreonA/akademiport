import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/company-date-info
 * Firma tarih bilgileri
 */
export async function GET(request: NextRequest) {
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

    // Firmaları ve tarih bilgilerini al
    const { data: companies, error: companiesError } = await supabase.from(
      'companies'
    ).select(`
        id,
        name,
        project_company_dates (
          id,
          start_date,
          end_date,
          is_flexible,
          project_id,
          created_at,
          updated_at
        )
      `);

    if (companiesError) {
      throw new Error('Companies fetch failed');
    }

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const companyDateInfo =
      companies?.map(company => {
        const companyDates = company.project_company_dates || [];
        const projectCount = companyDates.length;

        // Yaklaşan son tarihler (7 gün içinde)
        const upcomingDeadlines = companyDates.filter(cd => {
          if (!cd.end_date) return false;
          const endDate = new Date(cd.end_date);
          return endDate > now && endDate <= sevenDaysFromNow;
        }).length;

        // Gecikmiş projeler
        const overdueCount = companyDates.filter(cd => {
          if (!cd.end_date) return false;
          const endDate = new Date(cd.end_date);
          return endDate < now;
        }).length;

        // Son aktivite tarihi
        const lastActivity =
          companyDates.length > 0
            ? new Date(
                Math.max(
                  ...companyDates.map(cd =>
                    new Date(cd.updated_at || cd.created_at).getTime()
                  )
                )
              )
            : null;

        return {
          id: company.id,
          name: company.name,
          projectCount,
          upcomingDeadlines,
          overdueCount,
          lastActivity: lastActivity
            ? lastActivity.toLocaleDateString('tr-TR')
            : 'Hiç aktivite yok',
        };
      }) || [];

    return NextResponse.json(companyDateInfo);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
