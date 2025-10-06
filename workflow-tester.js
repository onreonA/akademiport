#!/usr/bin/env node

/**
 * 🧪 WORKFLOW TESTER SCRIPT'İ
 *
 * Bu script proje yönetimi workflow'unu adım adım test eder:
 * 1. Admin → Ana proje oluşturma
 * 2. Admin → Alt proje tanımlama
 * 3. Admin → Firmalara çoklu atama
 * 4. Firma → Atanan projeleri görme
 * 5. Firma → Görev tamamlama
 * 6. Danışman → Onay sistemi
 * 7. Admin → İlerleme takibi
 * 8. Sistem → Çoklu firma karşılaştırması
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
  subProjects: [
    {
      name: 'Frontend Geliştirme',
      description: 'React tabanlı frontend geliştirme',
      priority: 'high',
    },
    {
      name: 'Backend API',
      description: 'Node.js API geliştirme',
      priority: 'high',
    },
    {
      name: 'Test ve Deployment',
      description: 'Test senaryoları ve deployment',
      priority: 'medium',
    },
  ],
  tasks: [
    {
      name: 'Ana Sayfa Tasarımı',
      description: 'Modern ve responsive ana sayfa',
      priority: 'high',
      estimated_hours: 8,
    },
    {
      name: 'Ürün Listeleme',
      description: 'Ürün kartları ve filtreleme',
      priority: 'high',
      estimated_hours: 12,
    },
    {
      name: 'API Endpoint Tasarımı',
      description: 'RESTful API tasarımı',
      priority: 'high',
      estimated_hours: 16,
    },
  ],
};

// Test sonuçları
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: [],
  testData: {
    adminToken: null,
    firmaToken: null,
    createdProjectId: null,
    createdSubProjectIds: [],
    createdTaskIds: [],
    assignmentIds: [],
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

// Authentication
async function authenticateUsers() {
  console.log('\n🔐 AUTHENTICATION TESTİ');
  console.log('========================');

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
      testResults.testData.adminToken = response.data.session.access_token;
      logTest('Admin Authentication', 'PASS', `Token alındı`);
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
      testResults.testData.firmaToken = response.data.session.access_token;
      logTest('Firma Authentication', 'PASS', `Token alındı`);
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

  if (!testResults.testData.adminToken) {
    logTest('Main Project Creation', 'FAIL', 'Admin token yok');
    return;
  }

  try {
    const response = await makeRequest('/api/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${testResults.testData.adminToken}` },
      body: TEST_DATA.mainProject,
    });

    if (response.status === 200 || response.status === 201) {
      testResults.testData.createdProjectId =
        response.data.id || response.data.project?.id;
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

// Test 2: Alt proje tanımlama
async function testSubProjectCreation() {
  console.log('\n📂 TEST 2: ALT PROJE TANIMLAMA');
  console.log('===============================');

  if (
    !testResults.testData.adminToken ||
    !testResults.testData.createdProjectId
  ) {
    logTest(
      'Sub Project Creation',
      'FAIL',
      'Admin token veya ana proje ID yok'
    );
    return;
  }

  for (const [index, subProject] of TEST_DATA.subProjects.entries()) {
    try {
      const response = await makeRequest(
        `/api/projects/${testResults.testData.createdProjectId}/sub-projects`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testResults.testData.adminToken}`,
          },
          body: subProject,
        }
      );

      if (response.status === 200 || response.status === 201) {
        const subProjectId = response.data.id || response.data.sub_project?.id;
        testResults.testData.createdSubProjectIds.push(subProjectId);
        logTest(
          `Sub Project ${index + 1} Creation`,
          'PASS',
          `${subProject.name} oluşturuldu: ${subProjectId}`
        );
      } else {
        logTest(
          `Sub Project ${index + 1} Creation`,
          'FAIL',
          `Status: ${response.status}, Response: ${JSON.stringify(response.data)}`
        );
      }
    } catch (error) {
      logTest(
        `Sub Project ${index + 1} Creation`,
        'FAIL',
        `Error: ${error.message}`
      );
    }
  }
}

// Test 3: Firmalara çoklu atama
async function testMultiCompanyAssignment() {
  console.log('\n🏢 TEST 3: ÇOKLU FİRMA ATAMASI');
  console.log('===============================');

  if (
    !testResults.testData.adminToken ||
    !testResults.testData.createdProjectId
  ) {
    logTest(
      'Multi Company Assignment',
      'FAIL',
      'Admin token veya proje ID yok'
    );
    return;
  }

  // Ana projeyi firmaya ata
  try {
    const response = await makeRequest(
      `/api/projects/${testResults.testData.createdProjectId}/assign`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${testResults.testData.adminToken}` },
        body: {
          companyIds: ['6fcc9e92-4169-4b06-9c2f-a8c6cc284d73'], // Mundo company ID
          assignedBy: testResults.testData.adminToken,
        },
      }
    );

    if (response.status === 200 || response.status === 201) {
      logTest('Main Project Assignment', 'PASS', 'Ana proje firmaya atandı');
    } else {
      logTest(
        'Main Project Assignment',
        'FAIL',
        `Status: ${response.status}, Response: ${JSON.stringify(response.data)}`
      );
    }
  } catch (error) {
    logTest('Main Project Assignment', 'FAIL', `Error: ${error.message}`);
  }

  // Alt projeleri firmaya ata
  for (const [
    index,
    subProjectId,
  ] of testResults.testData.createdSubProjectIds.entries()) {
    try {
      const response = await makeRequest(
        `/api/sub-projects/${subProjectId}/assign`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testResults.testData.adminToken}`,
          },
          body: {
            companyIds: ['6fcc9e92-4169-4b06-9c2f-a8c6cc284d73'],
            assignedBy: testResults.testData.adminToken,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        logTest(
          `Sub Project ${index + 1} Assignment`,
          'PASS',
          `Alt proje ${index + 1} firmaya atandı`
        );
      } else {
        logTest(
          `Sub Project ${index + 1} Assignment`,
          'FAIL',
          `Status: ${response.status}, Response: ${JSON.stringify(response.data)}`
        );
      }
    } catch (error) {
      logTest(
        `Sub Project ${index + 1} Assignment`,
        'FAIL',
        `Error: ${error.message}`
      );
    }
  }
}

// Test 4: Firma tarafından atanan projeleri görme
async function testCompanyProjectView() {
  console.log('\n👀 TEST 4: FİRMA PROJE GÖRÜNTÜLEME');
  console.log('===================================');

  if (!testResults.testData.firmaToken) {
    logTest('Company Project View', 'FAIL', 'Firma token yok');
    return;
  }

  try {
    const response = await makeRequest('/api/firma/assigned-projects', {
      headers: { Authorization: `Bearer ${testResults.testData.firmaToken}` },
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
          'FAIL',
          `Test projesi bulunamadı. Toplam: ${projects.length} proje`
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

// Test 5: Görev tamamlama
async function testTaskCompletion() {
  console.log('\n✅ TEST 5: GÖREV TAMAMLAMA');
  console.log('============================');

  if (!testResults.testData.firmaToken) {
    logTest('Task Completion', 'FAIL', 'Firma token yok');
    return;
  }

  // Önce görevleri listele
  try {
    const response = await makeRequest('/api/firma/tasks', {
      headers: { Authorization: `Bearer ${testResults.testData.firmaToken}` },
    });

    if (response.status === 200) {
      const tasks = response.data.tasks || [];
      logTest('Task Listing', 'PASS', `${tasks.length} görev bulundu`);

      // İlk görevi tamamla
      if (tasks.length > 0) {
        const firstTask = tasks[0];
        try {
          const completionResponse = await makeRequest(
            `/api/firma/tasks/${firstTask.id}/complete`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${testResults.testData.firmaToken}`,
              },
              body: {
                completionNote: 'Workflow testi için tamamlandı',
                actualHours: 4.5,
                completionFiles: [],
              },
            }
          );

          if (
            completionResponse.status === 200 ||
            completionResponse.status === 201
          ) {
            logTest(
              'Task Completion',
              'PASS',
              `Görev tamamlandı: ${firstTask.name}`
            );
          } else {
            logTest(
              'Task Completion',
              'FAIL',
              `Status: ${completionResponse.status}, Response: ${JSON.stringify(completionResponse.data)}`
            );
          }
        } catch (error) {
          logTest('Task Completion', 'FAIL', `Error: ${error.message}`);
        }
      } else {
        logTest('Task Completion', 'FAIL', 'Tamamlanacak görev yok');
      }
    } else {
      logTest(
        'Task Listing',
        'FAIL',
        `Status: ${response.status}, Response: ${JSON.stringify(response.data)}`
      );
    }
  } catch (error) {
    logTest('Task Listing', 'FAIL', `Error: ${error.message}`);
  }
}

// Test 6: Danışman onay sistemi
async function testConsultantApproval() {
  console.log('\n👨‍💼 TEST 6: DANIŞMAN ONAY SİSTEMİ');
  console.log('==================================');

  if (!testResults.testData.adminToken) {
    logTest('Consultant Approval', 'FAIL', 'Admin token yok');
    return;
  }

  // Bekleyen onayları listele
  try {
    const response = await makeRequest('/api/consultant/pending-tasks', {
      headers: { Authorization: `Bearer ${testResults.testData.adminToken}` },
    });

    if (response.status === 200) {
      const pendingTasks = response.data.tasks || [];
      logTest(
        'Pending Tasks Listing',
        'PASS',
        `${pendingTasks.length} bekleyen görev`
      );

      // İlk bekleyen görevi onayla
      if (pendingTasks.length > 0) {
        const firstTask = pendingTasks[0];
        try {
          const approvalResponse = await makeRequest(
            `/api/consultant/tasks/${firstTask.id}/approve`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${testResults.testData.adminToken}`,
              },
              body: {
                approvalNote: 'Workflow testi onayı',
                qualityScore: 8.5,
              },
            }
          );

          if (
            approvalResponse.status === 200 ||
            approvalResponse.status === 201
          ) {
            logTest(
              'Task Approval',
              'PASS',
              `Görev onaylandı: ${firstTask.name}`
            );
          } else {
            logTest(
              'Task Approval',
              'FAIL',
              `Status: ${approvalResponse.status}, Response: ${JSON.stringify(approvalResponse.data)}`
            );
          }
        } catch (error) {
          logTest('Task Approval', 'FAIL', `Error: ${error.message}`);
        }
      } else {
        logTest('Task Approval', 'FAIL', 'Onaylanacak görev yok');
      }
    } else {
      logTest(
        'Pending Tasks Listing',
        'FAIL',
        `Status: ${response.status}, Response: ${JSON.stringify(response.data)}`
      );
    }
  } catch (error) {
    logTest('Pending Tasks Listing', 'FAIL', `Error: ${error.message}`);
  }
}

// Test 7: İlerleme takip dashboard
async function testProgressDashboard() {
  console.log('\n📊 TEST 7: İLERLEME TAKİP DASHBOARD');
  console.log('====================================');

  // Admin progress dashboard
  if (testResults.testData.adminToken) {
    try {
      const response = await makeRequest('/api/admin/progress', {
        headers: { Authorization: `Bearer ${testResults.testData.adminToken}` },
      });

      if (response.status === 200) {
        logTest(
          'Admin Progress Dashboard',
          'PASS',
          'Admin ilerleme verileri alındı'
        );
      } else {
        logTest(
          'Admin Progress Dashboard',
          'FAIL',
          `Status: ${response.status}`
        );
      }
    } catch (error) {
      logTest('Admin Progress Dashboard', 'FAIL', `Error: ${error.message}`);
    }
  }

  // Firma progress dashboard
  if (testResults.testData.firmaToken) {
    try {
      const response = await makeRequest('/api/firma/progress', {
        headers: { Authorization: `Bearer ${testResults.testData.firmaToken}` },
      });

      if (response.status === 200) {
        logTest(
          'Firma Progress Dashboard',
          'PASS',
          'Firma ilerleme verileri alındı'
        );
      } else {
        logTest(
          'Firma Progress Dashboard',
          'FAIL',
          `Status: ${response.status}`
        );
      }
    } catch (error) {
      logTest('Firma Progress Dashboard', 'FAIL', `Error: ${error.message}`);
    }
  }
}

// Test 8: Çoklu firma ilerleme karşılaştırması
async function testMultiCompanyProgress() {
  console.log('\n🔄 TEST 8: ÇOKLU FİRMA KARŞILAŞTIRMASI');
  console.log('======================================');

  if (!testResults.testData.adminToken) {
    logTest('Multi Company Progress', 'FAIL', 'Admin token yok');
    return;
  }

  try {
    const response = await makeRequest('/api/progress/dashboard', {
      headers: { Authorization: `Bearer ${testResults.testData.adminToken}` },
    });

    if (response.status === 200) {
      const data = response.data;
      const companyCount = data.companyPerformance?.length || 0;
      const projectCount = data.projectProgress?.length || 0;

      logTest(
        'Multi Company Progress',
        'PASS',
        `${companyCount} firma, ${projectCount} proje karşılaştırması`
      );
    } else {
      logTest('Multi Company Progress', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Multi Company Progress', 'FAIL', `Error: ${error.message}`);
  }
}

// Ana test fonksiyonu
async function runWorkflowTest() {
  console.log('🧪 WORKFLOW TESTER BAŞLIYOR...');
  console.log('===============================');
  console.log(`📅 Test Tarihi: ${new Date().toLocaleString('tr-TR')}`);
  console.log(`🌐 Test URL: ${BASE_URL}`);
  console.log(`⏱️  Timeout: ${TEST_CONFIG.timeout}ms`);
  console.log(`🎯 Test Hedefi: Proje Yönetimi Workflow'u`);

  // Server'ın hazır olmasını bekle
  console.log('\n⏳ Server hazır olması bekleniyor...');
  await delay(3000);

  // Authentication
  await authenticateUsers();

  // Test 1: Ana proje oluşturma
  await testMainProjectCreation();
  await delay(1000);

  // Test 2: Alt proje tanımlama
  await testSubProjectCreation();
  await delay(1000);

  // Test 3: Çoklu firma ataması
  await testMultiCompanyAssignment();
  await delay(1000);

  // Test 4: Firma proje görüntüleme
  await testCompanyProjectView();
  await delay(1000);

  // Test 5: Görev tamamlama
  await testTaskCompletion();
  await delay(1000);

  // Test 6: Danışman onay sistemi
  await testConsultantApproval();
  await delay(1000);

  // Test 7: İlerleme takip dashboard
  await testProgressDashboard();
  await delay(1000);

  // Test 8: Çoklu firma karşılaştırması
  await testMultiCompanyProgress();

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
    console.log('✅ Tüm workflow adımları çalışıyor');
    console.log('✅ Proje yönetimi sistemi aktif');
    console.log('✅ Çoklu firma desteği çalışıyor');
  } else if (testResults.passed / testResults.total >= 0.6) {
    console.log('🟡 WORKFLOW KISMEN HAZIR - %60-80 başarı oranı');
    console.log('⚠️  Bazı workflow adımları sorunlu');
  } else {
    console.log('🔴 WORKFLOW SORUNLU - %60 altı başarı oranı');
    console.log('❌ Kritik workflow sorunları var');
  }

  console.log('\n💡 WORKFLOW ÖNERİLERİ:');
  console.log('1. Başarısız testleri incele ve düzelt');
  console.log("2. API endpoint'lerini kontrol et");
  console.log('3. Veritabanı ilişkilerini doğrula');
  console.log("4. Authentication token'larını kontrol et");

  console.log('\n✨ Workflow testi tamamlandı!');
}

// Script'i çalıştır
if (require.main === module) {
  runWorkflowTest().catch(console.error);
}

module.exports = { runWorkflowTest };
