import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { ZoomAPI, GoogleMeetAPI } from '../../../../../lib/zoom-api';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const eventId = await params;
    const { id } = await params;
    const body = await request.json();
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    const { platform, settings } = body;
    if (!platform) {
      return NextResponse.json(
        { success: false, error: 'Platform seçimi gerekli' },
        { status: 400 }
      );
    }
    // Etkinliği getir
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();
    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: 'Etkinlik bulunamadı' },
        { status: 404 }
      );
    }
    // Platform bilgilerini getir
    const { data: platformData, error: platformError } = await supabase
      .from('meeting_platforms')
      .select('*')
      .eq('type', platform)
      .eq('is_active', true)
      .single();
    if (platformError || !platformData) {
      return NextResponse.json(
        { success: false, error: 'Platform bulunamadı veya aktif değil' },
        { status: 404 }
      );
    }
    let meetingData;
    // Platform'a göre meeting oluştur
    if (platform === 'zoom') {
      const zoomAPI = new ZoomAPI(
        platformData.api_key || '',
        platformData.api_secret || ''
      );
      meetingData = await zoomAPI.createMeeting(
        event.title,
        event.start_date,
        event.duration || 60
      );
    } else if (platform === 'google_meet') {
      const meetAPI = new GoogleMeetAPI(platformData.api_key || '');
      meetingData = await meetAPI.createMeeting(
        event.title,
        event.start_date,
        event.duration || 60
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Desteklenmeyen platform' },
        { status: 400 }
      );
    }
    // Etkinliği güncelle
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update({
        meeting_platform: platform,
        meeting_id: meetingData.id,
        meeting_link: meetingData.join_url,
        meeting_password: meetingData.password,
        meeting_settings: settings || {},
        is_online: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .select()
      .single();
    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Etkinlik güncellenemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: {
        event: updatedEvent,
        meeting: meetingData,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const eventId = await params;
    const { id } = await params;
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    // Etkinliği getir
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();
    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: 'Etkinlik bulunamadı' },
        { status: 404 }
      );
    }
    // Platform bilgilerini getir
    let platformData = null;
    if (event.meeting_platform) {
      const { data: platform, error: platformError } = await supabase
        .from('meeting_platforms')
        .select('*')
        .eq('type', event.meeting_platform)
        .single();
      if (!platformError) {
        platformData = platform;
      }
    }
    return NextResponse.json({
      success: true,
      data: {
        event,
        platform: platformData,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
