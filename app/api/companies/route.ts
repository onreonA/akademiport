import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

import { requireAdmin, createAuthErrorResponse } from '@/lib/jwt-utils';

// Firmaları getir
export async function GET(request: NextRequest) {
  try {
    // JWT Authentication - Admin users only
    const user = await requireAdmin(request);
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    // TEMPORARY: Disable cache for testing
    // const cacheKey = cacheKeys.companies({
    //   status,
    //   limit,
    //   offset,
    //   search: searchParams.get('search'),
    // });
    // const cachedData = cacheUtils.get(cacheKey);
    // if (cachedData) {
    //   return NextResponse.json(cachedData);
    // }
    // SIMPLIFIED: Basic companies query
    let query = supabase
      .from('companies')
      .select(
        'id, name, email, phone, status, website, description, created_at, updated_at'
      )
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);
    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    const search = searchParams.get('search');
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,city.ilike.%${search}%`
      );
    }
    // TEMPORARY: Disable role-based filtering for testing
    // if (userRole !== 'admin' && userRole !== 'master_admin') {
    //   // Company users can only see their own company
    //   query = query.eq('company_users.email', userEmail);
    // }
    const { data: companies, error: companiesError, count } = await query;
    if (companiesError) {
      return NextResponse.json(
        { error: 'Failed to fetch companies' },
        { status: 500 }
      );
    }
    // SIMPLIFIED: Direct return without transformation
    const transformedCompanies = companies || [];
    const response = {
      success: true,
      companies: transformedCompanies,
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    };
    // TEMPORARY: Disable cache for testing
    // cacheUtils.set(cacheKey, response, 2 * 60 * 1000); // 2 minutes cache
    return NextResponse.json(response);
  } catch (error: any) {
    // Handle authentication errors specifically
    if (error.message === 'Authentication required' || 
        error.message === 'Admin access required') {
      return createAuthErrorResponse(error.message, 401);
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// Güvenli şifre üretme fonksiyonu
function generateSecurePassword(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
// Yeni firma oluştur
export async function POST(request: NextRequest) {
  try {
    // JWT Authentication - Only admin users can create companies
    const user = await requireAdmin(request);
    
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
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    // Gerekli alanları kontrol et
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }
    // Güvenli şifre üret
    const plainPassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    // Firma oluştur
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
    // Company_users tablosuna da ekle
    const { data: companyUser, error: companyUserError } = await supabase
      .from('company_users')
      .insert({
        company_id: company.id,
        email: email,
        password_hash: hashedPassword,
        name: name,
        role: 'firma_admin',
        status: 'active',
      })
      .select()
      .single();
    if (companyUserError) {
      // Firma oluşturuldu ama kullanıcı oluşturulamadı, firma sil
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
      password: plainPassword, // Şifreyi response'da döndür (sadece bu seferlik)
      message: 'Firma başarıyla oluşturuldu',
    });
  } catch (error: any) {
    // Handle authentication errors specifically
    if (error.message === 'Authentication required' || 
        error.message === 'Admin access required') {
      return createAuthErrorResponse(error.message, 401);
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
