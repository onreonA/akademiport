#!/usr/bin/env node

/**
 * ŞİFRE OLUŞTURMA SCRIPT'İ
 *
 * Bu script test kullanıcıları için yeni şifreler oluşturur
 */

const http = require('http');

// Test kullanıcıları
const TEST_USERS = [
  'admin@ihracatakademi.com',
  'info@sarmobi.com',
  'info@sahbaz.com',
];

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname: 'localhost',
      port: 3000,
      path: url,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PasswordGenerator/1.0',
        ...options.headers,
      },
      timeout: 10000,
    };

    const req = http.request(requestOptions, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const parsedData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsedData,
            raw: data,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            raw: data,
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function generatePasswords() {
  console.log('🔑 TEST ŞİFRELERİ OLUŞTURULUYOR...');
  console.log('===================================');

  const generatedPasswords = {};

  for (const email of TEST_USERS) {
    console.log(`\n📧 ${email}:`);

    try {
      // Şifre oluştur
      const response = await makeRequest(`/api/companies/${email}/password`, {
        method: 'POST',
      });

      if (response.status === 200 && response.data.password) {
        const password = response.data.password;
        generatedPasswords[email] = password;
        console.log(`   ✅ Şifre oluşturuldu: ${password}`);
      } else {
        console.log(`   ❌ Şifre oluşturulamadı: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.log(`   ❌ Hata: ${error.message}`);
    }
  }

  // Sonuçları göster
  console.log('\n📋 OLUŞTURULAN ŞİFRELER:');
  console.log('========================');

  Object.entries(generatedPasswords).forEach(([email, password]) => {
    console.log(`📧 ${email}: ${password}`);
  });

  // Test şifrelerini dosyaya kaydet
  if (Object.keys(generatedPasswords).length > 0) {
    const fs = require('fs');
    const passwordData = {
      generated_at: new Date().toISOString(),
      passwords: generatedPasswords,
    };

    fs.writeFileSync(
      'test-passwords.json',
      JSON.stringify(passwordData, null, 2)
    );
    console.log('\n💾 Şifreler test-passwords.json dosyasına kaydedildi');
  }

  return generatedPasswords;
}

async function testGeneratedPasswords(passwords) {
  console.log('\n🧪 OLUŞTURULAN ŞİFRELERİ TEST ET');
  console.log('==================================');

  for (const [email, password] of Object.entries(passwords)) {
    console.log(`\n📧 ${email}:`);

    try {
      const response = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: email,
          password: password,
        },
      });

      if (response.status === 200 && response.data.success) {
        console.log(`   ✅ LOGİN BAŞARILI!`);
        console.log(`      User: ${response.data.user.email}`);
        console.log(`      Role: ${response.data.user.role}`);
        console.log(`      Token: ${response.data.token ? 'Mevcut' : 'Yok'}`);
      } else {
        console.log(`   ❌ LOGİN BAŞARISIZ: ${response.status}`);
        console.log(`      Error: ${response.data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ Hata: ${error.message}`);
    }
  }
}

// Ana fonksiyon
async function runPasswordGeneration() {
  console.log('🚀 ŞİFRE OLUŞTURMA VE TEST BAŞLIYOR...');
  console.log('======================================');

  // Şifreleri oluştur
  const passwords = await generatePasswords();

  // Oluşturulan şifreleri test et
  if (Object.keys(passwords).length > 0) {
    await testGeneratedPasswords(passwords);
  }

  console.log('\n✨ Şifre oluşturma ve test tamamlandı!');
}

// Script'i çalıştır
if (require.main === module) {
  runPasswordGeneration().catch(console.error);
}

module.exports = { runPasswordGeneration };
