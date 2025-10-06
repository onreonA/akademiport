// =====================================================
// ADMIN PASSWORD HASH FIX - JavaScript Version
// =====================================================
// Bu script admin kullanıcısını public.users tablosuna ekler

const { createClient } = require('@supabase/supabase-js');

// Supabase bağlantı bilgileri
const supabaseUrl = 'https://frylotuwbjhqybcxvvzs.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWxvdHV3YmpocXliY3h2dnpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3ODE4OCwiZXhwIjoyMDcxMjU0MTg4fQ.kvHMECvHePaa07whhElHb11tFArkv85UwAGNPZ3qGNY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addAdminToPublicUsers() {
  try {
    console.log('🔧 Admin kullanıcısını public.users tablosuna ekliyoruz...');

    // 1. public.users tablosuna password_hash alanı ekle
    console.log('1️⃣ password_hash alanını ekliyoruz...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);',
    });

    if (alterError) {
      console.log(
        '⚠️ password_hash alanı zaten var veya eklenemedi:',
        alterError.message
      );
    } else {
      console.log('✅ password_hash alanı eklendi');
    }

    // 2. admin@ihracatakademi.com kullanıcısını ekle
    console.log('2️⃣ admin@ihracatakademi.com kullanıcısını ekliyoruz...');
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .upsert(
        {
          email: 'admin@ihracatakademi.com',
          full_name: 'Admin User',
          role: 'admin',
          password_hash:
            '$2a$10$u6n4ZB7kOMZ/8D97OrJlMu7kY5W2xh/Wqvym0A65GASomiG.O4dli',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'email',
        }
      )
      .select();

    if (adminError) {
      console.error('❌ Admin kullanıcısı eklenemedi:', adminError);
      return;
    }

    console.log('✅ Admin kullanıcısı eklendi:', adminData);

    // 3. Zarife hocam için de ekle
    console.log(
      '3️⃣ zarife.yilmaz@ihracatakademiiii.com kullanıcısını ekliyoruz...'
    );
    const { data: zarifeData, error: zarifeError } = await supabase
      .from('users')
      .upsert(
        {
          email: 'zarife.yilmaz@ihracatakademiiii.com',
          full_name: 'Zarife Hocam',
          role: 'consultant',
          password_hash:
            '$2a$10$NURbOcPCLvABx.tTgUJBy.zLQi1y9/de2yz6uNppQr8bJatJn8KPS',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'email',
        }
      )
      .select();

    if (zarifeError) {
      console.error('❌ Zarife kullanıcısı eklenemedi:', zarifeError);
    } else {
      console.log('✅ Zarife kullanıcısı eklendi:', zarifeData);
    }

    // 4. Kontrol sorgusu
    console.log('4️⃣ Tüm kullanıcıları kontrol ediyoruz...');
    const { data: allUsers, error: selectError } = await supabase
      .from('users')
      .select('email, full_name, role, password_hash, created_at')
      .order('created_at', { ascending: false });

    if (selectError) {
      console.error('❌ Kullanıcılar listelenemedi:', selectError);
    } else {
      console.log('📋 Tüm kullanıcılar:');
      allUsers.forEach(user => {
        console.log(
          `  - ${user.email} (${user.role}) - ${user.password_hash ? 'Hash var' : 'Hash yok'}`
        );
      });
    }

    console.log('🎉 İşlem tamamlandı!');
  } catch (error) {
    console.error('❌ Genel hata:', error);
  }
}

// Script'i çalıştır
addAdminToPublicUsers();
