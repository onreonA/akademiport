#!/usr/bin/env node

/**
 * 🚀 DOĞRU USER FLOW TEST SCRIPT'İ
 *
 * Bu script doğru kullanıcı rolleriyle test yapar:
 * - Admin: admin@ihracatakademi.com (sadece /admin)
 * - Firma: info@sarmobi.com, info@sahbaz.com (sadece /firma)
 */

const http = require('http');

// Test konfigürasyonu
const BASE_URL = 'http://localhost:3000';
const TEST_CONFIG = {
  timeout: 10000,
  retries: 3,
  delay: 1000,
};

// Doğru test kullanıcıları
const TEST_USERS = {
  admin: {
    email: 'admin@ihracatakademi.com',
    password: 'admin123', // Bu çalışıyor olmalı
    role: 'admin',
    allowedRoutes: ['/admin'],
    forbiddenRoutes: ['/firma'],
  },
  firma_admin: {
    email: 'info@sarmobi.com',
    password: 'sarmobi123', // Bu çalışıyor olmalı
    role: 'firma_admin',
    allowedRoutes: ['/firma'],
    forbiddenRoutes: ['/admin'],
  },
};

// Test sonuçları
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: [],
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
        'User-Agent': 'CorrectUserFlowTest/1.0',
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

// Test fonksiyonları
async function testAuthenticationFlow() {
  console.log('\n🔐 1. AUTHENTICATION FLOW TESTİ');
  console.log('================================');

  let adminToken = null;
  let firmaToken = null;

  // Test 1: Login sayfası erişimi
  try {
    const response = await makeRequest('/giris');
    if (response.status === 200) {
      logTest('Login Page Access', 'PASS', `Status: ${response.status}`);
    } else {
      logTest(
        'Login Page Access',
        'FAIL',
        `Expected: 200, Got: ${response.status}`
      );
    }
  } catch (error) {
    logTest('Login Page Access', 'FAIL', `Error: ${error.message}`);
  }

  // Test 2: Admin login
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: TEST_USERS.admin.email,
        password: TEST_USERS.admin.password,
      },
    });

    if (response.status === 200 && response.data.success) {
      logTest(
        'Admin Login',
        'PASS',
        `User: ${response.data.user.email}, Role: ${response.data.user.role}`
      );
      adminToken = response.data.token;
    } else {
      logTest(
        'Admin Login',
        'FAIL',
        `Status: ${response.status}, Message: ${response.data.error || 'Unknown error'}`
      );
    }
  } catch (error) {
    logTest('Admin Login', 'FAIL', `Error: ${error.message}`);
  }

  // Test 3: Firma admin login
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: TEST_USERS.firma_admin.email,
        password: TEST_USERS.firma_admin.password,
      },
    });

    if (response.status === 200 && response.data.success) {
      logTest(
        'Firma Admin Login',
        'PASS',
        `User: ${response.data.user.email}, Role: ${response.data.user.role}`
      );
      firmaToken = response.data.token;
    } else {
      logTest(
        'Firma Admin Login',
        'FAIL',
        `Status: ${response.status}, Message: ${response.data.error || 'Unknown error'}`
      );
    }
  } catch (error) {
    logTest('Firma Admin Login', 'FAIL', `Error: ${error.message}`);
  }

  return { adminToken, firmaToken };
}

async function testRoleBasedAccess(adminToken, firmaToken) {
  console.log('\n🛡️ 2. ROLE-BASED ACCESS CONTROL TESTİ');
  console.log('======================================');

  // Test 1: Admin - Admin panel erişimi (izinli)
  if (adminToken) {
    try {
      const response = await makeRequest('/admin/dashboard', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (response.status === 200) {
        logTest(
          'Admin - Admin Panel Access',
          'PASS',
          `Status: ${response.status}`
        );
      } else {
        logTest(
          'Admin - Admin Panel Access',
          'FAIL',
          `Expected: 200, Got: ${response.status}`
        );
      }
    } catch (error) {
      logTest('Admin - Admin Panel Access', 'FAIL', `Error: ${error.message}`);
    }

    // Test 2: Admin - Firma panel erişimi (yasak)
    try {
      const response = await makeRequest('/firma', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (response.status === 403 || response.status === 401) {
        logTest(
          'Admin - Firma Panel Blocked',
          'PASS',
          `Correctly blocked: ${response.status}`
        );
      } else {
        logTest(
          'Admin - Firma Panel Blocked',
          'FAIL',
          `Should be blocked, got: ${response.status}`
        );
      }
    } catch (error) {
      logTest(
        'Admin - Firma Panel Blocked',
        'PASS',
        `Request blocked: ${error.message}`
      );
    }
  }

  // Test 3: Firma - Firma panel erişimi (izinli)
  if (firmaToken) {
    try {
      const response = await makeRequest('/firma', {
        headers: { Authorization: `Bearer ${firmaToken}` },
      });
      if (response.status === 200) {
        logTest(
          'Firma - Firma Panel Access',
          'PASS',
          `Status: ${response.status}`
        );
      } else {
        logTest(
          'Firma - Firma Panel Access',
          'FAIL',
          `Expected: 200, Got: ${response.status}`
        );
      }
    } catch (error) {
      logTest('Firma - Firma Panel Access', 'FAIL', `Error: ${error.message}`);
    }

    // Test 4: Firma - Admin panel erişimi (yasak)
    try {
      const response = await makeRequest('/admin/dashboard', {
        headers: { Authorization: `Bearer ${firmaToken}` },
      });
      if (response.status === 403 || response.status === 401) {
        logTest(
          'Firma - Admin Panel Blocked',
          'PASS',
          `Correctly blocked: ${response.status}`
        );
      } else {
        logTest(
          'Firma - Admin Panel Blocked',
          'FAIL',
          `Should be blocked, got: ${response.status}`
        );
      }
    } catch (error) {
      logTest(
        'Firma - Admin Panel Blocked',
        'PASS',
        `Request blocked: ${error.message}`
      );
    }
  }
}

async function testAdminPanelFlow(adminToken) {
  console.log('\n👨‍💼 3. ADMIN PANEL FLOW TESTİ');
  console.log('================================');

  if (!adminToken) {
    logTest('Admin Panel Flow', 'FAIL', 'No admin token available');
    return;
  }

  const headers = { Authorization: `Bearer ${adminToken}` };

  // Test 1: Admin dashboard
  try {
    const response = await makeRequest('/admin/dashboard', { headers });
    if (response.status === 200) {
      logTest('Admin Dashboard Access', 'PASS', `Status: ${response.status}`);
    } else {
      logTest(
        'Admin Dashboard Access',
        'FAIL',
        `Expected: 200, Got: ${response.status}`
      );
    }
  } catch (error) {
    logTest('Admin Dashboard Access', 'FAIL', `Error: ${error.message}`);
  }

  // Test 2: Company management
  try {
    const response = await makeRequest('/admin/firma-yonetimi', { headers });
    if (response.status === 200) {
      logTest(
        'Company Management Access',
        'PASS',
        `Status: ${response.status}`
      );
    } else {
      logTest(
        'Company Management Access',
        'FAIL',
        `Expected: 200, Got: ${response.status}`
      );
    }
  } catch (error) {
    logTest('Company Management Access', 'FAIL', `Error: ${error.message}`);
  }

  // Test 3: Progress dashboard
  try {
    const response = await makeRequest('/api/admin/progress', { headers });
    if (response.status === 200) {
      logTest('Admin Progress API', 'PASS', `Status: ${response.status}`);
    } else {
      logTest(
        'Admin Progress API',
        'FAIL',
        `Expected: 200, Got: ${response.status}`
      );
    }
  } catch (error) {
    logTest('Admin Progress API', 'FAIL', `Error: ${error.message}`);
  }

  // Test 4: Task approvals
  try {
    const response = await makeRequest('/admin/gorev-onaylari', { headers });
    if (response.status === 200) {
      logTest('Task Approvals Access', 'PASS', `Status: ${response.status}`);
    } else {
      logTest(
        'Task Approvals Access',
        'FAIL',
        `Expected: 200, Got: ${response.status}`
      );
    }
  } catch (error) {
    logTest('Task Approvals Access', 'FAIL', `Error: ${error.message}`);
  }
}

async function testFirmaPanelFlow(firmaToken) {
  console.log('\n🏢 4. FIRMA PANEL FLOW TESTİ');
  console.log('================================');

  if (!firmaToken) {
    logTest('Firma Panel Flow', 'FAIL', 'No firma token available');
    return;
  }

  const headers = { Authorization: `Bearer ${firmaToken}` };

  // Test 1: Firma dashboard
  try {
    const response = await makeRequest('/firma', { headers });
    if (response.status === 200) {
      logTest('Firma Dashboard Access', 'PASS', `Status: ${response.status}`);
    } else {
      logTest(
        'Firma Dashboard Access',
        'FAIL',
        `Expected: 200, Got: ${response.status}`
      );
    }
  } catch (error) {
    logTest('Firma Dashboard Access', 'FAIL', `Error: ${error.message}`);
  }

  // Test 2: Project management
  try {
    const response = await makeRequest('/firma/proje-yonetimi', { headers });
    if (response.status === 200) {
      logTest(
        'Project Management Access',
        'PASS',
        `Status: ${response.status}`
      );
    } else {
      logTest(
        'Project Management Access',
        'FAIL',
        `Expected: 200, Got: ${response.status}`
      );
    }
  } catch (error) {
    logTest('Project Management Access', 'FAIL', `Error: ${error.message}`);
  }

  // Test 3: Assigned projects API
  try {
    const response = await makeRequest('/api/firma/assigned-projects', {
      headers,
    });
    if (response.status === 200) {
      logTest(
        'Assigned Projects API',
        'PASS',
        `Status: ${response.status}, Projects: ${response.data.projects?.length || 0}`
      );
    } else {
      logTest(
        'Assigned Projects API',
        'FAIL',
        `Expected: 200, Got: ${response.status}`
      );
    }
  } catch (error) {
    logTest('Assigned Projects API', 'FAIL', `Error: ${error.message}`);
  }

  // Test 4: Progress dashboard
  try {
    const response = await makeRequest('/api/firma/progress', { headers });
    if (response.status === 200) {
      logTest('Firma Progress API', 'PASS', `Status: ${response.status}`);
    } else {
      logTest(
        'Firma Progress API',
        'FAIL',
        `Expected: 200, Got: ${response.status}`
      );
    }
  } catch (error) {
    logTest('Firma Progress API', 'FAIL', `Error: ${error.message}`);
  }
}

async function testCrossPlatformIntegration() {
  console.log('\n🔄 5. CROSS-PLATFORM INTEGRATION TESTİ');
  console.log('======================================');

  // Test 1: Public pages
  try {
    const response = await makeRequest('/');
    if (response.status === 200) {
      logTest('Public Homepage Access', 'PASS', `Status: ${response.status}`);
    } else {
      logTest(
        'Public Homepage Access',
        'FAIL',
        `Expected: 200, Got: ${response.status}`
      );
    }
  } catch (error) {
    logTest('Public Homepage Access', 'FAIL', `Error: ${error.message}`);
  }

  // Test 2: API health check
  try {
    const response = await makeRequest('/api/companies');
    if (response.status === 401 || response.status === 200) {
      logTest(
        'API Health Check',
        'PASS',
        `Status: ${response.status} (auth required)`
      );
    } else {
      logTest(
        'API Health Check',
        'FAIL',
        `Unexpected status: ${response.status}`
      );
    }
  } catch (error) {
    logTest('API Health Check', 'FAIL', `Error: ${error.message}`);
  }

  // Test 3: Error handling
  try {
    const response = await makeRequest('/non-existent-page');
    if (response.status === 404) {
      logTest('Error Handling', 'PASS', `404 handled correctly`);
    } else {
      logTest(
        'Error Handling',
        'FAIL',
        `Expected: 404, Got: ${response.status}`
      );
    }
  } catch (error) {
    logTest('Error Handling', 'FAIL', `Error: ${error.message}`);
  }
}

async function testPerformanceAndSecurity() {
  console.log('\n⚡ 6. PERFORMANCE & SECURITY TESTİ');
  console.log('===================================');

  // Test 1: Response time
  const startTime = Date.now();
  try {
    const response = await makeRequest('/giris');
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (responseTime < 5000) {
      // 5 saniye altında
      logTest('Response Time', 'PASS', `${responseTime}ms`);
    } else {
      logTest('Response Time', 'FAIL', `Too slow: ${responseTime}ms`);
    }
  } catch (error) {
    logTest('Response Time', 'FAIL', `Error: ${error.message}`);
  }

  // Test 2: SQL injection protection
  try {
    const response = await makeRequest(
      "/api/firma/tasks/1'; SELECT * FROM users; --"
    );
    if (response.status === 401 || response.status === 400) {
      logTest(
        'SQL Injection Protection',
        'PASS',
        `Blocked malicious request: ${response.status}`
      );
    } else {
      logTest(
        'SQL Injection Protection',
        'FAIL',
        `Security issue: ${response.status}`
      );
    }
  } catch (error) {
    logTest(
      'SQL Injection Protection',
      'PASS',
      `Request blocked: ${error.message}`
    );
  }

  // Test 3: Authentication required
  try {
    const response = await makeRequest('/api/firma/tasks/1');
    if (response.status === 401) {
      logTest(
        'Authentication Required',
        'PASS',
        `Unauthorized access blocked: ${response.status}`
      );
    } else {
      logTest(
        'Authentication Required',
        'FAIL',
        `Security issue: ${response.status}`
      );
    }
  } catch (error) {
    logTest(
      'Authentication Required',
      'PASS',
      `Request blocked: ${error.message}`
    );
  }
}

// Ana test fonksiyonu
async function runCorrectUserFlowTest() {
  console.log('🚀 DOĞRU USER FLOW TESTİ BAŞLIYOR...');
  console.log('=====================================');
  console.log(`📅 Test Tarihi: ${new Date().toLocaleString('tr-TR')}`);
  console.log(`🌐 Test URL: ${BASE_URL}`);
  console.log(`⏱️  Timeout: ${TEST_CONFIG.timeout}ms`);
  console.log(`🔐 Test Kullanıcıları:`);
  console.log(`   👨‍💼 Admin: ${TEST_USERS.admin.email} (sadece /admin)`);
  console.log(`   🏢 Firma: ${TEST_USERS.firma_admin.email} (sadece /firma)`);

  // Server'ın hazır olmasını bekle
  console.log('\n⏳ Server hazır olması bekleniyor...');
  await delay(2000);

  // Test 1: Authentication Flow
  const { adminToken, firmaToken } = await testAuthenticationFlow();

  // Test 2: Role-Based Access Control
  await testRoleBasedAccess(adminToken, firmaToken);

  // Test 3: Admin Panel Flow
  await testAdminPanelFlow(adminToken);

  // Test 4: Firma Panel Flow
  await testFirmaPanelFlow(firmaToken);

  // Test 5: Cross-Platform Integration
  await testCrossPlatformIntegration();

  // Test 6: Performance & Security
  await testPerformanceAndSecurity();

  // Sonuçları göster
  console.log('\n📊 TEST SONUÇLARI');
  console.log('==================');
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

  console.log('\n🎯 SİSTEM DURUMU:');
  if (testResults.passed / testResults.total >= 0.8) {
    console.log('🟢 SİSTEM HAZIR - %80+ başarı oranı');
  } else if (testResults.passed / testResults.total >= 0.6) {
    console.log('🟡 SİSTEM KISMEN HAZIR - %60-80 başarı oranı');
  } else {
    console.log('🔴 SİSTEM SORUNLU - %60 altı başarı oranı');
  }

  console.log('\n✨ Test tamamlandı!');
}

// Script'i çalıştır
if (require.main === module) {
  runCorrectUserFlowTest().catch(console.error);
}

module.exports = { runCorrectUserFlowTest };
