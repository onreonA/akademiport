-- Remove updated_at triggers from assignment tables
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- 1. updated_at trigger'larını kaldır
DROP TRIGGER IF EXISTS update_project_company_assignments_updated_at ON project_company_assignments;
DROP TRIGGER IF EXISTS update_sub_project_company_assignments_updated_at ON sub_project_company_assignments;
DROP TRIGGER IF EXISTS update_task_company_assignments_updated_at ON task_company_assignments;

-- 2. Test sorgusu
SELECT 'Updated_at triggers removed' as status;
