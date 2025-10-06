-- Disable triggers temporarily for testing
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- 1. Trigger'ları kaldır
DROP TRIGGER IF EXISTS audit_project_company_assignments ON project_company_assignments;
DROP TRIGGER IF EXISTS audit_sub_project_company_assignments ON sub_project_company_assignments;
DROP TRIGGER IF EXISTS cascade_project_assignment_status ON project_company_assignments;

-- 2. Test sorgusu
SELECT 'Triggers disabled for testing' as status;
