import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const notificationId = await params;
    const { id } = await params;
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Bildirim ID gerekli' },
        { status: 400 }
      );
    }
    // Bildirimi güncelle
    const { data: notification, error } = await supabase
      .from('event_notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .eq('user_email', userEmail)
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Bildirim güncellenemedi' },
        { status: 500 }
      );
    }
    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Bildirim bulunamadı' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { notification },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const notificationId = await params;
    const { id } = await params;
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Bildirim ID gerekli' },
        { status: 400 }
      );
    }
    // Bildirimi sil
    const { error } = await supabase
      .from('event_notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_email', userEmail);
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Bildirim silinemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { message: 'Bildirim başarıyla silindi' },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
