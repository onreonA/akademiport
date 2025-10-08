import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { document_id, company_id } = body;

    if (!document_id || !company_id) {
      return NextResponse.json(
        { success: false, error: 'Döküman ID ve Firma ID gerekli' },
        { status: 400 }
      );
    }

    // Remove assignment
    const { error } = await supabase
      .from('company_document_assignments')
      .delete()
      .eq('document_id', document_id)
      .eq('company_id', company_id);

    if (error) {
      console.error('Assignment removal error:', error);
      return NextResponse.json(
        { success: false, error: 'Atama kaldırma işlemi başarısız' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Atama başarıyla kaldırıldı',
    });
  } catch (error) {
    console.error('Remove assignment API error:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
