-- ============================================================================
-- PROJECTS RLS POLICY MIGRATION
-- ============================================================================
-- Master admin'in tüm projeleri görebilmesi için RLS policy ekler
-- ============================================================================

-- Enable RLS on projects table (if not already enabled)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Master Admin: Full access to all projects
CREATE POLICY IF NOT EXISTS "Master admin can do everything on projects"
  ON projects
  FOR ALL
  USING (is_master_admin())
  WITH CHECK (is_master_admin());

-- Consultant: Can view and manage their own projects
CREATE POLICY IF NOT EXISTS "Consultants can view their own projects"
  ON projects
  FOR SELECT
  USING (
    consultant_id = auth.uid() OR
    is_master_admin()
  );

CREATE POLICY IF NOT EXISTS "Consultants can manage their own projects"
  ON projects
  FOR ALL
  USING (
    consultant_id = auth.uid() OR
    is_master_admin()
  )
  WITH CHECK (
    consultant_id = auth.uid() OR
    is_master_admin()
  );

-- Company users: Can view their company's projects
CREATE POLICY IF NOT EXISTS "Company users can view their company projects"
  ON projects
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    ) OR
    is_master_admin()
  );

-- ============================================================================
-- MIGRATION TAMAMLANDI
-- ============================================================================

