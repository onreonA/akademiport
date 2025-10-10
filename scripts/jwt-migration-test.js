#!/usr/bin/env node

/**
 * JWT Kimlik Doğrulama Sistemi Test Script'i
 * 
 * Bu script, JWT kimlik doğrulama sistemine geçirilen API endpoint'lerini test etmek için kullanılır.
 * 
 * Kullanım: node jwt-migration-test.js [endpoint_yolu]
 * Örnek: node jwt-migration-test.js /api/firma/tasks
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Komut satırı argümanlarını al
const args = process.argv.slice(2);
const endpoint = args[0];

if (!endpoint) {
  console.error('Hata: Endpoint yolu belirtilmedi.');
  console.log('Kullanım: node jwt-migration-test.js [endpoint_yolu]');
  console.log('Örnek: node jwt-migration-test.js /api/firma/tasks');
  process.exit(1);
}

// Test token'larını oluştur
console.log('🔑 Test token\'ları oluşturuluyor...');

const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const jwt = require('jsonwebtoken');

const adminToken = jwt.sign(
  {
    id: 'admin-test-id',
    email: 'admin@ihracatakademi.com',
    role: 'admin',
  },
  jwtSecret,
  { expiresIn: '1h' }
);

const companyToken = jwt.sign(
  {
    id: 'company-test-id',
    email: 'info@mundo.com',
    role: 'firma_kullanici',
    company_id: '6fcc9e92-4169-4b06-9c2f-a8c6cc284d73',
  },
  jwtSecret,
  { expiresIn: '1h' }
);

// Test token'larını geçici dosyalara kaydet
fs.writeFileSync('admin-token.txt', adminToken);
fs.writeFileSync('company-token.txt', companyToken);

console.log('✅ Test token\'ları oluşturuldu.');

// Endpoint'i test et
console.log(`\n🧪 ${endpoint} endpoint'i test ediliyor...`);

// 1. Anonim erişim testi
console.log('\n1️⃣ Anonim erişim testi:');
try {
  execSync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000${endpoint}`, { stdio: 'inherit' });
} catch (error) {
  console.log('✅ Anonim erişim reddedildi (beklenen davranış).');
}

// 2. Admin token ile erişim testi
console.log('\n2️⃣ Admin token ile erişim testi:');
try {
  execSync(`curl -s -H "Cookie: auth-token=${adminToken}" http://localhost:3000${endpoint}`, { stdio: 'inherit' });
} catch (error) {
  console.error(`❌ Admin token ile erişim hatası: ${error.message}`);
}

// 3. Firma token ile erişim testi
console.log('\n3️⃣ Firma token ile erişim testi:');
try {
  execSync(`curl -s -H "Cookie: auth-token=${companyToken}" http://localhost:3000${endpoint}`, { stdio: 'inherit' });
} catch (error) {
  console.error(`❌ Firma token ile erişim hatası: ${error.message}`);
}

// Geçici dosyaları temizle
fs.unlinkSync('admin-token.txt');
fs.unlinkSync('company-token.txt');

console.log('\n✅ Test tamamlandı.');
