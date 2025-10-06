import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Firma kullanıcısı için alt proje değerlendirme raporlarını listele
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }

    // Firma kullanıcısı kontrolü
    const { data: companyUser, error: userError } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('email', userEmail)
      .single();

    if (userError || !companyUser) {
      return NextResponse.json(
        { error: 'Company user not found' },
        { status: 404 }
      );
    }

    // Firma için yayınlanmış değerlendirme raporlarını getir
    const { data: reports, error } = await supabase
      .from('sub_project_evaluation_reports')
      .select(
        `
        *,
        sub_project_completions (
          id,
          completed_at,
          completion_percentage,
          company_id,
          sub_projects (
            id,
            name,
            description,
            project_id,
            projects (
              id,
              name
            )
          )
        ),
        users (
          id,
          full_name,
          email
        )
      `
      )
      .eq('report_status', 'published')
      .eq('sub_project_completions.company_id', companyUser.company_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching company evaluation reports:', error);
      return NextResponse.json(
        { error: 'Failed to fetch evaluation reports', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reports: reports || [],
    });
  } catch (error) {
    console.error('Error in company evaluation reports API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
