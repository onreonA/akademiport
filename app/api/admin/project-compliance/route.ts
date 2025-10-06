import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/project-compliance
 * Proje uyumluluk bilgileri
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

    // Projeleri ve atama bilgilerini al
    const { data: projects, error: projectsError } = await supabase.from(
      'projects'
    ).select(`
        id,
        name,
        start_date,
        end_date,
        progress,
        project_company_assignments (
          company_id
        )
      `);

    if (projectsError) {
      throw new Error('Projects fetch failed');
    }

    const projectCompliance =
      projects?.map(project => {
        const now = new Date();
        const startDate = project.start_date;
        const endDate = project.end_date;

        // Gecikme hesaplama
        let delayDays = 0;
        let complianceStatus: 'compliant' | 'delayed' | 'critical' | 'no-date' =
          'no-date';

        if (endDate) {
          const endDateObj = new Date(endDate);
          delayDays = Math.ceil(
            (now.getTime() - endDateObj.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (delayDays <= 0) {
            complianceStatus = 'compliant';
          } else if (delayDays <= 30) {
            complianceStatus = 'delayed';
          } else {
            complianceStatus = 'critical';
          }
        }

        return {
          id: project.id,
          name: project.name,
          startDate: startDate,
          endDate: endDate,
          actualStartDate: startDate, // Şimdilik aynı
          actualEndDate: endDate, // Şimdilik aynı
          delayDays,
          complianceStatus,
          companyCount: project.project_company_assignments?.length || 0,
          progress: project.progress || 0,
        };
      }) || [];

    return NextResponse.json(projectCompliance);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
