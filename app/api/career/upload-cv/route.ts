import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Dosya yüklenmedi' },
        { status: 400 }
      );
    }
    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Dosya boyutu 10MB'dan büyük olamaz" },
        { status: 400 }
      );
    }
    // Dosya tipi kontrolü
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Geçersiz dosya tipi. Sadece PDF, DOC, DOCX ve TXT dosyaları kabul edilir',
        },
        { status: 400 }
      );
    }
    // Dosya adını güvenli hale getir
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `cv_${timestamp}.${fileExtension}`;
    // Dosyayı Supabase Storage'a yükle
    const { data, error } = await supabase.storage
      .from('cv-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Dosya yüklenemedi' },
        { status: 500 }
      );
    }
    // Dosya URL'ini al
    const { data: urlData } = supabase.storage
      .from('cv-files')
      .getPublicUrl(fileName);
    return NextResponse.json({
      success: true,
      message: 'CV başarıyla yüklendi',
      file_path: data.path,
      file_name: file.name,
      file_url: urlData.publicUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
