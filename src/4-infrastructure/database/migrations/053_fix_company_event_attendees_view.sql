-- Migration: Fix Company User Event Attendees View
-- Company users should be able to see all attendees for events in their program
-- Date: 2025-01-XX

-- Drop the old policy that only allows viewing own company's attendances
DROP POLICY IF EXISTS "Company user can view own company attendances" ON event_attendances;

-- Drop the new policy if it already exists (in case migration was partially run)
DROP POLICY IF EXISTS "Company user can view program event attendances" ON event_attendances;

-- Create new policy: Company users can view all attendances for events in their program
CREATE POLICY "Company user can view program event attendances"
  ON event_attendances
  FOR SELECT
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1
      FROM users u
      JOIN companies c ON c.id = u.company_id
      JOIN events e ON e.id = event_attendances.event_id
      WHERE u.id = auth.uid()
        AND c.program_id = e.program_id
        AND e.deleted_at IS NULL
    )
  );

-- ============================================================================
-- Fix: Company users should be able to view companies in their program
-- This fixes the "Unknown" company issue in event attendees list
-- ============================================================================

-- Drop the old policy that only allows viewing own company
DROP POLICY IF EXISTS "Company members can view their own company" ON companies;

-- Create new policy: Company users can view their own company AND companies in their program
-- Using SECURITY DEFINER function to avoid recursive policy issues
CREATE OR REPLACE FUNCTION can_view_company(company_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_company_id UUID;
  user_program_id UUID;
BEGIN
  -- Get user's company_id and program_id
  SELECT u.company_id, c.program_id INTO user_company_id, user_program_id
  FROM users u
  LEFT JOIN companies c ON c.id = u.company_id
  WHERE u.id = auth.uid();
  
  -- If user has no company, deny access
  IF user_company_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Allow if it's user's own company
  IF company_uuid = user_company_id THEN
    RETURN TRUE;
  END IF;
  
  -- Allow if companies are in the same program
  IF user_program_id IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1
      FROM companies c
      WHERE c.id = company_uuid
        AND c.program_id = user_program_id
    );
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Company members can view their own company"
  ON companies
  FOR SELECT
  USING (
    is_master_admin() OR
    can_view_company(id)
  );

-- ============================================================================
-- Fix: Company users should be able to view users from companies in their program
-- This fixes the "Unknown" user name issue in event attendees list
-- ============================================================================

-- Create SECURITY DEFINER function to avoid recursive policy issues
CREATE OR REPLACE FUNCTION can_view_user_in_program(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_company_id UUID;
  current_user_program_id UUID;
  target_user_company_id UUID;
  target_user_program_id UUID;
BEGIN
  -- Get current user's company_id and program_id
  SELECT u.company_id, c.program_id INTO current_user_company_id, current_user_program_id
  FROM users u
  LEFT JOIN companies c ON c.id = u.company_id
  WHERE u.id = auth.uid();
  
  -- If current user has no company, deny access (except own profile)
  IF current_user_company_id IS NULL THEN
    RETURN target_user_id = auth.uid();
  END IF;
  
  -- Allow if it's user's own profile
  IF target_user_id = auth.uid() THEN
    RETURN TRUE;
  END IF;
  
  -- Get target user's company_id and program_id
  SELECT u.company_id, c.program_id INTO target_user_company_id, target_user_program_id
  FROM users u
  LEFT JOIN companies c ON c.id = u.company_id
  WHERE u.id = target_user_id;
  
  -- If target user has no company, deny access
  IF target_user_company_id IS NULL OR target_user_program_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Allow if users are in companies with the same program
  RETURN current_user_program_id = target_user_program_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Company users can view users in their program" ON users;

-- Create new policy: Company users can view users from companies in their program
CREATE POLICY "Company users can view users in their program"
  ON users
  FOR SELECT
  USING (
    is_master_admin() OR
    -- User's own profile (already covered by existing policy, but included for clarity)
    id = auth.uid() OR
    -- Users from companies in the same program
    can_view_user_in_program(id)
  );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

