import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// GET - Tekil yanıt getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from('forum_replies')
      .select(
        `
        *
      `
      )
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Yanıt bulunamadı' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Yanıt getirilemedi' },
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
// PUT - Yanıt güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, is_solution, is_hidden, topic_id } = body;
    // Validasyon - content opsiyonel (partial update için)
    if (
      content === undefined &&
      is_solution === undefined &&
      is_hidden === undefined &&
      topic_id === undefined
    ) {
      return NextResponse.json(
        { success: false, error: 'En az bir alan güncellenmelidir' },
        { status: 400 }
      );
    }
    // Sadece sağlanan alanları güncelle
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (content !== undefined) updateData.content = content;
    if (is_solution !== undefined) updateData.is_solution = is_solution;
    if (is_hidden !== undefined) updateData.is_hidden = is_hidden;
    if (topic_id !== undefined) updateData.topic_id = topic_id;

    const { data, error } = await supabase
      .from('forum_replies')
      .update(updateData)
      .eq('id', id)
      .select(
        `
        *
      `
      )
      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Yanıt bulunamadı' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Yanıt güncellenemedi', details: error },
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
// DELETE - Yanıt sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Önce yanıtta alt yanıt var mı kontrol et
    const { data: childReplies, error: childError } = await supabase
      .from('forum_replies')
      .select('id')
      .eq('parent_reply_id', id)
      .limit(1);
    if (childError) {
      return NextResponse.json(
        { success: false, error: 'Yanıt kontrol edilemedi' },
        { status: 500 }
      );
    }
    if (childReplies && childReplies.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bu yanıtta alt yanıtlar bulunduğu için silinemez',
        },
        { status: 400 }
      );
    }
    const { error } = await supabase
      .from('forum_replies')
      .delete()
      .eq('id', id);
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Yanıt bulunamadı' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Yanıt silinemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Yanıt başarıyla silindi',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
