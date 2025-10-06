import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Tüm rapor türlerini birleştir
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }

    // Admin kullanıcı kontrolü
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!['admin', 'master_admin', 'consultant'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');

    // Mevcut raporları getir
    let regularReportsQuery = supabase
      .from('reports')
      .select(
        `
        *,
        companies (
          id,
          name,
          industry
        ),
        users (
          id,
          full_name,
          email
        )
      `
      )
      .order('created_at', { ascending: false });

    if (companyId) {
      regularReportsQuery = regularReportsQuery.eq('company_id', companyId);
    }

    const { data: regularReports, error: regularError } =
      await regularReportsQuery;

    // Alt proje değerlendirme raporlarını getir
    let evaluationReportsQuery = supabase
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
          ),
          companies (
            id,
            name,
            industry
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
      .order('created_at', { ascending: false });

    if (companyId) {
      evaluationReportsQuery = evaluationReportsQuery.eq(
        'sub_project_completions.company_id',
        companyId
      );
    }

    const { data: evaluationReports, error: evaluationError } =
      await evaluationReportsQuery;

    if (regularError || evaluationError) {
      console.error('Error fetching consolidated reports:', {
        regularError,
        evaluationError,
      });
      return NextResponse.json(
        { error: 'Failed to fetch reports' },
        { status: 500 }
      );
    }

    // Raporları birleştir ve formatla
    const allReports = [
      ...(regularReports || []).map(report => ({
        ...report,
        report_type: 'regular',
        type_display: report.type,
      })),
      ...(evaluationReports || []).map(report => ({
        ...report,
        report_type: 'sub_project_evaluation',
        type_display: 'Alt Proje Değerlendirme',
        company_id: report.sub_project_completions?.companies?.id,
        companies: report.sub_project_completions?.companies,
      })),
    ].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({
      success: true,
      reports: allReports,
      total: allReports.length,
      regular_count: regularReports?.length || 0,
      evaluation_count: evaluationReports?.length || 0,
    });
  } catch (error) {
    console.error('Error in consolidated reports API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
