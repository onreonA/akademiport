import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// GET - Bildirimleri listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const isRead = searchParams.get('is_read');
    const type = searchParams.get('type');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      );
    }
    let query = supabase
      .from('forum_notifications')
      .select(
        `
        id,
        notification_type,
        title,
        message,
        topic_id,
        reply_id,
        from_user_id,
        to_user_id,
        is_read,
        created_at,
        users!forum_notifications_from_user_id_fkey(full_name, email)
      `
      )
      .eq('to_user_id', userId);
    // Filtreler
    if (isRead !== null) {
      query = query.eq('is_read', isRead === 'true');
    }
    if (type) {
      query = query.eq('notification_type', type);
    }
    // Sıralama
    query = query.order(sortBy, { ascending: order === 'asc' });
    // Sayfalama
    query = query.range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) {
      return NextResponse.json(
        { success: false, error: `Bildirimler getirilemedi: ${error.message}` },
        { status: 500 }
      );
    }
    // Bildirimleri düzenle
    const formattedData =
      data?.map(notification => ({
        id: notification.id,
        type: notification.notification_type,
        title: notification.title,
        message: notification.message,
        topic_id: notification.topic_id,
        reply_id: notification.reply_id,
        from_user_id: notification.from_user_id,
        from_user_name: notification.users?.full_name || 'Kullanıcı',
        is_read: notification.is_read,
        created_at: notification.created_at,
      })) || [];
    return NextResponse.json({
      success: true,
      data: formattedData,
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
// POST - Bildirim oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, topic_id, reply_id, type, title, message } = body;
    // Validasyon
    if (!user_id || !type || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı, tip, başlık ve mesaj gerekli' },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from('forum_notifications')
      .insert({
        user_id,
        topic_id: topic_id || null,
        reply_id: reply_id || null,
        type,
        title,
        message,
        is_read: false,
      })
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Bildirim oluşturulamadı' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
