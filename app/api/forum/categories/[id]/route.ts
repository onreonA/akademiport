import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// GET - Tekil kategori getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Kategori bulunamadı' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Kategori getirilemedi' },
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
// PUT - Kategori güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      .update({
        name,
        description: description || null,
        icon: icon || null,
        color: color || 'bg-blue-500',
        sort_order: sort_order || 0,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Kategori bulunamadı' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Kategori güncellenemedi' },
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
// DELETE - Kategori sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Önce kategoride konu var mı kontrol et
    const { data: topics, error: topicsError } = await supabase
      .from('forum_topics')
      .select('id')
      .eq('category_id', id)
      .limit(1);
    if (topicsError) {
      return NextResponse.json(
        { success: false, error: 'Kategori kontrol edilemedi' },
        { status: 500 }
      );
    }
    if (topics && topics.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bu kategoride konular bulunduğu için silinemez',
        },
        { status: 400 }
      );
    }
    const { error } = await supabase
      .from('forum_categories')
      .delete()
      .eq('id', id);
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Kategori bulunamadı' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Kategori silinemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Kategori başarıyla silindi',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
