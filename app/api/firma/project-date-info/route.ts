import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/firma/project-date-info
 * Firma proje tarih bilgileri
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

    // Firma atanmış projeleri ve tarih bilgilerini al
    const { data: assignments, error: assignmentsError } = await supabase
      .from('project_company_assignments')
      .select(
        `
        project_id,
        status,
        projects (
          id,
          name,
          progress,
          start_date,
          end_date
        )
      `
      )
      .eq('company_id', companyId)
      .eq('status', 'active');

    if (assignmentsError) {
      throw new Error(`Assignments fetch failed: ${assignmentsError.message}`);
    }

    const projectDateInfo =
      assignments?.map(assignment => {
        const project = assignment.projects;

        // Proje tarihlerini kullan (şimdilik basit çözüm)
        const startDate = project.start_date;
        const endDate = project.end_date;

        // Kalan gün hesaplama
        let daysRemaining: number | null = null;
        if (endDate) {
          const now = new Date();
          const endDateObj = new Date(endDate);
          const diffTime = endDateObj.getTime() - now.getTime();
          daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        // Durum belirleme
        let status:
          | 'on-time'
          | 'upcoming'
          | 'overdue'
          | 'no-date'
          | 'completed' = 'no-date';

        if (assignment.status === 'completed') {
          status = 'completed';
        } else if (endDate) {
          const now = new Date();
          const endDateObj = new Date(endDate);
          const sevenDaysFromNow = new Date();
          sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

          if (endDateObj < now) {
            status = 'overdue';
          } else if (endDateObj <= sevenDaysFromNow) {
            status = 'upcoming';
          } else {
            status = 'on-time';
          }
        }

        return {
          id: project.id,
          name: project.name,
          startDate: startDate,
          endDate: endDate,
          isFlexible: false, // Şimdilik false
          status,
          daysRemaining,
          progress: project.progress || 0,
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
