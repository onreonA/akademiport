import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// Katılımcıları getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı e-postası gerekli' },
        { status: 400 }
      );
    }
    // Katılımcıları getir
    const { data: participants, error } = await supabase
      .from('event_participants')
      .select('*')
      .eq('event_id', (await params).id);
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Katılımcılar getirilemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { participants: participants || [] },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
// Katılım kaydı oluştur
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    // Kullanıcı bilgilerini al
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, full_name, company_id')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    // Etkinlik bilgilerini kontrol et
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', (await params).id)
      .single();
    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: 'Etkinlik bulunamadı' },
        { status: 404 }
      );
    }
    // Katılım sayısını kontrol et
    const { data: existingParticipants, error: countError } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', (await params).id);
    if (countError) {
      return NextResponse.json(
        { success: false, error: 'Katılım kontrolü yapılamadı' },
        { status: 500 }
      );
    }
    if (
      existingParticipants &&
      existingParticipants.length >= event.max_participants
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Etkinlik maksimum katılımcı sayısına ulaştı',
        },
        { status: 400 }
      );
    }
    // Zaten kayıtlı mı kontrol et
    const { data: existingParticipant } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', (await params).id)
      .eq('user_email', userEmail)
      .single();
    if (existingParticipant) {
      return NextResponse.json(
        { success: false, error: 'Bu etkinliğe zaten kayıtlısınız' },
        { status: 400 }
      );
    }
    // Katılım kaydı oluştur
    const { data: participant, error: participantError } = await supabase
      .from('event_participants')
      .insert({
        event_id: (await params).id,
        user_email: userEmail,
        user_name: user.full_name,
        company_id: user.company_id,
        status: 'Kayıtlı',
        registered_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (participantError) {
      return NextResponse.json(
        { success: false, error: 'Katılım kaydı oluşturulamadı' },
        { status: 500 }
      );
    }
    // Etkinlik katılımcı sayısını güncelle
    await supabase
      .from('events')
      .update({ registered_count: (existingParticipants?.length || 0) + 1 })
      .eq('id', (await params).id);
    // Gamification: Puan ekle
    try {
      const pointsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1', '')}/api/points`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Email': userEmail,
          },
          body: JSON.stringify({
            points: 50,
            transaction_type: 'event_participation',
            description: `${event.title} etkinliğine katıldın!`,
            reference_id: (await params).id,
            reference_type: 'event',
          }),
        }
      );
      // Gamification: Başarımları kontrol et
      const achievementsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1', '')}/api/achievements`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Email': userEmail,
          },
          body: JSON.stringify({
            action_type: 'event_participation',
            reference_data: { event_id: (await params).id },
          }),
        }
      );
    } catch (error) {
      // Gamification hatası olsa bile kayıt işlemi devam etsin
    }
    return NextResponse.json({
      success: true,
      data: { participant },
      message: 'Etkinliğe başarıyla kayıt oldunuz',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
// Katılım durumu güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const body = await request.json();
    const { status } = body;
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı e-postası gerekli' },
        { status: 400 }
      );
    }
    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Durum bilgisi gerekli' },
        { status: 400 }
      );
    }
    // Kullanıcının katılım kaydını bul ve güncelle
    const { data: participant, error: updateError } = await supabase
      .from('event_participants')
      .update({
        status:
          status === 'attending'
            ? 'Kayıtlı'
            : status === 'not_attending'
              ? 'Katılmadı'
              : status === 'undecided'
                ? 'Kararsız'
                : 'Kayıtlı',
        updated_at: new Date().toISOString(),
      })
      .eq('event_id', (await params).id)
      .eq('user_email', userEmail)
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
