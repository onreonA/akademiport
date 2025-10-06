import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const expertise = searchParams.get('expertise');
    let query = supabase
      .from('news_experts')
      .select('*')
      .order('name', { ascending: true });
    if (active === 'true') {
      query = query.eq('is_active', true);
    }
    if (expertise) {
      query = query.contains('expertise_areas', [expertise]);
    }
    const { data: experts, error } = await query;
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Uzmanlar getirilemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: experts || [],
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
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı kimliği gerekli' },
        { status: 401 }
      );
    }
    // Admin kontrolü
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('email', userEmail)
      .single();
    if (!user || !['admin', 'master_admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { name, title, bio, avatar_url, expertise_areas, social_links } =
      body;
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Uzman adı zorunludur' },
        { status: 400 }
      );
    }
    const { data: expert, error } = await supabase
      .from('news_experts')
      .insert({
        name,
        title,
        bio,
        avatar_url,
        expertise_areas: expertise_areas || [],
        social_links: social_links || {},
      })
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Uzman oluşturulamadı' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: expert,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
