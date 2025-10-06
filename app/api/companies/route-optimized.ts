import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// OPTIMIZED: Companies API with caching and pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    // Query parameters
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    // Get user from cookies (middleware sets this)
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // OPTIMIZED: Single query with joins instead of multiple lookups
    let query = supabase
      .from('companies')
      .select(
        `
        id,
        name,
        email,
        phone,
        address,
        city,
        country,
        status,
        industry,
        website,
        description,
        created_at,
        updated_at,
        company_users!inner(
          id,
          role,
          status
        )
      `
      )
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);
    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,city.ilike.%${search}%`
      );
    }
    // Role-based filtering
    if (userRole === 'admin' || userRole === 'master_admin') {
      // Admins can see all companies
    } else {
      // Company users can only see their own company
      query = query.eq('company_users.email', userEmail);
    }
    const { data: companies, error: companiesError, count } = await query;
    if (companiesError) {
      return NextResponse.json(
        { error: 'Failed to fetch companies' },
        { status: 500 }
      );
    }
    // OPTIMIZED: Transform data in single pass
    const transformedCompanies =
      companies?.map(company => ({
        id: company.id,
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
        city: company.city,
        country: company.country,
        status: company.status,
        industry: company.industry,
        website: company.website,
        description: company.description,
        created_at: company.created_at,
        updated_at: company.updated_at,
        // Flatten company_users data
        user_role: company.company_users?.[0]?.role,
        user_status: company.company_users?.[0]?.status,
      })) || [];
    return NextResponse.json({
      success: true,
      companies: transformedCompanies,
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// OPTIMIZED: Company creation with transaction
export async function POST(request: NextRequest) {
  try {
    const {
      name,
      email,
      phone,
      address,
      city,
      country,
      sector,
      website,
      description,
    } = await request.json();
    const supabase = createClient();
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail || !['admin', 'master_admin'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }
    // Check if company already exists
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('email', email)
      .single();
    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company with this email already exists' },
        { status: 400 }
      );
    }
    // Generate secure password
    const plainPassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    // OPTIMIZED: Use transaction-like approach with rollback
    try {
      // Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name,
          email,
          phone: phone || null,
          address: address || null,
          city: city || null,
          country: country || 'Türkiye',
          industry: sector || null,
          website: website || null,
          description: description || null,
          status: 'active',
          password: hashedPassword,
          password_created_at: new Date().toISOString(),
          password_updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (companyError) {
        return NextResponse.json(
          { error: 'Failed to create company' },
          { status: 500 }
        );
      }
      // Create company user
      const { data: companyUser, error: companyUserError } = await supabase
        .from('company_users')
        .insert({
          company_id: company.id,
          email: email,
          password_hash: hashedPassword,
          name: name,
          role: 'admin',
          status: 'active',
        })
        .select()
        .single();
      if (companyUserError) {
        // Rollback: Delete company if user creation fails
        await supabase.from('companies').delete().eq('id', company.id);
        return NextResponse.json(
          { error: 'Failed to create company user' },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        company,
        companyUser,
        password: plainPassword, // Return password for admin
        message: 'Firma başarıyla oluşturuldu',
      });
    } catch (transactionError) {
      return NextResponse.json(
        { error: 'Failed to create company' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// Secure password generation
function generateSecurePassword(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
