#!/usr/bin/env node

/**
 * 🚀 DAY 2: End-to-End Workflow Test
 * Tam proje yönetimi workflow'unu test eder
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Test data
const TEST_DATA = {
  admin: {
    email: 'admin@ihracatakademi.com',
    password: '123456',
  },
  company: {
    email: 'info@mundo.com',
    password: '123456',
  },
  project: {
    id: 'c7dc068c-4c57-4f28-92da-06756daf7552',
  },
  subProject: {
    id: '3882a07e-2afc-4bd1-953e-e0bce09129e7',
  },
};

async function testWorkflow() {
  console.log('🚀 DAY 2: End-to-End Workflow Test Başlatılıyor...\n');

  let adminCookies = '';
  let companyCookies = '';

  try {
    // 1. Admin Login
    console.log('📊 1. ADMIN LOGIN:');
    const adminLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_DATA.admin.email,
        password: TEST_DATA.admin.password,
      }),
    });

    if (adminLoginResponse.status !== 200) {
      console.log('❌ Admin login failed');
      return;
    }

    adminCookies = adminLoginResponse.headers.get('set-cookie') || '';
    console.log('✅ Admin login successful');

    // 2. Company Login
    console.log('\n📊 2. COMPANY LOGIN:');
    const companyLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_DATA.company.email,
        password: TEST_DATA.company.password,
      }),
    });

    if (companyLoginResponse.status !== 200) {
      console.log('❌ Company login failed');
      return;
    }

    companyCookies = companyLoginResponse.headers.get('set-cookie') || '';
    console.log('✅ Company login successful');

    // 3. Admin: Get Project Details
    console.log('\n📊 3. ADMIN: GET PROJECT DETAILS:');
    const projectResponse = await fetch(
      `${BASE_URL}/api/projects/${TEST_DATA.project.id}`,
      {
        headers: { Cookie: adminCookies },
      }
    );

    const projectData = await projectResponse.json();
    console.log('Project Status:', projectResponse.status);
    console.log('Project Name:', projectData.project?.name || 'N/A');

    // 4. Admin: Get Sub-Projects
    console.log('\n📊 4. ADMIN: GET SUB-PROJECTS:');
    const subProjectsResponse = await fetch(
      `${BASE_URL}/api/projects/${TEST_DATA.project.id}/sub-projects`,
      {
        headers: { Cookie: adminCookies },
      }
    );

    const subProjectsData = await subProjectsResponse.json();
    console.log('Sub-Projects Status:', subProjectsResponse.status);
    console.log(
      'Sub-Projects Count:',
      subProjectsData.subProjects?.length || 0
    );

    // 5. Admin: Get Tasks
    console.log('\n📊 5. ADMIN: GET TASKS:');
    const tasksResponse = await fetch(
      `${BASE_URL}/api/projects/${TEST_DATA.project.id}/tasks`,
      {
        headers: { Cookie: adminCookies },
      }
    );

    const tasksData = await tasksResponse.json();
    console.log('Tasks Status:', tasksResponse.status);
    console.log('Tasks Count:', tasksData.tasks?.length || 0);

    // 6. Admin: Create New Task
    console.log('\n📊 6. ADMIN: CREATE NEW TASK:');
    const newTaskResponse = await fetch(
      `${BASE_URL}/api/projects/${TEST_DATA.project.id}/tasks`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: adminCookies,
        },
        body: JSON.stringify({
          title: 'DAY 2 Test Görevi',
          description: 'Bu görev Day 2 test için oluşturuldu',
          priority: 'Orta',
          subProjectId: TEST_DATA.subProject.id,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 gün sonra
        }),
      }
    );

    const newTaskData = await newTaskResponse.json();
    console.log('Create Task Status:', newTaskResponse.status);
    console.log('New Task ID:', newTaskData.task?.id || 'N/A');

    // 7. Company: Get Assigned Projects
    console.log('\n📊 7. COMPANY: GET ASSIGNED PROJECTS:');
    const companyProjectsResponse = await fetch(
      `${BASE_URL}/api/firma/assigned-projects`,
      {
        headers: { Cookie: companyCookies },
      }
    );

    const companyProjectsData = await companyProjectsResponse.json();
    console.log('Company Projects Status:', companyProjectsResponse.status);
    console.log(
      'Company Projects Count:',
      companyProjectsData.projects?.length || 0
    );

    // 8. Company: Get Tasks
    console.log('\n📊 8. COMPANY: GET TASKS:');
    const companyTasksResponse = await fetch(`${BASE_URL}/api/firma/tasks`, {
      headers: { Cookie: companyCookies },
    });

    const companyTasksData = await companyTasksResponse.json();
    console.log('Company Tasks Status:', companyTasksResponse.status);
    console.log('Company Tasks Count:', companyTasksData.tasks?.length || 0);

    // 9. Company: Complete Task (if any tasks exist)
    if (companyTasksData.tasks && companyTasksData.tasks.length > 0) {
      console.log('\n📊 9. COMPANY: COMPLETE TASK:');
      const taskToComplete = companyTasksData.tasks[0];

      const completeTaskResponse = await fetch(
        `${BASE_URL}/api/firma/tasks/${taskToComplete.id}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: companyCookies,
          },
          body: JSON.stringify({
            completionNote: 'DAY 2 test tamamlama notu',
            completionDate: new Date().toISOString(),
          }),
        }
      );

      const completeTaskData = await completeTaskResponse.json();
      console.log('Complete Task Status:', completeTaskResponse.status);
      console.log('Completion Message:', completeTaskData.message || 'N/A');
    } else {
      console.log('\n📊 9. COMPANY: COMPLETE TASK:');
      console.log('⚠️ No tasks available to complete');
    }

    // 10. Admin: Get Dashboard Stats
    console.log('\n📊 10. ADMIN: GET DASHBOARD STATS:');
    const adminStatsResponse = await fetch(
      `${BASE_URL}/api/admin/dashboard-stats`,
      {
        headers: { Cookie: adminCookies },
      }
    );

    const adminStatsData = await adminStatsResponse.json();
    console.log('Admin Stats Status:', adminStatsResponse.status);
    console.log('Total Projects:', adminStatsData.data?.projects?.total || 0);

    // 11. Company: Get Dashboard Stats
    console.log('\n📊 11. COMPANY: GET DASHBOARD STATS:');
    const companyStatsResponse = await fetch(
      `${BASE_URL}/api/firma/dashboard-stats`,
      {
        headers: { Cookie: companyCookies },
      }
    );

    const companyStatsData = await companyStatsResponse.json();
    console.log('Company Stats Status:', companyStatsResponse.status);
    console.log(
      'Company Projects:',
      companyStatsData.data?.projects?.total || 0
    );

    // Summary
    console.log('\n📊 WORKFLOW TEST SUMMARY:');
    console.log(
      '✅ Admin Login:',
      adminLoginResponse.status === 200 ? 'SUCCESS' : 'FAILED'
    );
    console.log(
      '✅ Company Login:',
      companyLoginResponse.status === 200 ? 'SUCCESS' : 'FAILED'
    );
    console.log(
      '✅ Admin Get Project:',
      projectResponse.status === 200 ? 'SUCCESS' : 'FAILED'
    );
    console.log(
      '✅ Admin Get Sub-Projects:',
      subProjectsResponse.status === 200 ? 'SUCCESS' : 'FAILED'
    );
    console.log(
      '✅ Admin Get Tasks:',
      tasksResponse.status === 200 ? 'SUCCESS' : 'FAILED'
    );
    console.log(
      '✅ Admin Create Task:',
      newTaskResponse.status === 201 ? 'SUCCESS' : 'FAILED'
    );
    console.log(
      '✅ Company Get Projects:',
      companyProjectsResponse.status === 200 ? 'SUCCESS' : 'FAILED'
    );
    console.log(
      '✅ Company Get Tasks:',
      companyTasksResponse.status === 200 ? 'SUCCESS' : 'FAILED'
    );
    console.log(
      '✅ Admin Dashboard:',
      adminStatsResponse.status === 200 ? 'SUCCESS' : 'FAILED'
    );
    console.log(
      '✅ Company Dashboard:',
      companyStatsResponse.status === 200 ? 'SUCCESS' : 'FAILED'
    );
  } catch (error) {
    console.error('❌ Workflow test error:', error);
  }
}

// Test'i çalıştır
testWorkflow();
