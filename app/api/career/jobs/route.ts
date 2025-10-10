import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - İş ilanlarını listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const level = searchParams.get('level');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('job_postings')
      .select('*')
      .order('created_at', { ascending: false });

    // Filtreler
    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (level) {
      query = query.eq('level', level);
    }

    // Sayfalama
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: 'İş ilanları getirilemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
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

// POST - Yeni iş ilanı oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      company,
      department,
      location,
      type,
      level,
      salary,
      description,
      requirements,
      benefits,
      application_deadline,
    } = body;

    // Validasyon
    if (
      !title ||
      !company ||
      !department ||
      !location ||
      !type ||
      !level ||
      !description
    ) {
      return NextResponse.json(
        { success: false, error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }

    // İş ilanını veritabanına ekle
    const { data, error } = await supabase
      .from('job_postings')
      .insert({
        title,
        company,
        department,
        location,
        type,
        level,
        salary,
        description,
        requirements: requirements || [],
        benefits: benefits || [],
        status: 'Aktif',
        application_deadline,
        applications_count: 0,
        views_count: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: 'İş ilanı kaydedilemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'İş ilanı başarıyla oluşturuldu',
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
