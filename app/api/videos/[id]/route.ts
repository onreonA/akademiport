import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// GET - Tekil video detayı
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userEmail = request.headers.get('X-User-Email');
    let query = supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .eq('status', 'Aktif');
    // Eğer kullanıcı email'i varsa, firma kontrolü yap
    if (userEmail) {
      // Firma kullanıcısı için atanmış eğitim setlerini kontrol et
      query = query.eq('status', 'Aktif');
    }
    const { data: video, error } = await query.single();
    if (error || !video) {
      return NextResponse.json(
        { success: false, error: 'Video bulunamadı' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: video,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
// PATCH - Video güncelle (admin için)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { title, description, youtube_url, duration, order_index, status } =
      body;
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
    // Video'yu güncelle
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (youtube_url !== undefined) updateData.youtube_url = youtube_url;
    if (duration !== undefined) updateData.duration = duration;
    if (order_index !== undefined) updateData.order_index = order_index;
    if (status !== undefined) updateData.status = status;
    const { data: updatedVideo, error } = await supabase
      .from('videos')
      .update(updateData)
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
// DELETE - Video sil (admin için)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    // Video'yu sil
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Video silinemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Video başarıyla silindi',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
