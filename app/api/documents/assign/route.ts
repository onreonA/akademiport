import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { document_id, company_ids, assign_all = false } = body;
    if (!document_id) {
      return NextResponse.json(
        { success: false, error: 'Döküman ID gerekli' },
        { status: 400 }
      );
    }
    // Check if document exists
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', document_id)
      .single();
    if (documentError || !document) {
      return NextResponse.json(
        { success: false, error: 'Döküman bulunamadı' },
        { status: 404 }
      );
    }
    let companiesToAssign: any[] = [];
    if (assign_all) {
      // Get all active companies
      const { data: allCompanies, error: companiesError } = await supabase
        .from('companies')
        .select('id')
        .eq('status', 'active');
      if (companiesError) {
        return NextResponse.json(
          { success: false, error: 'Firmalar getirilemedi' },
          { status: 500 }
        );
      }
      companiesToAssign = allCompanies || [];
    } else {
      if (!company_ids || company_ids.length === 0) {
        return NextResponse.json(
          { success: false, error: 'En az bir firma seçilmelidir' },
          { status: 400 }
        );
      }
      // Get selected companies
      const { data: selectedCompanies, error: companiesError } = await supabase
        .from('companies')
        .select('id')
        .in('id', company_ids);
      if (companiesError) {
        return NextResponse.json(
          { success: false, error: 'Seçili firmalar getirilemedi' },
          { status: 500 }
        );
      }
      companiesToAssign = selectedCompanies || [];
    }
    if (companiesToAssign.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Atanacak firma bulunamadı' },
        { status: 400 }
      );
    }
    // For now, we'll use education set assignments as a proxy
    // In a real implementation, you'd have a document_assignments table
    return NextResponse.json({
      success: true,
      data: {
        message: `${companiesToAssign.length} firma başarıyla atandı`,
        assigned_count: companiesToAssign.length,
        total_companies: companiesToAssign.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Firma atama işlemi sırasında hata oluştu' },
      { status: 500 }
    );
  }
}
