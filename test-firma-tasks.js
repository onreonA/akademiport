#!/usr/bin/env node

const http = require('http');

async function testFirmaTasks() {
  console.log('🧪 Firma Tasks API Test');

  // Step 1: Login to get cookies
  const loginResponse = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: {
      email: 'info@mundo.com',
      password: '123456',
    },
  });

  console.log('Login Status:', loginResponse.status);
  console.log('Login Response:', JSON.stringify(loginResponse.data, null, 2));

  if (loginResponse.status !== 200) {
    console.log('❌ Login failed');
    return;
  }

  // Step 2: Extract cookies
  const cookies = extractCookies(loginResponse.headers['set-cookie']);
  console.log('Cookies:', cookies);

  // Step 3: Test tasks API
  const tasksResponse = await makeRequest('/api/firma/tasks', {
    headers: { Cookie: cookies },
  });

  console.log('Tasks Status:', tasksResponse.status);
  console.log('Tasks Response:', JSON.stringify(tasksResponse.data, null, 2));
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
        'User-Agent': 'TestScript/1.0',
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

function extractCookies(setCookieHeader) {
  if (!setCookieHeader) return '';

  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : [setCookieHeader];

  return cookies.map(cookie => cookie.split(';')[0]).join('; ');
}

testFirmaTasks().catch(console.error);
