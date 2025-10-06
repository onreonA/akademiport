#!/usr/bin/env node

/**
 * YAYGIN ŞİFRELERİ TEST SCRIPT'İ
 *
 * Bu script yaygın şifrelerle login testi yapar
 */

const http = require('http');

// Test kullanıcıları ve yaygın şifreler
const TEST_COMBINATIONS = [
  {
    email: 'admin@ihracatakademi.com',
    passwords: [
      'admin123',
      'admin',
      '123456',
      'password',
      'admin@123',
      'ihracat123',
      'akademi123',
      'test123',
      '1234',
      'admin2024',
    ],
  },
  {
    email: 'info@sarmobi.com',
    passwords: [
      'sarmobi123',
      'sarmobi',
      '123456',
      'password',
      'sarmobi@123',
      'test123',
      '1234',
      'sarmobi2024',
    ],
  },
  {
    email: 'info@sahbaz.com',
    passwords: [
      'sahbaz123',
      'sahbaz',
      '123456',
      'password',
      'sahbaz@123',
      'test123',
      '1234',
      'sahbaz2024',
    ],
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
        'User-Agent': 'CommonPasswordTest/1.0',
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

async function testCommonPasswords() {
  console.log('🔐 YAYGIN ŞİFRELERİ TEST EDİLİYOR...');
  console.log('====================================');

  const successfulLogins = [];

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
            `   ✅ BAŞARILI: "${password}" - Role: ${response.data.user.role}`
          );
          successfulLogins.push({
            email: user.email,
            password: password,
            role: response.data.user.role,
            token: response.data.token,
          });
          break; // İlk başarılı şifreyi bulduğunda dur
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

  // Sonuçları göster
  if (successfulLogins.length > 0) {
    console.log('\n🎉 BAŞARILI LOGİNLER:');
    console.log('=====================');

    successfulLogins.forEach((login, index) => {
      console.log(`${index + 1}. ${login.email}`);
      console.log(`   Şifre: ${login.password}`);
      console.log(`   Role: ${login.role}`);
      console.log(`   Token: ${login.token ? 'Mevcut' : 'Yok'}`);
      console.log('');
    });

    // Başarılı şifreleri dosyaya kaydet
    const fs = require('fs');
    const loginData = {
      generated_at: new Date().toISOString(),
      successful_logins: successfulLogins,
    };

    fs.writeFileSync(
      'successful-logins.json',
      JSON.stringify(loginData, null, 2)
    );
    console.log(
      "💾 Başarılı login'ler successful-logins.json dosyasına kaydedildi"
    );

    return successfulLogins;
  } else {
    console.log('\n❌ HİÇBİR ŞİFRE ÇALIŞMIYOR!');
    console.log('💡 Öneriler:');
    console.log('1. Veritabanından şifreleri sıfırlayın');
    console.log('2. Admin panelinden yeni şifreler oluşturun');
    console.log("3. Şifre oluşturma API'sini admin yetkisiyle kullanın");

    return [];
  }
}

// Ana fonksiyon
async function runCommonPasswordTest() {
  console.log('🚀 YAYGIN ŞİFRE TESTİ BAŞLIYOR...');
  console.log('==================================');

  const successfulLogins = await testCommonPasswords();

  if (successfulLogins.length > 0) {
    console.log('\n✅ BAŞARILI LOGİNLER BULUNDU!');
    console.log('Artık user flow testini çalıştırabilirsiniz.');
  } else {
    console.log('\n❌ BAŞARILI LOGİN BULUNAMADI!');
    console.log('Şifre sıfırlama gerekli.');
  }

  console.log('\n✨ Test tamamlandı!');
}

// Script'i çalıştır
if (require.main === module) {
  runCommonPasswordTest().catch(console.error);
}

module.exports = { runCommonPasswordTest };
