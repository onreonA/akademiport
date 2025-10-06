-- Migration: 009a_company_task_status_basic.sql
-- Description: Basic company task status system - Phase 1
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

-- 3. Create function to update company task status
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

-- 4. Grant permissions
GRANT SELECT, INSERT, UPDATE ON company_task_statuses TO authenticated;
