import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
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
      cv_file_path,
      cv_file_name,
      kvkk_accepted,
    } = body;
    // Validasyon
    if (!application_type || !name || !email || !phone || !kvkk_accepted) {
      return NextResponse.json(
        { success: false, error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }
    if (!['consultant', 'intern', 'hr_staff'].includes(application_type)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz başvuru tipi' },
        { status: 400 }
      );
    }
    // Başvuruyu veritabanına ekle
    const { data, error } = await supabase
      .from('career_applications')
      .insert({
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
        cv_file_path,
        cv_file_name,
        kvkk_accepted,
        status: 'pending',
      })
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Başvuru kaydedilemedi' },
        { status: 500 }
      );
    }
    // Durum geçmişine ilk kaydı ekle
    await supabase.from('application_status_history').insert({
      application_id: data.id,
      new_status: 'pending',
      notes: 'Başvuru alındı',
    });
    return NextResponse.json({
      success: true,
      message: 'Başvurunuz başarıyla gönderildi',
      application_id: data.id,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    let query = supabase
      .from('career_applications')
      .select(
        `
        *,
        application_status_history(
          id,
          previous_status,
          new_status,
          updated_by,
          notes,
          created_at
        )
      `
      )
      .order('created_at', { ascending: false });
    // Filtreler
    if (type) {
      query = query.eq('application_type', type);
    }
    if (status) {
      query = query.eq('status', status);
    }
    // Sayfalama
    query = query.range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Başvurular getirilemedi' },
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
