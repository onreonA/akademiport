import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// POST - Tüm bildirimleri okundu işaretle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id } = body;
    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from('forum_notifications')
      .update({ is_read: true })
      .eq('to_user_id', user_id)
      .eq('is_read', false);
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Bildirimler güncellenemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Tüm bildirimler okundu olarak işaretlendi',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
