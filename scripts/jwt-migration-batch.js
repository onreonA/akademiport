#!/usr/bin/env node

/**
 * JWT Kimlik Doğrulama Sistemi Toplu Geçiş Script'i
 *
 * Bu script, belirtilen dizindeki tüm API endpoint'lerini eski cookie/header tabanlı kimlik doğrulama sisteminden
 * yeni JWT token tabanlı kimlik doğrulama sistemine geçirmek için kullanılır.
 *
 * Kullanım: node jwt-migration-batch.js [dizin_yolu]
 * Örnek: node jwt-migration-batch.js app/api/firma
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Komut satırı argümanlarını al
const args = process.argv.slice(2);
const targetDir = args[0] || 'app/api';

if (!fs.existsSync(targetDir)) {
  console.error(`Hata: ${targetDir} dizini bulunamadı.`);
  process.exit(1);
}

// Tüm route.ts dosyalarını bul
console.log(`🔍 ${targetDir} dizinindeki route.ts dosyaları aranıyor...`);
const routeFiles = findRouteFiles(targetDir);
console.log(`✅ ${routeFiles.length} adet route.ts dosyası bulundu.`);

// JWT kimlik doğrulamaya geçirilecek dosyaları filtrele
console.log('🔍 JWT kimlik doğrulamaya geçirilecek dosyalar belirleniyor...');
const filesToMigrate = filterFilesToMigrate(routeFiles);
console.log(
  `✅ ${filesToMigrate.length} adet dosya JWT kimlik doğrulamaya geçirilecek.`
);

// Dosyaları JWT kimlik doğrulamaya geçir
console.log('🚀 JWT kimlik doğrulamaya geçiş başlatılıyor...');
let successCount = 0;
let errorCount = 0;

filesToMigrate.forEach((file, index) => {
  console.log(`\n[${index + 1}/${filesToMigrate.length}] ${file} işleniyor...`);

  try {
    execSync(`node scripts/jwt-migration.js ${file}`, { stdio: 'inherit' });
    successCount++;
  } catch (error) {
    console.error(
      `❌ ${file} dosyası işlenirken hata oluştu: ${error.message}`
    );
    errorCount++;
  }
});

console.log(
  `\n✅ İşlem tamamlandı. ${successCount} dosya başarıyla geçirildi, ${errorCount} dosyada hata oluştu.`
);

/**
 * Belirtilen dizindeki tüm route.ts dosyalarını bulur
 * @param {string} dir - Aranacak dizin
 * @returns {string[]} - route.ts dosyalarının tam yolları
 */
function findRouteFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      // Alt dizinleri de ara
      results = results.concat(findRouteFiles(filePath));
    } else if (file === 'route.ts') {
      // route.ts dosyasını listeye ekle
      results.push(filePath);
    }
  });

  return results;
}

/**
 * JWT kimlik doğrulamaya geçirilecek dosyaları filtreler
 * @param {string[]} files - Tüm route.ts dosyaları
 * @returns {string[]} - JWT kimlik doğrulamaya geçirilecek dosyalar
 */
function filterFilesToMigrate(files) {
  return files.filter(file => {
    // Dosya içeriğini oku
    const content = fs.readFileSync(file, 'utf8');

    // Zaten JWT kimlik doğrulamaya geçirilmiş mi?
    const hasJwtAuth =
      content.includes('requireAuth') ||
      content.includes('requireAdmin') ||
      content.includes('requireCompany');

    if (hasJwtAuth) {
      return false;
    }

    // Cookie veya header tabanlı kimlik doğrulama kullanıyor mu?
    const hasCookieAuth = content.includes(
      "request.cookies.get('auth-user-email')"
    );
    const hasHeaderAuth = content.includes(
      "request.headers.get('X-User-Email')"
    );

    return hasCookieAuth || hasHeaderAuth;
  });
}
