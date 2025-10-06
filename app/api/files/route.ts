import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// GET /api/files - Get files with optional filters
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    // Get user email from cookies (middleware sets this)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    // Build query
    let query = supabase
      .from('files')
      .select(
        `
        id,
        name,
        file_name,
        file_url,
        file_size,
        file_type,
        upload_type,
        status,
        created_at,
        updated_at,
        company_id,
        uploaded_by,
        companies (
          id,
          name,
          email
        )
      `
      )
      .order('created_at', { ascending: false });
    // Apply filters
    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    if (type) {
      query = query.eq('upload_type', type);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    // If user is not admin, only show their company's files
    if (!['admin', 'master_admin'].includes(userRole || '')) {
      // Find user's company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('email', userEmail)
        .single();
      // If not found in companies table, check company_users table
      if (companyError && companyError.code === 'PGRST116') {
        const { data: userCompanyData, error: userCompanyError } =
          await supabase
            .from('company_users')
            .select('company_id')
            .eq('email', userEmail)
            .single();
        if (userCompanyData) {
          company = { id: userCompanyData.company_id };
        }
      }
      if (company) {
        query = query.eq('company_id', company.id);
      } else {
        // User has no company, return empty array
        return NextResponse.json({
          success: true,
          data: [],
        });
      }
    }
    const { data: files, error } = await query;
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch files' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      data: files || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
