import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Tekil haber getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const userEmail = request.headers.get('X-User-Email');

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: news, error } = await supabase
      .from('news')
      .select(
        `
        *,
        news_experts (
          id,
          name,
          title,
          avatar_url
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      console.log('News fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Haber bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    console.log('News API error:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// PUT - Haber güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const userEmail = request.headers.get('X-User-Email');

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      summary,
      category,
      tags,
      image_url,
      video_url,
      podcast_url,
      reading_time,
      difficulty_level,
      expert_author_id,
      is_featured,
      seo_keywords,
      source_url,
      status,
    } = body;

    // Validation
    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Başlık ve içerik zorunludur' },
        { status: 400 }
      );
    }

    const updateData: any = {
      title,
      content,
      excerpt: excerpt || '',
      summary: summary || '',
      category: category || '',
      tags: tags || [],
      image_url: image_url || '',
      video_url: video_url || '',
      podcast_url: podcast_url || '',
      reading_time: reading_time || 5,
      difficulty_level: difficulty_level || 'Başlangıç',
      expert_author_id: expert_author_id || null,
      is_featured: is_featured || false,
      seo_keywords: seo_keywords || '',
      source_url: source_url || '',
      status: status || 'draft',
      updated_at: new Date().toISOString(),
    };

    // Eğer status published ise published_at'i güncelle
    if (status === 'published') {
      updateData.published_at = new Date().toISOString();
      updateData.is_published = true;
    }

    const { data: updatedNews, error } = await supabase
      .from('news')
      .update(updateData)
      .eq('id', id)
      .select(
        `
        *,
        news_experts (
          id,
          name,
          title,
          avatar_url
        )
      `
      )
      .single();

    if (error) {
      console.log('News update error:', error);
      return NextResponse.json(
        { success: false, error: 'Haber güncellenemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: updatedNews });
  } catch (error) {
    console.log('News update API error:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// DELETE - Haber sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const userEmail = request.headers.get('X-User-Email');

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Önce haberi kontrol et
    const { data: existingNews, error: fetchError } = await supabase
      .from('news')
      .select('id, title')
      .eq('id', id)
      .single();

    if (fetchError || !existingNews) {
      return NextResponse.json(
        { success: false, error: 'Haber bulunamadı' },
        { status: 404 }
      );
    }

    // Haberi sil
    const { error: deleteError } = await supabase
      .from('news')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.log('News delete error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Haber silinemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `"${existingNews.title}" haberi başarıyla silindi`,
    });
  } catch (error) {
    console.log('News delete API error:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
