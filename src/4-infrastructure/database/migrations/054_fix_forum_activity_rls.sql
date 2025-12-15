-- =====================================================
-- FIX FORUM ACTIVITY RLS POLICY
-- Migration: 054_fix_forum_activity_rls.sql
-- Created: 2025-12-13
-- Description: Fix RLS policy violation for forum_activity table inserts
-- =====================================================

-- The record_forum_activity() trigger function needs to bypass RLS
-- when inserting into forum_activity table. We'll make it SECURITY DEFINER
-- so it runs with the privileges of the function owner (postgres/superuser)

CREATE OR REPLACE FUNCTION record_forum_activity()
RETURNS TRIGGER 
SECURITY DEFINER -- Run with function owner's privileges (bypasses RLS)
SET search_path = public -- Ensure we use the public schema
AS $$
DECLARE
  v_company_id UUID;
  v_program_id UUID;
  v_points INTEGER;
  v_activity_type VARCHAR(50);
BEGIN
  IF TG_TABLE_NAME = 'forum_topics' AND TG_OP = 'INSERT' THEN
    -- Only record activity if company_id is not null (admin topics don't have company_id)
    IF NEW.company_id IS NOT NULL THEN
      v_company_id := NEW.company_id;
      v_program_id := NEW.program_id;
      v_points := 10; -- Konu açma: +10 puan
      v_activity_type := 'topic_created';

      INSERT INTO forum_activity (user_id, company_id, program_id, activity_type, topic_id, points)
      VALUES (NEW.author_id, v_company_id, v_program_id, v_activity_type, NEW.id, v_points);
    END IF;

  ELSIF TG_TABLE_NAME = 'forum_replies' AND TG_OP = 'INSERT' THEN
    -- Get company_id and program_id from topic
    SELECT t.company_id, t.program_id INTO v_company_id, v_program_id
    FROM forum_topics t WHERE t.id = NEW.topic_id;

    -- Only record activity if company_id is not null
    IF v_company_id IS NOT NULL THEN
      v_points := 5; -- Yanıt yazma: +5 puan
      v_activity_type := 'reply_created';

      INSERT INTO forum_activity (user_id, company_id, program_id, activity_type, topic_id, reply_id, points)
      VALUES (NEW.author_id, v_company_id, v_program_id, v_activity_type, NEW.topic_id, NEW.id, v_points);
    END IF;

  ELSIF TG_TABLE_NAME = 'forum_replies' AND TG_OP = 'UPDATE' AND NEW.is_solution = TRUE AND OLD.is_solution = FALSE THEN
    -- Get company_id and program_id from topic
    SELECT t.company_id, t.program_id INTO v_company_id, v_program_id
    FROM forum_topics t WHERE t.id = NEW.topic_id;

    -- Only record activity if company_id is not null
    IF v_company_id IS NOT NULL THEN
      v_points := 20; -- Çözüm işaretlenme: +20 puan
      v_activity_type := 'solution_marked';

      INSERT INTO forum_activity (user_id, company_id, program_id, activity_type, topic_id, reply_id, points)
      VALUES (NEW.author_id, v_company_id, v_program_id, v_activity_type, NEW.topic_id, NEW.id, v_points);
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add comment explaining the security model
COMMENT ON FUNCTION record_forum_activity() IS 
'Trigger function that records forum activity for leaderboard scoring. 
Uses SECURITY DEFINER to bypass RLS policies when inserting activity records, 
as this is a system-level operation that should not be restricted by user permissions.';
