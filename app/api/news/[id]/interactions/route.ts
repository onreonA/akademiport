import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
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
    const { interaction_type, interaction_data = {} } = body;
    // Geçerli etkileşim türleri
    const validTypes = ['read', 'like', 'share', 'save', 'bookmark'];
    if (!validTypes.includes(interaction_type)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz etkileşim türü' },
        { status: 400 }
      );
    }
    // Etkileşimi kaydet
    const { data: interaction, error } = await supabase
      .from('news_interactions')
      .upsert(
        {
          user_email: userEmail,
          news_id: id,
          interaction_type,
          interaction_data,
        },
        { onConflict: 'user_email,news_id,interaction_type' }
      )
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Etkileşim kaydedilemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: interaction,
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
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const interaction_type = searchParams.get('type');
    if (!interaction_type) {
      return NextResponse.json(
        { success: false, error: 'Etkileşim türü gerekli' },
        { status: 400 }
      );
    }
    // Etkileşimi sil
    const { error } = await supabase
      .from('news_interactions')
      .delete()
      .eq('user_email', userEmail)
      .eq('news_id', id)
      .eq('interaction_type', interaction_type);
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Etkileşim silinemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Etkileşim başarıyla silindi',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
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
    // Kullanıcının bu haberle etkileşimlerini getir
    const { data: interactions, error } = await supabase
      .from('news_interactions')
      .select('*')
      .eq('user_email', userEmail)
      .eq('news_id', id);
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Etkileşimler getirilemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: interactions || [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
