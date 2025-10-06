-- ========================================
-- MUNDO VE SARMOBİ GİRİŞ SORUNU DÜZELTME
-- ========================================

-- 1. MEVCUT DURUMU KONTROL ET
SELECT '=== MEVCUT DURUM ===' as info;

SELECT 'USERS TABLOSU:' as table_name;
SELECT id, email, full_name, role, created_at FROM users WHERE email IN ('info@mundo.com', 'info@sarmobi.com');

SELECT 'COMPANIES TABLOSU:' as table_name;
SELECT id, name, email, status, created_at FROM companies WHERE email IN ('info@mundo.com', 'info@sarmobi.com');

SELECT 'COMPANY_USERS TABLOSU:' as table_name;
SELECT 
    cu.id,
    cu.email,
    cu.name,
    cu.status,
    c.name as company_name,
    cu.created_at
FROM company_users cu
JOIN companies c ON cu.company_id = c.id
WHERE cu.email IN ('info@mundo.com', 'info@sarmobi.com');

-- 2. FIRMA KULLANICILARINI USERS TABLOSUNA GERİ EKLE (GİRİŞ İÇİN)
-- Şifre: 'firma123' (bcrypt hash)
INSERT INTO users (email, full_name, password_hash, role, status, created_at, updated_at) 
VALUES 
    ('info@mundo.com', 'Mundo', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'company', 'active', NOW(), NOW()),
    ('info@sarmobi.com', 'Sarmobi', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'company', 'active', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();

-- 3. SONUÇLARI KONTROL ET
SELECT '=== DÜZELTME SONRASI ===' as info;

SELECT 'USERS TABLOSU (GİRİŞ İÇİN):' as table_name;
SELECT id, email, full_name, role, status, created_at FROM users WHERE email IN ('info@mundo.com', 'info@sarmobi.com');

SELECT 'COMPANIES TABLOSU:' as table_name;
SELECT id, name, email, status, created_at FROM companies WHERE email IN ('info@mundo.com', 'info@sarmobi.com');

SELECT 'COMPANY_USERS TABLOSU:' as table_name;
SELECT 
    cu.id,
    cu.email,
    cu.name,
    cu.status,
    c.name as company_name,
    cu.created_at
FROM company_users cu
JOIN companies c ON cu.company_id = c.id
WHERE cu.email IN ('info@mundo.com', 'info@sarmobi.com');

-- 4. TEST BİLGİLERİ
SELECT '=== TEST BİLGİLERİ ===' as info;
SELECT 
    'Mundo' as company,
    'info@mundo.com' as email,
    'firma123' as password,
    'Giriş yapabilmeli' as status
UNION ALL
SELECT 
    'Sarmobi' as company,
    'info@sarmobi.com' as email,
    'firma123' as password,
    'Giriş yapabilmeli' as status;

-- 5. TOPLAM SAYILAR
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'company') as total_company_users,
    (SELECT COUNT(*) FROM companies) as total_companies,
    (SELECT COUNT(*) FROM company_users) as total_company_user_records;
