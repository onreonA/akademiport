import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Bekleyen alt proje tamamlamalarını listele
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

    // Bekleyen tamamlamaları getir
    const { data: completions, error } = await supabase
      .from('sub_project_completions')
      .select(
        `
        *,
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
        ),
        company_users (
          id,
          name,
          email
        )
      `
      )
      .eq('status', 'pending_review')
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching sub-project completions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch completions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      completions: completions || [],
    });
  } catch (error) {
    console.error('Error in sub-project completions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Alt proje tamamlama durumunu güncelle
export async function PATCH(request: NextRequest) {
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

    const { completionId, status } = await request.json();

    if (!completionId || !status) {
      return NextResponse.json(
        { error: 'Completion ID and status are required' },
        { status: 400 }
      );
    }

    // Durumu güncelle
    const { data, error } = await supabase
      .from('sub_project_completions')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', completionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating completion status:', error);
      return NextResponse.json(
        { error: 'Failed to update completion status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      completion: data,
    });
  } catch (error) {
    console.error('Error in update completion API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
