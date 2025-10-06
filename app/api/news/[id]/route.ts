import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı kimliği gerekli' },
        { status: 401 }
      );
    }
    const { id } = await params;
    // Haber detaylarını getir
    const { data: news, error } = await supabase
      .from('news')
      .select(
        `
        *,
        news_experts!expert_author_id (
          id,
          name,
          title,
          bio,
          avatar_url,
          expertise_areas,
          social_links
        )
      `
      )
      .eq('id', id)
      .eq('status', 'published')
      .single();
    if (error || !news) {
      return NextResponse.json(
        { success: false, error: 'Haber bulunamadı' },
        { status: 404 }
      );
    }
    // Görüntülenme sayısını artır
    await supabase.from('news_interactions').upsert(
      {
        user_email: userEmail,
        news_id: id,
        interaction_type: 'read',
      },
      { onConflict: 'user_email,news_id,interaction_type' }
    );
    // İlgili haberleri getir
    const { data: relatedNews } = await supabase
      .from('news')
      .select(
        `
        id,
        title,
        excerpt,
        image_url,
        category,
        reading_time,
        difficulty_level,
        created_at,
        view_count,
        like_count,
        comment_count
      `
      )
      .eq('status', 'published')
      .eq('category', news.category)
      .neq('id', id)
      .order('view_count', { ascending: false })
      .limit(3);
    // Etiketleri getir
    const { data: tags } = await supabase
      .from('news_tag_relations')
      .select(
        `
        news_tags (
          id,
          name,
          color
        )
      `
      )
      .eq('news_id', id);
    // Yorumları getir
    const { data: comments } = await supabase
      .from('news_comments')
      .select(
        `
        id,
        content,
        user_email,
        likes_count,
        created_at,
        updated_at
      `
      )
      .eq('news_id', id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(10);
    return NextResponse.json({
      success: true,
      data: {
        news,
        relatedNews: relatedNews || [],
        tags: tags?.map(t => t.news_tags).filter(Boolean) || [],
        comments: comments || [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const body = await request.json();
    // Haber güncelleme
    const { data: news, error } = await supabase
      .from('news')
      .update({
        ...body,
        last_updated: new Date().toISOString(),
        is_published: body.status === 'published',
        published_at:
          body.status === 'published' ? new Date().toISOString() : null,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Haber güncellenemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: news,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    // Haber silme
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Haber silinemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Haber başarıyla silindi',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
