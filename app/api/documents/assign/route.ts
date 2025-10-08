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

    let targetCompanyIds = company_ids || [];

    // If assign_all is true, get all active companies
    if (assign_all) {
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id')
        .eq('status', 'active');

      if (companiesError) {
        return NextResponse.json(
          { success: false, error: 'Firmalar getirilemedi' },
          { status: 500 }
        );
      }

      targetCompanyIds = companies.map(c => c.id);
    }

    if (targetCompanyIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Atanacak firma bulunamadı' },
        { status: 400 }
      );
    }

    // Create assignments
    const assignments = targetCompanyIds.map(companyId => ({
      company_id: companyId,
      document_id: document_id,
      assigned_by: null, // Admin tarafından atanıyor
      status: 'Aktif',
    }));

    const { data: insertedAssignments, error: insertError } = await supabase
      .from('company_document_assignments')
      .insert(assignments)
      .select();

    if (insertError) {
      console.error('Assignment creation error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Atama işlemi başarısız' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${insertedAssignments.length} firmaya döküman atandı`,
      data: insertedAssignments,
    });
  } catch (error) {
    console.error('Document assignment API error:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('document_id');
    const companyId = searchParams.get('company_id');

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı email'i gerekli" },
        { status: 400 }
      );
    }

    let query = supabase.from('company_document_assignments').select(`
        *,
        companies (
          id,
          name,
          industry
        ),
        documents (
          id,
          title,
          file_type
        )
      `);

    if (documentId) {
      query = query.eq('document_id', documentId);
    }

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data: assignments, error } = await query;

    if (error) {
      console.error('Assignments fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Atamalar getirilemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: assignments || [],
    });
  } catch (error) {
    console.error('Document assignments API error:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
