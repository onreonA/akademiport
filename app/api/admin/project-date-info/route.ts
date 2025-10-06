import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/project-date-info
 * Proje tarih bilgileri
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

    // Projeleri ve tarih bilgilerini al
    const { data: projects, error: projectsError } = await supabase.from(
      'projects'
    ).select(`
        id,
        name,
        start_date,
        end_date,
        project_company_dates (
          id,
          start_date,
          end_date,
          is_flexible,
          company_id
        )
      `);

    if (projectsError) {
      throw new Error('Projects fetch failed');
    }

    const projectDateInfo =
      projects?.map(project => {
        const companyDates = project.project_company_dates || [];
        const companyCount = companyDates.length;

        // En erken başlangıç ve en geç bitiş tarihi
        const startDates = companyDates
          .map(cd => cd.start_date)
          .filter(date => date)
          .map(date => new Date(date));

        const endDates = companyDates
          .map(cd => cd.end_date)
          .filter(date => date)
          .map(date => new Date(date));

        const earliestStart =
          startDates.length > 0
            ? new Date(Math.min(...startDates.map(d => d.getTime())))
            : null;
        const latestEnd =
          endDates.length > 0
            ? new Date(Math.max(...endDates.map(d => d.getTime())))
            : null;

        // Durum belirleme
        let status: 'on-time' | 'upcoming' | 'overdue' | 'no-date' = 'no-date';

        if (latestEnd) {
          const now = new Date();
          const sevenDaysFromNow = new Date();
          sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

          if (latestEnd < now) {
            status = 'overdue';
          } else if (latestEnd <= sevenDaysFromNow) {
            status = 'upcoming';
          } else {
            status = 'on-time';
          }
        }

        return {
          id: project.id,
          name: project.name,
          startDate: earliestStart?.toISOString().split('T')[0] || null,
          endDate: latestEnd?.toISOString().split('T')[0] || null,
          isFlexible: companyDates.some(cd => cd.is_flexible),
          companyCount,
          status,
        };
      }) || [];

    return NextResponse.json(projectDateInfo);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
