-- Enhanced Assignment System Migration
-- Phase 1: Database & Core Logic
-- This migration enhances the assignment system with status management and audit trails

-- 1. Add status columns to existing assignment tables
ALTER TABLE project_company_assignments 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' 
CHECK (status IN ('active', 'locked', 'revoked', 'pending', 'suspended'));

ALTER TABLE sub_project_company_assignments 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' 
CHECK (status IN ('active', 'locked', 'revoked', 'pending', 'suspended'));

-- 2. Create audit trail table for assignment changes
CREATE TABLE IF NOT EXISTS assignment_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_type VARCHAR(50) NOT NULL, -- 'project', 'sub_project'
    assignment_id UUID NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    changed_by UUID REFERENCES users(id),
    change_reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    additional_data JSONB -- For storing extra context
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignment_audit_log_assignment_type ON assignment_audit_log(assignment_type);
CREATE INDEX IF NOT EXISTS idx_assignment_audit_log_assignment_id ON assignment_audit_log(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_audit_log_company_id ON assignment_audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_assignment_audit_log_changed_at ON assignment_audit_log(changed_at);

-- 4. Create function to log assignment changes
CREATE OR REPLACE FUNCTION log_assignment_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if status actually changed
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
            NEW.assigned_by, -- Assuming this field exists
            'Status changed via ' || TG_OP
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create triggers for audit logging
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

-- 6. Create function for cascading status updates
CREATE OR REPLACE FUNCTION cascade_assignment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- If project assignment is locked or revoked, lock all sub-projects and tasks
    IF TG_TABLE_NAME = 'project_company_assignments' AND NEW.status IN ('locked', 'revoked') THEN
        -- Update all sub-project assignments for this company
        UPDATE sub_project_company_assignments 
        SET status = NEW.status,
            updated_at = NOW()
        WHERE sub_project_id IN (
            SELECT id FROM sub_projects WHERE project_id = NEW.project_id
        ) AND company_id = NEW.company_id;
        
        -- Log the cascade
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
            NEW.project_id, -- Parent project ID for reference
            NEW.company_id,
            'active', -- Assume they were active
            NEW.status,
            NEW.assigned_by,
            'Cascaded from parent project status change',
            jsonb_build_object('parent_project_id', NEW.project_id, 'cascade_type', 'project_to_sub_projects')
        );
    END IF;
    
    -- If sub-project assignment is locked or revoked, lock all tasks
    IF TG_TABLE_NAME = 'sub_project_company_assignments' AND NEW.status IN ('locked', 'revoked') THEN
        -- Log the cascade for tasks (since we don't have task_company_assignments table)
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
            'task',
            NEW.sub_project_id,
            NEW.company_id,
            'active',
            NEW.status,
            NEW.assigned_by,
            'Cascaded from parent sub-project status change',
            jsonb_build_object('parent_sub_project_id', NEW.sub_project_id, 'cascade_type', 'sub_project_to_tasks')
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create triggers for cascading updates
DROP TRIGGER IF EXISTS cascade_project_assignment_status ON project_company_assignments;
CREATE TRIGGER cascade_project_assignment_status
    AFTER UPDATE ON project_company_assignments
    FOR EACH ROW
    EXECUTE FUNCTION cascade_assignment_status();

DROP TRIGGER IF EXISTS cascade_sub_project_assignment_status ON sub_project_company_assignments;
CREATE TRIGGER cascade_sub_project_assignment_status
    AFTER UPDATE ON sub_project_company_assignments
    FOR EACH ROW
    EXECUTE FUNCTION cascade_assignment_status();

-- 8. Create function to get assignment status for tasks
CREATE OR REPLACE FUNCTION get_task_assignment_status(task_id UUID, company_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
    task_sub_project_id UUID;
    task_project_id UUID;
    sub_project_status VARCHAR(20);
    project_status VARCHAR(20);
BEGIN
    -- Get task's sub_project_id and project_id
    SELECT sub_project_id, project_id INTO task_sub_project_id, task_project_id
    FROM tasks WHERE id = task_id;
    
    -- Check sub-project assignment status
    SELECT status INTO sub_project_status
    FROM sub_project_company_assignments
    WHERE sub_project_id = task_sub_project_id AND company_id = company_id;
    
    -- Check project assignment status
    SELECT status INTO project_status
    FROM project_company_assignments
    WHERE project_id = task_project_id AND company_id = company_id;
    
    -- Return the most restrictive status
    IF project_status IN ('locked', 'revoked') THEN
        RETURN project_status;
    ELSIF sub_project_status IN ('locked', 'revoked') THEN
        RETURN sub_project_status;
    ELSIF sub_project_status IS NOT NULL THEN
        RETURN sub_project_status;
    ELSIF project_status IS NOT NULL THEN
        RETURN project_status;
    ELSE
        RETURN 'revoked'; -- Not assigned
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 9. Update existing assignments to have 'active' status
UPDATE project_company_assignments SET status = 'active' WHERE status IS NULL;
UPDATE sub_project_company_assignments SET status = 'active' WHERE status IS NULL;

-- 10. Add RLS policies for audit log
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

-- 11. Create view for easy assignment status querying
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

-- 12. Create function to get company's accessible projects
CREATE OR REPLACE FUNCTION get_company_accessible_projects(company_uuid UUID)
RETURNS TABLE (
    project_id UUID,
    project_name VARCHAR(255),
    assignment_status VARCHAR(20),
    has_active_sub_projects BOOLEAN,
    has_locked_sub_projects BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as project_id,
        p.name as project_name,
        COALESCE(pca.status, 'revoked') as assignment_status,
        EXISTS(
            SELECT 1 FROM sub_project_company_assignments spca
            JOIN sub_projects sp ON sp.id = spca.sub_project_id
            WHERE sp.project_id = p.id 
            AND spca.company_id = company_uuid 
            AND spca.status = 'active'
        ) as has_active_sub_projects,
        EXISTS(
            SELECT 1 FROM sub_project_company_assignments spca
            JOIN sub_projects sp ON sp.id = spca.sub_project_id
            WHERE sp.project_id = p.id 
            AND spca.company_id = company_uuid 
            AND spca.status = 'locked'
        ) as has_locked_sub_projects
    FROM projects p
    LEFT JOIN project_company_assignments pca ON pca.project_id = p.id AND pca.company_id = company_uuid
    WHERE pca.status IN ('active', 'locked') OR pca.status IS NULL;
END;
$$ LANGUAGE plpgsql;

-- 13. Grant necessary permissions
GRANT SELECT ON assignment_status_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_company_accessible_projects(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_task_assignment_status(UUID, UUID) TO authenticated;

-- 14. Add comments for documentation
COMMENT ON TABLE assignment_audit_log IS 'Audit trail for assignment status changes';
COMMENT ON FUNCTION get_task_assignment_status IS 'Returns the effective assignment status for a task based on project and sub-project assignments';
COMMENT ON FUNCTION get_company_accessible_projects IS 'Returns all projects accessible by a company with their assignment status';
COMMENT ON VIEW assignment_status_summary IS 'Summary view of all assignments with company and project names';
