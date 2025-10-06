import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

import { cacheKeys, cacheUtils } from '@/lib/cache/redis-cache';
import { createClient } from '@/lib/supabase/server';
// Firmaları getir
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userEmail = request.cookies.get('auth-user-email')?.value;
    const userRole = request.cookies.get('auth-user-role')?.value;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }
    // OPTIMIZED: Check cache first
    const cacheKey = cacheKeys.companies({
      status,
      limit,
      offset,
      search: searchParams.get('search'),
    });
    const cachedData = cacheUtils.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
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
        company_users(
          id,
          role,
          status
        )
      `
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
    // Role-based filtering
    if (userRole !== 'admin' && userRole !== 'master_admin') {
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
        user_role:
          company.company_users?.[0]?.role === 'admin'
            ? 'firma_admin'
            : company.company_users?.[0]?.role === 'operator'
              ? 'firma_kullanıcı'
              : company.company_users?.[0]?.role,
        user_status: company.company_users?.[0]?.status,
      })) || [];
    const response = {
      success: true,
      companies: transformedCompanies,
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    };
    // Cache the response
    cacheUtils.set(cacheKey, response, 2 * 60 * 1000); // 2 minutes cache
    return NextResponse.json(response);
  } catch (error) {
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
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 400 }
      );
    }
    // Kullanıcı yetkisini kontrol et
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', userEmail)
      .single();
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Sadece adminler firma oluşturabilir
    if (user.role !== 'admin' && user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
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
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
