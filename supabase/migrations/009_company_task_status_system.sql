-- Migration: 009_company_task_status_system.sql
-- Description: Firma bazlı görev durumu takip sistemi
-- Date: 2024-12-19

-- 1. Create company_task_statuses table for firm-specific task tracking
CREATE TABLE IF NOT EXISTS company_task_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'Bekliyor',
    completed_at TIMESTAMP WITH TIME ZONE,
    completion_note TEXT,
    completion_files JSONB, -- Store file URLs/metadata
    completed_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    approval_note TEXT,
    rejected_by UUID REFERENCES users(id),
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one status per task per company
    UNIQUE(task_id, company_id)
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_task_statuses_task_id ON company_task_statuses(task_id);
CREATE INDEX IF NOT EXISTS idx_company_task_statuses_company_id ON company_task_statuses(company_id);
CREATE INDEX IF NOT EXISTS idx_company_task_statuses_status ON company_task_statuses(status);
CREATE INDEX IF NOT EXISTS idx_company_task_statuses_completed_by ON company_task_statuses(completed_by);
CREATE INDEX IF NOT EXISTS idx_company_task_statuses_created_at ON company_task_statuses(created_at);

-- 3. Create function to initialize company task status for all assigned companies
CREATE OR REPLACE FUNCTION initialize_company_task_statuses()
RETURNS TRIGGER AS $$
BEGIN
    -- When a new task is created, create status records for all companies assigned to the project
    INSERT INTO company_task_statuses (task_id, company_id, status)
    SELECT 
        NEW.id as task_id,
        pca.company_id,
        'Bekliyor' as status
    FROM project_company_assignments pca
    JOIN sub_projects sp ON sp.project_id = pca.project_id
    WHERE sp.id = NEW.sub_project_id
    AND pca.status = 'active'
    ON CONFLICT (task_id, company_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to auto-initialize company task statuses
DROP TRIGGER IF EXISTS trigger_initialize_company_task_statuses ON tasks;
CREATE TRIGGER trigger_initialize_company_task_statuses
    AFTER INSERT ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION initialize_company_task_statuses();

-- 5. Create function to update company task status
CREATE OR REPLACE FUNCTION update_company_task_status(
    p_task_id UUID,
    p_company_id UUID,
    p_status VARCHAR(50),
    p_completion_note TEXT DEFAULT NULL,
    p_completed_by UUID DEFAULT NULL,
    p_approval_note TEXT DEFAULT NULL,
    p_approved_by UUID DEFAULT NULL,
    p_rejection_reason TEXT DEFAULT NULL,
    p_rejected_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    status_id UUID;
BEGIN
    -- Insert or update company task status
    INSERT INTO company_task_statuses (
        task_id, 
        company_id, 
        status, 
        completion_note, 
        completed_by,
        approved_by,
        approval_note,
        rejected_by,
        rejection_reason,
        completed_at,
        approved_at,
        rejected_at,
        updated_at
    )
    VALUES (
        p_task_id,
        p_company_id,
        p_status,
        p_completion_note,
        p_completed_by,
        p_approved_by,
        p_approval_note,
        p_rejected_by,
        p_rejection_reason,
        CASE WHEN p_status = 'Tamamlandı' THEN NOW() ELSE NULL END,
        CASE WHEN p_status = 'Onaylandı' THEN NOW() ELSE NULL END,
        CASE WHEN p_status = 'Reddedildi' THEN NOW() ELSE NULL END,
        NOW()
    )
    ON CONFLICT (task_id, company_id)
    DO UPDATE SET
        status = EXCLUDED.status,
        completion_note = EXCLUDED.completion_note,
        completed_by = EXCLUDED.completed_by,
        approved_by = EXCLUDED.approved_by,
        approval_note = EXCLUDED.approval_note,
        rejected_by = EXCLUDED.rejected_by,
        rejection_reason = EXCLUDED.rejection_reason,
        completed_at = EXCLUDED.completed_at,
        approved_at = EXCLUDED.approved_at,
        rejected_at = EXCLUDED.rejected_at,
        updated_at = NOW()
    RETURNING id INTO status_id;
    
    RETURN status_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Migrate existing task completions to company-specific statuses
-- First check if task_completions table exists, if not skip migration
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_completions') THEN
        -- Migrate existing task completions to company-specific statuses
        INSERT INTO company_task_statuses (
            task_id,
            company_id,
            status,
            completed_at,
            completion_note,
            completed_by
        )
        SELECT DISTINCT
            tc.task_id,
            u.company_id,
            CASE 
                WHEN tc.status = 'Tamamlandı' THEN 'Onaya Gönderildi'
                WHEN tc.status = 'Onaylandı' THEN 'Onaylandı'
                WHEN tc.status = 'Reddedildi' THEN 'Reddedildi'
                ELSE 'Bekliyor'
            END,
            tc.completion_date,
            tc.completion_note,
            tc.completed_by
        FROM task_completions tc
        JOIN users u ON u.id = tc.completed_by
        WHERE u.company_id IS NOT NULL
        ON CONFLICT (task_id, company_id) DO NOTHING;
    END IF;
END $$;

-- 7. Create view for easy querying of company task statuses with task details
CREATE OR REPLACE VIEW company_task_status_view AS
SELECT 
    cts.id,
    cts.task_id,
    cts.company_id,
    cts.status,
    cts.completed_at,
    cts.completion_note,
    cts.completion_files,
    cts.completed_by,
    cts.approved_by,
    cts.approved_at,
    cts.approval_note,
    cts.rejected_by,
    cts.rejected_at,
    cts.rejection_reason,
    cts.created_at,
    cts.updated_at,
    t.title as task_title,
    t.description as task_description,
    t.priority as task_priority,
    t.due_date as task_due_date,
    sp.name as sub_project_name,
    p.name as project_name,
    c.name as company_name,
    completed_user.name as completed_by_name,
    approved_user.name as approved_by_name,
    rejected_user.name as rejected_by_name
FROM company_task_statuses cts
JOIN tasks t ON t.id = cts.task_id
JOIN sub_projects sp ON sp.id = t.sub_project_id
JOIN projects p ON p.id = sp.project_id
JOIN companies c ON c.id = cts.company_id
LEFT JOIN users completed_user ON completed_user.id = cts.completed_by
LEFT JOIN users approved_user ON approved_user.id = cts.approved_by
LEFT JOIN users rejected_user ON rejected_user.id = cts.rejected_by;

-- 8. Add RLS policies for security
ALTER TABLE company_task_statuses ENABLE ROW LEVEL SECURITY;

-- Policy: Companies can only see their own task statuses
CREATE POLICY "Companies can view their own task statuses" ON company_task_statuses
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Policy: Companies can update their own task statuses
CREATE POLICY "Companies can update their own task statuses" ON company_task_statuses
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM users WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Policy: Companies can insert their own task statuses
CREATE POLICY "Companies can insert their own task statuses" ON company_task_statuses
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM users WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Policy: Admins and consultants can see all task statuses
CREATE POLICY "Admins can view all task statuses" ON company_task_statuses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE email = auth.jwt() ->> 'email' 
            AND role IN ('admin', 'consultant')
        )
    );

-- 9. Grant permissions
GRANT SELECT, INSERT, UPDATE ON company_task_statuses TO authenticated;
GRANT SELECT ON company_task_status_view TO authenticated;
