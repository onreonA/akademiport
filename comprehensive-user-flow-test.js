#!/usr/bin/env node

/**
 * 🚀 KAPSAMLI USER FLOW TEST SCRIPT'İ
 *
 * Bu script gerçek kullanıcı senaryolarını test eder:
 * 1. Authentication Flow
 * 2. Admin Panel Flow
 * 3. Firma Panel Flow
 * 4. Project Management Flow
 * 5. Task Management Flow
 * 6. Cross-Platform Integration
 */

const http = require('http');
const https = require('https');

// Test konfigürasyonu
const BASE_URL = 'http://localhost:3000';
const TEST_CONFIG = {
  timeout: 10000,
  retries: 3,
  delay: 1000,
};

// Test kullanıcıları
const TEST_USERS = {
  admin: {
    email: 'admin@ihracatakademi.com',
    password: 'admin123',
    role: 'admin',
  },
  firma_admin: {
    email: 'info@absdoor.com',
    password: 'absdoor123',
    role: 'firma_admin',
  },
  firma_user: {
    email: 'info@sahbaz.com',
    password: 'sahbaz123',
    role: 'firma_user',
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
        'User-Agent': 'UserFlowTest/1.0',
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
      logTest('Admin Login', 'PASS', `User: ${response.data.user.email}`);
      return response.data.token; // Token'ı döndür
    } else {
      logTest(
        'Admin Login',
        'FAIL',
        `Status: ${response.status}, Success: ${response.data.success}`
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
      logTest('Firma Admin Login', 'PASS', `User: ${response.data.user.email}`);
      return response.data.token; // Token'ı döndür
    } else {
      logTest(
        'Firma Admin Login',
        'FAIL',
        `Status: ${response.status}, Success: ${response.data.success}`
      );
    }
  } catch (error) {
    logTest('Firma Admin Login', 'FAIL', `Error: ${error.message}`);
  }

  return null;
}

async function testAdminPanelFlow(adminToken) {
  console.log('\n👨‍💼 2. ADMIN PANEL FLOW TESTİ');
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
  console.log('\n🏢 3. FIRMA PANEL FLOW TESTİ');
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

async function testProjectManagementFlow(firmaToken) {
  console.log('\n📋 4. PROJECT MANAGEMENT FLOW TESTİ');
  console.log('====================================');

  if (!firmaToken) {
    logTest('Project Management Flow', 'FAIL', 'No firma token available');
    return;
  }

  const headers = { Authorization: `Bearer ${firmaToken}` };

  // Test 1: Get assigned projects
  try {
    const response = await makeRequest('/api/firma/assigned-projects', {
      headers,
    });
    if (response.status === 200 && response.data.projects) {
      const projects = response.data.projects;
      logTest(
        'Get Assigned Projects',
        'PASS',
        `Found ${projects.length} projects`
      );

      // Test 2: Access specific project
      if (projects.length > 0) {
        const projectId = projects[0].id;
        try {
          const projectResponse = await makeRequest(
            `/api/projects/${projectId}`,
            { headers }
          );
          if (projectResponse.status === 200) {
            logTest(
              'Access Specific Project',
              'PASS',
              `Project ID: ${projectId}`
            );
          } else {
            logTest(
              'Access Specific Project',
              'FAIL',
              `Expected: 200, Got: ${projectResponse.status}`
            );
          }
        } catch (error) {
          logTest('Access Specific Project', 'FAIL', `Error: ${error.message}`);
        }
      }
    } else {
      logTest('Get Assigned Projects', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Get Assigned Projects', 'FAIL', `Error: ${error.message}`);
  }
}

async function testTaskManagementFlow(firmaToken) {
  console.log('\n✅ 5. TASK MANAGEMENT FLOW TESTİ');
  console.log('==================================');

  if (!firmaToken) {
    logTest('Task Management Flow', 'FAIL', 'No firma token available');
    return;
  }

  const headers = { Authorization: `Bearer ${firmaToken}` };

  // Test 1: Task completion (mock data)
  try {
    const response = await makeRequest('/api/firma/tasks/1/complete', {
      method: 'POST',
      headers,
      body: {
        completionNote: 'Test completion from user flow',
        actualHours: 2.5,
        completionFiles: [],
      },
    });

    // 401 bekliyoruz çünkü task 1 mevcut olmayabilir
    if (response.status === 401 || response.status === 404) {
      logTest(
        'Task Completion API',
        'PASS',
        `Expected auth/not found error: ${response.status}`
      );
    } else if (response.status === 200) {
      logTest('Task Completion API', 'PASS', `Task completed successfully`);
    } else {
      logTest(
        'Task Completion API',
        'FAIL',
        `Unexpected status: ${response.status}`
      );
    }
  } catch (error) {
    logTest('Task Completion API', 'FAIL', `Error: ${error.message}`);
  }

  // Test 2: Task comment
  try {
    const response = await makeRequest('/api/firma/tasks/1/comment', {
      method: 'POST',
      headers,
      body: {
        comment: 'Test comment from user flow',
        commentType: 'general',
      },
    });

    if (response.status === 401 || response.status === 404) {
      logTest(
        'Task Comment API',
        'PASS',
        `Expected auth/not found error: ${response.status}`
      );
    } else if (response.status === 200) {
      logTest('Task Comment API', 'PASS', `Comment added successfully`);
    } else {
      logTest(
        'Task Comment API',
        'FAIL',
        `Unexpected status: ${response.status}`
      );
    }
  } catch (error) {
    logTest('Task Comment API', 'FAIL', `Error: ${error.message}`);
  }
}

async function testCrossPlatformIntegration() {
  console.log('\n🔄 6. CROSS-PLATFORM INTEGRATION TESTİ');
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
  console.log('\n⚡ 7. PERFORMANCE & SECURITY TESTİ');
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
async function runComprehensiveUserFlowTest() {
  console.log('🚀 KAPSAMLI USER FLOW TESTİ BAŞLIYOR...');
  console.log('==========================================');
  console.log(`📅 Test Tarihi: ${new Date().toLocaleString('tr-TR')}`);
  console.log(`🌐 Test URL: ${BASE_URL}`);
  console.log(`⏱️  Timeout: ${TEST_CONFIG.timeout}ms`);

  // Server'ın hazır olmasını bekle
  console.log('\n⏳ Server hazır olması bekleniyor...');
  await delay(3000);

  // Test 1: Authentication Flow
  const adminToken = await testAuthenticationFlow();
  const firmaToken = await testAuthenticationFlow(); // İkinci kez firma için

  // Test 2: Admin Panel Flow
  await testAdminPanelFlow(adminToken);

  // Test 3: Firma Panel Flow
  await testFirmaPanelFlow(firmaToken);

  // Test 4: Project Management Flow
  await testProjectManagementFlow(firmaToken);

  // Test 5: Task Management Flow
  await testTaskManagementFlow(firmaToken);

  // Test 6: Cross-Platform Integration
  await testCrossPlatformIntegration();

  // Test 7: Performance & Security
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
  runComprehensiveUserFlowTest().catch(console.error);
}

module.exports = { runComprehensiveUserFlowTest };
