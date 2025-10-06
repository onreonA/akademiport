-- Fix status constraint to include all status values
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- 1. Mevcut constraint'i kaldır
ALTER TABLE project_company_assignments 
DROP CONSTRAINT IF EXISTS project_company_assignments_status_check;

-- 2. Yeni constraint ekle
ALTER TABLE project_company_assignments 
ADD CONSTRAINT project_company_assignments_status_check 
CHECK (status IN ('active', 'locked', 'revoked', 'pending', 'suspended'));

-- 3. Sub-project assignments için de aynısını yap
ALTER TABLE sub_project_company_assignments 
DROP CONSTRAINT IF EXISTS sub_project_company_assignments_status_check;

ALTER TABLE sub_project_company_assignments 
ADD CONSTRAINT sub_project_company_assignments_status_check 
CHECK (status IN ('active', 'locked', 'revoked', 'pending', 'suspended'));

-- 4. Test sorgusu
SELECT 'Status constraints updated' as status;
