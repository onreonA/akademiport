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
        { success: false, error: 'Kullanıcı e-postası gerekli' },
        { status: 400 }
      );
    }
    // Event'i getir
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', (await params).id)
      .single();
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Etkinlik bulunamadı' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { event },
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
    const body = await request.json();
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı e-postası gerekli' },
        { status: 400 }
      );
    }
    // Event'i güncelle
    const { data: event, error } = await supabase
      .from('events')
      .update(body)
      .eq('id', (await params).id)
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Etkinlik güncellenemedi' },
        { status: 400 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { event },
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
        { success: false, error: 'Kullanıcı e-postası gerekli' },
        { status: 400 }
      );
    }
    // Event'i sil
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', (await params).id);
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Etkinlik silinemedi' },
        { status: 400 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Etkinlik başarıyla silindi',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
