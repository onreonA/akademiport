#!/usr/bin/env node

/**
 * 🚀 IA-6 Performance Test Suite
 * Comprehensive performance testing for the entire project
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 IA-6 Performance Test Suite Başlatılıyor...\n');

// Test sonuçları için klasör oluştur
const resultsDir = path.join(__dirname, 'performance-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Test konfigürasyonu
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  pages: [
    '/',
    '/firma',
    '/firma/dashboard-test',
    '/firma/egitimlerim/videolar',
    '/firma/proje-yonetimi',
    '/admin',
    '/admin/dashboard',
    '/admin/firma-yonetimi',
    '/program-hakkinda',
    '/kariyer',
  ],
  apiEndpoints: [
    '/api/firma/dashboard-stats',
    '/api/firma/me',
    '/api/projects',
    '/api/company/education-assignments',
    '/api/admin/dashboard-stats',
  ],
};

// Lighthouse test fonksiyonu
async function runLighthouseTest() {
  console.log('📊 1. Lighthouse Performance Test Başlatılıyor...\n');

  try {
    // Lighthouse CI kurulumu kontrol et
    try {
      execSync('npx @lighthouse-ci/cli --version', { stdio: 'ignore' });
      console.log('✅ Lighthouse CI zaten kurulu');
    } catch (error) {
      console.log('📦 Lighthouse CI kuruluyor...');
      execSync('npm install --save-dev @lighthouse-ci/cli', {
        stdio: 'inherit',
      });
    }

    // Lighthouse config dosyası oluştur
    const lighthouseConfig = {
      ci: {
        collect: {
          numberOfRuns: 3,
          url: TEST_CONFIG.pages.map(page => `${TEST_CONFIG.baseUrl}${page}`),
        },
        assert: {
          assertions: {
            'categories:performance': ['error', { minScore: 0.7 }],
            'categories:accessibility': ['error', { minScore: 0.9 }],
            'categories:best-practices': ['error', { minScore: 0.8 }],
            'categories:seo': ['error', { minScore: 0.8 }],
            'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
            'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
            'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
            'speed-index': ['error', { maxNumericValue: 3000 }],
          },
        },
        upload: {
          target: 'filesystem',
          outputDir: './performance-results/lighthouse',
        },
      },
    };

    fs.writeFileSync(
      path.join(__dirname, 'lighthouserc.js'),
      `module.exports = ${JSON.stringify(lighthouseConfig, null, 2)};`
    );

    console.log('🔍 Lighthouse test çalıştırılıyor...');
    execSync('npx lhci autorun', { stdio: 'inherit' });

    console.log('✅ Lighthouse test tamamlandı!');
    console.log(`📁 Sonuçlar: ./performance-results/lighthouse/`);
  } catch (error) {
    console.error('❌ Lighthouse test hatası:', error.message);
  }
}

// Bundle Analyzer test fonksiyonu
async function runBundleAnalysis() {
  console.log('\n📦 2. Bundle Analysis Başlatılıyor...\n');

  try {
    // Bundle analyzer kurulumu kontrol et
    try {
      execSync('npx @next/bundle-analyzer --version', { stdio: 'ignore' });
      console.log('✅ Bundle Analyzer zaten kurulu');
    } catch (error) {
      console.log('📦 Bundle Analyzer kuruluyor...');
      execSync('npm install --save-dev @next/bundle-analyzer', {
        stdio: 'inherit',
      });
    }

    console.log('🔍 Bundle analizi çalıştırılıyor...');
    execSync('ANALYZE=true npm run build', { stdio: 'inherit' });

    console.log('✅ Bundle analizi tamamlandı!');
    console.log('📁 Sonuçlar: .next/analyze/ klasöründe');
  } catch (error) {
    console.error('❌ Bundle analizi hatası:', error.message);
  }
}

// API Load Test fonksiyonu
async function runAPILoadTest() {
  console.log('\n⚡ 3. API Load Test Başlatılıyor...\n');

  try {
    // Artillery kurulumu kontrol et
    try {
      execSync('npx artillery --version', { stdio: 'ignore' });
      console.log('✅ Artillery zaten kurulu');
    } catch (error) {
      console.log('📦 Artillery kuruluyor...');
      execSync('npm install --save-dev artillery', { stdio: 'inherit' });
    }

    // Artillery config dosyası oluştur
    const artilleryConfig = {
      config: {
        target: TEST_CONFIG.baseUrl,
        phases: [
          { duration: '30s', arrivalRate: 5 },
          { duration: '1m', arrivalRate: 10 },
          { duration: '30s', arrivalRate: 5 },
        ],
      },
      scenarios: [
        {
          name: 'API Load Test',
          weight: 100,
          flow: TEST_CONFIG.apiEndpoints.map(endpoint => ({
            get: {
              url: endpoint,
              capture: [{ json: '$.responseTime', as: 'responseTime' }],
            },
          })),
        },
      ],
    };

    fs.writeFileSync(
      path.join(resultsDir, 'artillery-config.yml'),
      require('yaml').stringify(artilleryConfig)
    );

    console.log('🔍 API Load test çalıştırılıyor...');
    execSync(
      `npx artillery run ${path.join(resultsDir, 'artillery-config.yml')} --output ${path.join(resultsDir, 'api-load-test.json')}`,
      {
        stdio: 'inherit',
      }
    );

    console.log('✅ API Load test tamamlandı!');
    console.log(`📁 Sonuçlar: ${path.join(resultsDir, 'api-load-test.json')}`);
  } catch (error) {
    console.error('❌ API Load test hatası:', error.message);
  }
}

// Web Vitals monitoring
async function runWebVitalsTest() {
  console.log('\n📈 4. Web Vitals Monitoring Başlatılıyor...\n');

  try {
    // Web Vitals kurulumu kontrol et
    try {
      execSync('npm list web-vitals', { stdio: 'ignore' });
      console.log('✅ Web Vitals zaten kurulu');
    } catch (error) {
      console.log('📦 Web Vitals kuruluyor...');
      execSync('npm install web-vitals', { stdio: 'inherit' });
    }

    // Web Vitals test script'i oluştur
    const webVitalsScript = `
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  console.log('Web Vital:', metric);
  // Burada analytics servisine gönderebilirsiniz
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
`;

    fs.writeFileSync(
      path.join(resultsDir, 'web-vitals-test.js'),
      webVitalsScript
    );

    console.log('✅ Web Vitals monitoring hazır!');
    console.log('📁 Script: ./performance-results/web-vitals-test.js');
  } catch (error) {
    console.error('❌ Web Vitals test hatası:', error.message);
  }
}

// Ana test fonksiyonu
async function runAllTests() {
  console.log('🎯 IA-6 Comprehensive Performance Test Suite\n');
  console.log('📋 Test Edilecek Alanlar:');
  console.log('   1. 📊 Lighthouse Performance (Web Vitals)');
  console.log('   2. 📦 Bundle Analysis (JavaScript Size)');
  console.log('   3. ⚡ API Load Testing (Backend Performance)');
  console.log('   4. 📈 Web Vitals Monitoring (Real-time)\n');

  try {
    await runLighthouseTest();
    await runBundleAnalysis();
    await runAPILoadTest();
    await runWebVitalsTest();

    console.log('\n🎉 Tüm performans testleri tamamlandı!');
    console.log('📁 Sonuçlar: ./performance-results/ klasöründe');
    console.log('\n📊 Özet:');
    console.log('   - Lighthouse: Web Vitals ve Core Metrics');
    console.log('   - Bundle: JavaScript bundle optimizasyonu');
    console.log('   - API Load: Backend performans testi');
    console.log('   - Web Vitals: Real-time monitoring');
  } catch (error) {
    console.error('❌ Test suite hatası:', error.message);
  }
}

// Test başlat
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runLighthouseTest,
  runBundleAnalysis,
  runAPILoadTest,
  runWebVitalsTest,
  runAllTests,
};
