import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/firma/date-stats
 * Firma tarih istatistikleri
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Firma kullanıcı kontrolü
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;

    if (
      !userEmail ||
      !['firma_admin', 'firma_kullanıcı'].includes(userRole || '')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Kullanıcının firma ID'sini al
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const companyId = user.company_id;

    // Toplam atanmış proje sayısı
    const { count: totalProjects } = await supabase
      .from('project_company_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'active');

    // Tarih atanmış proje sayısı
    const { count: projectsWithDates } = await supabase
      .from('project_company_dates')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .not('end_date', 'is', null);

    // Yaklaşan son tarihler (7 gün içinde)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { count: upcomingDeadlines } = await supabase
      .from('project_company_dates')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .lte('end_date', sevenDaysFromNow.toISOString())
      .gte('end_date', new Date().toISOString());

    // Gecikmiş projeler
    const { count: overdueProjects } = await supabase
      .from('project_company_dates')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .lt('end_date', new Date().toISOString());

    // Tamamlanan projeler
    const { count: completedProjects } = await supabase
      .from('project_company_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'completed');

    // Esnek tarihli projeler
    const { count: flexibleDates } = await supabase
      .from('project_company_dates')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_flexible', true);

    const stats = {
      totalProjects: totalProjects || 0,
      projectsWithDates: projectsWithDates || 0,
      upcomingDeadlines: upcomingDeadlines || 0,
      overdueProjects: overdueProjects || 0,
      completedProjects: completedProjects || 0,
      flexibleDates: flexibleDates || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
