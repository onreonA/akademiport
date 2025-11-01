-- =====================================================
-- Add RLS Policy for Consultants and Program Managers
-- to view users in their program companies
-- =====================================================

-- Consultants and Program Managers: Can view users in their program companies
CREATE POLICY "Consultants and Program Managers can view users in their program companies"
  ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies c
      INNER JOIN user_programs up ON up.program_id = c.program_id
      WHERE c.id = users.company_id
        AND up.user_id = auth.uid()
        AND up.role_in_program IN ('consultant', 'program_manager')
        AND up.is_active = true
    )
  );

