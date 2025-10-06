-- Fix trigger to remove updated_at reference
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- 1. Mevcut trigger'ları kaldır
DROP TRIGGER IF EXISTS audit_project_company_assignments ON project_company_assignments;
DROP TRIGGER IF EXISTS audit_sub_project_company_assignments ON sub_project_company_assignments;

-- 2. Düzeltilmiş audit function oluştur
CREATE OR REPLACE FUNCTION log_assignment_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO assignment_audit_log (
            assignment_type,
            assignment_id,
            company_id,
            old_status,
            new_status,
            changed_by,
            change_reason
        ) VALUES (
            CASE 
                WHEN TG_TABLE_NAME = 'project_company_assignments' THEN 'project'
                WHEN TG_TABLE_NAME = 'sub_project_company_assignments' THEN 'sub_project'
                ELSE 'unknown'
            END,
            CASE 
                WHEN TG_TABLE_NAME = 'project_company_assignments' THEN NEW.project_id
                WHEN TG_TABLE_NAME = 'sub_project_company_assignments' THEN NEW.sub_project_id
                ELSE NEW.id
            END,
            NEW.company_id,
            OLD.status,
            NEW.status,
            NEW.assigned_by,
            'Status changed via ' || TG_OP
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger'ları yeniden oluştur
CREATE TRIGGER audit_project_company_assignments
    AFTER UPDATE ON project_company_assignments
    FOR EACH ROW
    EXECUTE FUNCTION log_assignment_change();

CREATE TRIGGER audit_sub_project_company_assignments
    AFTER UPDATE ON sub_project_company_assignments
    FOR EACH ROW
    EXECUTE FUNCTION log_assignment_change();

-- 4. Test sorgusu
SELECT 'Trigger fix completed' as status;
