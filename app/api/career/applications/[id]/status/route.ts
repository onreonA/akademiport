import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { new_status, notes, updated_by } = body;
    // Validasyon
    if (!new_status) {
      return NextResponse.json(
        { success: false, error: 'Yeni durum belirtilmedi' },
        { status: 400 }
      );
    }
    const validStatuses = [
      'pending',
      'admin_approved',
      'consultant_approved',
      'in_pool',
      'hired',
      'rejected',
    ];
    if (!validStatuses.includes(new_status)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz durum' },
        { status: 400 }
      );
    }
    // Mevcut başvuruyu getir
    const { data: currentApplication, error: fetchError } = await supabase
      .from('career_applications')
      .select('status')
      .eq('id', id)
      .single();
    if (fetchError || !currentApplication) {
      return NextResponse.json(
        { success: false, error: 'Başvuru bulunamadı' },
        { status: 404 }
      );
    }
    const previous_status = currentApplication.status;
    // Başvuru durumunu güncelle
    const { error: updateError } = await supabase
      .from('career_applications')
      .update({ status: new_status })
      .eq('id', id);
    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Durum güncellenemedi' },
        { status: 500 }
      );
    }
    // Durum geçmişine kayıt ekle
    const { error: historyError } = await supabase
      .from('application_status_history')
      .insert({
        application_id: id,
        previous_status,
        new_status,
        updated_by,
        notes,
      });
    if (historyError) {
      // Ana güncelleme başarılı olduğu için sadece log'da hata göster
    }
    // Eğer admin onayı verildiyse ve stajyer/firma personel ise, firma havuzuna ekle
    if (new_status === 'admin_approved') {
      const { data: application } = await supabase
        .from('career_applications')
        .select('application_type')
        .eq('id', id)
        .single();
      if (
        application &&
        ['intern', 'hr_staff'].includes(application.application_type)
      ) {
        // Tüm firmalara havuzda göster
        const { data: companies } = await supabase
          .from('companies')
          .select('id');
        if (companies && companies.length > 0) {
          const poolEntries = companies.map(company => ({
            application_id: id,
            company_id: company.id,
            status: 'available',
          }));
          await supabase.from('hr_pool').insert(poolEntries);
        }
      }
    }
    return NextResponse.json({
      success: true,
      message: 'Başvuru durumu güncellendi',
      previous_status,
      new_status,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
