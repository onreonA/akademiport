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
    const materialId = await params;
    const { id } = await params;
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    // Materyal bilgilerini getir
    const { data: material, error: materialError } = await supabase
      .from('event_materials')
      .select('*')
      .eq('id', materialId)
      .single();
    if (materialError || !material) {
      return NextResponse.json(
        { success: false, error: 'Materyal bulunamadı' },
        { status: 404 }
      );
    }
    // İndirme kaydı oluştur
    const { error: downloadError } = await supabase
      .from('material_downloads')
      .insert({
        material_id: materialId,
        user_email: userEmail,
        ip_address:
          request.headers.get('x-forwarded-for') ||
          (request as any).ip ||
          'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      });
    if (downloadError) {
      // İndirme kaydı başarısız olsa bile devam et
    }
    // Dosya URL'sini döndür (gerçek uygulamada dosya sunucusundan)
    // Gamification: Puan ekle
    try {
      const pointsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1', '')}/api/points`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Email': userEmail,
          },
          body: JSON.stringify({
            points: 10,
            transaction_type: 'material_download',
            description: `${material.title} materyalini indirdin!`,
            reference_id: materialId,
            reference_type: 'material',
          }),
        }
      );
      // Gamification: Başarımları kontrol et
      const achievementsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1', '')}/api/achievements`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Email': userEmail,
          },
          body: JSON.stringify({
            action_type: 'material_download',
            reference_data: { material_id: materialId },
          }),
        }
      );
    } catch (error) {
      // Gamification hatası olsa bile indirme işlemi devam etsin
    }
    const downloadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/materials${material.file_path}`;
    return NextResponse.json({
      success: true,
      data: {
        download_url: downloadUrl,
        file_name: material.file_name,
        file_size: material.file_size,
        mime_type: material.mime_type,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
