import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/company-compliance
 * Firma uyumluluk bilgileri
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

    // Firmaları ve atama bilgilerini al
    const { data: companies, error: companiesError } = await supabase.from(
      'companies'
    ).select(`
        id,
        name,
        project_company_assignments (
          project_id,
          projects (
            id,
            name,
            end_date,
            progress
          )
        )
      `);

    if (companiesError) {
      throw new Error('Companies fetch failed');
    }

    const companyCompliance =
      companies?.map(company => {
        const assignments = company.project_company_assignments || [];
        const totalProjects = assignments.length;

        let compliantProjects = 0;
        let delayedProjects = 0;
        let criticalProjects = 0;
        let totalDelay = 0;

        assignments.forEach(assignment => {
          const project = assignment.projects;
          if (project && project.end_date) {
            const now = new Date();
            const endDate = new Date(project.end_date);
            const delayDays = Math.ceil(
              (now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (delayDays <= 0) {
              compliantProjects++;
            } else if (delayDays <= 30) {
              delayedProjects++;
              totalDelay += delayDays;
            } else {
              criticalProjects++;
              totalDelay += delayDays;
            }
          }
        });

        const averageDelay =
          delayedProjects + criticalProjects > 0
            ? Math.round(totalDelay / (delayedProjects + criticalProjects))
            : 0;

        const complianceRate =
          totalProjects > 0
            ? Math.round((compliantProjects / totalProjects) * 100)
            : 0;

        return {
          id: company.id,
          name: company.name,
          totalProjects,
          compliantProjects,
          delayedProjects,
          criticalProjects,
          averageDelay,
          complianceRate,
        };
      }) || [];

    return NextResponse.json(companyCompliance);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
