-- =====================================================
-- FIX FORUM TOPICS RLS POLICY FOR OWN TOPICS
-- Migration: 055_fix_forum_topics_rls_own_topics.sql
-- Created: 2025-12-13
-- Description: Allow company users to see their own unapproved topics
-- =====================================================

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view approved topics in their program" ON forum_topics;

-- Create new policy that allows:
-- 1. Approved topics in their program
-- 2. Their own topics (even if not approved)
CREATE POLICY "Users can view approved topics and their own topics"
  ON forum_topics FOR SELECT
  USING (
    (
      -- Approved topics in their program
      (
        is_approved = TRUE
        AND EXISTS (
          SELECT 1 FROM users
          JOIN companies ON companies.id = users.company_id
          WHERE users.id = auth.uid()
          AND companies.program_id = forum_topics.program_id
        )
      )
      OR
      -- Their own topics (even if not approved)
      (
        author_id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM users
          JOIN companies ON companies.id = users.company_id
          WHERE users.id = auth.uid()
          AND companies.program_id = forum_topics.program_id
        )
      )
    )
  );
