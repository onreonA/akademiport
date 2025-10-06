import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Firma ID gerekli' },
        { status: 400 }
      );
    }
    let query = supabase
      .from('hr_pool')
      .select(
        `
        *,
        career_applications(
          id,
          application_type,
          name,
          email,
          phone,
          city,
          education,
          experience,
          interests,
          position,
          expertise,
          cv_file_name,
          created_at
        ),
        companies!hr_pool_company_id_fkey(
          id,
          name
        )
      `
      )
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    // Filtreler
    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('career_applications.application_type', type);
    }
    // Sayfalama
    query = query.range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: `Firma havuzu getirilemedi: ${error.message}`,
        },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
