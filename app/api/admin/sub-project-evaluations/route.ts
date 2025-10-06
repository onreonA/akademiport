import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Alt proje değerlendirme raporlarını listele
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
    const status = searchParams.get('status') || 'published';

    // Değerlendirme raporlarını getir
    const { data: reports, error } = await supabase
      .from('sub_project_evaluation_reports')
      .select(
        `
        *,
        sub_project_completions (
          id,
          completed_at,
          completion_percentage,
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
      .eq('report_status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching evaluation reports:', error);
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
    console.error('Error in evaluation reports API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Yeni alt proje değerlendirme raporu oluştur
export async function POST(request: NextRequest) {
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
      .select('id, role')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!['admin', 'master_admin', 'consultant'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const {
      completionId,
      title,
      content,
      evaluation_score,
      strengths,
      weaknesses,
      recommendations,
      next_steps,
      report_status = 'published',
    } = await request.json();

    // Gerekli alanları kontrol et
    if (!completionId || !title || !content) {
      return NextResponse.json(
        { error: 'Completion ID, title, and content are required' },
        { status: 400 }
      );
    }

    // Rapor oluştur
    const { data: report, error } = await supabase
      .from('sub_project_evaluation_reports')
      .insert({
        sub_project_completion_id: completionId,
        consultant_id: user.id,
        title,
        content,
        evaluation_score,
        strengths: strengths || [],
        weaknesses: weaknesses || [],
        recommendations: recommendations || [],
        next_steps: next_steps || [],
        report_status,
      })
      .select(
        `
        *,
        sub_project_completions (
          id,
          completed_at,
          completion_percentage,
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
      .single();

    if (error) {
      console.error('Error creating evaluation report:', error);
      return NextResponse.json(
        { error: 'Failed to create evaluation report' },
        { status: 500 }
      );
    }

    // Alt proje tamamlama durumunu güncelle
    await supabase
      .from('sub_project_completions')
      .update({
        status: 'evaluated',
        updated_at: new Date().toISOString(),
      })
      .eq('id', completionId);

    return NextResponse.json({
      success: true,
      report: report,
    });
  } catch (error) {
    console.error('Error in create evaluation report API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
