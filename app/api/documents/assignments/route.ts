import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
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

    // Fetch all document assignments with related data
    const { data: assignments, error } = await supabase
      .from('company_document_assignments')
      .select(
        `
        id,
        document_id,
        company_id,
        assigned_at,
        assigned_by,
        documents:document_id (
          id,
          title,
          file_type,
          status
        ),
        companies:company_id (
          id,
          name,
          email,
          status
        )
      `
      )
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('Assignments fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Atamalar yüklenirken hata oluştu' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: assignments || [],
    });
  } catch (error) {
    console.error('Assignments API error:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
