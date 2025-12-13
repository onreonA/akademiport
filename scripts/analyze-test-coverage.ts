/**
 * Test Coverage Analysis Script
 *
 * Coverage raporunu analiz edip eksik alanları belirler
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface CoverageSummary {
  lines: { total: number; covered: number; pct: number };
  statements: { total: number; covered: number; pct: number };
  functions: { total: number; covered: number; pct: number };
  branches: { total: number; covered: number; pct: number };
}

interface CoverageData {
  [filePath: string]: {
    lines: { total: number; covered: number; pct: number };
    statements: { total: number; covered: number; pct: number };
    functions: { total: number; covered: number; pct: number };
    branches: { total: number; covered: number; pct: number };
  };
}

const COVERAGE_THRESHOLD = 60; // Minimum coverage percentage
const CRITICAL_PATHS = [
  'src/2-application/use-cases', // Business logic
  'src/app/api', // API routes
  'src/4-infrastructure', // Infrastructure layer
];

function analyzeCoverage() {
  console.log('📊 Test Coverage Analizi Başlatılıyor...\n');

  try {
    // Coverage JSON dosyasını oku (önce final, yoksa tmp dosyalarını birleştir)
    let coveragePath = join(process.cwd(), 'coverage', 'coverage-final.json');
    let coverageData: CoverageData;

    try {
      coverageData = JSON.parse(readFileSync(coveragePath, 'utf-8'));
    } catch {
      // coverage-final.json yoksa, tmp dosyalarını birleştir
      console.log('⚠️  coverage-final.json bulunamadı, geçici dosyaları birleştiriliyor...\n');
      const tmpDir = join(process.cwd(), 'coverage', '.tmp');

      try {
        const tmpFiles = readdirSync(tmpDir)
          .filter((f) => f.endsWith('.json'))
          .map((f) => join(tmpDir, f));

        coverageData = {};
        for (const tmpFile of tmpFiles) {
          try {
            const fileContent = readFileSync(tmpFile, 'utf-8');
            if (fileContent.trim().length === 0) continue; // Skip empty files
            const tmpData: CoverageData = JSON.parse(fileContent);
            Object.assign(coverageData, tmpData);
          } catch (err) {
            // Skip invalid files
            console.log(`   ⚠️  Skipping invalid file: ${tmpFile}`);
          }
        }

        if (Object.keys(coverageData).length === 0) {
          throw new Error('Coverage verisi bulunamadı');
        }
      } catch (err) {
        throw new Error(`Coverage verisi bulunamadı: ${err}`);
      }
    }

    // Summary hesapla
    const summary: CoverageSummary = {
      lines: { total: 0, covered: 0, pct: 0 },
      statements: { total: 0, covered: 0, pct: 0 },
      functions: { total: 0, covered: 0, pct: 0 },
      branches: { total: 0, covered: 0, pct: 0 },
    };

    const lowCoverageFiles: Array<{
      path: string;
      coverage: { lines: number; statements: number; functions: number; branches: number };
      isCritical: boolean;
    }> = [];

    // Her dosya için coverage hesapla
    Object.entries(coverageData).forEach(([filePath, data]) => {
      // Skip node_modules, test files, etc.
      if (
        filePath.includes('node_modules') ||
        filePath.includes('.test.') ||
        filePath.includes('.spec.') ||
        filePath.includes('test/')
      ) {
        return;
      }

      // Summary'e ekle
      summary.lines.total += data.lines.total;
      summary.lines.covered += data.lines.covered;
      summary.statements.total += data.statements.total;
      summary.statements.covered += data.statements.covered;
      summary.functions.total += data.functions.total;
      summary.functions.covered += data.functions.covered;
      summary.branches.total += data.branches.total;
      summary.branches.covered += data.branches.covered;

      // Low coverage dosyaları tespit et
      const minCoverage = Math.min(
        data.lines.pct,
        data.statements.pct,
        data.functions.pct,
        data.branches.pct
      );

      if (minCoverage < COVERAGE_THRESHOLD) {
        const isCritical = CRITICAL_PATHS.some((path) => filePath.includes(path));
        lowCoverageFiles.push({
          path: filePath,
          coverage: {
            lines: data.lines.pct,
            statements: data.statements.pct,
            functions: data.functions.pct,
            branches: data.branches.pct,
          },
          isCritical,
        });
      }
    });

    // Summary percentage hesapla
    summary.lines.pct =
      summary.lines.total > 0 ? (summary.lines.covered / summary.lines.total) * 100 : 0;
    summary.statements.pct =
      summary.statements.total > 0
        ? (summary.statements.covered / summary.statements.total) * 100
        : 0;
    summary.functions.pct =
      summary.functions.total > 0 ? (summary.functions.covered / summary.functions.total) * 100 : 0;
    summary.branches.pct =
      summary.branches.total > 0 ? (summary.branches.covered / summary.branches.total) * 100 : 0;

    // Sonuçları yazdır
    console.log('📈 Genel Coverage Özeti:');
    console.log(
      `   Lines:      ${summary.lines.pct.toFixed(2)}% (${summary.lines.covered}/${summary.lines.total})`
    );
    console.log(
      `   Statements: ${summary.statements.pct.toFixed(2)}% (${summary.statements.covered}/${summary.statements.total})`
    );
    console.log(
      `   Functions:  ${summary.functions.pct.toFixed(2)}% (${summary.functions.covered}/${summary.functions.total})`
    );
    console.log(
      `   Branches:   ${summary.branches.pct.toFixed(2)}% (${summary.branches.covered}/${summary.branches.total})`
    );
    console.log('');

    // Low coverage dosyaları
    console.log(
      `⚠️  Düşük Coverage (<${COVERAGE_THRESHOLD}%) Dosyalar: ${lowCoverageFiles.length}`
    );
    console.log('');

    // Critical path'leri önce göster
    const criticalFiles = lowCoverageFiles.filter((f) => f.isCritical);
    const nonCriticalFiles = lowCoverageFiles.filter((f) => !f.isCritical);

    if (criticalFiles.length > 0) {
      console.log("🔴 Kritik Path'ler (Öncelikli):");
      criticalFiles
        .sort((a, b) => {
          const aMin = Math.min(...Object.values(a.coverage));
          const bMin = Math.min(...Object.values(b.coverage));
          return aMin - bMin;
        })
        .slice(0, 20)
        .forEach((file) => {
          const minCoverage = Math.min(...Object.values(file.coverage));
          console.log(`   ${minCoverage.toFixed(1)}% - ${file.path}`);
        });
      console.log('');
    }

    if (nonCriticalFiles.length > 0) {
      console.log('🟡 Diğer Dosyalar:');
      nonCriticalFiles
        .sort((a, b) => {
          const aMin = Math.min(...Object.values(a.coverage));
          const bMin = Math.min(...Object.values(b.coverage));
          return aMin - bMin;
        })
        .slice(0, 20)
        .forEach((file) => {
          const minCoverage = Math.min(...Object.values(file.coverage));
          console.log(`   ${minCoverage.toFixed(1)}% - ${file.path}`);
        });
      console.log('');
    }

    // Öneriler
    console.log('💡 Öneriler:');
    if (summary.lines.pct < COVERAGE_THRESHOLD) {
      console.log(`   ⚠️  Genel coverage ${COVERAGE_THRESHOLD}%'ın altında!`);
    }
    if (criticalFiles.length > 0) {
      console.log(`   🔴 ${criticalFiles.length} kritik dosya için test eklenmeli`);
    }
    console.log('');

    // JSON raporu oluştur
    const report = {
      summary,
      lowCoverageFiles: lowCoverageFiles.slice(0, 50), // İlk 50 dosya
      criticalFiles: criticalFiles.slice(0, 20),
      timestamp: new Date().toISOString(),
    };

    const reportPath = join(process.cwd(), 'test-results', 'coverage-analysis.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Detaylı rapor: ${reportPath}`);

    // Exit code
    if (summary.lines.pct < COVERAGE_THRESHOLD || criticalFiles.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Coverage analizi başarısız:', error);
    console.error('💡 Önce "npm run test:coverage" çalıştırın');
    process.exit(1);
  }
}

analyzeCoverage();
