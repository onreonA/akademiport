import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// GET /api/companies/[id] - Get single company details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;
    // Get company with consultant assignments
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(
        `
        id,
        name,
        description,
        logo_url,
        website,
        phone,
        address,
        city,
        country,
        industry,
        size,
        status,
        email,
        created_at,
        updated_at,
        consultant_assignments (
          id,
          consultant_id,
          assigned_at,
          status,
          notes,
          users!consultant_assignments_consultant_id_fkey (
            id,
            full_name,
            email
          )
        )
      `
      )
      .eq('id', id)
      .single();
    if (companyError) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    // Get all tab data in parallel
    const [
      { data: generalInfo },
      { data: markets },
      { data: products },
      { data: competitors },
      { data: production },
      { data: digital },
      { data: sales },
      { data: content },
      { data: certification },
      { data: activityHistory },
    ] = await Promise.all([
      supabase
        .from('company_general_info')
        .select('*')
        .eq('company_id', id)
        .single(),
      supabase
        .from('company_markets')
        .select('*')
        .eq('company_id', id)
        .single(),
      supabase
        .from('company_products')
        .select('*')
        .eq('company_id', id)
        .single(),
      supabase
        .from('company_competitors')
        .select('*')
        .eq('company_id', id)
        .single(),
      supabase
        .from('company_production')
        .select('*')
        .eq('company_id', id)
        .single(),
      supabase
        .from('company_digital')
        .select('*')
        .eq('company_id', id)
        .single(),
      supabase.from('company_sales').select('*').eq('company_id', id).single(),
      supabase
        .from('company_content')
        .select('*')
        .eq('company_id', id)
        .single(),
      supabase
        .from('company_certification')
        .select('*')
        .eq('company_id', id)
        .single(),
      supabase
        .from('company_activity_history')
        .select('*')
        .eq('company_id', id)
        .order('created_at', { ascending: false }),
    ]);
    // Debug: List all company_general_info records to find the correct company_id
    const { data: allGeneralInfo, error: allGeneralInfoError } = await supabase
      .from('company_general_info')
      .select('*');
    // Transform data to match frontend expectations
    const assignedConsultant = company.consultant_assignments?.[0];
    const transformedCompany = {
      id: company.id,
      name: company.name,
      subBrand: company.description
        ? company.description.substring(0, 50) + '...'
        : undefined,
      authorizedPerson:
        assignedConsultant?.users?.[0]?.full_name || 'Atanmamış',
      sector: company.industry || 'Belirtilmemiş',
      lastUpdate: company.updated_at,
      projectStatus: getProjectStatus(company.status),
      consultant: assignedConsultant?.users?.[0]?.full_name || 'Atanmamış',
      phone: company.phone || 'Belirtilmemiş',
      email: company.email || 'Belirtilmemiş',
      city: company.city || 'Belirtilmemiş',
      registrationStatus: getRegistrationStatus(company.status),
      dysRecord: false, // TODO: Add DYS field to companies table
      educationStatus: 'İzlenmeye Başlanmadı', // TODO: Add education status
      progressPercentage: getProgressPercentage(company.status),
      notes: assignedConsultant?.notes || undefined,
      // Additional fields for detail view
      description: company.description,
      website: company.website,
      address: company.address,
      country: company.country,
      size: company.size,
      status: company.status,
      created_at: company.created_at,
      consultant_assignments: company.consultant_assignments,
      // Tab data
      generalInfo: generalInfo || {
        company_name: company.name || '',
        authorized_person:
          generalInfo?.authorized_person ||
          assignedConsultant?.users?.[0]?.full_name ||
          '',
        email: generalInfo?.email || company.email || '',
        phone: generalInfo?.phone || company.phone || '',
        sector: generalInfo?.sector || company.industry || '',
        city: generalInfo?.city || company.city || '',
        address: generalInfo?.address || company.address || '',
        website: generalInfo?.website || company.website || '',
        founded_year: generalInfo?.founded_year || '',
        employee_count: generalInfo?.employee_count || '',
        tax_number: generalInfo?.tax_number || '',
        legal_structure: generalInfo?.legal_structure || 'Anonim Şirket',
        capital: generalInfo?.capital || '500000',
        description: generalInfo?.description || company.description || '',
      },
      markets: markets || {},
      products: products || {},
      competitors: competitors || {},
      production: production || {},
      digital: digital || {},
      sales: sales || {},
      content: content || {},
      certification: certification || {},
      activityHistory: activityHistory || [],
    };
    return NextResponse.json({ company: transformedCompany });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// PUT /api/companies/[id] - Update company
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;
    const body = await request.json();
    // Update company data
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .update({
        name: body.name,
        description: body.description,
        website: body.website,
        phone: body.phone,
        address: body.address,
        city: body.city,
        industry: body.sector,
        email: body.email,
        ...(body.status && { status: body.status }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (companyError) {
      return NextResponse.json(
        { error: companyError.message },
        { status: 400 }
      );
    }
    return NextResponse.json({
      message: 'Company updated successfully',
      company,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// DELETE /api/companies/[id] - Delete company
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;

    // 🛡️ SECURITY: Check admin authentication
    const userEmail = request.headers.get('X-User-Email');
    if (!userEmail || userEmail !== 'admin@ihracatakademi.com') {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    // 🛡️ SECURITY: Verify company exists before deletion
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', id)
      .single();

    if (!existingCompany) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // First, delete consultant assignments
    const { error: assignmentError } = await supabase
      .from('consultant_assignments')
      .delete()
      .eq('company_id', id);
    if (assignmentError) {
      return NextResponse.json(
        { error: assignmentError.message },
        { status: 400 }
      );
    }
    // Then, delete the company
    const { error: companyError } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);
    if (companyError) {
      return NextResponse.json(
        { error: companyError.message },
        { status: 400 }
      );
    }
    return NextResponse.json({
      message: 'Company deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// Helper functions
function getProjectStatus(
  status: string
): 'Başlangıç' | 'Gelişim' | 'İleri' | 'Tamamlanmış' {
  switch (status) {
    case 'pending':
      return 'Başlangıç';
    case 'active':
      return 'Gelişim';
    default:
      return 'Başlangıç';
  }
}
function getRegistrationStatus(
  status: string
): 'Tamamlanmadı' | 'İncelemede' | 'Tamamlandı' {
  switch (status) {
    case 'pending':
      return 'Tamamlanmadı';
    case 'active':
      return 'Tamamlandı';
    default:
      return 'İncelemede';
  }
}
function getProgressPercentage(status: string): number {
  switch (status) {
    case 'pending':
      return 25;
    case 'active':
      return 75;
    default:
      return 50;
  }
}
