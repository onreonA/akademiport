// =====================================================
// MUNDO FİRMASI TEST SCRIPT
// =====================================================
// Bu script info@mundo.com kullanıcısını test eder

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Supabase bağlantı bilgileri
const supabaseUrl = 'https://frylotuwbjhqybcxvvzs.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWxvdHV3YmpocXliY3h2dnpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3ODE4OCwiZXhwIjoyMDcxMjU0MTg4fQ.kvHMECvHePaa07whhElHb11tFArkv85UwAGNPZ3qGNY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMundoUser() {
  try {
    console.log('🔍 Mundo firması kullanıcısını test ediyoruz...');

    // 1. company_users tablosundan kontrol et
    console.log(
      '1️⃣ company_users tablosundan info@mundo.com kullanıcısını arıyoruz...'
    );
    const { data: companyUser, error: companyError } = await supabase
      .from('company_users')
      .select('*')
      .eq('email', 'info@mundo.com')
      .single();

    if (companyError) {
      console.error('❌ Company user bulunamadı:', companyError);
    } else {
      console.log('✅ Company user bulundu:', {
        email: companyUser.email,
        name: companyUser.name,
        role: companyUser.role,
        company_id: companyUser.company_id,
        hasPasswordHash: !!companyUser.password_hash,
        passwordHashLength: companyUser.password_hash?.length || 0,
      });
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
        .select('*')
        .eq('id', companyUser.company_id)
        .single();

      if (companyInfoError) {
        console.error('❌ Firma bilgileri bulunamadı:', companyInfoError);
      } else {
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
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'info@mundo.com')
      .single();

    if (publicError) {
      console.log('ℹ️ public.users tablosunda yok (normal)');
    } else {
      console.log('⚠️ public.users tablosunda da var:', {
        email: publicUser.email,
        role: publicUser.role,
        hasPasswordHash: !!publicUser.password_hash,
      });
    }

    // 5. AuthService'in kullandığı sorguyu test et
    console.log('5️⃣ AuthService sorgusunu test ediyoruz...');
    const { data: authServiceResult, error: authServiceError } = await supabase
      .from('company_users')
      .select('*')
      .eq('email', 'info@mundo.com')
      .single();

    console.log('🔧 AuthService sorgu sonucu:', {
      found: !!authServiceResult,
      error: authServiceError?.message || 'Yok',
      hasPasswordHash: !!authServiceResult?.password_hash,
    });

    console.log('🎉 Mundo kullanıcısı testi tamamlandı!');
  } catch (error) {
    console.error('❌ Test hatası:', error);
  }
}

// Script'i çalıştır
testMundoUser();
