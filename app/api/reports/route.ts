import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
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
    if (user.role !== 'admin' && user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    // Tüm raporları getir
    const { data: reports, error } = await supabase
      .from('reports')
      .select(
        `
        *,
        companies (
          id,
          name,
          sector
        ),
        users (
          id,
          name,
          email
        )
      `
      )
      .order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch reports' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      reports: reports || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
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
    if (user.role !== 'admin' && user.role !== 'master_admin') {
      return NextResponse.json(
        { error: 'Only admins can create reports' },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { title, companyId, type, period, description, fileName, fileSize } =
      body;
    // Validation
    if (!title || !companyId || !type || !period) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    // Rapor oluştur
    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        title,
        company_id: companyId,
        type,
        period,
        description,
        file_name: fileName,
        file_size: fileSize,
        uploaded_by: user.id,
        status: 'active',
      })
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create report' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      report,
      message: 'Rapor başarıyla oluşturuldu',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
