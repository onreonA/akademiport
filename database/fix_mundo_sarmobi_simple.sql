-- ========================================
-- MUNDO VE SARMOBİ GİRİŞ SORUNU - BASİT ÇÖZÜM
-- ========================================

-- 1. MEVCUT DURUMU KONTROL ET
SELECT '=== MEVCUT DURUM ===' as info;

SELECT 'COMPANY_USERS TABLOSU:' as table_name;
SELECT 
    id, email, name, role, status, created_at
FROM company_users 
WHERE email IN ('info@mundo.com', 'info@sarmobi.com');

-- 2. ŞİFRE HASH'İNİ DÜZELT (firma123 için)
UPDATE company_users 
SET password_hash = '$2b$12$55h0LM62QAP14mSH2uYhmua6MUtpIGt2nMJxnobfNe41/U81C5JWK'
WHERE email IN ('info@mundo.com', 'info@sarmobi.com');

-- 3. SONUÇLARI KONTROL ET
SELECT '=== DÜZELTME SONRASI ===' as info;

SELECT 'COMPANY_USERS TABLOSU (GÜNCELLENMİŞ):' as table_name;
SELECT 
    id, email, name, role, status, created_at
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
        WHEN password_hash = '$2b$12$55h0LM62QAP14mSH2uYhmua6MUtpIGt2nMJxnobfNe41/U81C5JWK' 
        THEN '✅ Doğru hash'
        ELSE '❌ Yanlış hash'
    END as hash_status
FROM company_users 
WHERE email IN ('info@mundo.com', 'info@sarmobi.com');
