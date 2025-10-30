-- ============================================================================
-- PROJE YÖNETİMİ SİSTEMİ - TEMİZ KURULUM
-- ============================================================================
-- Bu script mevcut tabloları temizler ve yeniden oluşturur
-- ============================================================================

-- 1. ÖNCE MEVCUT TABLOLARI VE TRİGGERLARI TEMİZLE
-- ============================================================================

-- Triggers
DROP TRIGGER IF EXISTS trigger_update_projects_updated_at ON projects CASCADE;
DROP TRIGGER IF EXISTS trigger_update_sub_projects_updated_at ON sub_projects CASCADE;
DROP TRIGGER IF EXISTS trigger_update_tasks_updated_at ON tasks CASCADE;
DROP TRIGGER IF EXISTS trigger_calculate_sub_project_progress ON tasks CASCADE;
DROP TRIGGER IF EXISTS trigger_calculate_project_progress ON sub_projects CASCADE;

-- Functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS calculate_sub_project_progress() CASCADE;
DROP FUNCTION IF EXISTS calculate_project_progress() CASCADE;

-- Tables (cascade ile ilişkili her şeyi sil)
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS sub_projects CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- 2. TABLOLARI OLUŞTUR
-- ============================================================================

-- projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo' NOT NULL,
  priority VARCHAR(50) DEFAULT 'medium' NOT NULL,
  start_date DATE,
  end_date DATE,
  progress INTEGER DEFAULT 0 NOT NULL CHECK (progress >= 0 AND progress <= 100),
  is_template BOOLEAN DEFAULT false NOT NULL,
  template_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- sub_projects table
CREATE TABLE sub_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo' NOT NULL,
  order_index INTEGER DEFAULT 0 NOT NULL,
  progress INTEGER DEFAULT 0 NOT NULL CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sub_project_id UUID REFERENCES sub_projects(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo' NOT NULL,
  priority VARCHAR(50) DEFAULT 'medium' NOT NULL,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  order_index INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- task_comments table
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  comment TEXT NOT NULL,
  is_question BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. INDEX'LERİ OLUŞTUR
-- ============================================================================

CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_projects_consultant_id ON projects(consultant_id);
CREATE INDEX idx_projects_is_template ON projects(is_template);
CREATE INDEX idx_projects_template_id ON projects(template_id);

CREATE INDEX idx_sub_projects_project_id ON sub_projects(project_id);

CREATE INDEX idx_tasks_sub_project_id ON tasks(sub_project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);

CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_comments_user_id ON task_comments(user_id);

-- 4. TRİGGER FONKSİYONLARINI OLUŞTUR
-- ============================================================================

-- Updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sub-project progress hesaplama
CREATE OR REPLACE FUNCTION calculate_sub_project_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_tasks INTEGER;
  completed_tasks INTEGER;
  new_progress INTEGER;
  affected_sub_project_id UUID;
BEGIN
  -- Hangi sub_project etkilendi?
  IF TG_OP = 'DELETE' THEN
    affected_sub_project_id := OLD.sub_project_id;
  ELSE
    affected_sub_project_id := NEW.sub_project_id;
  END IF;

  -- Toplam ve tamamlanan görev sayısını hesapla
  SELECT 
    COUNT(*), 
    COUNT(CASE WHEN status = 'done' THEN 1 ELSE NULL END)
  INTO total_tasks, completed_tasks
  FROM tasks
  WHERE sub_project_id = affected_sub_project_id;

  -- Progress hesapla
  IF total_tasks > 0 THEN
    new_progress := (completed_tasks * 100) / total_tasks;
  ELSE
    new_progress := 0;
  END IF;

  -- Sub-project'i güncelle
  UPDATE sub_projects
  SET progress = new_progress, updated_at = NOW()
  WHERE id = affected_sub_project_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Project progress hesaplama
CREATE OR REPLACE FUNCTION calculate_project_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_sub_projects INTEGER;
  sum_sub_project_progress INTEGER;
  new_progress INTEGER;
  affected_project_id UUID;
BEGIN
  -- Hangi project etkilendi?
  IF TG_OP = 'DELETE' THEN
    affected_project_id := OLD.project_id;
  ELSE
    affected_project_id := NEW.project_id;
  END IF;

  -- Toplam sub-project sayısı ve progress toplamını hesapla
  SELECT 
    COUNT(*), 
    COALESCE(SUM(progress), 0)
  INTO total_sub_projects, sum_sub_project_progress
  FROM sub_projects
  WHERE project_id = affected_project_id;

  -- Progress hesapla
  IF total_sub_projects > 0 THEN
    new_progress := sum_sub_project_progress / total_sub_projects;
  ELSE
    new_progress := 0;
  END IF;

  -- Project'i güncelle
  UPDATE projects
  SET progress = new_progress, updated_at = NOW()
  WHERE id = affected_project_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. TRİGGERLARI OLUŞTUR
-- ============================================================================

-- Updated_at triggers
CREATE TRIGGER trigger_update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_sub_projects_updated_at
BEFORE UPDATE ON sub_projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Progress calculation triggers
CREATE TRIGGER trigger_calculate_sub_project_progress
AFTER INSERT OR UPDATE OF status OR DELETE ON tasks
FOR EACH ROW
EXECUTE FUNCTION calculate_sub_project_progress();

CREATE TRIGGER trigger_calculate_project_progress
AFTER INSERT OR UPDATE OF progress OR DELETE ON sub_projects
FOR EACH ROW
EXECUTE FUNCTION calculate_project_progress();

-- 6. RLS POLİCİES
-- ============================================================================

-- Projects RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for admin" ON projects
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('master_admin', 'program_manager')
  )
);

CREATE POLICY "Allow consultant for assigned projects" ON projects
FOR ALL USING (
  consultant_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'consultant'
  )
);

CREATE POLICY "Allow company read for their projects" ON projects
FOR SELECT USING (
  company_id IN (
    SELECT company_id FROM public.users WHERE id = auth.uid()
  )
);

-- Sub-projects RLS
ALTER TABLE sub_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for admin" ON sub_projects
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('master_admin', 'program_manager')
  )
);

CREATE POLICY "Allow consultant for their projects" ON sub_projects
FOR ALL USING (
  project_id IN (
    SELECT id FROM projects WHERE consultant_id = auth.uid()
  )
);

CREATE POLICY "Allow company read for their projects" ON sub_projects
FOR SELECT USING (
  project_id IN (
    SELECT id FROM projects 
    WHERE company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  )
);

-- Tasks RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for admin" ON tasks
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('master_admin', 'program_manager')
  )
);

CREATE POLICY "Allow consultant for their projects" ON tasks
FOR ALL USING (
  sub_project_id IN (
    SELECT sp.id FROM sub_projects sp
    JOIN projects p ON sp.project_id = p.id
    WHERE p.consultant_id = auth.uid()
  )
);

CREATE POLICY "Allow company for assigned tasks" ON tasks
FOR ALL USING (
  assigned_to = auth.uid()
  OR sub_project_id IN (
    SELECT sp.id FROM sub_projects sp
    JOIN projects p ON sp.project_id = p.id
    WHERE p.company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  )
);

-- Task Comments RLS
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for admin" ON task_comments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('master_admin', 'program_manager')
  )
);

CREATE POLICY "Allow read/write for task participants" ON task_comments
FOR ALL USING (
  task_id IN (
    SELECT t.id FROM tasks t
    JOIN sub_projects sp ON t.sub_project_id = sp.id
    JOIN projects p ON sp.project_id = p.id
    WHERE p.consultant_id = auth.uid()
    OR t.assigned_to = auth.uid()
    OR p.company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  )
);

-- ============================================================================
-- KURULUM TAMAMLANDI!
-- ============================================================================

-- Kontrol sorgusu
SELECT 
  'projects' as table_name, COUNT(*) as row_count FROM projects
UNION ALL
SELECT 'sub_projects', COUNT(*) FROM sub_projects
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'task_comments', COUNT(*) FROM task_comments;

