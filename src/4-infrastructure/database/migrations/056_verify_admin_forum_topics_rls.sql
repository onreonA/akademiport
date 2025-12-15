-- =====================================================
-- VERIFY ADMIN FORUM TOPICS RLS POLICY
-- Migration: 056_verify_admin_forum_topics_rls.sql
-- Created: 2025-12-13
-- Description: Verify that admin RLS policy works correctly for SELECT
-- =====================================================

-- The "Admin can manage all topics" policy should already exist from migration 033
-- This migration verifies it exists and is correct

-- Check if policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'forum_topics' 
    AND policyname = 'Admin can manage all topics'
  ) THEN
    -- Create the policy if it doesn't exist
    CREATE POLICY "Admin can manage all topics"
      ON forum_topics FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.role IN ('master_admin', 'consultant')
        )
      );
    
    RAISE NOTICE 'Admin policy created';
  ELSE
    RAISE NOTICE 'Admin policy already exists';
  END IF;
END $$;

-- Verify the policy is enabled
-- Note: Policies are automatically enabled when created
-- This is just for documentation

COMMENT ON POLICY "Admin can manage all topics" ON forum_topics IS 
'Allows master_admin and consultant users to perform all operations (SELECT, INSERT, UPDATE, DELETE) on all forum topics. 
This policy should allow admins to see all topics regardless of program_id or approval status.';
