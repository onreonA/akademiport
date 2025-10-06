-- Remove all triggers completely
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- 1. Tüm trigger'ları kaldır
DROP TRIGGER IF EXISTS audit_project_company_assignments ON project_company_assignments;
DROP TRIGGER IF EXISTS audit_sub_project_company_assignments ON sub_project_company_assignments;
DROP TRIGGER IF EXISTS cascade_project_assignment_status ON project_company_assignments;
DROP TRIGGER IF EXISTS cascade_sub_project_assignment_status ON sub_project_company_assignments;

-- 2. Trigger function'ları da kaldır
DROP FUNCTION IF EXISTS log_assignment_change();
DROP FUNCTION IF EXISTS cascade_assignment_status();

-- 3. Test sorgusu
SELECT 'All triggers removed' as status;
