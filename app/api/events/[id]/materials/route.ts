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
    const { id: eventId } = await params;
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    // Materyalleri getir
    const { data: materials, error } = await supabase
      .from('event_materials')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Materyaller getirilemedi' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { materials: materials || [] },
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
    const { id: eventId } = await params;
    const body = await request.json();
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    const {
      title,
      description,
      file_name,
      file_path,
      file_size,
      file_type,
      mime_type,
      category,
      is_public = true,
    } = body;
    if (
      !title ||
      !file_name ||
      !file_path ||
      !file_size ||
      !file_type ||
      !mime_type ||
      !category
    ) {
      return NextResponse.json(
        { success: false, error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }
    // Materyal oluştur
    const { data: material, error } = await supabase
      .from('event_materials')
      .insert({
        event_id: eventId,
        title,
        description,
        file_name,
        file_path,
        file_size,
        file_type,
        mime_type,
        category,
        is_public,
        uploaded_by: userEmail,
      })
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Materyal oluşturulamadı' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { material },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
