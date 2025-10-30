#!/usr/bin/env node

/**
 * Create Firma User via Supabase Admin API
 *
 * Bu script Supabase Admin API kullanarak firma kullanıcısı oluşturur.
 * SQL ile password hash sorunu yaşadığımız için bu yöntemi kullanıyoruz.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Error: Missing environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createFirmaUser() {
  try {
    console.log('🚀 Creating firma user...');

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'firma@test.com',
      password: 'Test123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Firma Kullanıcı',
      },
    });

    if (authError) {
      console.error('❌ Auth error:', authError);
      process.exit(1);
    }

    console.log('✅ Auth user created:', authData.user.id);

    // 2. Insert into public.users
    const { error: insertError } = await supabase.from('users').insert({
      id: authData.user.id,
      email: 'firma@test.com',
      first_name: 'Firma',
      last_name: 'Kullanıcı',
      full_name: 'Firma Kullanıcı',
      phone: '+90 555 123 4567',
      role: 'company_user',
      company_id: 'e5f76e70-ecc9-4005-8819-2bb2c118f8a5',
      is_active: true,
      is_email_verified: true,
    });

    if (insertError) {
      console.error('❌ Insert error:', insertError);
      // Rollback: delete auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      process.exit(1);
    }

    console.log('✅ Public user created');
    console.log('\n🎉 SUCCESS! You can now login with:');
    console.log('   Email: firma@test.com');
    console.log('   Password: Test123!');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

createFirmaUser();
