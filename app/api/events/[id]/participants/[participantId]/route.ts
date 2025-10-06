import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// Katılım durumunu güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; participantId: string } }
) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const body = await request.json();
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı e-postası gerekli' },
        { status: 400 }
      );
    }
    // Kullanıcı yetkisini kontrol et
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    // Sadece admin ve master_admin katılım durumunu güncelleyebilir
    if (user.role !== 'admin' && user.role !== 'master_admin') {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }
    const { status } = body;
    if (!status || !['Kayıtlı', 'Katıldı', 'Katılmadı'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz durum' },
        { status: 400 }
      );
    }
    // Katılım durumunu güncelle
    const { data: participant, error: updateError } = await supabase
      .from('event_participants')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.participantId)
      .eq('event_id', params.id)
      .select()
      .single();
    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Katılım durumu güncellenemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { participant },
      message: 'Katılım durumu başarıyla güncellendi',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
// Katılım kaydını sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; participantId: string } }
) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı e-postası gerekli' },
        { status: 400 }
      );
    }
    // Kullanıcı yetkisini kontrol et
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    // Sadece admin ve master_admin katılım kaydını silebilir
    if (user.role !== 'admin' && user.role !== 'master_admin') {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }
    // Katılım kaydını sil
    const { error: deleteError } = await supabase
      .from('event_participants')
      .delete()
      .eq('id', params.participantId)
      .eq('event_id', params.id);
    if (deleteError) {
      return NextResponse.json(
        { success: false, error: 'Katılım kaydı silinemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Katılım kaydı başarıyla silindi',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
