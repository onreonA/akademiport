/**
 * Test Performance Optimization Script
 *
 * Yavaş testleri tespit edip optimize eder
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface TestResult {
  name: string;
  duration: number;
  file: string;
}

const SLOW_TEST_THRESHOLD = 1000; // 1 second

function analyzeTestPerformance() {
  console.log('⚡ Test Performance Analizi Başlatılıyor...\n');

  try {
    // Test results JSON dosyasını oku
    const resultsPath = join(process.cwd(), 'test-results', 'results.json');
    const resultsData = JSON.parse(readFileSync(resultsPath, 'utf-8'));

    const slowTests: TestResult[] = [];
    const testFiles: Map<string, number> = new Map();

    // Test sonuçlarını analiz et
    if (resultsData.testResults) {
      resultsData.testResults.forEach((testFile: any) => {
        const fileName = testFile.name;
        let totalDuration = 0;

        if (testFile.assertionResults) {
          testFile.assertionResults.forEach((test: any) => {
            const duration = test.duration || 0;
            totalDuration += duration;

            if (duration > SLOW_TEST_THRESHOLD) {
              slowTests.push({
                name: test.fullName || test.title,
                duration,
                file: fileName,
              });
            }
          });
        }

        testFiles.set(fileName, totalDuration);
      });
    }

    // Sonuçları yazdır
    console.log('📊 Test Performance Özeti:\n');

    // En yavaş test dosyaları
    const sortedFiles = Array.from(testFiles.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    console.log('🐌 En Yavaş Test Dosyaları:');
    sortedFiles.forEach(([file, duration]) => {
      console.log(`   ${(duration / 1000).toFixed(2)}s - ${file}`);
    });
    console.log('');

    // Yavaş testler
    if (slowTests.length > 0) {
      console.log(`⚠️  Yavaş Testler (>${SLOW_TEST_THRESHOLD}ms): ${slowTests.length}\n`);

      const sortedSlowTests = slowTests.sort((a, b) => b.duration - a.duration).slice(0, 20);

      console.log('🔴 En Yavaş Testler:');
      sortedSlowTests.forEach((test) => {
        console.log(`   ${(test.duration / 1000).toFixed(2)}s - ${test.name}`);
        console.log(`      File: ${test.file}`);
      });
      console.log('');
    } else {
      console.log('✅ Yavaş test bulunamadı (tüm testler <1s)\n');
    }

    // Öneriler
    console.log('💡 Optimizasyon Önerileri:');
    if (slowTests.length > 0) {
      console.log('   1. Yavaş testleri optimize et:');
      console.log("      - Mock'ları iyileştir");
      console.log('      - Gereksiz async işlemleri kaldır');
      console.log('      - Test isolation iyileştir');
      console.log('');
    }

    const totalDuration = Array.from(testFiles.values()).reduce((a, b) => a + b, 0);
    const avgDuration = totalDuration / testFiles.size;

    console.log(`   Toplam Test Süresi: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`   Ortalama Test Dosyası Süresi: ${(avgDuration / 1000).toFixed(2)}s`);
    console.log('');

    // JSON raporu oluştur
    const report = {
      slowTests: sortedSlowTests,
      slowFiles: sortedFiles.map(([file, duration]) => ({ file, duration })),
      totalDuration,
      avgDuration,
      timestamp: new Date().toISOString(),
    };

    const reportPath = join(process.cwd(), 'test-results', 'performance-analysis.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Detaylı rapor: ${reportPath}`);

    // Exit code
    if (slowTests.length > 10) {
      console.log('⚠️  Çok fazla yavaş test var, optimizasyon önerilir');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Performance analizi başarısız:', error);
    console.error('💡 Önce "npm run test:run" çalıştırın');
    process.exit(1);
  }
}

analyzeTestPerformance();
