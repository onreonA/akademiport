import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// GET - Konuları listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');
    const status = searchParams.get('status');
    const isFeatured = searchParams.get('is_featured');
    const isSolved = searchParams.get('is_solved');
    const authorId = searchParams.get('author_id');
    const companyId = searchParams.get('company_id');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    let query = supabase.from('forum_topics').select(`
        *,
        forum_categories(name, description, icon, color),
        users(email, full_name)
      `);
    // Filtreler
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    if (status) {
      query = query.eq('status', status);
    } else {
      // Firma forum sayfasında gizli konuları gösterme
      query = query.neq('status', 'hidden');
    }
    if (isFeatured !== null) {
      query = query.eq('is_featured', isFeatured === 'true');
    }
    if (isSolved !== null) {
      query = query.eq('is_solved', isSolved === 'true');
    }
    if (authorId) {
      query = query.eq('author_id', authorId);
    }
    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    // Sıralama
    query = query.order(sortBy, { ascending: order === 'asc' });
    // Sayfalama
    query = query.range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Konular getirilemedi', details: error },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
// POST - Yeni konu oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      category_id,
      author_id,
      company_id,
      status,
      is_featured,
      tags,
    } = body;
    // Validasyon
    if (!title || !content || !category_id || !author_id) {
      return NextResponse.json(
        { success: false, error: 'Başlık, içerik, kategori ve yazar gerekli' },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from('forum_topics')
      .insert({
        title,
        content,
        category_id,
        author_id,
        company_id: company_id || null,
        status: status || 'active',
        is_featured: is_featured || false,
        is_solved: false,
        view_count: 0,
        reply_count: 0,
        like_count: 0,
        tags: tags || [],
      })
      .select(
        `
        *,
        forum_categories(name, description, icon, color),
        users(email, full_name)
      `
      )
      .single();
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Konu oluşturulamadı' },
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
