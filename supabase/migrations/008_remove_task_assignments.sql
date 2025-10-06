-- Remove Task Assignment System Migration
-- Phase 1: Database & Core Logic - Step 2
-- This migration removes the task_company_assignments table since tasks will inherit from sub-projects

-- 1. Drop task_company_assignments table and related objects
DROP TABLE IF EXISTS task_company_assignments CASCADE;

-- 2. Drop related indexes
DROP INDEX IF EXISTS idx_task_company_assignments_task_id;
DROP INDEX IF EXISTS idx_task_company_assignments_company_id;

-- 3. Drop related triggers (if table exists)
-- DROP TRIGGER IF EXISTS update_task_company_assignments_updated_at ON task_company_assignments;

-- 4. Create function to check if a task is accessible by a company
CREATE OR REPLACE FUNCTION is_task_accessible_by_company(task_id UUID, company_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    task_sub_project_id UUID;
    task_project_id UUID;
    sub_project_assigned BOOLEAN;
    project_assigned BOOLEAN;
BEGIN
    -- Get task's sub_project_id and project_id
    SELECT sub_project_id, project_id INTO task_sub_project_id, task_project_id
    FROM tasks WHERE id = task_id;
    
    -- Check if sub-project is assigned to company with active status
    SELECT EXISTS(
        SELECT 1 FROM sub_project_company_assignments
        WHERE sub_project_id = task_sub_project_id 
        AND company_id = company_id
        AND status = 'active'
    ) INTO sub_project_assigned;
    
    -- Check if project is assigned to company with active status
    SELECT EXISTS(
        SELECT 1 FROM project_company_assignments
        WHERE project_id = task_project_id 
        AND company_id = company_id
        AND status = 'active'
    ) INTO project_assigned;
    
    -- Task is accessible if either sub-project or project is assigned
    RETURN sub_project_assigned OR project_assigned;
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to get all tasks accessible by a company
CREATE OR REPLACE FUNCTION get_company_accessible_tasks(company_uuid UUID)
RETURNS TABLE (
    task_id UUID,
    task_title VARCHAR(255),
    task_status VARCHAR(20),
    sub_project_id UUID,
    sub_project_name VARCHAR(255),
    project_id UUID,
    project_name VARCHAR(255),
    assignment_source VARCHAR(20) -- 'sub_project' or 'project'
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id as task_id,
        t.title as task_title,
        t.status as task_status,
        t.sub_project_id,
        sp.name as sub_project_name,
        t.project_id,
        p.name as project_name,
        CASE 
            WHEN EXISTS(
                SELECT 1 FROM sub_project_company_assignments spca
                WHERE spca.sub_project_id = t.sub_project_id 
                AND spca.company_id = company_uuid 
                AND spca.status = 'active'
            ) THEN 'sub_project'
            ELSE 'project'
        END as assignment_source
    FROM tasks t
    LEFT JOIN sub_projects sp ON sp.id = t.sub_project_id
    LEFT JOIN projects p ON p.id = t.project_id
    WHERE (
        -- Task accessible through sub-project assignment
        EXISTS(
            SELECT 1 FROM sub_project_company_assignments spca
            WHERE spca.sub_project_id = t.sub_project_id 
            AND spca.company_id = company_uuid 
            AND spca.status = 'active'
        )
        OR
        -- Task accessible through project assignment (if no sub-project assignment)
        (
            t.sub_project_id IS NULL 
            AND EXISTS(
                SELECT 1 FROM project_company_assignments pca
                WHERE pca.project_id = t.project_id 
                AND pca.company_id = company_uuid 
                AND pca.status = 'active'
            )
        )
    );
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to get task assignment status (inherited from parent)
CREATE OR REPLACE FUNCTION get_task_assignment_status_inherited(task_id UUID, company_id UUID)
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
    
    -- If task has sub_project_id, check sub-project assignment
    IF task_sub_project_id IS NOT NULL THEN
        SELECT status INTO sub_project_status
        FROM sub_project_company_assignments
        WHERE sub_project_id = task_sub_project_id AND company_id = company_id;
        
        IF sub_project_status IS NOT NULL THEN
            RETURN sub_project_status;
        END IF;
    END IF;
    
    -- Check project assignment
    SELECT status INTO project_status
    FROM project_company_assignments
    WHERE project_id = task_project_id AND company_id = company_id;
    
    IF project_status IS NOT NULL THEN
        RETURN project_status;
    END IF;
    
    -- Not assigned
    RETURN 'revoked';
END;
$$ LANGUAGE plpgsql;

-- 7. Update the existing get_task_assignment_status function to use the new logic
DROP FUNCTION IF EXISTS get_task_assignment_status(UUID, UUID);
CREATE OR REPLACE FUNCTION get_task_assignment_status(task_id UUID, company_id UUID)
RETURNS VARCHAR(20) AS $$
BEGIN
    RETURN get_task_assignment_status_inherited(task_id, company_id);
END;
$$ LANGUAGE plpgsql;

-- 8. Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_task_accessible_by_company(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_company_accessible_tasks(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_task_assignment_status_inherited(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_task_assignment_status(UUID, UUID) TO authenticated;

-- 9. Add comments for documentation
COMMENT ON FUNCTION is_task_accessible_by_company IS 'Checks if a task is accessible by a company through project or sub-project assignment';
COMMENT ON FUNCTION get_company_accessible_tasks IS 'Returns all tasks accessible by a company with their assignment source';
COMMENT ON FUNCTION get_task_assignment_status_inherited IS 'Returns the inherited assignment status for a task from its parent project/sub-project';
