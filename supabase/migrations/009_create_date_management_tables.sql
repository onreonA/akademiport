-- Date Management System Migration
-- This migration creates tables for company-specific date management

-- Create project_company_dates table
CREATE TABLE IF NOT EXISTS project_company_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, company_id)
);

-- Create sub_project_company_dates table
CREATE TABLE IF NOT EXISTS sub_project_company_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_project_id UUID NOT NULL REFERENCES sub_projects(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sub_project_id, company_id)
);

-- Create task_company_dates table
CREATE TABLE IF NOT EXISTS task_company_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id, company_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_company_dates_project_id ON project_company_dates(project_id);
CREATE INDEX IF NOT EXISTS idx_project_company_dates_company_id ON project_company_dates(company_id);
CREATE INDEX IF NOT EXISTS idx_sub_project_company_dates_sub_project_id ON sub_project_company_dates(sub_project_id);
CREATE INDEX IF NOT EXISTS idx_sub_project_company_dates_company_id ON sub_project_company_dates(company_id);
CREATE INDEX IF NOT EXISTS idx_task_company_dates_task_id ON task_company_dates(task_id);
CREATE INDEX IF NOT EXISTS idx_task_company_dates_company_id ON task_company_dates(company_id);

-- Enable Row Level Security
ALTER TABLE project_company_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_project_company_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_company_dates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_company_dates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'project_company_dates' 
        AND policyname = 'Admins can manage project company dates'
    ) THEN
        CREATE POLICY "Admins can manage project company dates" ON project_company_dates
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.email = auth.jwt() ->> 'email'
                    AND users.role IN ('admin', 'master_admin', 'danışman')
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'project_company_dates' 
        AND policyname = 'Companies can view their own project dates'
    ) THEN
        CREATE POLICY "Companies can view their own project dates" ON project_company_dates
            FOR SELECT USING (
                company_id IN (
                    SELECT company_id FROM users 
                    WHERE email = auth.jwt() ->> 'email'
                )
            );
    END IF;
END $$;

-- Create RLS policies for sub_project_company_dates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sub_project_company_dates' 
        AND policyname = 'Admins can manage sub project company dates'
    ) THEN
        CREATE POLICY "Admins can manage sub project company dates" ON sub_project_company_dates
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.email = auth.jwt() ->> 'email'
                    AND users.role IN ('admin', 'master_admin', 'danışman')
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sub_project_company_dates' 
        AND policyname = 'Companies can view their own sub project dates'
    ) THEN
        CREATE POLICY "Companies can view their own sub project dates" ON sub_project_company_dates
            FOR SELECT USING (
                company_id IN (
                    SELECT company_id FROM users 
                    WHERE email = auth.jwt() ->> 'email'
                )
            );
    END IF;
END $$;

-- Create RLS policies for task_company_dates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'task_company_dates' 
        AND policyname = 'Admins can manage task company dates'
    ) THEN
        CREATE POLICY "Admins can manage task company dates" ON task_company_dates
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.email = auth.jwt() ->> 'email'
                    AND users.role IN ('admin', 'master_admin', 'danışman')
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'task_company_dates' 
        AND policyname = 'Companies can view their own task dates'
    ) THEN
        CREATE POLICY "Companies can view their own task dates" ON task_company_dates
            FOR SELECT USING (
                company_id IN (
                    SELECT company_id FROM users 
                    WHERE email = auth.jwt() ->> 'email'
                )
            );
    END IF;
END $$;
