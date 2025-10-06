-- Sub-Project Completion Reports System Migration
-- This migration creates the system for consultant evaluation reports when companies complete sub-projects

-- Create sub_project_completion_reports table
CREATE TABLE sub_project_completion_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_project_id UUID REFERENCES sub_projects(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    consultant_id TEXT,
    
    -- Rapor İçeriği
    completion_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
    timeliness_score INTEGER CHECK (timeliness_score >= 1 AND timeliness_score <= 5),
    communication_score INTEGER CHECK (communication_score >= 1 AND communication_score <= 5),
    
    -- Değerlendirme Metni
    strengths TEXT,
    areas_for_improvement TEXT,
    recommendations TEXT,
    general_feedback TEXT,
    
    -- Ek Bilgiler
    task_completion_rate DECIMAL(5,2), -- Görev tamamlama oranı (%)
    total_tasks INTEGER,
    completed_tasks INTEGER,
    delayed_tasks INTEGER,
    
    -- Sistem Bilgileri
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(sub_project_id, company_id)
);

-- Add completion tracking columns to sub_project_company_assignments
ALTER TABLE sub_project_company_assignments 
ADD COLUMN IF NOT EXISTS completion_status VARCHAR(20) DEFAULT 'in_progress' 
CHECK (completion_status IN ('in_progress', 'completed', 'requires_review', 'reported'));

ALTER TABLE sub_project_company_assignments 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE sub_project_company_assignments 
ADD COLUMN IF NOT EXISTS consultant_review_required BOOLEAN DEFAULT false;

ALTER TABLE sub_project_company_assignments 
ADD COLUMN IF NOT EXISTS all_tasks_completed BOOLEAN DEFAULT false;

-- Create indexes for better performance
CREATE INDEX idx_sub_project_completion_reports_sub_project_id ON sub_project_completion_reports(sub_project_id);
CREATE INDEX idx_sub_project_completion_reports_company_id ON sub_project_completion_reports(company_id);
CREATE INDEX idx_sub_project_completion_reports_consultant_id ON sub_project_completion_reports(consultant_id);
CREATE INDEX idx_sub_project_completion_reports_completion_date ON sub_project_completion_reports(completion_date);

-- Create a function to automatically check if all tasks in a sub-project are completed
CREATE OR REPLACE FUNCTION check_sub_project_completion()
RETURNS TRIGGER AS $$
DECLARE
    sub_proj_id UUID;
    company_assignment_id UUID;
    total_tasks INTEGER;
    completed_tasks INTEGER;
    all_completed BOOLEAN;
BEGIN
    -- Get sub_project_id from the updated task
    sub_proj_id := NEW.sub_project_id;
    
    IF sub_proj_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Count total and completed tasks for this sub-project
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'Tamamlandı')
    INTO total_tasks, completed_tasks
    FROM tasks 
    WHERE sub_project_id = sub_proj_id;
    
    -- Check if all tasks are completed
    all_completed := (total_tasks > 0 AND completed_tasks = total_tasks);
    
    -- Update all company assignments for this sub-project
    UPDATE sub_project_company_assignments 
    SET 
        all_tasks_completed = all_completed,
        consultant_review_required = all_completed,
        completion_status = CASE 
            WHEN all_completed THEN 'requires_review'
            ELSE completion_status
        END,
        completed_at = CASE 
            WHEN all_completed AND completed_at IS NULL THEN NOW()
            ELSE completed_at
        END
    WHERE sub_project_id = sub_proj_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically check sub-project completion when tasks are updated
DROP TRIGGER IF EXISTS trigger_check_sub_project_completion ON tasks;
CREATE TRIGGER trigger_check_sub_project_completion
    AFTER UPDATE OF status ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION check_sub_project_completion();

-- Create a function to get sub-project completion statistics
CREATE OR REPLACE FUNCTION get_sub_project_completion_stats(
    p_sub_project_id UUID,
    p_company_id UUID DEFAULT NULL
)
RETURNS TABLE (
    sub_project_id UUID,
    company_id UUID,
    total_tasks INTEGER,
    completed_tasks INTEGER,
    completion_rate DECIMAL,
    all_completed BOOLEAN,
    completion_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        spca.sub_project_id,
        spca.company_id,
        COALESCE((
            SELECT COUNT(*)::INTEGER 
            FROM tasks t 
            WHERE t.sub_project_id = spca.sub_project_id
        ), 0) as total_tasks,
        COALESCE((
            SELECT COUNT(*)::INTEGER 
            FROM tasks t 
            WHERE t.sub_project_id = spca.sub_project_id 
            AND t.status = 'Tamamlandı'
        ), 0) as completed_tasks,
        CASE 
            WHEN (SELECT COUNT(*) FROM tasks t WHERE t.sub_project_id = spca.sub_project_id) > 0
            THEN ROUND(
                (SELECT COUNT(*) FROM tasks t WHERE t.sub_project_id = spca.sub_project_id AND t.status = 'Tamamlandı') * 100.0 / 
                (SELECT COUNT(*) FROM tasks t WHERE t.sub_project_id = spca.sub_project_id), 
                2
            )
            ELSE 0
        END as completion_rate,
        spca.all_tasks_completed,
        spca.completed_at
    FROM sub_project_company_assignments spca
    WHERE spca.sub_project_id = p_sub_project_id
    AND (p_company_id IS NULL OR spca.company_id = p_company_id);
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for sub_project_completion_reports
ALTER TABLE sub_project_completion_reports ENABLE ROW LEVEL SECURITY;

-- Policy for consultants and admins to insert/update reports
CREATE POLICY "Consultants and admins can manage reports" ON sub_project_completion_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'master_admin', 'danışman')
        )
    );

-- Policy for companies to view their own reports
CREATE POLICY "Companies can view their own reports" ON sub_project_completion_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()
            AND users.company_id = sub_project_completion_reports.company_id
        )
    );

-- Insert default completion status values for existing assignments
UPDATE sub_project_company_assignments 
SET completion_status = 'in_progress'
WHERE completion_status IS NULL;

-- Add comment to table
COMMENT ON TABLE sub_project_completion_reports IS 'Stores consultant evaluation reports for completed sub-projects by companies';
COMMENT ON COLUMN sub_project_completion_reports.overall_rating IS 'Overall performance rating (1-5 scale)';
COMMENT ON COLUMN sub_project_completion_reports.task_completion_rate IS 'Percentage of tasks completed on time';
COMMENT ON FUNCTION check_sub_project_completion() IS 'Automatically checks if all tasks in a sub-project are completed and updates assignment status';
COMMENT ON FUNCTION get_sub_project_completion_stats(UUID, UUID) IS 'Returns completion statistics for a sub-project and company';
