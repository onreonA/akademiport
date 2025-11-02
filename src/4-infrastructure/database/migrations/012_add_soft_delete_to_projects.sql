-- ============================================================================
-- SOFT DELETE MIGRATION - PROJE YÖNETİMİ
-- ============================================================================
-- Bu migration projects, sub_projects ve tasks tablolarına deleted_at kolonu ekler
-- ve soft delete için gerekli index'leri oluşturur.
-- ============================================================================

-- 1. PROJECTS TABLOSUNA deleted_at EKLE
-- ============================================================================

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Index: Soft delete sorguları için performans
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at 
ON projects(deleted_at) 
WHERE deleted_at IS NULL;

-- Index: Silinen projeleri sorgulamak için
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at_not_null 
ON projects(deleted_at) 
WHERE deleted_at IS NOT NULL;

-- Comment
COMMENT ON COLUMN projects.deleted_at IS 'Soft delete için kullanılır. NULL ise kayıt aktif, değilse silinmiş';

-- ============================================================================

-- 2. SUB_PROJECTS TABLOSUNA deleted_at EKLE
-- ============================================================================

ALTER TABLE sub_projects 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Index: Soft delete sorguları için performans
CREATE INDEX IF NOT EXISTS idx_sub_projects_deleted_at 
ON sub_projects(deleted_at) 
WHERE deleted_at IS NULL;

-- Index: Silinen alt projeleri sorgulamak için
CREATE INDEX IF NOT EXISTS idx_sub_projects_deleted_at_not_null 
ON sub_projects(deleted_at) 
WHERE deleted_at IS NOT NULL;

-- Comment
COMMENT ON COLUMN sub_projects.deleted_at IS 'Soft delete için kullanılır. NULL ise kayıt aktif, değilse silinmiş';

-- ============================================================================

-- 3. TASKS TABLOSUNA deleted_at EKLE
-- ============================================================================

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Index: Soft delete sorguları için performans
CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at 
ON tasks(deleted_at) 
WHERE deleted_at IS NULL;

-- Index: Silinen görevleri sorgulamak için
CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at_not_null 
ON tasks(deleted_at) 
WHERE deleted_at IS NOT NULL;

-- Comment
COMMENT ON COLUMN tasks.deleted_at IS 'Soft delete için kullanılır. NULL ise kayıt aktif, değilse silinmiş';

-- ============================================================================

-- 4. RLS POLİCİLERİ GÜNCELLE (deleted_at kontrolü ekle)
-- ============================================================================

-- Projects RLS - Silinen projeleri varsayılan olarak gösterme
DROP POLICY IF EXISTS "Allow all for admin" ON projects;
CREATE POLICY "Allow all for admin" ON projects
FOR ALL USING (
  deleted_at IS NULL AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('master_admin', 'program_manager')
  )
);

DROP POLICY IF EXISTS "Allow consultant for assigned projects" ON projects;
CREATE POLICY "Allow consultant for assigned projects" ON projects
FOR ALL USING (
  deleted_at IS NULL AND
  (consultant_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'consultant'
  ))
);

DROP POLICY IF EXISTS "Allow company read for their projects" ON projects;
CREATE POLICY "Allow company read for their projects" ON projects
FOR SELECT USING (
  deleted_at IS NULL AND
  company_id IN (
    SELECT company_id FROM public.users WHERE id = auth.uid()
  )
);

-- Admin için silinen projeleri görüntüleme politikası
CREATE POLICY "Allow admin to view deleted projects" ON projects
FOR SELECT USING (
  deleted_at IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'master_admin'
  )
);

-- ============================================================================

-- 5. PROGRESS TRİGGERLARINI GÜNCELLE (deleted_at kontrolü)
-- ============================================================================

-- Sub-project progress hesaplama - deleted_at kontrolü ekle
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

  -- Toplam ve tamamlanan görev sayısını hesapla (deleted_at IS NULL kontrolü ile)
  SELECT 
    COUNT(*), 
    COUNT(CASE WHEN status = 'done' AND deleted_at IS NULL THEN 1 ELSE NULL END)
  INTO total_tasks, completed_tasks
  FROM tasks
  WHERE sub_project_id = affected_sub_project_id
  AND deleted_at IS NULL;

  -- Progress hesapla
  IF total_tasks > 0 THEN
    new_progress := (completed_tasks * 100) / total_tasks;
  ELSE
    new_progress := 0;
  END IF;

  -- Sub-project'i güncelle
  UPDATE sub_projects
  SET progress = new_progress, updated_at = NOW()
  WHERE id = affected_sub_project_id
  AND deleted_at IS NULL;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Project progress hesaplama - deleted_at kontrolü ekle
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

  -- Toplam sub-project sayısı ve progress toplamını hesapla (deleted_at IS NULL kontrolü ile)
  SELECT 
    COUNT(*), 
    COALESCE(SUM(progress), 0)
  INTO total_sub_projects, sum_sub_project_progress
  FROM sub_projects
  WHERE project_id = affected_project_id
  AND deleted_at IS NULL;

  -- Progress hesapla
  IF total_sub_projects > 0 THEN
    new_progress := sum_sub_project_progress / total_sub_projects;
  ELSE
    new_progress := 0;
  END IF;

  -- Project'i güncelle
  UPDATE projects
  SET progress = new_progress, updated_at = NOW()
  WHERE id = affected_project_id
  AND deleted_at IS NULL;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MIGRATION TAMAMLANDI
-- ============================================================================

-- Kontrol sorgusu
SELECT 
  'projects' as table_name, 
  COUNT(*) FILTER (WHERE deleted_at IS NULL) as active_count,
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted_count
FROM projects
UNION ALL
SELECT 
  'sub_projects', 
  COUNT(*) FILTER (WHERE deleted_at IS NULL),
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL)
FROM sub_projects
UNION ALL
SELECT 
  'tasks', 
  COUNT(*) FILTER (WHERE deleted_at IS NULL),
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL)
FROM tasks;

