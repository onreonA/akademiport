-- Rollback Migration: Fix Company User Event Attendees View
-- This rollback restores the original policies
-- Date: 2025-01-XX

-- Rollback: Restore original event_attendances policy
DROP POLICY IF EXISTS "Company user can view program event attendances" ON event_attendances;

CREATE POLICY "Company user can view own company attendances"
  ON event_attendances
  FOR SELECT
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1
      FROM users u
      WHERE u.id = auth.uid()
        AND u.company_id = event_attendances.company_id
    )
  );

-- Rollback: Restore original companies policy
DROP POLICY IF EXISTS "Company members can view their own company" ON companies;

CREATE POLICY "Company members can view their own company"
  ON companies
  FOR SELECT
  USING (is_company_member(id));

-- ============================================================================
-- ROLLBACK COMPLETE
-- ============================================================================

