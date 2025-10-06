-- Multi-Company Assignment System Migration
-- This migration enables projects, sub-projects, and tasks to be assigned to multiple companies

-- Create project_company_assignments table
CREATE TABLE project_company_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    UNIQUE(project_id, company_id)
);

-- Create sub_project_company_assignments table
CREATE TABLE sub_project_company_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_project_id UUID REFERENCES sub_projects(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    UNIQUE(sub_project_id, company_id)
);

-- Create task_company_assignments table
CREATE TABLE task_company_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    UNIQUE(task_id, company_id)
);

-- Create indexes for better performance
CREATE INDEX idx_project_company_assignments_project_id ON project_company_assignments(project_id);
CREATE INDEX idx_project_company_assignments_company_id ON project_company_assignments(company_id);
CREATE INDEX idx_sub_project_company_assignments_sub_project_id ON sub_project_company_assignments(sub_project_id);
CREATE INDEX idx_sub_project_company_assignments_company_id ON sub_project_company_assignments(company_id);
CREATE INDEX idx_task_company_assignments_task_id ON task_company_assignments(task_id);
CREATE INDEX idx_task_company_assignments_company_id ON task_company_assignments(company_id);

-- Create triggers for updated_at
CREATE TRIGGER update_project_company_assignments_updated_at BEFORE UPDATE ON project_company_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sub_project_company_assignments_updated_at BEFORE UPDATE ON sub_project_company_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_company_assignments_updated_at BEFORE UPDATE ON task_company_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for multi-company access
ALTER TABLE project_company_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_project_company_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_company_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_company_assignments
CREATE POLICY "Users can view project assignments for their company" ON project_company_assignments
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all project assignments" ON project_company_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'consultant')
        )
    );

-- RLS Policies for sub_project_company_assignments
CREATE POLICY "Users can view sub-project assignments for their company" ON sub_project_company_assignments
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all sub-project assignments" ON sub_project_company_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'consultant')
        )
    );

-- RLS Policies for task_company_assignments
CREATE POLICY "Users can view task assignments for their company" ON task_company_assignments
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all task assignments" ON task_company_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'consultant')
        )
    );

-- Update existing projects to have company assignments
-- This will create assignments for existing projects
INSERT INTO project_company_assignments (project_id, company_id, assigned_by)
SELECT 
    p.id as project_id,
    p.company_id,
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1) as assigned_by
FROM projects p
WHERE p.company_id IS NOT NULL
ON CONFLICT (project_id, company_id) DO NOTHING;

-- Update existing sub-projects to have company assignments
-- This will create assignments for existing sub-projects
INSERT INTO sub_project_company_assignments (sub_project_id, company_id, assigned_by)
SELECT 
    sp.id as sub_project_id,
    p.company_id,
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1) as assigned_by
FROM sub_projects sp
JOIN projects p ON sp.project_id = p.id
WHERE p.company_id IS NOT NULL
ON CONFLICT (sub_project_id, company_id) DO NOTHING;

-- Update existing tasks to have company assignments
-- This will create assignments for existing tasks
INSERT INTO task_company_assignments (task_id, company_id, assigned_by)
SELECT 
    t.id as task_id,
    p.company_id,
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1) as assigned_by
FROM tasks t
JOIN projects p ON t.project_id = p.id
WHERE p.company_id IS NOT NULL
ON CONFLICT (task_id, company_id) DO NOTHING;
