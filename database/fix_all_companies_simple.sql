-- ========================================
-- TÜM FİRMALARI BASİT ŞİFRE İLE GÜNCELLE
-- ========================================

-- 1. MEVCUT DURUMU KONTROL ET
SELECT '=== MEVCUT DURUM ===' as info;

SELECT 'COMPANY_USERS TABLOSU:' as table_name;
SELECT 
    id, email, name, role, status, created_at,
    password_hash
FROM company_users 
ORDER BY email;

-- 2. TÜM FİRMALARI BASİT ŞİFRE İLE GÜNCELLE
-- Şifre: '123456' (basit ve hatırlanabilir)
UPDATE company_users 
SET password_hash = '$2b$12$55h0LM62QAP14mSH2uYhmua6MUtpIGt2nMJxnobfNe41/U81C5JWK'
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
        WHEN password_hash = '$2b$12$55h0LM62QAP14mSH2uYhmua6MUtpIGt2nMJxnobfNe41/U81C5JWK' 
        THEN '✅ Doğru hash (123456)'
        ELSE '❌ Yanlış hash'
    END as hash_status
FROM company_users 
ORDER BY email;

-- 6. TOPLAM SAYILAR
SELECT 
    (SELECT COUNT(*) FROM companies) as total_companies,
    (SELECT COUNT(*) FROM company_users) as total_company_users,
    (SELECT COUNT(*) FROM company_users WHERE status = 'active') as active_company_users;
