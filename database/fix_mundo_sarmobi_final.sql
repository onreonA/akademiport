-- ========================================
-- MUNDO VE SARMOBİ GİRİŞ SORUNU - FINAL ÇÖZÜM
-- ========================================

-- 1. MEVCUT DURUMU KONTROL ET
SELECT '=== MEVCUT DURUM ===' as info;

SELECT 'COMPANY_USERS TABLOSU:' as table_name;
SELECT 
    id, email, name, role, status, created_at,
    password_hash
FROM company_users 
WHERE email IN ('info@mundo.com', 'info@sarmobi.com');

-- 2. DOĞRU ŞİFRE HASH'İNİ OLUŞTUR (firma123 için)
-- Test sonucundan: yeni hash ile güncelle
UPDATE company_users 
SET password_hash = '$2b$12$Hfh9c3rXeRimLi6uPBlCGO5y3NknG7tU1Jczj8cVm6lRV9hpSo1Jm'
WHERE email IN ('info@mundo.com', 'info@sarmobi.com');

-- 3. SONUÇLARI KONTROL ET
SELECT '=== DÜZELTME SONRASI ===' as info;

SELECT 'COMPANY_USERS TABLOSU (GÜNCELLENMİŞ):' as table_name;
SELECT 
    id, email, name, role, status, created_at,
    password_hash
FROM company_users 
WHERE email IN ('info@mundo.com', 'info@sarmobi.com');

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

-- 5. ŞİFRE DOĞRULAMA TESTİ
SELECT '=== ŞİFRE DOĞRULAMA TESTİ ===' as info;
SELECT 
    email,
    name,
    CASE 
        WHEN password_hash = '$2b$12$Hfh9c3rXeRimLi6uPBlCGO5y3NknG7tU1Jczj8cVm6lRV9hpSo1Jm' 
        THEN '✅ Doğru hash (test edildi)'
        ELSE '❌ Yanlış hash'
    END as hash_status
FROM company_users 
WHERE email IN ('info@mundo.com', 'info@sarmobi.com');

-- 6. ROSEHAN İLE KARŞILAŞTIRMA
SELECT '=== ROSEHAN İLE KARŞILAŞTIRMA ===' as info;
SELECT 
    'Rosehan' as company,
    email,
    'Çalışan hash' as status,
    password_hash
FROM company_users 
WHERE email = 'info@rosehan.com'
UNION ALL
SELECT 
    'Mundo' as company,
    email,
    'Güncellenmiş hash' as status,
    password_hash
FROM company_users 
WHERE email = 'info@mundo.com'
UNION ALL
SELECT 
    'Sarmobi' as company,
    email,
    'Güncellenmiş hash' as status,
    password_hash
FROM company_users 
WHERE email = 'info@sarmobi.com';
