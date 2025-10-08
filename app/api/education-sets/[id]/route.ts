import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// GET - Tekil eğitim seti detayı
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userEmail = request.headers.get('X-User-Email');
    let query = supabase
      .from('education_sets')
      .select('*')
      .eq('id', id)
      .eq('status', 'Aktif');
    // Eğer kullanıcı email'i varsa, firma kontrolü yap
    if (userEmail) {
      // Firma kullanıcısı için atanmış eğitim setlerini kontrol et
      query = query.eq('status', 'Aktif');
    }
    const { data: educationSet, error } = await query.single();
    if (error || !educationSet) {
      return NextResponse.json(
        { success: false, error: 'Eğitim seti bulunamadı' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: educationSet,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// DELETE - Eğitim setini sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userEmail = request.headers.get('X-User-Email');

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }

    // Önce eğitim setinin var olup olmadığını kontrol et
    const { data: educationSet, error: fetchError } = await supabase
      .from('education_sets')
      .select('id, name')
      .eq('id', id)
      .single();

    if (fetchError || !educationSet) {
      return NextResponse.json(
        { success: false, error: 'Eğitim seti bulunamadı' },
        { status: 404 }
      );
    }

    // Eğitim setini sil
    const { error: deleteError } = await supabase
      .from('education_sets')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Education set delete error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Eğitim seti silinirken hata oluştu' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Eğitim seti başarıyla silindi',
    });
  } catch (error) {
    console.error('Education set DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
