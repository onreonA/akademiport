// =====================================================
// ADMIN USER TEST SCRIPT
// =====================================================
// Bu script admin kullanıcısının varlığını test eder

const { createClient } = require('@supabase/supabase-js');

// Supabase bağlantı bilgileri
const supabaseUrl = 'https://frylotuwbjhqybcxvvzs.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWxvdHV3YmpocXliY3h2dnpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3ODE4OCwiZXhwIjoyMDcxMjU0MTg4fQ.kvHMECvHePaa07whhElHb11tFArkv85UwAGNPZ3qGNY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminUser() {
  try {
    console.log('🔍 Admin kullanıcısını test ediyoruz...');

    // 1. public.users tablosundan admin kullanıcısını bul
    console.log('1️⃣ public.users tablosundan admin kullanıcısını arıyoruz...');
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@ihracatakademi.com')
      .single();

    if (adminError) {
      console.error('❌ Admin kullanıcısı bulunamadı:', adminError);
      return;
    }

    console.log('✅ Admin kullanıcısı bulundu:', {
      email: adminUser.email,
      role: adminUser.role,
      hasPasswordHash: !!adminUser.password_hash,
      passwordHashLength: adminUser.password_hash?.length || 0,
    });

    // 2. Şifre hash'ini test et
    console.log('2️⃣ Şifre hash testi yapıyoruz...');
    const bcrypt = require('bcryptjs');

    const testPassword = '123456';
    const isPasswordValid = await bcrypt.compare(
      testPassword,
      adminUser.password_hash
    );

    console.log('🔐 Şifre testi sonucu:', {
      testPassword,
      isPasswordValid,
      storedHash: adminUser.password_hash,
    });

    // 3. AuthService'in kullandığı sorguyu test et
    console.log('3️⃣ AuthService sorgusunu test ediyoruz...');
    const { data: authServiceResult, error: authServiceError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@ihracatakademi.com')
      .single();

    console.log('🔧 AuthService sorgu sonucu:', {
      found: !!authServiceResult,
      error: authServiceError?.message || 'Yok',
      hasPasswordHash: !!authServiceResult?.password_hash,
    });

    console.log('🎉 Test tamamlandı!');
  } catch (error) {
    console.error('❌ Test hatası:', error);
  }
}

// Script'i çalıştır
testAdminUser();
