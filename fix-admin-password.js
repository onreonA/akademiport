// =====================================================
// ADMIN PASSWORD FIX SCRIPT
// =====================================================
// Bu script admin kullanıcısı için doğru şifre hash'ini oluşturur

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Supabase bağlantı bilgileri
const supabaseUrl = 'https://frylotuwbjhqybcxvvzs.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWxvdHV3YmpocXliY3h2dnpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3ODE4OCwiZXhwIjoyMDcxMjU0MTg4fQ.kvHMECvHePaa07whhElHb11tFArkv85UwAGNPZ3qGNY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAdminPassword() {
  try {
    console.log('🔧 Admin şifresini düzeltiyoruz...');

    // 1. Yeni şifre hash'i oluştur
    const newPassword = '123456';
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    console.log("🔐 Yeni şifre hash'i oluşturuldu:", newPasswordHash);

    // 2. Test et
    const testResult = await bcrypt.compare(newPassword, newPasswordHash);
    console.log('✅ Hash testi:', testResult ? 'BAŞARILI' : 'BAŞARISIZ');

    // 3. Admin kullanıcısının şifresini güncelle
    console.log('3️⃣ Admin kullanıcısının şifresini güncelliyoruz...');
    const { data: updateResult, error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('email', 'admin@ihracatakademi.com')
      .select();

    if (updateError) {
      console.error('❌ Şifre güncellenemedi:', updateError);
      return;
    }

    console.log('✅ Admin şifresi güncellendi:', updateResult);

    // 4. Final test
    console.log('4️⃣ Final test yapıyoruz...');
    const { data: finalTest, error: finalError } = await supabase
      .from('users')
      .select('email, password_hash')
      .eq('email', 'admin@ihracatakademi.com')
      .single();

    if (finalError) {
      console.error('❌ Final test başarısız:', finalError);
      return;
    }

    const finalPasswordTest = await bcrypt.compare(
      '123456',
      finalTest.password_hash
    );
    console.log(
      '🎯 Final şifre testi:',
      finalPasswordTest ? 'BAŞARILI' : 'BAŞARISIZ'
    );

    console.log('🎉 Admin şifresi başarıyla düzeltildi!');
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

// Script'i çalıştır
fixAdminPassword();
