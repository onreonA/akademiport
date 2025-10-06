#!/usr/bin/env node

/**
 * 🔍 Authentication Debug Script
 * Database'deki gerçek role'leri ve user'ları kontrol eder
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function debugAuthentication() {
  console.log('🔍 Authentication Debug Başlatılıyor...\n');

  try {
    // 1. Companies tablosundaki user'ları kontrol et
    console.log('📊 1. COMPANIES TABLOSU:');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, email, role')
      .limit(10);

    if (companiesError) {
      console.error('❌ Companies error:', companiesError);
    } else {
      console.log('✅ Companies:', companies);
    }

    // 2. Company_users tablosundaki user'ları kontrol et
    console.log('\n📊 2. COMPANY_USERS TABLOSU:');
    const { data: companyUsers, error: companyUsersError } = await supabase
      .from('company_users')
      .select('id, email, role, company_id')
      .limit(10);

    if (companyUsersError) {
      console.error('❌ Company users error:', companyUsersError);
    } else {
      console.log('✅ Company users:', companyUsers);
    }

    // 3. Users tablosundaki user'ları kontrol et
    console.log('\n📊 3. USERS TABLOSU:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(10);

    if (usersError) {
      console.error('❌ Users error:', usersError);
    } else {
      console.log('✅ Users:', users);
    }

    // 4. Test user'ları kontrol et
    console.log("\n🔍 4. TEST USER'LAR:");
    const testEmails = [
      'admin@ihracatakademi.com',
      'info@mundo.com',
      'sarmobi@test.com',
      'sahbaz@test.com',
    ];

    for (const email of testEmails) {
      console.log(`\n📧 ${email}:`);

      // Companies tablosunda ara
      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name, email, role')
        .eq('email', email)
        .single();

      if (companyData) {
        console.log('  ✅ Companies tablosunda:', companyData);
      }

      // Company_users tablosunda ara
      const { data: companyUserData } = await supabase
        .from('company_users')
        .select('id, email, role, company_id')
        .eq('email', email)
        .single();

      if (companyUserData) {
        console.log('  ✅ Company_users tablosunda:', companyUserData);
      }

      // Users tablosunda ara
      const { data: userData } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('email', email)
        .single();

      if (userData) {
        console.log('  ✅ Users tablosunda:', userData);
      }
    }

    // 5. Role enum'larını kontrol et
    console.log("\n📊 5. ROLE ENUM'LARI:");
    console.log('✅ Manual role check: admin, firma, danışman, master_admin');
  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
}

// Script'i çalıştır
debugAuthentication();
