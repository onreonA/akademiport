-- ============================================================================
-- COMPANY TASK DATES TABLE
-- ============================================================================
-- Bu migration görevlere firma bazlı tarih ataması yapılmasını sağlar.
-- Her firma için her görevin başlangıç ve bitiş tarihleri ayrı ayrı belirlenebilir.
-- ============================================================================

-- 1) Tabloyu oluştur
CREATE TABLE IF NOT EXISTS company_task_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  
  -- Firma bazlı görev tarih atamaları
  start_date DATE,
  end_date DATE,
  
  -- Görev/firma ilişkisinin aktifliği
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Aynı firmaya aynı görevin yalnızca bir kez atanmasını sağlar
  UNIQUE (company_id, task_id)
);

-- 2) İndeksler
CREATE INDEX IF NOT EXISTS idx_company_task_dates_company
  ON company_task_dates (company_id);

CREATE INDEX IF NOT EXISTS idx_company_task_dates_task
  ON company_task_dates (task_id);

CREATE INDEX IF NOT EXISTS idx_company_task_dates_active
  ON company_task_dates (is_active)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_company_task_dates_dates
  ON company_task_dates (start_date, end_date);

-- 3) Row Level Security aktif et ve politikaları tanımla
ALTER TABLE company_task_dates ENABLE ROW LEVEL SECURITY;

-- Master admin tüm kayıtları yönetebilir
DROP POLICY IF EXISTS "Master admin can manage all task dates" ON company_task_dates;
CREATE POLICY "Master admin can manage all task dates"
  ON company_task_dates
  FOR ALL
  USING (is_master_admin())
  WITH CHECK (is_master_admin());

-- Danışmanlar yalnızca sorumlu oldukları projelerin görevlerini görebilir
DROP POLICY IF EXISTS "Consultant can view task dates of own projects" ON company_task_dates;
CREATE POLICY "Consultant can view task dates of own projects"
  ON company_task_dates
  FOR SELECT
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1
      FROM tasks t
      JOIN sub_projects sp ON sp.id = t.sub_project_id
      JOIN projects p ON p.id = sp.project_id
      WHERE t.id = company_task_dates.task_id
        AND p.consultant_id = auth.uid()
    )
  );

-- Danışmanlar yalnızca sorumlu oldukları projelerin görevlerinde değişiklik yapabilir
DROP POLICY IF EXISTS "Consultant can manage task dates of own projects" ON company_task_dates;
CREATE POLICY "Consultant can manage task dates of own projects"
  ON company_task_dates
  FOR ALL
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1
      FROM tasks t
      JOIN sub_projects sp ON sp.id = t.sub_project_id
      JOIN projects p ON p.id = sp.project_id
      WHERE t.id = company_task_dates.task_id
        AND p.consultant_id = auth.uid()
    )
  )
  WITH CHECK (
    is_master_admin() OR
    EXISTS (
      SELECT 1
      FROM tasks t
      JOIN sub_projects sp ON sp.id = t.sub_project_id
      JOIN projects p ON p.id = sp.project_id
      WHERE t.id = company_task_dates.task_id
        AND p.consultant_id = auth.uid()
    )
  );

-- Şirket kullanıcıları yalnızca kendi firmalarına ait kayıtları görebilir
DROP POLICY IF EXISTS "Company user can view own company task dates" ON company_task_dates;
CREATE POLICY "Company user can view own company task dates"
  ON company_task_dates
  FOR SELECT
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1
      FROM users u
      WHERE u.id = auth.uid()
        AND u.company_id = company_task_dates.company_id
    )
  );

-- 4) updated_at değerini otomatik güncelle
DROP TRIGGER IF EXISTS update_company_task_dates_updated_at ON company_task_dates;
CREATE TRIGGER update_company_task_dates_updated_at
  BEFORE UPDATE ON company_task_dates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5) Tarih validasyonu için check constraint
ALTER TABLE company_task_dates
  ADD CONSTRAINT check_task_dates_valid
  CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

