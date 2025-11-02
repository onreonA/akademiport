-- ============================================================================
-- TASK DEPENDENCIES MIGRATION
-- ============================================================================
-- Bu migration görev bağımlılıklarını yönetmek için task_dependencies tablosunu oluşturur.
-- ============================================================================

-- 1. TASK_DEPENDENCIES TABLOSU OLUŞTUR
-- ============================================================================

CREATE TABLE IF NOT EXISTS task_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  dependency_type VARCHAR(20) DEFAULT 'blocks' NOT NULL CHECK (dependency_type IN ('blocks', 'related')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  UNIQUE(task_id, depends_on_task_id), -- Aynı bağımlılık sadece bir kez tanımlanabilir
  CHECK (task_id != depends_on_task_id) -- Self-dependency önle: bir görev kendisine bağımlı olamaz
);

-- 2. INDEX'LERİ OLUŞTUR
-- ============================================================================

-- Task'a ait bağımlılıkları sorgulamak için
CREATE INDEX idx_task_dependencies_task_id ON task_dependencies(task_id);

-- Bağımlı olduğu görevleri sorgulamak için
CREATE INDEX idx_task_dependencies_depends_on_task_id ON task_dependencies(depends_on_task_id);

-- Composite index: Bir görevin belirli bir göreve bağımlı olup olmadığını kontrol etmek için
CREATE INDEX idx_task_dependencies_composite ON task_dependencies(task_id, depends_on_task_id);

-- 3. YORUMLAR
-- ============================================================================

COMMENT ON TABLE task_dependencies IS 'Görev bağımlılıkları tablosu. Bir görevin hangi görevlere bağımlı olduğunu belirtir.';
COMMENT ON COLUMN task_dependencies.task_id IS 'Bağımlı olan görev (dependent task)';
COMMENT ON COLUMN task_dependencies.depends_on_task_id IS 'Bağımlı olunan görev (dependency task)';
COMMENT ON COLUMN task_dependencies.dependency_type IS 'Bağımlılık tipi: blocks (zorunlu - bloklar), related (opsiyonel - ilişkili)';

-- 4. CIRCULAR DEPENDENCY ÖNLEME FONKSİYONU
-- ============================================================================

CREATE OR REPLACE FUNCTION check_circular_dependency()
RETURNS TRIGGER AS $$
DECLARE
  visited_tasks UUID[];
  current_task_id UUID;
  dependent_tasks UUID[];
BEGIN
  -- Circular dependency kontrolü: Yeni bağımlılık eklendiğinde döngü oluşup oluşmadığını kontrol et
  
  -- Eğer task_id, depends_on_task_id'ye bağımlıysa, depends_on_task_id'nin de task_id'ye bağımlı olup olmadığını kontrol et
  -- Bu durumda circular dependency oluşur: task_id -> depends_on_task_id -> task_id
  
  -- Basit kontrol: depends_on_task_id, task_id'ye bağımlı mı?
  IF EXISTS (
    SELECT 1 FROM task_dependencies 
    WHERE task_id = NEW.depends_on_task_id 
    AND depends_on_task_id = NEW.task_id
  ) THEN
    RAISE EXCEPTION 'Circular dependency detected: Task % cannot depend on task % because task % already depends on task %', 
      NEW.task_id, NEW.depends_on_task_id, NEW.depends_on_task_id, NEW.task_id;
  END IF;
  
  -- Daha derin kontrol: depends_on_task_id'nin bağımlı olduğu görevler task_id'ye kadar gelir mi?
  -- Recursive CTE ile kontrol (derinlik limiti: 10)
  WITH RECURSIVE dependency_chain AS (
    -- Başlangıç: depends_on_task_id'nin direkt bağımlı olduğu görevler
    SELECT depends_on_task_id as dependent_task_id, 1 as depth
    FROM task_dependencies
    WHERE task_id = NEW.depends_on_task_id
    
    UNION ALL
    
    -- Recursive: Her seviyedeki bağımlı görevler
    SELECT td.depends_on_task_id, dc.depth + 1
    FROM task_dependencies td
    JOIN dependency_chain dc ON td.task_id = dc.dependent_task_id
    WHERE dc.depth < 10 -- Maksimum derinlik limiti (sonsuz döngüyü önlemek için)
  )
  SELECT dependent_task_id INTO current_task_id
  FROM dependency_chain
  WHERE dependent_task_id = NEW.task_id
  LIMIT 1;
  
  IF current_task_id IS NOT NULL THEN
    RAISE EXCEPTION 'Circular dependency detected: Task % indirectly depends on task % through dependency chain', 
      NEW.task_id, NEW.depends_on_task_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. TRİGGER OLUŞTUR
-- ============================================================================

-- Circular dependency kontrolü için trigger
CREATE TRIGGER trigger_check_circular_dependency
BEFORE INSERT OR UPDATE ON task_dependencies
FOR EACH ROW
EXECUTE FUNCTION check_circular_dependency();

-- 6. RLS POLİCİES
-- ============================================================================

ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

-- Admin için tüm erişim
CREATE POLICY "Allow all for admin" ON task_dependencies
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('master_admin', 'program_manager')
  )
);

-- Consultant için: Kendi projelerindeki görevlerin bağımlılıklarını yönetebilir
CREATE POLICY "Allow consultant for their projects" ON task_dependencies
FOR ALL USING (
  task_id IN (
    SELECT t.id FROM tasks t
    JOIN sub_projects sp ON t.sub_project_id = sp.id
    JOIN projects p ON sp.project_id = p.id
    WHERE p.consultant_id = auth.uid()
  )
);

-- Company User için: Kendi projelerindeki görevlerin bağımlılıklarını görebilir (read-only)
CREATE POLICY "Allow company read for their projects" ON task_dependencies
FOR SELECT USING (
  task_id IN (
    SELECT t.id FROM tasks t
    JOIN sub_projects sp ON t.sub_project_id = sp.id
    JOIN projects p ON sp.project_id = p.id
    WHERE p.company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  )
);

-- ============================================================================
-- MIGRATION TAMAMLANDI
-- ============================================================================

-- Kontrol sorgusu
SELECT 
  'task_dependencies' as table_name,
  COUNT(*) as row_count
FROM task_dependencies;

