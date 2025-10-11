#!/usr/bin/env node

/**
 * API Kimlik Doğrulama Analiz Script'i
 *
 * Bu script, API endpoint'lerindeki kimlik doğrulama yöntemlerini analiz eder.
 */

const fs = require('fs');
const path = require('path');

// Tüm route.ts dosyalarını bul
const routeFiles = findRouteFiles('app/api');

// Kimlik doğrulama kategorilerine ayır
const analysis = {
  jwtAuth: [],
  cookieAuth: [],
  headerAuth: [],
  noAuth: [],
};

routeFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');

  // JWT kimlik doğrulama kontrolü
  const hasJwtAuth =
    content.includes('requireAuth') ||
    content.includes('requireAdmin') ||
    content.includes('requireCompany');

  // Cookie kimlik doğrulama kontrolü
  const hasCookieAuth = content.includes(
    "request.cookies.get('auth-user-email')"
  );

  // Header kimlik doğrulama kontrolü
  const hasHeaderAuth = content.includes("request.headers.get('X-User-Email')");

  // Kategorize et
  if (hasJwtAuth) {
    analysis.jwtAuth.push(file);
  } else if (hasCookieAuth) {
    analysis.cookieAuth.push(file);
  } else if (hasHeaderAuth) {
    analysis.headerAuth.push(file);
  } else {
    analysis.noAuth.push(file);
  }
});

// Sonuçları yazdır
console.log('📊 API Kimlik Doğrulama Analiz Raporu\n');

console.log(`✅ JWT Kimlik Doğrulama (${analysis.jwtAuth.length} dosya):`);
analysis.jwtAuth.forEach(file => console.log(`   - ${file}`));

console.log(
  `\n🔶 Cookie Kimlik Doğrulama (${analysis.cookieAuth.length} dosya):`
);
analysis.cookieAuth.forEach(file => console.log(`   - ${file}`));

console.log(
  `\n🔷 Header Kimlik Doğrulama (${analysis.headerAuth.length} dosya):`
);
analysis.headerAuth.forEach(file => console.log(`   - ${file}`));

console.log(`\n⚠️ Kimlik Doğrulama Yok (${analysis.noAuth.length} dosya):`);
analysis.noAuth.forEach(file => console.log(`   - ${file}`));

console.log(`\n📈 Özet:`);
console.log(`   Toplam API Dosyası: ${routeFiles.length}`);
console.log(
  `   JWT: ${analysis.jwtAuth.length} (${Math.round((analysis.jwtAuth.length / routeFiles.length) * 100)}%)`
);
console.log(
  `   Cookie: ${analysis.cookieAuth.length} (${Math.round((analysis.cookieAuth.length / routeFiles.length) * 100)}%)`
);
console.log(
  `   Header: ${analysis.headerAuth.length} (${Math.round((analysis.headerAuth.length / routeFiles.length) * 100)}%)`
);
console.log(
  `   Yok: ${analysis.noAuth.length} (${Math.round((analysis.noAuth.length / routeFiles.length) * 100)}%)`
);

// JSON çıktısı oluştur
fs.writeFileSync('api-auth-analysis.json', JSON.stringify(analysis, null, 2));
console.log(`\n💾 Detaylı analiz api-auth-analysis.json dosyasına kaydedildi.`);

/**
 * Belirtilen dizindeki tüm route.ts dosyalarını bulur
 */
function findRouteFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(findRouteFiles(filePath));
    } else if (file === 'route.ts') {
      results.push(filePath);
    }
  });

  return results;
}
