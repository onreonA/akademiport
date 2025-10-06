-- Migration: Company Date Management System
-- Phase 1: Database schema for company-specific date management

-- 1. Ana Proje Tarihleri (Firma Bazlı)
CREATE TABLE project_company_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_flexible BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  UNIQUE(project_id, company_id)
);

-- 2. Alt Proje Tarihleri (Firma Bazlı)
CREATE TABLE sub_project_company_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_project_id UUID NOT NULL REFERENCES sub_projects(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_flexible BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  UNIQUE(sub_project_id, company_id)
);

-- 3. Görev Tarihleri (Firma Bazlı)
CREATE TABLE task_company_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE NOT NULL,
  is_flexible BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  UNIQUE(task_id, company_id)
);

-- 4. Indexes for performance
CREATE INDEX idx_project_company_dates_project_id ON project_company_dates(project_id);
CREATE INDEX idx_project_company_dates_company_id ON project_company_dates(company_id);
CREATE INDEX idx_project_company_dates_dates ON project_company_dates(start_date, end_date);

CREATE INDEX idx_sub_project_company_dates_sub_project_id ON sub_project_company_dates(sub_project_id);
CREATE INDEX idx_sub_project_company_dates_company_id ON sub_project_company_dates(company_id);
CREATE INDEX idx_sub_project_company_dates_dates ON sub_project_company_dates(start_date, end_date);

CREATE INDEX idx_task_company_dates_task_id ON task_company_dates(task_id);
CREATE INDEX idx_task_company_dates_company_id ON task_company_dates(company_id);
CREATE INDEX idx_task_company_dates_dates ON task_company_dates(start_date, end_date);

-- 5. Basic constraints
ALTER TABLE project_company_dates 
ADD CONSTRAINT check_project_dates 
CHECK (start_date <= end_date);

ALTER TABLE sub_project_company_dates 
ADD CONSTRAINT check_sub_project_dates 
CHECK (start_date <= end_date);

ALTER TABLE task_company_dates 
ADD CONSTRAINT check_task_dates 
CHECK (start_date IS NULL OR start_date <= end_date);

-- 6. RLS Policies
ALTER TABLE project_company_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_project_company_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_company_dates ENABLE ROW LEVEL SECURITY;

-- Project company dates policies
CREATE POLICY "Companies can view their own project dates" ON project_company_dates
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Admins can manage all project dates" ON project_company_dates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = auth.jwt() ->> 'email' 
      AND role IN ('admin', 'master_admin', 'danışman')
    ) OR
    EXISTS (
      SELECT 1 FROM company_users 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Sub-project company dates policies
CREATE POLICY "Companies can view their own sub-project dates" ON sub_project_company_dates
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Admins can manage all sub-project dates" ON sub_project_company_dates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = auth.jwt() ->> 'email' 
      AND role IN ('admin', 'master_admin', 'danışman')
    ) OR
    EXISTS (
      SELECT 1 FROM company_users 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Task company dates policies
CREATE POLICY "Companies can view their own task dates" ON task_company_dates
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Admins can manage all task dates" ON task_company_dates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = auth.jwt() ->> 'email' 
      AND role IN ('admin', 'master_admin', 'danışman')
    ) OR
    EXISTS (
      SELECT 1 FROM company_users 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- 7. Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_company_dates_updated_at
  BEFORE UPDATE ON project_company_dates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sub_project_company_dates_updated_at
  BEFORE UPDATE ON sub_project_company_dates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_company_dates_updated_at
  BEFORE UPDATE ON task_company_dates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
