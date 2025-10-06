import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/date-stats
 * Tarih yönetimi istatistikleri
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

    // Toplam proje sayısı
    const { count: totalProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    // Tarih atanmış proje sayısı
    const { count: projectsWithDates } = await supabase
      .from('project_company_dates')
      .select('project_id', { count: 'exact', head: true })
      .not('end_date', 'is', null);

    // Tarih atanmamış proje sayısı
    const projectsWithoutDates =
      (totalProjects || 0) - (projectsWithDates || 0);

    // Yaklaşan son tarihler (7 gün içinde)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { count: upcomingDeadlines } = await supabase
      .from('project_company_dates')
      .select('*', { count: 'exact', head: true })
      .lte('end_date', sevenDaysFromNow.toISOString())
      .gte('end_date', new Date().toISOString());

    // Gecikmiş projeler
    const { count: overdueProjects } = await supabase
      .from('project_company_dates')
      .select('*', { count: 'exact', head: true })
      .lt('end_date', new Date().toISOString());

    // Esnek tarihli projeler
    const { count: flexibleDates } = await supabase
      .from('project_company_dates')
      .select('*', { count: 'exact', head: true })
      .eq('is_flexible', true);

    // Firma kapsamı (tarih atanmış firma sayısı / toplam firma sayısı)
    const { count: totalCompanies } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });

    const { count: companiesWithDates } = await supabase
      .from('project_company_dates')
      .select('company_id', { count: 'exact', head: true });

    const companyCoverage =
      totalCompanies && companiesWithDates
        ? Math.round((companiesWithDates / totalCompanies) * 100)
        : 0;

    const stats = {
      totalProjects: totalProjects || 0,
      projectsWithDates: projectsWithDates || 0,
      projectsWithoutDates,
      upcomingDeadlines: upcomingDeadlines || 0,
      overdueProjects: overdueProjects || 0,
      flexibleDates: flexibleDates || 0,
      companyCoverage,
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
