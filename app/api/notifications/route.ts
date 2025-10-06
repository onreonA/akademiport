import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Mock notifications data for now
    const notifications = [
      {
        id: '1',
        title: 'Yeni Proje Oluşturuldu',
        message: 'Test 6 projesi başarıyla oluşturuldu',
        type: 'success',
        read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Görev Tamamlandı',
        message: 'Test 6 Alt Proje 1 - Analiz görevi tamamlandı',
        type: 'info',
        read: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '3',
        title: 'Sistem Güncellemesi',
        message: 'Firma-First Tarih Yönetimi sistemi aktif edildi',
        type: 'warning',
        read: true,
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ].slice(0, limit);

    return NextResponse.json({
      success: true,
      notifications,
      unread_count: notifications.filter(n => !n.read).length,
    });
  } catch (error) {
    // Error logging disabled for production
    return NextResponse.json(
      { error: 'Bildirimler alınamadı' },
      { status: 500 }
    );
  }
}
