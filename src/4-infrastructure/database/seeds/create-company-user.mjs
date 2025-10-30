/**
 * Create Company User via Supabase Client
 * Sprint 7.5: Company User Management
 *
 * Terminal'den çalıştır: node src/4-infrastructure/database/seeds/create-company-user.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, '../../../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY bulunamadı!');
  console.error('Supabase URL:', supabaseUrl ? '✅' : '❌');
  console.error('Service Key:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const companyId = 'e5f76e70-ecc9-4005-8819-2bb2c118f8a5';
const email = 'firma@test.com';
const password = 'Test123!';
const fullName = 'Test Firma Kullanıcısı';

async function createCompanyUser() {
  try {
    console.log('🚀 Creating company user...');
    console.log('📧 Email:', email);
    console.log('🔐 Password:', password);

    // 1. Önce varsa sil
    console.log('\n🗑️  Deleting existing user if exists...');
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === email);

    if (existingUser) {
      console.log('Found existing user, deleting...');
      await supabase.auth.admin.deleteUser(existingUser.id);
      await supabase.from('users').delete().eq('email', email);
      console.log('✅ Deleted existing user');
    }

    // 2. Auth kullanıcısı oluştur (SERVICE ROLE KEY ile)
    console.log('\n👤 Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Email'i otomatik onayla
      user_metadata: {
        full_name: fullName,
      },
    });

    if (authError) {
      console.error('❌ Auth user creation failed:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Auth user not created');
    }

    console.log('✅ Auth user created:', authData.user.id);

    // 3. Public users tablosuna ekle
    console.log('\n📝 Creating public user record...');
    const { error: insertError } = await supabase.from('users').insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      phone: '+90 555 123 4567',
      role: 'company_user',
      company_id: companyId,
      is_active: true,
      is_email_verified: true,
    });

    if (insertError) {
      console.error('❌ Public user creation failed:', insertError);
      throw insertError;
    }

    console.log('✅ Public user created');

    // 4. Firma'nın current_users sayısını güncelle
    console.log('\n📊 Updating company user count...');
    const { data: companyData } = await supabase
      .from('users')
      .select('id')
      .eq('company_id', companyId)
      .eq('role', 'company_user')
      .eq('is_active', true);

    await supabase
      .from('companies')
      .update({
        current_users: companyData?.length || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId);

    console.log('✅ Company user count updated');

    // 5. Doğrulama
    console.log('\n🔍 Verifying user...');
    const { data: userData } = await supabase
      .from('users')
      .select('*, companies(name)')
      .eq('email', email)
      .single();

    console.log('\n✅ SUCCESS! User created:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ID:', userData?.id);
    console.log('Email:', userData?.email);
    console.log('Full Name:', userData?.full_name);
    console.log('Role:', userData?.role);
    console.log('Company:', userData?.companies?.name);
    console.log('Active:', userData?.is_active);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎉 Login credentials:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('URL: http://localhost:3000/login');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

createCompanyUser();
