-- ============================================================================
-- COMPANY PROJECT ASSIGNMENTS TABLE
-- ============================================================================
-- Bu migration şirketlerin projelere ve alt projelere toplu atanmasını,
-- firma bazlı tarih yönetimini ve görev kalıtımını destekleyecek veri yapısını
-- oluşturur.
-- ============================================================================

-- 1) Tabloyu oluştur
CREATE TABLE IF NOT EXISTS company_project_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sub_project_id UUID REFERENCES sub_projects(id) ON DELETE CASCADE,

  -- Firma bazlı tarih atamaları
  start_date TIMESTAMP,
  end_date TIMESTAMP,

  -- Firma/alt proje ilişkisinin aktifliği
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Aynı firmaya aynı proje/alt proje kombinasyonunun yalnızca bir kez atanmasını sağlar
  UNIQUE (company_id, project_id, sub_project_id)
);

-- 2) İndeksler
CREATE INDEX IF NOT EXISTS idx_company_project_assignments_company
  ON company_project_assignments (company_id);

CREATE INDEX IF NOT EXISTS idx_company_project_assignments_project
  ON company_project_assignments (project_id);

CREATE INDEX IF NOT EXISTS idx_company_project_assignments_sub_project
  ON company_project_assignments (sub_project_id);

CREATE INDEX IF NOT EXISTS idx_company_project_assignments_active
  ON company_project_assignments (is_active)
  WHERE is_active = true;

-- 3) Row Level Security aktif et ve politikaları tanımla
ALTER TABLE company_project_assignments ENABLE ROW LEVEL SECURITY;

-- Master admin tüm kayıtları yönetebilir
DROP POLICY IF EXISTS "Master admin can manage all assignments" ON company_project_assignments;
CREATE POLICY "Master admin can manage all assignments"
  ON company_project_assignments
  FOR ALL
  USING (is_master_admin())
  WITH CHECK (is_master_admin());

-- Danışmanlar yalnızca sorumlu oldukları projeleri görebilir
DROP POLICY IF EXISTS "Consultant can view assignments of own projects" ON company_project_assignments;
CREATE POLICY "Consultant can view assignments of own projects"
  ON company_project_assignments
  FOR SELECT
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1
      FROM projects p
      WHERE p.id = company_project_assignments.project_id
        AND p.consultant_id = auth.uid()
    )
  );

-- Danışmanlar yalnızca sorumlu oldukları projelerde değişiklik yapabilir
DROP POLICY IF EXISTS "Consultant can manage assignments of own projects" ON company_project_assignments;
CREATE POLICY "Consultant can manage assignments of own projects"
  ON company_project_assignments
  FOR ALL
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1
      FROM projects p
      WHERE p.id = company_project_assignments.project_id
        AND p.consultant_id = auth.uid()
    )
  )
  WITH CHECK (
    is_master_admin() OR
    EXISTS (
      SELECT 1
      FROM projects p
      WHERE p.id = company_project_assignments.project_id
        AND p.consultant_id = auth.uid()
    )
  );

-- Şirket kullanıcıları yalnızca kendi firmalarına ait kayıtları görebilir
DROP POLICY IF EXISTS "Company user can view own company assignments" ON company_project_assignments;
CREATE POLICY "Company user can view own company assignments"
  ON company_project_assignments
  FOR SELECT
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1
      FROM users u
      WHERE u.id = auth.uid()
        AND u.company_id = company_project_assignments.company_id
    )
  );

-- Şirket kullanıcılarının kayıt üzerinde değişiklik yapması desteklenmiyor
-- (gerekirse ileride ayrı bir policy oluşturulacak)

-- 4) updated_at değerini otomatik güncelle
DROP TRIGGER IF EXISTS update_company_project_assignments_updated_at ON company_project_assignments;
CREATE TRIGGER update_company_project_assignments_updated_at
  BEFORE UPDATE ON company_project_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

