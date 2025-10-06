import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// GET - Beğenileri listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const replyId = searchParams.get('reply_id');
    let query = supabase.from('forum_likes').select('*');
    // Filtreler
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (replyId) {
      query = query.eq('reply_id', replyId);
    }
    const { data, error } = await query;
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Beğeniler getirilemedi' },
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
// POST - Beğeni ekle/çıkar (toggle)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, reply_id } = body;
    // Validasyon
    if (!user_id || !reply_id) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı ve yanıt ID gerekli' },
        { status: 400 }
      );
    }
    // Önce mevcut beğeniyi kontrol et
    const { data: existingLike, error: checkError } = await supabase
      .from('forum_likes')
      .select('*')
      .eq('user_id', user_id)
      .eq('reply_id', reply_id)
      .single();
    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json(
        { success: false, error: 'Beğeni kontrol edilemedi' },
        { status: 500 }
      );
    }
    if (existingLike) {
      // Beğeniyi kaldır
      const { error: deleteError } = await supabase
        .from('forum_likes')
        .delete()
        .eq('user_id', user_id)
        .eq('reply_id', reply_id);
      if (deleteError) {
        return NextResponse.json(
          { success: false, error: 'Beğeni kaldırılamadı' },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        action: 'removed',
        message: 'Beğeni kaldırıldı',
      });
    } else {
      // Beğeni ekle
      const { data, error: insertError } = await supabase
        .from('forum_likes')
        .insert({
          user_id,
          reply_id,
        })
        .select()
        .single();
      if (insertError) {
        return NextResponse.json(
          { success: false, error: 'Beğeni eklenemedi' },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        action: 'added',
        data,
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
