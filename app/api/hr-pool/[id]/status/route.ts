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
    const { id } = params;
    const body = await request.json();
    const { status, notes } = body;
    // Validasyon
    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Durum belirtilmedi' },
        { status: 400 }
      );
    }
    const validStatuses = [
      'available',
      'viewed',
      'contacted',
      'hired',
      'removed',
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz durum' },
        { status: 400 }
      );
    }
    // Mevcut havuz kaydını getir
    const { data: currentPool, error: fetchError } = await supabase
      .from('hr_pool')
      .select('status, application_id')
      .eq('id', id)
      .single();
    if (fetchError || !currentPool) {
      return NextResponse.json(
        { success: false, error: 'Havuz kaydı bulunamadı' },
        { status: 404 }
      );
    }
    const previousStatus = currentPool.status;
    // Havuz durumunu güncelle
    const updateData: any = { status };
    // Duruma göre timestamp'leri güncelle
    if (status === 'viewed') {
      updateData.viewed_at = new Date().toISOString();
    } else if (status === 'contacted') {
      updateData.contacted_at = new Date().toISOString();
    } else if (status === 'hired') {
      updateData.hired_at = new Date().toISOString();
    }
    if (notes) {
      updateData.notes = notes;
    }
    const { error: updateError } = await supabase
      .from('hr_pool')
      .update(updateData)
      .eq('id', id);
    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Durum güncellenemedi' },
        { status: 500 }
      );
    }
    // Eğer işe alındı ise, başvuru durumunu da güncelle
    if (status === 'hired') {
      const { error: applicationUpdateError } = await supabase
        .from('career_applications')
        .update({ status: 'hired' })
        .eq('id', currentPool.application_id);
      if (applicationUpdateError) {
      }
    }
    return NextResponse.json({
      success: true,
      message: 'Havuz durumu güncellendi',
      previous_status: previousStatus,
      new_status: status,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
