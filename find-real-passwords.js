#!/usr/bin/env node

/**
 * 🔍 GERÇEK ŞİFRELERİ BULMA SCRIPT'İ
 *
 * Bu script veritabanından gerçek şifreleri bulur
 */

const https = require('https');

// Supabase bağlantı bilgileri
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://frylotuwbjhqybcxvvzs.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWxvdHV3YmpocXliY3h2dnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NzgxODgsImV4cCI6MjA3MTI1NDE4OH0.sz1HL_Amw4ndS0czezgYzYnpHnGjC02wjRbhSLSiPdc';

function makeSupabaseRequest(table, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);

    // Query parametrelerini ekle
    if (options.select) {
      url.searchParams.append('select', options.select);
    }
    if (options.eq) {
      Object.entries(options.eq).forEach(([key, value]) => {
        url.searchParams.append(key, `eq.${value}`);
      });
    }

    const requestOptions = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'PasswordFinder/1.0',
      },
    };

    const req = https.request(requestOptions, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const parsedData = data ? JSON.parse(data) : [];
          resolve({
            status: res.statusCode,
            data: parsedData,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: null,
            raw: data,
          });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function findRealPasswords() {
  console.log('🔍 GERÇEK ŞİFRELERİ BULMA BAŞLIYOR...');
  console.log('=====================================');

  // 1. Users tablosundan şifre hash'lerini al
  console.log('\n👤 1. USERS TABLOSU ŞİFRELERİ');
  try {
    const response = await makeSupabaseRequest('users', {
      select: 'id,email,full_name,role,password_hash,created_at',
    });

    if (response.status === 200) {
      console.log(
        `✅ Users tablosu erişilebilir - ${response.data.length} kullanıcı bulundu`
      );

      if (response.data.length > 0) {
        console.log('\n📋 Kullanıcı Şifre Bilgileri:');
        response.data.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} (${user.full_name})`);
          console.log(`      Role: ${user.role}`);
          console.log(
            `      Password Hash: ${user.password_hash ? 'Mevcut' : 'Yok'}`
          );
          if (user.password_hash) {
            console.log(
              `      Hash: ${user.password_hash.substring(0, 20)}...`
            );
          }
          console.log('');
        });
      } else {
        console.log('⚠️  Users tablosu boş');
      }
    } else {
      console.log(`❌ Users tablosu hatası: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Users tablosu hatası: ${error.message}`);
  }

  // 2. Company_users tablosundan şifre hash'lerini al
  console.log('\n🏢 2. COMPANY_USERS TABLOSU ŞİFRELERİ');
  try {
    const response = await makeSupabaseRequest('company_users', {
      select: 'id,email,full_name,role,password_hash,created_at',
    });

    if (response.status === 200) {
      console.log(
        `✅ Company_users tablosu erişilebilir - ${response.data.length} kullanıcı bulundu`
      );

      if (response.data.length > 0) {
        console.log('\n📋 Firma Kullanıcı Şifre Bilgileri:');
        response.data.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} (${user.full_name})`);
          console.log(`      Role: ${user.role}`);
          console.log(
            `      Password Hash: ${user.password_hash ? 'Mevcut' : 'Yok'}`
          );
          if (user.password_hash) {
            console.log(
              `      Hash: ${user.password_hash.substring(0, 20)}...`
            );
          }
          console.log('');
        });
      } else {
        console.log('⚠️  Company_users tablosu boş');
      }
    } else {
      console.log(`❌ Company_users tablosu hatası: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Company_users tablosu hatası: ${error.message}`);
  }

  // 3. Test kullanıcıları için özel kontrol
  console.log('\n🧪 3. TEST KULLANICILARI ÖZEL KONTROL');
  const testEmails = [
    'admin@ihracatakademi.com',
    'info@sarmobi.com',
    'info@sahbaz.com',
  ];

  for (const email of testEmails) {
    console.log(`\n📧 ${email}:`);

    try {
      // Users tablosunda ara
      const userResponse = await makeSupabaseRequest('users', {
        select: 'id,email,full_name,role,password_hash',
        eq: { email: email },
      });

      if (userResponse.status === 200 && userResponse.data.length > 0) {
        const user = userResponse.data[0];
        console.log(`   ✅ Users tablosunda bulundu:`);
        console.log(`      Name: ${user.full_name}`);
        console.log(`      Role: ${user.role}`);
        console.log(
          `      Password Hash: ${user.password_hash ? 'Mevcut' : 'Yok'}`
        );
        if (user.password_hash) {
          console.log(`      Hash: ${user.password_hash.substring(0, 30)}...`);
        }
      } else {
        console.log(`   ❌ Users tablosunda bulunamadı`);
      }

      // Company_users tablosunda ara
      const companyUserResponse = await makeSupabaseRequest('company_users', {
        select: 'id,email,full_name,role,password_hash',
        eq: { email: email },
      });

      if (
        companyUserResponse.status === 200 &&
        companyUserResponse.data.length > 0
      ) {
        const user = companyUserResponse.data[0];
        console.log(`   ✅ Company_users tablosunda bulundu:`);
        console.log(`      Name: ${user.full_name}`);
        console.log(`      Role: ${user.role}`);
        console.log(
          `      Password Hash: ${user.password_hash ? 'Mevcut' : 'Yok'}`
        );
        if (user.password_hash) {
          console.log(`      Hash: ${user.password_hash.substring(0, 30)}...`);
        }
      } else {
        console.log(`   ❌ Company_users tablosunda bulunamadı`);
      }
    } catch (error) {
      console.log(`   ❌ Hata: ${error.message}`);
    }
  }

  console.log('\n💡 ÖNERİLER:');
  console.log("1. Eğer password_hash yoksa, şifre oluşturma API'sini kullanın");
  console.log("2. Eğer password_hash varsa, bcrypt ile hash'lenmiş şifre var");
  console.log('3. Test için yeni şifre oluşturun veya mevcut şifreyi kullanın');

  console.log('\n✨ Şifre analizi tamamlandı!');
}

// Script'i çalıştır
if (require.main === module) {
  findRealPasswords().catch(console.error);
}

module.exports = { findRealPasswords };
