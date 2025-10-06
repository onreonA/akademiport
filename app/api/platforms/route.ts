import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    // Kullanıcıyı kontrol et (sadece admin)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('email', userEmail)
      .single();
    if (userError || !user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }
    // Platformları getir
    const { data: platforms, error } = await supabase
      .from('meeting_platforms')
      .select('*')
      .order('name');
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Platformlar getirilemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { platforms: platforms || [] },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const body = await request.json();
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    // Kullanıcıyı kontrol et (sadece admin)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('email', userEmail)
      .single();
    if (userError || !user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }
    const {
      name,
      type,
      api_key,
      api_secret,
      webhook_url,
      is_active = true,
    } = body;
    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: 'Platform adı ve türü gerekli' },
        { status: 400 }
      );
    }
    // Platform oluştur
    const { data: platform, error } = await supabase
      .from('meeting_platforms')
      .insert({
        name,
        type,
        api_key,
        api_secret,
        webhook_url,
        is_active,
      })
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Platform oluşturulamadı' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { platform },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
