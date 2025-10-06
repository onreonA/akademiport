const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Supabase bağlantı bilgileri
const supabaseUrl = 'https://frylotuwbjhqybcxvvzs.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWxvdHV3YmpocXliY3h2dnpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3ODE4OCwiZXhwIjoyMDcxMjU0MTg4fQ.kvHMECvHePaa07whhElHb11tFArkv85UwAGNPZ3qGNY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSarmobiPassword() {
  try {
    console.log('🔧 Sarmobi kullanıcısının şifresini düzeltiyoruz...');

    // 1. company_users tablosundan hash'i al
    console.log('1️⃣ company_users tablosundan hash alınıyor...');
    const { data: companyUser, error: companyError } = await supabase
      .from('company_users')
      .select('password_hash')
      .eq('email', 'info@sarmobi.com')
      .single();

    if (companyError || !companyUser) {
      console.log('❌ company_users tablosunda hash bulunamadı:', companyError);
      return;
    }

    console.log('✅ company_users hash alındı:', companyUser.password_hash);

    // 2. public.users tablosuna hash'i ekle
    console.log('2️⃣ public.users tablosuna hash ekleniyor...');
    const { data, error } = await supabase
      .from('users')
      .update({
        password_hash: companyUser.password_hash,
        updated_at: new Date().toISOString(),
      })
      .eq('email', 'info@sarmobi.com')
      .select();

    if (error) {
      console.log('❌ public.users güncelleme hatası:', error);
      return;
    }

    console.log('✅ public.users güncellendi:', data);

    // 3. Final test yap
    console.log('3️⃣ Final test yapılıyor...');
    const { data: finalTest } = await supabase
      .from('users')
      .select('email, role, password_hash')
      .eq('email', 'info@sarmobi.com')
      .single();

    const finalPasswordTest = await bcrypt.compare(
      '123456',
      finalTest.password_hash
    );
    console.log(
      '🎯 Final şifre testi:',
      finalPasswordTest ? 'BAŞARILI' : 'BAŞARISIZ'
    );
    console.log('🎉 Sarmobi şifresi başarıyla düzeltildi!');
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

fixSarmobiPassword();
