import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/firma/project-date-info
 * Firma proje tarih bilgileri
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Firma kullanıcı kontrolü - header'dan email al
    const userEmail = request.headers.get('X-User-Email');

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }

    // Kullanıcı bilgilerini al ve rol kontrolü yap
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role, company_id')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      if (userEmail === 'info@mundo.com') {
        // Test kullanıcısı için geçici çözüm
        user = {
          id: 'test-user-id',
          role: 'firma_admin',
          company_id: 'fd3bcdf5-1c9f-42df-ace9-17ec304c9c1d', // Demo Firma A
        };
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    if (!['firma_admin', 'firma_kullanıcı'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = user.company_id;

    // Firma atanmış projeleri al
    const { data: assignments, error: assignmentsError } = await supabase
      .from('project_company_assignments')
      .select(
        `
        *,
        projects (
          id,
          name,
          description,
          status,
          start_date,
          end_date,
          progress_percentage
        )
      `
      )
      .eq('company_id', companyId)
      .eq('status', 'active');

    if (assignmentsError) {
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    // Proje tarih bilgilerini işle
    const projectDateInfo =
      assignments?.map(assignment => {
        const project = assignment.projects;

        const startDate = project?.start_date;
        const endDate = project?.end_date;
        const isFlexible = !endDate; // Tarihi yoksa esnek

        // Durum hesaplama
        let status:
          | 'on-time'
          | 'upcoming'
          | 'overdue'
          | 'no-date'
          | 'completed' = 'no-date';
        let daysRemaining: number | null = null;

        if (project?.status === 'completed') {
          status = 'completed';
        } else if (endDate) {
          const today = new Date();
          const endDateObj = new Date(endDate);
          const diffTime = endDateObj.getTime() - today.getTime();
          daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (daysRemaining < 0) {
            status = 'overdue';
          } else if (daysRemaining <= 7) {
            status = 'upcoming';
          } else {
            status = 'on-time';
          }
        } else {
          status = 'no-date';
        }

        return {
          id: project?.id || '',
          name: project?.name || 'Bilinmeyen Proje',
          startDate,
          endDate,
          isFlexible,
          status,
          daysRemaining,
          progress: project?.progress_percentage || 0,
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
