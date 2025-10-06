import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// GET - Tüm videoları listele (admin için)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const set_id = searchParams.get('set_id');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    let query = supabase
      .from('videos')
      .select('*')
      .order('order_index', { ascending: true });
    if (set_id) {
      query = query.eq('set_id', set_id);
    }
    if (status) {
      query = query.eq('status', status);
    }
    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .select('*', { count: 'exact' } as any);
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Videolar getirilemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: data || [],
      count: count || 0,
      page,
      limit,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
// POST - Yeni video oluştur (admin için)
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı email gerekli' },
        { status: 400 }
      );
    }
    // Admin kontrolü
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('email', userEmail)
      .single();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { set_id, title, description, youtube_url, duration, order_index } =
      body;
    if (!set_id || !title || !youtube_url) {
      return NextResponse.json(
        { success: false, error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }
    // Eğitim setinin var olduğunu kontrol et
    const { data: educationSet } = await supabase
      .from('education_sets')
      .select('id')
      .eq('id', set_id)
      .single();
    if (!educationSet) {
      return NextResponse.json(
        { success: false, error: 'Eğitim seti bulunamadı' },
        { status: 404 }
      );
    }
    // Yeni video oluştur
    const { data: newVideo, error } = await supabase
      .from('videos')
      .insert({
        set_id,
        title,
        description: description || '',
        youtube_url,
        duration: duration || 0,
        order_index: order_index || 0,
        status: 'Aktif',
        created_by: (user as any).id,
      })
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Video oluşturulamadı' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: newVideo,
      message: 'Video başarıyla oluşturuldu',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
// PATCH - Video güncelle (admin için)
export async function PATCH(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı email gerekli' },
        { status: 400 }
      );
    }
    // Admin kontrolü
    const { data: user } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', userEmail)
      .single();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }
    const body = await request.json();
    const {
      id,
      set_id,
      title,
      description,
      youtube_url,
      duration,
      order_index,
      status,
    } = body;
    if (!id || !set_id || !title || !youtube_url) {
      return NextResponse.json(
        { success: false, error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }
    // Video'nun var olduğunu kontrol et
    const { data: existingVideo } = await supabase
      .from('videos')
      .select('id')
      .eq('id', id)
      .single();
    if (!existingVideo) {
      return NextResponse.json(
        { success: false, error: 'Video bulunamadı' },
        { status: 404 }
      );
    }
    // Eğitim setinin var olduğunu kontrol et
    const { data: educationSet } = await supabase
      .from('education_sets')
      .select('id')
      .eq('id', set_id)
      .single();
    if (!educationSet) {
      return NextResponse.json(
        { success: false, error: 'Eğitim seti bulunamadı' },
        { status: 404 }
      );
    }
    // Video'yu güncelle
    const { data: updatedVideo, error } = await supabase
      .from('videos')
      .update({
        set_id,
        title,
        description: description || '',
        youtube_url,
        duration: duration || 0,
        order_index: order_index || 0,
        status: status || 'Aktif',
      })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Video güncellenemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: updatedVideo,
      message: 'Video başarıyla güncellendi',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
