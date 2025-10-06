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
        { success: false, error: 'Kullanıcı kimliği gerekli' },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const expert = searchParams.get('expert');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const featured = searchParams.get('featured');
    const status = searchParams.get('status') || 'published';
    const offset = (page - 1) * limit;
    // Ana sorgu oluşturma
    let query = supabase.from('news').select(`
        *,
        news_experts!expert_author_id (
          id,
          name,
          title,
          avatar_url
        )
      `);
    // Filtreler
    if (category) {
      query = query.eq('category', category);
    }
    if (difficulty) {
      query = query.eq('difficulty_level', difficulty);
    }
    if (expert) {
      query = query.eq('expert_author_id', expert);
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }
    if (status) {
      query = query.eq('status', status);
    }
    // Arama
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`
      );
    }
    // Sıralama
    const sortColumn =
      sortBy === 'popular'
        ? 'view_count'
        : sortBy === 'likes'
          ? 'like_count'
          : sortBy === 'comments'
            ? 'comment_count'
            : sortBy === 'published'
              ? 'published_at'
              : 'created_at';
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' });
    // Sayfalama
    query = query.range(offset, offset + limit - 1);
    const { data: news, error, count } = await query;
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Haberler getirilemedi' },
        { status: 500 }
      );
    }
    // Toplam sayı için ayrı sorgu
    let countQuery = supabase
      .from('news')
      .select('*', { count: 'exact', head: true });
    if (category) countQuery = countQuery.eq('category', category);
    if (difficulty) countQuery = countQuery.eq('difficulty_level', difficulty);
    if (expert) countQuery = countQuery.eq('expert_author_id', expert);
    if (featured === 'true') countQuery = countQuery.eq('is_featured', true);
    if (status) countQuery = countQuery.eq('status', status);
    if (search)
      countQuery = countQuery.or(
        `title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`
      );
    const { count: totalCount } = await countQuery;
    return NextResponse.json({
      success: true,
      data: {
        news,
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / limit),
        },
      },
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
      status = 'draft',
    } = body;
    // Zorunlu alanlar kontrolü
    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Başlık ve içerik zorunludur' },
        { status: 400 }
      );
    }
    // Haber oluşturma
    const { data: news, error } = await supabase
      .from('news')
      .insert({
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
        is_featured: is_featured || false,
        seo_keywords,
        source_url,
        status,
        author_id: null, // Şimdilik null bırakıyoruz
        is_published: status === 'published',
        published_at: status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Haber oluşturulamadı' },
        { status: 500 }
      );
    }
    // Etiketleri ekleme
    if (tags && tags.length > 0) {
      // Önce etiketleri oluştur (eğer yoksa)
      for (const tagName of tags) {
        await supabase
          .from('news_tags')
          .upsert({ name: tagName }, { onConflict: 'name' });
      }
      // Haber-etiket ilişkilerini oluştur
      const tagIds = await Promise.all(
        tags.map(async (tagName: string) => {
          const { data: tag } = await supabase
            .from('news_tags')
            .select('id')
            .eq('name', tagName)
            .single();
          return tag?.id;
        })
      );
      const validTagIds = tagIds.filter(id => id);
      if (validTagIds.length > 0) {
        await supabase.from('news_tag_relations').insert(
          validTagIds.map(tagId => ({
            news_id: news.id,
            tag_id: tagId,
          }))
        );
      }
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
