import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const supabase = createClient();
    const body = await request.json();
    const { companyIds } = body;
    if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
      return NextResponse.json(
        { error: 'En az bir firma seçilmelidir' },
        { status: 400 }
      );
    }
    // Alt projenin var olup olmadığını kontrol et
    const { data: subProject, error: subProjectError } = await supabase
      .from('sub_projects')
      .select('id, name')
      .eq('id', resolvedParams.id)
      .single();
    if (subProjectError || !subProject) {
      return NextResponse.json(
        { error: 'Alt proje bulunamadı' },
        { status: 404 }
      );
    }
    // Mevcut atamaları kontrol et
    const { data: existingAssignments, error: existingError } = await supabase
      .from('company_projects')
      .select('company_id')
      .eq('sub_project_id', resolvedParams.id);
    if (existingError) {
      return NextResponse.json(
        { error: 'Firma atama işlemi başarısız' },
        { status: 500 }
      );
    }
    const existingCompanyIds =
      existingAssignments?.map(a => a.company_id) || [];
    const newCompanyIds = companyIds.filter(
      id => !existingCompanyIds.includes(id)
    );
    if (newCompanyIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Tüm firmalar zaten atanmış',
        assignedCount: 0,
      });
    }
    // Yeni atamaları ekle
    const assignmentsToInsert = newCompanyIds.map(companyId => ({
      company_id: companyId,
      sub_project_id: resolvedParams.id,
      status: 'Planlandı',
      assigned_at: new Date().toISOString(),
    }));
    const { data: insertedAssignments, error: insertError } = await supabase
      .from('company_projects')
      .insert(assignmentsToInsert).select(`
        id,
        company_id,
        project_id,
        assigned_at,
        status,
        companies (
          id,
          name,
          email,
          status
        )
      `);
    if (insertError) {
      return NextResponse.json(
        { error: 'Firma atama işlemi başarısız' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: `${insertedAssignments.length} firma başarıyla atandı`,
      assignedCount: insertedAssignments.length,
      assignedCompanies: insertedAssignments,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Firma atama işlemi başarısız' },
      { status: 500 }
    );
  }
}
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const supabase = createClient();
    // Alt projeye atanmış firmaları getir
    const { data: assignments, error } = await supabase
      .from('company_projects')
      .select(
        `
        id,
        company_id,
        sub_project_id,
        assigned_at,
        status,
        companies (
          id,
          name,
          email,
          status
        )
      `
      )
      .eq('sub_project_id', resolvedParams.id);
    if (error) {
      return NextResponse.json(
        { error: 'Atanmış firmalar getirilemedi' },
        { status: 500 }
      );
    }
    const formattedAssignments =
      assignments?.map(assignment => ({
        id: assignment.id,
        companyId: assignment.company_id,
        subProjectId: assignment.sub_project_id,
        assignedAt: assignment.assigned_at,
        status: assignment.status,
        company: assignment.companies,
      })) || [];
    return NextResponse.json({
      success: true,
      assignments: formattedAssignments,
      total: formattedAssignments.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Atanmış firmalar getirilemedi' },
      { status: 500 }
    );
  }
}
