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
    // Firma kullanıcısını bul
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('email', userEmail)
      .single();
    if (companyError) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    // Firmaya ait raporları getir
    const { data: reports, error } = await supabase
      .from('reports')
      .select(
        `
        id,
        title,
        type,
        period,
        description,
        file_name,
        file_size,
        file_url,
        status,
        download_count,
        is_read,
        tags,
        priority,
        created_at,
        updated_at
      `
      )
      .eq('company_id', company.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch reports' },
        { status: 500 }
      );
    }
    // API response formatını firma formatına dönüştür
    const formattedReports =
      reports?.map((report: any) => ({
        id: report.id,
        title: report.title,
        type: report.type.toLowerCase().replace(' ', '_') as any,
        fileName: report.file_name,
        fileSize: `${Math.round(report.file_size / 1024 / 1024)} MB`,
        author: 'Sistem',
        publishDate: report.created_at,
        description: report.description || '',
        pdfUrl: report.file_url || '#',
        isRead: report.is_read || false,
        downloadCount: report.download_count || 0,
        companyId: company.id,
        tags: report.tags || [],
        priority: report.priority || 'medium',
      })) || [];
    return NextResponse.json({
      success: true,
      data: formattedReports,
      company: {
        id: company.id,
        name: company.name,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
