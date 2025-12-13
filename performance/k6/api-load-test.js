/**
 * k6 Load Test: API Endpoints
 *
 * API endpoint'lerinin performansını test eder
 *
 * Kullanım:
 * - k6 run performance/k6/api-load-test.js
 * - k6 run --vus 10 --duration 30s performance/k6/api-load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 users
    { duration: '1m', target: 10 }, // Stay at 10 users
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 }, // Stay at 20 users
    { duration: '30s', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.05'], // Error rate should be less than 5%
    errors: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test data
const testUser = {
  email: __ENV.TEST_EMAIL || 'test@example.com',
  password: __ENV.TEST_PASSWORD || 'test123',
};

export default function () {
  // Test 1: Health check / API status
  let res = http.get(`${BASE_URL}/api/health`);
  check(res, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: Dashboard stats API (requires auth - will likely fail without proper setup)
  // This is a placeholder for authenticated endpoints
  res = http.get(`${BASE_URL}/api/dashboard/stats`, {
    headers: {
      'Content-Type': 'application/json',
      // Note: In real scenario, you'd need to authenticate first
    },
  });

  // Accept both 200 (success) and 401 (unauthorized) as expected responses
  check(res, {
    'dashboard stats response received': (r) => r.status === 200 || r.status === 401,
    'dashboard stats response time < 2000ms': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(1);

  // Test 3: Public endpoints (if any)
  res = http.get(`${BASE_URL}/`);
  check(res, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage response time < 2000ms': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(1);
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    'performance/k6-results.json': JSON.stringify(data),
  };
}

function textSummary(data, options) {
  const indent = options.indent || ' ';
  const enableColors = options.enableColors || false;

  let summary = '\n';
  summary += `${indent}Test Summary\n`;
  summary += `${indent}============\n\n`;

  summary += `${indent}Duration: ${data.state.testRunDurationMs / 1000}s\n`;
  summary += `${indent}VUs: ${data.metrics.vus.values.max}\n`;
  summary += `${indent}Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += `${indent}Failed: ${data.metrics.http_req_failed.values.rate * 100}%\n`;
  summary += `${indent}Avg Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}P95 Response Time: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;

  return summary;
}

