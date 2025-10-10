-- Complete trigger and function removal with all dependencies
-- This will forcefully remove all triggers and functions related to forum replies

-- Step 1: Drop all triggers on forum_replies table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tgname FROM pg_trigger WHERE tgrelid = 'forum_replies'::regclass)
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.tgname || ' ON forum_replies CASCADE';
        RAISE NOTICE 'Dropped trigger: %', r.tgname;
    END LOOP;
END $$;

-- Step 2: Drop all related functions
DROP FUNCTION IF EXISTS notify_on_reply() CASCADE;
DROP FUNCTION IF EXISTS create_forum_notification() CASCADE;
DROP FUNCTION IF EXISTS handle_forum_reply() CASCADE;

-- Step 3: List remaining triggers (should be empty)
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'forum_replies';

-- Step 4: Verify by checking pg_trigger directly
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'forum_replies';

