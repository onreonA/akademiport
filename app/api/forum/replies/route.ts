import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// GET - Yanıtları listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topic_id');
    const authorId = searchParams.get('author_id');
    const companyId = searchParams.get('company_id');
    const isSolution = searchParams.get('is_solution');
    const parentReplyId = searchParams.get('parent_reply_id');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const order = searchParams.get('order') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    let query = supabase.from('forum_replies').select(`
        *
      `);
    // Filtreler
    if (topicId) {
      query = query.eq('topic_id', topicId);
    }
    if (authorId) {
      query = query.eq('author_id', authorId);
    }
    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    if (isSolution !== null) {
      query = query.eq('is_solution', isSolution === 'true');
    }
    if (parentReplyId) {
      query = query.eq('parent_reply_id', parentReplyId);
    }
    // parentReplyId yoksa tüm yanıtları getir (ana + nested)
    // Sıralama
    query = query.order(sortBy, { ascending: order === 'asc' });
    // Sayfalama
    query = query.range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Yanıtlar getirilemedi' },
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
// POST - Yeni yanıt oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic_id, author_id, company_id, content, parent_reply_id } = body;
    // Validasyon
    if (!topic_id || !author_id || !content) {
      return NextResponse.json(
        { success: false, error: 'Konu, yazar ve içerik gerekli' },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from('forum_replies')
      .insert({
        topic_id,
        author_id,
        company_id: company_id || null,
        content,
        parent_reply_id: parent_reply_id || null,
        is_solution: false,
        is_hidden: false,
        like_count: 0,
      })
      .select(
        `
        *
      `
      )
      .single();
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Yanıt oluşturulamadı', details: error },
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
