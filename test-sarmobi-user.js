const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Supabase bağlantı bilgileri
const supabaseUrl = 'https://frylotuwbjhqybcxvvzs.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWxvdHV3YmpocXliY3h2dnpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3ODE4OCwiZXhwIjoyMDcxMjU0MTg4fQ.kvHMECvHePaa07whhElHb11tFArkv85UwAGNPZ3qGNY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSarmobiUser() {
  try {
    console.log('🔍 Sarmobi firması kullanıcısını test ediyoruz...');

    // 1. company_users tablosundan info@sarmobi.com kullanıcısını ara
    console.log(
      '1️⃣ company_users tablosundan info@sarmobi.com kullanıcısını arıyoruz...'
    );
    const { data: companyUser, error: companyError } = await supabase
      .from('company_users')
      .select('*')
      .eq('email', 'info@sarmobi.com')
      .single();

    if (companyError) {
      console.log('❌ company_users tablosunda hata:', companyError);
    } else if (companyUser) {
      console.log('✅ company_users tablosunda bulundu:', {
        id: companyUser.id,
        email: companyUser.email,
        name: companyUser.name,
        role: companyUser.role,
        company_id: companyUser.company_id,
        hasPasswordHash: !!companyUser.password_hash,
        passwordHashLength: companyUser.password_hash?.length || 0,
      });
    } else {
      console.log('❌ company_users tablosunda bulunamadı');
    }

    // 2. Şifre hash'ini test et
    if (companyUser && companyUser.password_hash) {
      console.log('2️⃣ Şifre hash testi yapıyoruz...');
      const testPassword = '123456';
      const isPasswordValid = await bcrypt.compare(
        testPassword,
        companyUser.password_hash
      );

      console.log('🔐 Şifre testi sonucu:', {
        testPassword,
        isPasswordValid,
        storedHash: companyUser.password_hash,
      });
    }

    // 3. Companies tablosundan firma bilgilerini kontrol et
    if (companyUser && companyUser.company_id) {
      console.log(
        '3️⃣ Companies tablosundan firma bilgilerini kontrol ediyoruz...'
      );
      const { data: company, error: companyInfoError } = await supabase
        .from('companies')
        .select('id, name, status, created_at')
        .eq('id', companyUser.company_id)
        .single();

      if (companyInfoError) {
        console.log('❌ Companies tablosunda hata:', companyInfoError);
      } else if (company) {
        console.log('✅ Firma bilgileri:', {
          id: company.id,
          name: company.name,
          status: company.status,
          created_at: company.created_at,
        });
      }
    }

    // 4. public.users tablosunda da var mı kontrol et
    console.log('4️⃣ public.users tablosunda da var mı kontrol ediyoruz...');
    const { data: publicUser, error: publicUserError } = await supabase
      .from('users')
      .select('email, role, password_hash')
      .eq('email', 'info@sarmobi.com')
      .single();

    if (publicUserError) {
      console.log('❌ public.users tablosunda hata:', publicUserError);
    } else if (publicUser) {
      console.log('✅ public.users tablosunda bulundu:', {
        email: publicUser.email,
        role: publicUser.role,
        hasPasswordHash: !!publicUser.password_hash,
      });
    } else {
      console.log('❌ public.users tablosunda bulunamadı');
    }

    // 5. AuthService sorgusunu test et
    console.log('5️⃣ AuthService sorgusunu test ediyoruz...');
    const authService = require('./lib/auth-service.ts');
    let authServiceResult = null;
    let authServiceError = null;

    try {
      authServiceResult = await authService.signIn({
        email: 'info@sarmobi.com',
        password: '123456',
      });
    } catch (error) {
      authServiceError = error;
    }

    console.log('🔐 AuthService test sonucu:', {
      found: !!authServiceResult,
      error: authServiceError?.message || 'Yok',
      hasPasswordHash: !!authServiceResult?.password_hash,
    });

    console.log('🎉 Sarmobi kullanıcısı testi tamamlandı!');
  } catch (error) {
    console.error('❌ Test hatası:', error);
  }
}

// Script'i çalıştır
testSarmobiUser();
