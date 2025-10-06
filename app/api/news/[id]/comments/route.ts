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
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    const { data: comments, error } = await supabase
      .from('news_comments')
      .select('*')
      .eq('news_id', id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Yorumlar getirilemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: comments || [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
export async function POST(
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
    const body = await request.json();
    const { content } = body;
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Yorum içeriği gerekli' },
        { status: 400 }
      );
    }
    // Yorum oluştur
    const { data: comment, error } = await supabase
      .from('news_comments')
      .insert({
        news_id: id,
        user_email: userEmail,
        content: content.trim(),
        is_approved: true, // Admin onayı gerekmiyorsa true
      })
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Yorum oluşturulamadı' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
