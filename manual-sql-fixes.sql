-- Manual SQL Fixes for Enhanced Assignment System
-- Bu SQL'leri Supabase SQL Editor'da çalıştırın

-- 1. Status column'larını kontrol et ve güncelle
ALTER TABLE project_company_assignments 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' 
CHECK (status IN ('active', 'locked', 'revoked', 'pending', 'suspended'));

ALTER TABLE sub_project_company_assignments 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' 
CHECK (status IN ('active', 'locked', 'revoked', 'pending', 'suspended'));

-- 2. Audit trail table oluştur
CREATE TABLE IF NOT EXISTS assignment_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_type VARCHAR(50) NOT NULL,
    assignment_id UUID NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    changed_by UUID REFERENCES users(id),
    change_reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    additional_data JSONB
);

-- 3. Index'leri oluştur
CREATE INDEX IF NOT EXISTS idx_assignment_audit_log_assignment_type ON assignment_audit_log(assignment_type);
CREATE INDEX IF NOT EXISTS idx_assignment_audit_log_assignment_id ON assignment_audit_log(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_audit_log_company_id ON assignment_audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_assignment_audit_log_changed_at ON assignment_audit_log(changed_at);

-- 4. Audit logging function oluştur
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
            NEW.project_id,
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

-- 5. Cascade function oluştur
CREATE OR REPLACE FUNCTION cascade_assignment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- If project assignment is locked or revoked, lock all sub-projects
    IF TG_TABLE_NAME = 'project_company_assignments' AND NEW.status IN ('locked', 'revoked') THEN
        UPDATE sub_project_company_assignments 
        SET status = NEW.status
        WHERE sub_project_id IN (
            SELECT id FROM sub_projects WHERE project_id = NEW.project_id
        ) AND company_id = NEW.company_id;
        
        INSERT INTO assignment_audit_log (
            assignment_type,
            assignment_id,
            company_id,
            old_status,
            new_status,
            changed_by,
            change_reason,
            additional_data
        ) VALUES (
            'sub_project',
            NEW.project_id,
            NEW.company_id,
            'active',
            NEW.status,
            NEW.assigned_by,
            'Cascaded from parent project status change',
            jsonb_build_object('parent_project_id', NEW.project_id, 'cascade_type', 'project_to_sub_projects')
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger'ları oluştur
DROP TRIGGER IF EXISTS audit_project_company_assignments ON project_company_assignments;
CREATE TRIGGER audit_project_company_assignments
    AFTER UPDATE ON project_company_assignments
    FOR EACH ROW
    EXECUTE FUNCTION log_assignment_change();

DROP TRIGGER IF EXISTS audit_sub_project_company_assignments ON sub_project_company_assignments;
CREATE TRIGGER audit_sub_project_company_assignments
    AFTER UPDATE ON sub_project_company_assignments
    FOR EACH ROW
    EXECUTE FUNCTION log_assignment_change();

DROP TRIGGER IF EXISTS cascade_project_assignment_status ON project_company_assignments;
CREATE TRIGGER cascade_project_assignment_status
    AFTER UPDATE ON project_company_assignments
    FOR EACH ROW
    EXECUTE FUNCTION cascade_assignment_status();

-- 7. Helper functions oluştur
CREATE OR REPLACE FUNCTION get_task_assignment_status(task_id UUID, company_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
    task_sub_project_id UUID;
    task_project_id UUID;
    sub_project_status VARCHAR(20);
    project_status VARCHAR(20);
BEGIN
    SELECT sub_project_id, project_id INTO task_sub_project_id, task_project_id
    FROM tasks WHERE id = task_id;
    
    SELECT status INTO sub_project_status
    FROM sub_project_company_assignments
    WHERE sub_project_id = task_sub_project_id AND company_id = company_id;
    
    SELECT status INTO project_status
    FROM project_company_assignments
    WHERE project_id = task_project_id AND company_id = company_id;
    
    IF project_status IN ('locked', 'revoked') THEN
        RETURN project_status;
    ELSIF sub_project_status IN ('locked', 'revoked') THEN
        RETURN sub_project_status;
    ELSIF sub_project_status IS NOT NULL THEN
        RETURN sub_project_status;
    ELSIF project_status IS NOT NULL THEN
        RETURN project_status;
    ELSE
        RETURN 'revoked';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 8. Assignment status summary view oluştur
CREATE OR REPLACE VIEW assignment_status_summary AS
SELECT 
    'project' as assignment_type,
    pca.project_id as assignment_id,
    pca.company_id,
    c.name as company_name,
    p.name as project_name,
    pca.status,
    pca.assigned_at,
    pca.assigned_at as updated_at
FROM project_company_assignments pca
JOIN companies c ON c.id = pca.company_id
JOIN projects p ON p.id = pca.project_id

UNION ALL

SELECT 
    'sub_project' as assignment_type,
    spca.sub_project_id as assignment_id,
    spca.company_id,
    c.name as company_name,
    sp.name as sub_project_name,
    spca.status,
    spca.assigned_at,
    spca.assigned_at as updated_at
FROM sub_project_company_assignments spca
JOIN companies c ON c.id = spca.company_id
JOIN sub_projects sp ON sp.id = spca.sub_project_id;

-- 9. RLS policies ekle
ALTER TABLE assignment_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit log for their company" ON assignment_audit_log
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all audit logs" ON assignment_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin')
        )
    );

-- 10. Permissions ver
GRANT SELECT ON assignment_status_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_task_assignment_status(UUID, UUID) TO authenticated;

-- 11. Mevcut assignment'ları 'active' yap
UPDATE project_company_assignments SET status = 'active' WHERE status IS NULL;
UPDATE sub_project_company_assignments SET status = 'active' WHERE status IS NULL;

-- 12. Test verisi ekle
INSERT INTO assignment_audit_log (
    assignment_type,
    assignment_id,
    company_id,
    old_status,
    new_status,
    change_reason,
    changed_at
) VALUES (
    'project',
    'c5095cbe-f204-4ad5-bc03-5e9c0f2c2026',
    '6fcc9e92-4169-4b06-9c2f-a8c6cc284d73',
    'revoked',
    'active',
    'System initialization',
    NOW()
) ON CONFLICT DO NOTHING;

-- 13. Kontrol sorguları
SELECT 'project_company_assignments' as table_name, count(*) as total, 
       count(CASE WHEN status = 'active' THEN 1 END) as active,
       count(CASE WHEN status = 'locked' THEN 1 END) as locked,
       count(CASE WHEN status = 'revoked' THEN 1 END) as revoked
FROM project_company_assignments

UNION ALL

SELECT 'sub_project_company_assignments' as table_name, count(*) as total,
       count(CASE WHEN status = 'active' THEN 1 END) as active,
       count(CASE WHEN status = 'locked' THEN 1 END) as locked,
       count(CASE WHEN status = 'revoked' THEN 1 END) as revoked
FROM sub_project_company_assignments;
