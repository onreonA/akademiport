import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// GET - Firma'nın video izleme durumlarını getir
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı email gerekli' },
        { status: 400 }
      );
    }
    const { searchParams } = new URL(request.url);
    const set_id = searchParams.get('set_id');
    const video_id = searchParams.get('video_id');
    // Firma'yı bul
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('email', userEmail)
      .single();
    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Firma bulunamadı' },
        { status: 404 }
      );
    }
    let query = supabase
      .from('video_watch_progress')
      .select('*')
      .eq('company_id', company.id);
    if (set_id) {
      query = query.eq('set_id', set_id);
    }
    if (video_id) {
      query = query.eq('video_id', video_id);
    }
    const { data, error } = await query;
    if (error) {
      return NextResponse.json(
        { success: false, error: 'İzleme durumu getirilemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
// POST - Video izleme durumunu kaydet
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı email gerekli' },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { video_id, watched_duration, is_completed } = body;
    if (!video_id) {
      return NextResponse.json(
        { success: false, error: 'Video ID gerekli' },
        { status: 400 }
      );
    }
    // Firma'yı bul
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('email', userEmail)
      .single();
    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Firma bulunamadı' },
        { status: 404 }
      );
    }
    // Video'yu bul ve set_id'sini al
    const { data: video } = await supabase
      .from('videos')
      .select('set_id, duration')
      .eq('id', video_id)
      .single();
    if (!video) {
      return NextResponse.json(
        { success: false, error: 'Video bulunamadı' },
        { status: 404 }
      );
    }
    // Mevcut izleme durumunu kontrol et
    const { data: existingProgress } = await supabase
      .from('video_watch_progress')
      .select('*')
      .eq('company_id', company.id)
      .eq('video_id', video_id)
      .single();
    let progressData;
    if (existingProgress) {
      // Mevcut kaydı güncelle
      const { data, error } = await supabase
        .from('video_watch_progress')
        .update({
          watched_duration:
            watched_duration || existingProgress.watched_duration,
          is_completed:
            is_completed !== undefined
              ? is_completed
              : existingProgress.is_completed,
          watched_at: new Date().toISOString(),
        })
        .eq('id', existingProgress.id)
        .select()
        .single();
      if (error) {
        return NextResponse.json(
          { success: false, error: 'İzleme durumu güncellenemedi' },
          { status: 500 }
        );
      }
      progressData = data;
    } else {
      // Yeni kayıt oluştur
      const { data, error } = await supabase
        .from('video_watch_progress')
        .insert({
          company_id: company.id,
          video_id,
          set_id: video.set_id,
          watched_duration: watched_duration || 0,
          is_completed: is_completed || false,
        })
        .select()
        .single();
      if (error) {
        return NextResponse.json(
          { success: false, error: 'İzleme durumu kaydedilemedi' },
          { status: 500 }
        );
      }
      progressData = data;
    }
    return NextResponse.json({
      success: true,
      data: progressData,
      message: 'İzleme durumu kaydedildi',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
