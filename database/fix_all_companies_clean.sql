-- ========================================
-- TÜM FİRMALARI TEMİZ HASH İLE GÜNCELLE
-- ========================================

-- 1. MEVCUT DURUMU KONTROL ET
SELECT '=== MEVCUT DURUM ===' as info;

SELECT 'COMPANY_USERS TABLOSU:' as table_name;
SELECT 
    id, email, name, role, status, created_at,
    password_hash
FROM company_users 
ORDER BY email;

-- 2. TÜM FİRMALARI TEMİZ HASH İLE GÜNCELLE
-- Şifre: '123456' (test edilmiş ve çalışan)
-- Test sonucundan: $2b$12$kM6.E4Xm..UKzNzmsXvR/OEwFtiwx4D//GX6mZlV7wl0f5Wmyt4I6
UPDATE company_users 
SET password_hash = '$2b$12$kM6.E4Xm..UKzNzmsXvR/OEwFtiwx4D//GX6mZlV7wl0f5Wmyt4I6'
WHERE email IN (
    'info@mundo.com',
    'info@sarmobi.com',
    'info@rosehan.com',
    'info@sahbaz.com'
);

-- 3. SONUÇLARI KONTROL ET
SELECT '=== GÜNCELLEME SONRASI ===' as info;

SELECT 'COMPANY_USERS TABLOSU (GÜNCELLENMİŞ):' as table_name;
SELECT 
    id, email, name, role, status, created_at,
    password_hash
FROM company_users 
ORDER BY email;

-- 4. TEST BİLGİLERİ
SELECT '=== TEST BİLGİLERİ ===' as info;
SELECT 
    'Mundo' as company,
    'info@mundo.com' as email,
    '123456' as password,
    'Giriş yapabilmeli' as status
UNION ALL
SELECT 
    'Sarmobi' as company,
    'info@sarmobi.com' as email,
    '123456' as password,
    'Giriş yapabilmeli' as status
UNION ALL
SELECT 
    'Rosehan' as company,
    'info@rosehan.com' as email,
    '123456' as password,
    'Giriş yapabilmeli' as status
UNION ALL
SELECT 
    'Şahbaz' as company,
    'info@sahbaz.com' as email,
    '123456' as password,
    'Giriş yapabilmeli' as status;

-- 5. ŞİFRE DOĞRULAMA TESTİ
SELECT '=== ŞİFRE DOĞRULAMA TESTİ ===' as info;
SELECT 
    email,
    name,
    CASE 
        WHEN password_hash = '$2b$12$kM6.E4Xm..UKzNzmsXvR/OEwFtiwx4D//GX6mZlV7wl0f5Wmyt4I6' 
        THEN '✅ Temiz hash (123456) - TEST EDİLDİ'
        ELSE '❌ Yanlış hash'
    END as hash_status
FROM company_users 
ORDER BY email;

-- 6. HASH FORMAT ANALİZİ
SELECT '=== HASH FORMAT ANALİZİ ===' as info;
SELECT 
    email,
    name,
    password_hash,
    LENGTH(password_hash) as total_length,
    CASE 
        WHEN password_hash LIKE '$2b$12$%' THEN '✅ Doğru format (2b, cost 12)'
        WHEN password_hash LIKE '$2b$10$%' THEN '⚠️ Cost 10 format'
        WHEN password_hash LIKE '$2a$%' THEN '⚠️ Eski 2a format'
        ELSE '❌ Bilinmeyen format'
    END as format_status
FROM company_users 
ORDER BY email;
