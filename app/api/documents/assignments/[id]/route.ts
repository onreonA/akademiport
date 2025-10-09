import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userEmail = request.headers.get('X-User-Email');

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı e-postası gerekli' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const isAdmin = userEmail === 'admin@ihracatakademi.com';

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Atama ID gerekli' },
        { status: 400 }
      );
    }

    // Delete the assignment
    const { error } = await supabase
      .from('company_document_assignments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Assignment delete error:', error);
      return NextResponse.json(
        { success: false, error: 'Atama kaldırılırken hata oluştu' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Atama başarıyla kaldırıldı',
    });
  } catch (error) {
    console.error('Assignment delete API error:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
