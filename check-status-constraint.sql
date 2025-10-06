-- Check status constraint
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- 1. Status constraint'ini kontrol et
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname LIKE '%status%' 
AND conrelid = 'project_company_assignments'::regclass;

-- 2. Alternatif yöntem
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'project_company_assignments'
AND tc.constraint_type = 'CHECK';
