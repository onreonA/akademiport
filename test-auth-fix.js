#!/usr/bin/env node

/**
 * 🔍 Authentication Fix Test Script
 * API'lerin artık çalışıp çalışmadığını test eder
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testAuthentication() {
  console.log('🔍 Authentication Fix Test Başlatılıyor...\n');

  try {
    // 1. Login test
    console.log('📊 1. LOGIN TEST:');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'info@mundo.com',
        password: '123456',
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login Status:', loginResponse.status);
    console.log('Login Response:', loginData);

    if (loginResponse.status !== 200) {
      console.log('❌ Login failed, stopping tests');
      return;
    }

    // Extract cookies
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    console.log('Set-Cookie:', setCookieHeader);

    // 2. Dashboard stats test
    console.log('\n📊 2. DASHBOARD STATS TEST:');
    const dashboardResponse = await fetch(
      `${BASE_URL}/api/firma/dashboard-stats`,
      {
        headers: {
          Cookie: setCookieHeader || '',
        },
      }
    );

    const dashboardData = await dashboardResponse.json();
    console.log('Dashboard Status:', dashboardResponse.status);
    console.log('Dashboard Response:', dashboardData);

    // 3. Firma me test
    console.log('\n📊 3. FIRMA ME TEST:');
    const meResponse = await fetch(`${BASE_URL}/api/firma/me`, {
      headers: {
        Cookie: setCookieHeader || '',
      },
    });

    const meData = await meResponse.json();
    console.log('Me Status:', meResponse.status);
    console.log('Me Response:', meData);

    // 4. Assigned projects test
    console.log('\n📊 4. ASSIGNED PROJECTS TEST:');
    const projectsResponse = await fetch(
      `${BASE_URL}/api/firma/assigned-projects`,
      {
        headers: {
          Cookie: setCookieHeader || '',
        },
      }
    );

    const projectsData = await projectsResponse.json();
    console.log('Projects Status:', projectsResponse.status);
    console.log('Projects Response:', projectsData);

    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log(
      '✅ Login:',
      loginResponse.status === 200 ? 'SUCCESS' : 'FAILED'
    );
    console.log(
      '✅ Dashboard Stats:',
      dashboardResponse.status === 200 ? 'SUCCESS' : 'FAILED'
    );
    console.log(
      '✅ Firma Me:',
      meResponse.status === 200 ? 'SUCCESS' : 'FAILED'
    );
    console.log(
      '✅ Assigned Projects:',
      projectsResponse.status === 200 ? 'SUCCESS' : 'FAILED'
    );
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Test'i çalıştır
testAuthentication();
