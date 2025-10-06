import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// GET /api/firma/me - Get current firm's data
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    // Get user email from X-User-Email header (for custom auth)
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Find company by email
    let { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('email', userEmail)
      .single();
    // Eğer companies tablosunda bulunamazsa, company_users tablosundan ana firmayı bul
    if (companyError && companyError.code === 'PGRST116') {
      const { data: userCompanyData, error: userCompanyError } = await supabase
        .from('company_users')
        .select(
          `
          company_id,
          companies (*)
        `
        )
        .eq('email', userEmail)
        .single();
      if (userCompanyError) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }
      if (userCompanyData && userCompanyData.companies) {
        company = userCompanyData.companies;
        companyError = null;
      }
    }
    if (companyError) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    // Return company data
    return NextResponse.json({
      success: true,
      data: company,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// PUT /api/firma/me - Update current firm's data
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    // Get user from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Extract user email from token or session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Get request body
    const body = await request.json();
    // Find company by email
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('email', user.email)
      .single();
    if (companyError) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    // Update company data
    const { data: updatedCompany, error: updateError } = await supabase
      .from('companies')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', company.id)
      .select()
      .single();
    if (updateError) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
    // Return updated company data
    return NextResponse.json({
      success: true,
      data: updatedCompany,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
