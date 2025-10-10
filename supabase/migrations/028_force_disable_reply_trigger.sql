-- Force disable forum reply trigger
-- Alternative approach with explicit error handling

DO $$ 
BEGIN
    -- Drop trigger if exists
    DROP TRIGGER IF EXISTS create_reply_notification ON forum_replies;
    
    -- Drop function if exists
    DROP FUNCTION IF EXISTS notify_on_reply();
    
    RAISE NOTICE 'Forum reply trigger successfully disabled';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error disabling trigger: %', SQLERRM;
END $$;

-- Verify trigger is disabled
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'forum_replies'
    AND trigger_name = 'create_reply_notification';

