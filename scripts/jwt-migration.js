#!/usr/bin/env node

/**
 * JWT Kimlik Doğrulama Sistemi Geçiş Script'i
 * 
 * Bu script, API endpoint'lerini eski cookie/header tabanlı kimlik doğrulama sisteminden
 * yeni JWT token tabanlı kimlik doğrulama sistemine geçirmek için kullanılır.
 * 
 * Kullanım: node jwt-migration.js [dosya_yolu]
 * Örnek: node jwt-migration.js app/api/firma/tasks/route.ts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Komut satırı argümanlarını al
const args = process.argv.slice(2);
const targetFile = args[0];

if (!targetFile) {
  console.error('Hata: Dosya yolu belirtilmedi.');
  console.log('Kullanım: node jwt-migration.js [dosya_yolu]');
  console.log('Örnek: node jwt-migration.js app/api/firma/tasks/route.ts');
  process.exit(1);
}

// Dosyanın var olup olmadığını kontrol et
if (!fs.existsSync(targetFile)) {
  console.error(`Hata: ${targetFile} dosyası bulunamadı.`);
  process.exit(1);
}

// Dosya içeriğini oku
let fileContent = fs.readFileSync(targetFile, 'utf8');

// Dosya türünü belirle (admin, firma, genel)
const isAdminEndpoint = targetFile.includes('/admin/');
const isFirmaEndpoint = targetFile.includes('/firma/');

// İmport ekle
if (!fileContent.includes('import { requireAuth') && 
    !fileContent.includes('import { requireAdmin') && 
    !fileContent.includes('import { requireCompany')) {
  
  // Mevcut import satırlarını bul
  const importLines = fileContent.match(/import.*from.*[\r\n]/g) || [];
  const lastImportLine = importLines[importLines.length - 1];
  
  let importStatement = '';
  if (isAdminEndpoint) {
    importStatement = "import { requireAdmin, createAuthErrorResponse } from '@/lib/jwt-utils';\n";
  } else if (isFirmaEndpoint) {
    importStatement = "import { requireCompany, createAuthErrorResponse } from '@/lib/jwt-utils';\n";
  } else {
    importStatement = "import { requireAuth, createAuthErrorResponse } from '@/lib/jwt-utils';\n";
  }
  
  // İmport satırını ekle
  if (lastImportLine) {
    fileContent = fileContent.replace(lastImportLine, lastImportLine + importStatement);
  } else {
    fileContent = importStatement + fileContent;
  }
}

// Cookie tabanlı kimlik doğrulama kodunu değiştir
const cookieAuthPattern = /const userEmail = request\.cookies\.get\('auth-user-email'\)\?\.value;[\s\S]*?const userRole = request\.cookies\.get\('auth-user-role'\)\?\.value;[\s\S]*?if \(!userEmail \|\| !userRole\) \{[\s\S]*?return NextResponse\.json\([\s\S]*?\{ status: 401 \}[\s\S]*?\);[\s\S]*?\}/g;

// Header tabanlı kimlik doğrulama kodunu değiştir
const headerAuthPattern = /const userEmail = request\.headers\.get\('X-User-Email'\);[\s\S]*?if \(!userEmail\) \{[\s\S]*?return NextResponse\.json\([\s\S]*?\{ status: 40[01] \}[\s\S]*?\);[\s\S]*?\}/g;

// Yeni kimlik doğrulama kodu
let newAuthCode = '';
if (isAdminEndpoint) {
  newAuthCode = '    // JWT Authentication - Admin users only\n    const user = await requireAdmin(request);\n    \n    const supabase = createClient();';
} else if (isFirmaEndpoint) {
  newAuthCode = '    // JWT Authentication - Company users only\n    const user = await requireCompany(request);\n    \n    const supabase = createClient();';
} else {
  newAuthCode = '    // JWT Authentication\n    const user = await requireAuth(request);\n    \n    const supabase = createClient();';
}

// Cookie tabanlı kimlik doğrulama kodunu değiştir
fileContent = fileContent.replace(cookieAuthPattern, newAuthCode);

// Header tabanlı kimlik doğrulama kodunu değiştir
fileContent = fileContent.replace(headerAuthPattern, newAuthCode);

// userEmail -> user.email değişikliği
fileContent = fileContent.replace(/\.eq\('email', userEmail\)/g, ".eq('email', user.email)");

// userRole -> user.role değişikliği
fileContent = fileContent.replace(/userRole/g, 'user.role');

// userCompanyId -> user.company_id değişikliği
fileContent = fileContent.replace(/userCompanyId/g, 'user.company_id');

// Hata yakalama bloğunu güncelle
const catchPattern = /catch \(error\) \{[\s\S]*?return NextResponse\.json\([\s\S]*?\{ status: 500 \}[\s\S]*?\);[\s\S]*?\}/g;
const newCatchBlock = `catch (error: any) {
    // Handle authentication errors specifically
    if (error.message === 'Authentication required'${isAdminEndpoint ? " || \n        error.message === 'Admin access required'" : ""}${isFirmaEndpoint ? " || \n        error.message === 'Company access required'" : ""}) {
      return createAuthErrorResponse(error.message, 401);
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }`;

fileContent = fileContent.replace(catchPattern, newCatchBlock);

// Dosyayı kaydet
fs.writeFileSync(targetFile, fileContent);

console.log(`✅ ${targetFile} dosyası JWT kimlik doğrulama sistemine geçirildi.`);

// Linting kontrolü yap
try {
  console.log('🔍 Linting kontrolü yapılıyor...');
  execSync(`npx eslint ${targetFile} --fix`, { stdio: 'inherit' });
  console.log('✅ Linting başarıyla tamamlandı.');
} catch (error) {
  console.error('⚠️ Linting hataları var. Manuel düzeltme gerekebilir.');
}

// Dosyayı test et
console.log(`
🧪 Test için:
  1. Sunucuyu yeniden başlatın: npm run dev
  2. Endpoint'i test edin: curl -v -H "Cookie: auth-token=<JWT_TOKEN>" http://localhost:3000${targetFile.replace('app', '').replace('/route.ts', '')}
`);
