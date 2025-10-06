-- ========================================
-- USERS TABLOSU YAPISINI KONTROL ET
-- ========================================

-- 1. USERS TABLOSUNUN KOLONLARINI GÖSTER
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. USERS TABLOSUNDAN ÖRNEK VERİ GÖSTER
SELECT * FROM users LIMIT 3;

-- 3. COMPANIES TABLOSUNUN KOLONLARINI GÖSTER
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
ORDER BY ordinal_position;

-- 4. COMPANY_USERS TABLOSUNUN KOLONLARINI GÖSTER
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'company_users' 
ORDER BY ordinal_position;
