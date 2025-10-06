-- Check database schema
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- 1. project_company_assignments tablosunun yapısını kontrol et
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'project_company_assignments'
ORDER BY ordinal_position;

-- 2. sub_project_company_assignments tablosunun yapısını kontrol et
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'sub_project_company_assignments'
ORDER BY ordinal_position;

-- 3. Mevcut assignment'ları kontrol et
SELECT id, project_id, company_id, status, assigned_at, assigned_by
FROM project_company_assignments
WHERE project_id = 'c5095cbe-f204-4ad5-bc03-5e9c0f2c2026'
LIMIT 5;
