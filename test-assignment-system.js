// Test Assignment System
// Bu script enhanced assignment system'i test eder

const testData = {
  projectId: 'c5095cbe-f204-4ad5-bc03-5e9c0f2c2026',
  subProjectId: '32a7fefc-fdc5-4c1c-b250-365931e5d644',
  companyId: '6fcc9e92-4169-4b06-9c2f-a8c6cc284d73', // Mundo
  testCompanyId: 'b33e55f2-0d16-43d4-b922-3c7b42d48a34', // ABS Door
};

async function testAssignmentSystem() {
  console.log('🧪 Enhanced Assignment System Test Başlıyor...\n');

  try {
    // Test 1: Project Assignment API
    console.log('📋 Test 1: Project Assignment API');
    await testProjectAssignmentAPI();

    // Test 2: Sub-Project Assignment API
    console.log('\n📋 Test 2: Sub-Project Assignment API');
    await testSubProjectAssignmentAPI();

    // Test 3: Company Project Access
    console.log('\n📋 Test 3: Company Project Access');
    await testCompanyProjectAccess();

    // Test 4: Bulk Operations
    console.log('\n📋 Test 4: Bulk Operations');
    await testBulkOperations();

    // Test 5: Analytics
    console.log('\n📋 Test 5: Analytics');
    await testAnalytics();

    console.log('\n✅ Tüm testler tamamlandı!');
  } catch (error) {
    console.error('❌ Test hatası:', error);
  }
}

async function testProjectAssignmentAPI() {
  try {
    // Get current assignments
    const response = await fetch(
      `http://localhost:3000/api/admin/projects/${testData.projectId}/assignments`,
      {
        method: 'GET',
        headers: {
          Cookie:
            'auth-user-email=admin@ihracatakademi.com; auth-user-role=admin',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log(
        `✅ Project assignments fetched: ${data.assignments.length} assignments, ${data.allCompanies.length} companies`
      );
    } else {
      console.log(`❌ Failed to fetch project assignments: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Project assignment API error: ${error.message}`);
  }
}

async function testSubProjectAssignmentAPI() {
  try {
    // Get current assignments
    const response = await fetch(
      `http://localhost:3000/api/admin/sub-projects/${testData.subProjectId}/assignments`,
      {
        method: 'GET',
        headers: {
          Cookie:
            'auth-user-email=admin@ihracatakademi.com; auth-user-role=admin',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log(
        `✅ Sub-project assignments fetched: ${data.assignments.length} assignments`
      );
      console.log(`✅ Parent project: ${data.subProject.projects?.name}`);
    } else {
      console.log(
        `❌ Failed to fetch sub-project assignments: ${response.status}`
      );
    }
  } catch (error) {
    console.log(`❌ Sub-project assignment API error: ${error.message}`);
  }
}

async function testCompanyProjectAccess() {
  try {
    // Test company access to project
    const response = await fetch(
      `http://localhost:3000/api/firma/projects/${testData.projectId}`,
      {
        method: 'GET',
        headers: {
          Cookie: 'auth-user-email=info@mundo.com; auth-user-role=firma_admin',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Company project access: ${data.project.name}`);
      console.log(`✅ Assignment status: ${data.assignmentStatus}`);
      console.log(`✅ Is locked: ${data.isLocked}`);
      console.log(`✅ Sub-projects: ${data.project.subProjects?.length || 0}`);
      console.log(`✅ Tasks: ${data.project.tasks?.length || 0}`);
    } else {
      console.log(`❌ Failed to access company project: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Company project access error: ${error.message}`);
  }
}

async function testBulkOperations() {
  try {
    // Test bulk assignment report
    const response = await fetch(
      'http://localhost:3000/api/admin/bulk-operations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie:
            'auth-user-email=admin@ihracatakademi.com; auth-user-role=admin',
        },
        body: JSON.stringify({
          operation: 'generate_assignment_report',
          data: {
            type: 'assignment_summary',
            filters: { timeRange: '30d' },
          },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Bulk operations test: ${data.results.length} results`);
      if (data.results.length > 0) {
        const report = data.results[0];
        console.log(`✅ Report generated: ${report.data?.type}`);
      }
    } else {
      console.log(`❌ Failed to test bulk operations: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Bulk operations error: ${error.message}`);
  }
}

async function testAnalytics() {
  try {
    // Test analytics data
    const response = await fetch(
      'http://localhost:3000/api/admin/bulk-operations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie:
            'auth-user-email=admin@ihracatakademi.com; auth-user-role=admin',
        },
        body: JSON.stringify({
          operation: 'generate_assignment_report',
          data: {
            type: 'company_projects',
            filters: { timeRange: '30d' },
          },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Analytics test: ${data.results.length} results`);
      if (data.results.length > 0) {
        const report = data.results[0];
        console.log(
          `✅ Company projects report: ${report.data?.total} assignments`
        );
      }
    } else {
      console.log(`❌ Failed to test analytics: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Analytics error: ${error.message}`);
  }
}

// Test'i çalıştır
testAssignmentSystem();
