#!/usr/bin/env node

/**
 * 🔐 DİREKT LOGİN TEST SCRIPT'İ
 *
 * Bu script farklı şifrelerle login testi yapar
 */

const http = require('http');

// Test kullanıcıları ve farklı şifreler
const TEST_COMBINATIONS = [
  {
    email: 'admin@ihracatakademi.com',
    passwords: ['admin123', 'admin', '123456', 'password'],
  },
  {
    email: 'info@sahbaz.com',
    passwords: ['sahbaz123', 'sahbaz', '123456', 'password'],
  },
  {
    email: 'info@mundo.com',
    passwords: ['mundo123', 'mundo', '123456', 'password'],
  },
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
        'User-Agent': 'LoginTest/1.0',
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

async function testLoginCombinations() {
  console.log('🔐 LOGİN KOMBİNASYONLARI TEST EDİLİYOR...');
  console.log('==========================================');

  for (const user of TEST_COMBINATIONS) {
    console.log(`\n📧 ${user.email}:`);

    for (const password of user.passwords) {
      try {
        const response = await makeRequest('/api/auth/login', {
          method: 'POST',
          body: {
            email: user.email,
            password: password,
          },
        });

        if (response.status === 200 && response.data.success) {
          console.log(
            `   ✅ BAŞARILI: "${password}" - ${response.data.user.role}`
          );
          return {
            email: user.email,
            password: password,
            token: response.data.token,
          };
        } else {
          console.log(
            `   ❌ "${password}": ${response.data.error || 'Unknown error'}`
          );
        }
      } catch (error) {
        console.log(`   ❌ "${password}": ${error.message}`);
      }
    }
  }

  return null;
}

async function testPasswordGeneration() {
  console.log('\n🔑 ŞİFRE OLUŞTURMA TESTİ');
  console.log('==========================');

  // Admin için şifre oluştur
  try {
    const response = await makeRequest(
      '/api/companies/admin@ihracatakademi.com/password',
      {
        method: 'POST',
      }
    );

    if (response.status === 200) {
      console.log(`✅ Admin şifre oluşturuldu: ${response.data.password}`);
      return response.data.password;
    } else {
      console.log(`❌ Admin şifre oluşturulamadı: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Admin şifre hatası: ${error.message}`);
  }

  return null;
}

async function testCompanyPasswordGeneration() {
  console.log('\n🏢 FİRMA ŞİFRE OLUŞTURMA TESTİ');
  console.log('================================');

  // Firma kullanıcıları için şifre oluştur
  const companyUsers = ['info@sahbaz.com', 'info@mundo.com'];

  for (const email of companyUsers) {
    try {
      const response = await makeRequest(`/api/companies/${email}/password`, {
        method: 'POST',
      });

      if (response.status === 200) {
        console.log(`✅ ${email} şifre oluşturuldu: ${response.data.password}`);
      } else {
        console.log(`❌ ${email} şifre oluşturulamadı: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${email} şifre hatası: ${error.message}`);
    }
  }
}

// Ana test fonksiyonu
async function runLoginTest() {
  console.log('🚀 DİREKT LOGİN TESTİ BAŞLIYOR...');
  console.log('==================================');

  // Test 1: Mevcut şifrelerle login
  const successfulLogin = await testLoginCombinations();

  if (successfulLogin) {
    console.log(`\n🎉 BAŞARILI LOGİN BULUNDU!`);
    console.log(`   Email: ${successfulLogin.email}`);
    console.log(`   Password: ${successfulLogin.password}`);
    console.log(`   Token: ${successfulLogin.token ? 'Mevcut' : 'Yok'}`);
  } else {
    console.log(`\n❌ HİÇBİR ŞİFRE ÇALIŞMIYOR!`);

    // Test 2: Şifre oluştur
    await testPasswordGeneration();
    await testCompanyPasswordGeneration();

    console.log(`\n🔑 YENİ ŞİFRELER OLUŞTURULDU!`);
    console.log(`   Lütfen yeni şifrelerle tekrar test edin.`);
  }

  console.log('\n✨ Login testi tamamlandı!');
}

// Script'i çalıştır
if (require.main === module) {
  runLoginTest().catch(console.error);
}

module.exports = { runLoginTest };
