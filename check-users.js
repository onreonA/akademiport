#!/usr/bin/env node

/**
 * 🔍 KULLANICI KONTROL SCRIPT'İ
 *
 * Bu script veritabanındaki kullanıcıları kontrol eder
 */

const http = require('http');
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
        'User-Agent': 'UserCheck/1.0',
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

async function checkUsers() {
  console.log('🔍 KULLANICI KONTROL BAŞLIYOR...');
  console.log('================================');

  // 1. Users tablosunu kontrol et
  console.log('\n👤 1. USERS TABLOSU');
  try {
    const response = await makeSupabaseRequest('users', {
      select: 'id,email,full_name,role,created_at',
    });

    if (response.status === 200) {
      console.log(
        `✅ Users tablosu erişilebilir - ${response.data.length} kullanıcı bulundu`
      );

      if (response.data.length > 0) {
        console.log('\n📋 Mevcut Kullanıcılar:');
        response.data.forEach((user, index) => {
          console.log(
            `   ${index + 1}. ${user.email} (${user.full_name}) - Role: ${user.role}`
          );
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

  // 2. Company_users tablosunu kontrol et
  console.log('\n🏢 2. COMPANY_USERS TABLOSU');
  try {
    const response = await makeSupabaseRequest('company_users', {
      select: 'id,email,full_name,role,company_id,created_at',
    });

    if (response.status === 200) {
      console.log(
        `✅ Company_users tablosu erişilebilir - ${response.data.length} kullanıcı bulundu`
      );

      if (response.data.length > 0) {
        console.log('\n📋 Mevcut Firma Kullanıcıları:');
        response.data.forEach((user, index) => {
          console.log(
            `   ${index + 1}. ${user.email} (${user.full_name}) - Role: ${user.role}`
          );
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

  // 3. Companies tablosunu kontrol et
  console.log('\n🏭 3. COMPANIES TABLOSU');
  try {
    const response = await makeSupabaseRequest('companies', {
      select: 'id,name,email,created_at',
    });

    if (response.status === 200) {
      console.log(
        `✅ Companies tablosu erişilebilir - ${response.data.length} firma bulundu`
      );

      if (response.data.length > 0) {
        console.log('\n📋 Mevcut Firmalar:');
        response.data.forEach((company, index) => {
          console.log(`   ${index + 1}. ${company.name} (${company.email})`);
        });
      } else {
        console.log('⚠️  Companies tablosu boş');
      }
    } else {
      console.log(`❌ Companies tablosu hatası: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Companies tablosu hatası: ${error.message}`);
  }

  // 4. Test kullanıcılarını kontrol et
  console.log('\n🧪 4. TEST KULLANICILARI KONTROLÜ');
  const testEmails = [
    'admin@ihracatakademi.com',
    'info@absdoor.com',
    'info@sahbaz.com',
  ];

  for (const email of testEmails) {
    try {
      // Users tablosunda ara
      const userResponse = await makeSupabaseRequest('users', {
        select: 'id,email,full_name,role',
        eq: { email: email },
      });

      // Company_users tablosunda ara
      const companyUserResponse = await makeSupabaseRequest('company_users', {
        select: 'id,email,full_name,role,company_id',
        eq: { email: email },
      });

      console.log(`\n📧 ${email}:`);

      if (userResponse.status === 200 && userResponse.data.length > 0) {
        const user = userResponse.data[0];
        console.log(
          `   ✅ Users tablosunda bulundu: ${user.full_name} (${user.role})`
        );
      } else {
        console.log(`   ❌ Users tablosunda bulunamadı`);
      }

      if (
        companyUserResponse.status === 200 &&
        companyUserResponse.data.length > 0
      ) {
        const user = companyUserResponse.data[0];
        console.log(
          `   ✅ Company_users tablosunda bulundu: ${user.full_name} (${user.role})`
        );
      } else {
        console.log(`   ❌ Company_users tablosunda bulunamadı`);
      }
    } catch (error) {
      console.log(`   ❌ Hata: ${error.message}`);
    }
  }

  console.log('\n✨ Kullanıcı kontrolü tamamlandı!');
}

// Script'i çalıştır
if (require.main === module) {
  checkUsers().catch(console.error);
}

module.exports = { checkUsers };
