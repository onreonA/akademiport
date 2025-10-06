import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/date-compliance-stats
 * Tarih uyumluluk istatistikleri
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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    // Tarih filtresi
    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = `AND p.start_date >= '${startDate}' AND p.end_date <= '${endDate}'`;
    }

    // Toplam proje sayısı
    const { count: totalProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    // Uyumlu projeler (tarih içinde tamamlanan)
    const { count: compliantProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .not('end_date', 'is', null)
      .gte('end_date', new Date().toISOString());

    // Uyumlu olmayan projeler
    const { count: nonCompliantProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .not('end_date', 'is', null)
      .lt('end_date', new Date().toISOString());

    // Uyumluluk oranı
    const complianceRate =
      totalProjects && compliantProjects
        ? Math.round((compliantProjects / totalProjects) * 100)
        : 0;

    // Ortalama gecikme (basit hesaplama)
    const { data: projects } = await supabase
      .from('projects')
      .select('start_date, end_date')
      .not('end_date', 'is', null);

    let totalDelay = 0;
    let delayedCount = 0;

    if (projects) {
      projects.forEach(project => {
        if (project.end_date) {
          const endDate = new Date(project.end_date);
          const now = new Date();
          const delay = Math.ceil(
            (now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (delay > 0) {
            totalDelay += delay;
            delayedCount++;
          }
        }
      });
    }

    const averageDelay =
      delayedCount > 0 ? Math.round(totalDelay / delayedCount) : 0;

    // Kritik projeler (30 günden fazla gecikmiş)
    const { count: criticalProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .not('end_date', 'is', null)
      .lt(
        'end_date',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      );

    const stats = {
      totalProjects: totalProjects || 0,
      compliantProjects: compliantProjects || 0,
      nonCompliantProjects: nonCompliantProjects || 0,
      complianceRate,
      averageDelay,
      criticalProjects: criticalProjects || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
