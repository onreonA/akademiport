import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// GET /api/firma/me/tabs - Get all tab data for current firm
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
      .select('id')
      .eq('email', userEmail)
      .single();
    // Eğer companies tablosunda bulunamazsa, company_users tablosundan ana firmayı bul
    if (companyError && companyError.code === 'PGRST116') {
      const { data: userCompanyData, error: userCompanyError } = await supabase
        .from('company_users')
        .select(
          `
          company_id,
          companies (id)
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
        company = { id: userCompanyData.companies[0]?.id };
        companyError = null;
      }
    }
    if (companyError) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    // Get all tab data in parallel
    const [
      generalInfo,
      markets,
      products,
      competitors,
      production,
      digital,
      sales,
      content,
      certification,
      activityHistory,
    ] = await Promise.all([
      // General Info
      supabase
        .from('company_general_info')
        .select('*')
        .eq('company_id', company?.id)
        .single(),
      // Markets
      supabase
        .from('company_markets')
        .select('*')
        .eq('company_id', company?.id)
        .single(),
      // Products
      supabase
        .from('company_products')
        .select('*')
        .eq('company_id', company?.id)
        .single(),
      // Competitors
      supabase
        .from('company_competitors')
        .select('*')
        .eq('company_id', company?.id)
        .single(),
      // Production
      supabase
        .from('company_production')
        .select('*')
        .eq('company_id', company?.id)
        .single(),
      // Digital
      supabase
        .from('company_digital')
        .select('*')
        .eq('company_id', company?.id)
        .single(),
      // Sales
      supabase
        .from('company_sales')
        .select('*')
        .eq('company_id', company?.id)
        .single(),
      // Content
      supabase
        .from('company_content')
        .select('*')
        .eq('company_id', company?.id)
        .single(),
      // Certification
      supabase
        .from('company_certification')
        .select('*')
        .eq('company_id', company?.id)
        .single(),
      // Activity History
      supabase
        .from('company_activity_history')
        .select('*')
        .eq('company_id', company?.id)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);
    // Transform data to match frontend expectations
    const transformedData = {
      general: generalInfo.data || {},
      markets: markets.data || {},
      products: products.data || {},
      competitors: competitors.data || {},
      production: production.data || {},
      digital: digital.data || {},
      sales: sales.data || {},
      content: content.data || {},
      certification: certification.data || {},
      logs: activityHistory.data || [],
    };
    // Return all tab data
    return NextResponse.json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// PUT /api/firma/me/tabs - Update specific tab data
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    // Get user email from X-User-Email header (for custom auth)
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Get request body
    const body = await request.json();
    const { tab, data } = body;
    if (!tab || !data) {
      return NextResponse.json(
        { error: 'Missing tab or data' },
        { status: 400 }
      );
    }
    // Find company by email
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('email', userEmail)
      .single();
    if (companyError) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    // Map tab names to table names
    const tableMap = {
      general: 'company_general_info',
      markets: 'company_markets',
      products: 'company_products',
      competitors: 'company_competitors',
      production: 'company_production',
      digital: 'company_digital',
      sales: 'company_sales',
      content: 'company_content',
      certification: 'company_certification',
    };
    const tableName = tableMap[tab as keyof typeof tableMap];
    if (!tableName) {
      return NextResponse.json({ error: 'Invalid tab name' }, { status: 400 });
    }
    // Check if record exists
    const { data: existingRecord, error: checkError } = await supabase
      .from(tableName)
      .select('id')
      .eq('company_id', company?.id)
      .single();
    let result;
    if (checkError && checkError.code === 'PGRST116') {
      // Record doesn't exist, create new one
      result = await supabase
        .from(tableName)
        .insert({
          company_id: company?.id,
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
    } else {
      // Record exists, update it
      result = await supabase
        .from(tableName)
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('company_id', company?.id)
        .select()
        .single();
    }
    if (result.error) {
      return NextResponse.json(
        {
          error: 'Update failed',
          details: result.error.message,
          code: result.error.code,
        },
        { status: 500 }
      );
    }
    // Add activity log
    await supabase.from('company_activity_history').insert({
      company_id: company?.id,
      type: 'update',
      title: `${tab.charAt(0).toUpperCase() + tab.slice(1)} Tab'ı Güncellendi`,
      description: `${tab} tab'ındaki veriler güncellendi`,
      details: `Tab: ${tab}, Güncelleme zamanı: ${new Date().toLocaleString('tr-TR')}`,
      user_id: null, // We don't have user.id in custom auth
      created_at: new Date().toISOString(),
    });
    // Return updated data
    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
