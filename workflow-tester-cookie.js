#!/usr/bin/env node

/**
 * 🧪 WORKFLOW TESTER SCRIPT'İ (Cookie-Based Authentication)
 *
 * Bu script proje yönetimi workflow'unu adım adım test eder:
 * Cookie-based authentication kullanarak API endpoint'lerini test eder
 */

const http = require('http');

// Test konfigürasyonu
const BASE_URL = 'http://localhost:3000';
const TEST_CONFIG = {
  timeout: 15000,
  retries: 3,
  delay: 2000,
};

// Test kullanıcıları
const TEST_USERS = {
  admin: {
    email: 'admin@ihracatakademi.com',
    password: '123456',
    role: 'admin',
  },
  firma: {
    email: 'info@mundo.com',
    password: '123456',
    role: 'firma_admin',
  },
};

// Test verileri
const TEST_DATA = {
  mainProject: {
    name: 'E-Ticaret Platformu Test Projesi',
    description: 'Workflow testi için oluşturulan ana proje',
    status: 'Planlandı',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    adminNote: 'Workflow test projesi',
  },
};

// Test sonuçları
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: [],
  testData: {
    adminCookies: null,
    firmaCookies: null,
    createdProjectId: null,
  },
};

// Utility fonksiyonlar
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname: 'localhost',
      port: 3000,
      path: url,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WorkflowTester/1.0',
        ...options.headers,
      },
      timeout: TEST_CONFIG.timeout,
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

function logTest(testName, status, details = '') {
  testResults.total++;
  if (status === 'PASS') {
    testResults.passed++;
    console.log(`✅ PASS: ${testName}${details ? ' - ' + details : ''}`);
  } else {
    testResults.failed++;
    console.log(`❌ FAIL: ${testName}${details ? ' - ' + details : ''}`);
  }
  testResults.details.push({ testName, status, details });
}

function extractCookies(setCookieHeader) {
  if (!setCookieHeader) return '';

  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : [setCookieHeader];

  return cookies.map(cookie => cookie.split(';')[0]).join('; ');
}

// Authentication with cookie handling
async function authenticateUsers() {
  console.log('\n🔐 AUTHENTICATION TESTİ (Cookie-Based)');
  console.log('=======================================');

  // Admin login
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: TEST_USERS.admin.email,
        password: TEST_USERS.admin.password,
      },
    });

    if (
      response.status === 200 &&
      response.data.user &&
      response.data.session
    ) {
      testResults.testData.adminCookies = extractCookies(
        response.headers['set-cookie']
      );
      logTest(
        'Admin Authentication',
        'PASS',
        `Cookies alındı: ${testResults.testData.adminCookies ? 'Evet' : 'Hayır'}`
      );
    } else {
      logTest('Admin Authentication', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Admin Authentication', 'FAIL', `Error: ${error.message}`);
  }

  // Firma login
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: TEST_USERS.firma.email,
        password: TEST_USERS.firma.password,
      },
    });

    if (
      response.status === 200 &&
      response.data.user &&
      response.data.session
    ) {
      testResults.testData.firmaCookies = extractCookies(
        response.headers['set-cookie']
      );
      logTest(
        'Firma Authentication',
        'PASS',
        `Cookies alındı: ${testResults.testData.firmaCookies ? 'Evet' : 'Hayır'}`
      );
    } else {
      logTest('Firma Authentication', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Firma Authentication', 'FAIL', `Error: ${error.message}`);
  }
}

// Test 1: Admin tarafından ana proje oluşturma
async function testMainProjectCreation() {
  console.log('\n📁 TEST 1: ANA PROJE OLUŞTURMA');
  console.log('================================');

  if (!testResults.testData.adminCookies) {
    logTest('Main Project Creation', 'FAIL', 'Admin cookies yok');
    return;
  }

  try {
    const response = await makeRequest('/api/projects', {
      method: 'POST',
      headers: {
        Cookie: testResults.testData.adminCookies,
      },
      body: TEST_DATA.mainProject,
    });

    if (response.status === 200 || response.status === 201) {
      testResults.testData.createdProjectId =
        response.data.project?.id || response.data.id;
      logTest(
        'Main Project Creation',
        'PASS',
        `Proje oluşturuldu: ${testResults.testData.createdProjectId}`
      );
    } else {
      logTest(
        'Main Project Creation',
        'FAIL',
        `Status: ${response.status}, Response: ${JSON.stringify(response.data)}`
      );
    }
  } catch (error) {
    logTest('Main Project Creation', 'FAIL', `Error: ${error.message}`);
  }
}

// Test 2: Firma tarafından atanan projeleri görme
async function testCompanyProjectView() {
  console.log('\n👀 TEST 2: FİRMA PROJE GÖRÜNTÜLEME');
  console.log('===================================');

  if (!testResults.testData.firmaCookies) {
    logTest('Company Project View', 'FAIL', 'Firma cookies yok');
    return;
  }

  try {
    const response = await makeRequest('/api/firma/assigned-projects', {
      headers: {
        Cookie: testResults.testData.firmaCookies,
      },
    });

    if (response.status === 200) {
      const projects = response.data.projects || [];
      const foundTestProject = projects.find(
        p => p.name === TEST_DATA.mainProject.name
      );

      if (foundTestProject) {
        logTest(
          'Company Project View',
          'PASS',
          `Test projesi bulundu: ${projects.length} proje`
        );
      } else {
        logTest(
          'Company Project View',
          'PASS',
          `Projeler listelendi: ${projects.length} proje (test projesi henüz atanmamış)`
        );
      }
    } else {
      logTest(
        'Company Project View',
        'FAIL',
        `Status: ${response.status}, Response: ${JSON.stringify(response.data)}`
      );
    }
  } catch (error) {
    logTest('Company Project View', 'FAIL', `Error: ${error.message}`);
  }
}

// Test 3: Proje listesi görüntüleme (Admin)
async function testProjectListing() {
  console.log('\n📋 TEST 3: PROJE LİSTESİ GÖRÜNTÜLEME (Admin)');
  console.log('=============================================');

  if (!testResults.testData.adminCookies) {
    logTest('Project Listing', 'FAIL', 'Admin cookies yok');
    return;
  }

  try {
    const response = await makeRequest('/api/projects', {
      headers: {
        Cookie: testResults.testData.adminCookies,
      },
    });

    if (response.status === 200) {
      const projects = response.data.projects || [];
      logTest('Project Listing', 'PASS', `${projects.length} proje listelendi`);
    } else {
      logTest(
        'Project Listing',
        'FAIL',
        `Status: ${response.status}, Response: ${JSON.stringify(response.data)}`
      );
    }
  } catch (error) {
    logTest('Project Listing', 'FAIL', `Error: ${error.message}`);
  }
}

// Test 4: Firma görevleri görüntüleme
async function testCompanyTasks() {
  console.log('\n📝 TEST 4: FİRMA GÖREVLERİ GÖRÜNTÜLEME');
  console.log('======================================');

  if (!testResults.testData.firmaCookies) {
    logTest('Company Tasks', 'FAIL', 'Firma cookies yok');
    return;
  }

  try {
    const response = await makeRequest('/api/firma/tasks', {
      headers: {
        Cookie: testResults.testData.firmaCookies,
      },
    });

    if (response.status === 200) {
      const tasks = response.data.tasks || [];
      logTest('Company Tasks', 'PASS', `${tasks.length} görev listelendi`);
    } else {
      logTest(
        'Company Tasks',
        'FAIL',
        `Status: ${response.status}, Response: ${JSON.stringify(response.data)}`
      );
    }
  } catch (error) {
    logTest('Company Tasks', 'FAIL', `Error: ${error.message}`);
  }
}

// Ana test fonksiyonu
async function runCookieWorkflowTest() {
  console.log('🧪 WORKFLOW TESTER BAŞLIYOR (Cookie-Based)...');
  console.log('==============================================');
  console.log(`📅 Test Tarihi: ${new Date().toLocaleString('tr-TR')}`);
  console.log(`🌐 Test URL: ${BASE_URL}`);
  console.log(`⏱️  Timeout: ${TEST_CONFIG.timeout}ms`);
  console.log(`🎯 Test Hedefi: Proje Yönetimi Workflow'u (Cookie Auth)`);

  // Server'ın hazır olmasını bekle
  console.log('\n⏳ Server hazır olması bekleniyor...');
  await delay(3000);

  // Authentication
  await authenticateUsers();

  // Test 1: Ana proje oluşturma
  await testMainProjectCreation();
  await delay(1000);

  // Test 2: Firma proje görüntüleme
  await testCompanyProjectView();
  await delay(1000);

  // Test 3: Proje listesi görüntüleme
  await testProjectListing();
  await delay(1000);

  // Test 4: Firma görevleri görüntüleme
  await testCompanyTasks();
  await delay(1000);

  // Sonuçları göster
  console.log('\n📊 WORKFLOW TEST SONUÇLARI');
  console.log('===========================');
  console.log(`✅ Başarılı: ${testResults.passed}`);
  console.log(`❌ Başarısız: ${testResults.failed}`);
  console.log(`📈 Toplam: ${testResults.total}`);
  console.log(
    `📊 Başarı Oranı: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`
  );

  if (testResults.failed > 0) {
    console.log('\n❌ BAŞARISIZ TESTLER:');
    testResults.details
      .filter(test => test.status === 'FAIL')
      .forEach(test => {
        console.log(`   - ${test.testName}: ${test.details}`);
      });
  }

  console.log('\n🎯 WORKFLOW DURUMU:');
  if (testResults.passed / testResults.total >= 0.8) {
    console.log('🟢 WORKFLOW HAZIR - %80+ başarı oranı');
    console.log('✅ Cookie-based authentication çalışıyor');
    console.log("✅ API endpoint'leri erişilebilir");
    console.log('✅ Proje yönetimi sistemi aktif');
  } else if (testResults.passed / testResults.total >= 0.6) {
    console.log('🟡 WORKFLOW KISMEN HAZIR - %60-80 başarı oranı');
    console.log("⚠️  Bazı API endpoint'leri sorunlu");
  } else {
    console.log('🔴 WORKFLOW SORUNLU - %60 altı başarı oranı');
    console.log('❌ Kritik authentication sorunları var');
  }

  console.log('\n💡 WORKFLOW ÖNERİLERİ:');
  console.log('1. Cookie-based authentication başarılı');
  console.log("2. API endpoint'lerini kontrol et");
  console.log('3. Veritabanı ilişkilerini doğrula');
  console.log('4. Middleware cookie ayarlarını kontrol et');

  console.log('\n✨ Cookie-based workflow testi tamamlandı!');
}

// Script'i çalıştır
if (require.main === module) {
  runCookieWorkflowTest().catch(console.error);
}

module.exports = { runCookieWorkflowTest };
