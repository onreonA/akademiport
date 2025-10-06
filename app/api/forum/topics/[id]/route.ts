import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// GET - Tekil konu getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from('forum_topics')
      .select(
        `
        *,
        forum_categories(name, description, icon, color),
        users(email, full_name)
      `
      )
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Konu bulunamadı' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Konu getirilemedi' },
        { status: 500 }
      );
    }
    // Görüntülenme sayısını artır
    await supabase
      .from('forum_topics')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', id);
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
// PUT - Konu güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      content,
      category_id,
      status,
      is_featured,
      is_solved,
      tags,
    } = body;
    // Validasyon - Sadece durum güncellemesi için esnek validasyon
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (status !== undefined) updateData.status = status;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (is_solved !== undefined) updateData.is_solved = is_solved;
    if (tags !== undefined) updateData.tags = tags;
    // En az bir alan güncellenmelidir
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Güncellenecek alan belirtilmedi' },
        { status: 400 }
      );
    }
    updateData.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('forum_topics')
      .update(updateData)
      .eq('id', id)
      .select(
        `
        *,
        forum_categories(name, description, icon, color),
        users(email, full_name)
      `
      )
      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Konu bulunamadı' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Konu güncellenemedi' },
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
// DELETE - Konu sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Önce konuda yanıt var mı kontrol et
    const { data: replies, error: repliesError } = await supabase
      .from('forum_replies')
      .select('id')
      .eq('topic_id', id)
      .limit(1);
    if (repliesError) {
      return NextResponse.json(
        { success: false, error: 'Konu kontrol edilemedi' },
        { status: 500 }
      );
    }
    if (replies && replies.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bu konuda yanıtlar bulunduğu için silinemez',
        },
        { status: 400 }
      );
    }
    const { error } = await supabase.from('forum_topics').delete().eq('id', id);
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Konu bulunamadı' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Konu silinemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Konu başarıyla silindi',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
