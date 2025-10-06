import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// GET - Kategorileri listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('is_active');
    const sortBy = searchParams.get('sort_by') || 'sort_order';
    const order = searchParams.get('order') || 'asc';
    let query = supabase.from('forum_categories').select('*');
    // Aktif kategorileri filtrele
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }
    // Sıralama
    query = query.order(sortBy, { ascending: order === 'asc' });
    const { data, error } = await query;
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Kategoriler getirilemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
// POST - Yeni kategori oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, color, sort_order, is_active } = body;
    // Validasyon
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Kategori adı gerekli' },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from('forum_categories')
      .insert({
        name,
        description: description || null,
        icon: icon || null,
        color: color || 'bg-blue-500',
        sort_order: sort_order || 0,
        is_active: is_active !== undefined ? is_active : true,
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
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
