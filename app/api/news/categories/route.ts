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
    let query = supabase
      .from('news_categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (active === 'true') {
      query = query.eq('is_active', true);
    }
    const { data: categories, error } = await query;
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Kategoriler getirilemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: categories || [],
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
    const { name, description, icon, color, sort_order = 0 } = body;
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Kategori adı zorunludur' },
        { status: 400 }
      );
    }
    const { data: category, error } = await supabase
      .from('news_categories')
      .insert({
        name,
        description,
        icon,
        color: color || '#3B82F6',
        sort_order,
      })
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Kategori oluşturulamadı' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
