-- Temporarily disable forum reply notification trigger
-- This allows reply creation to work while we fix the notification system

DROP TRIGGER IF EXISTS create_reply_notification ON forum_replies;
DROP FUNCTION IF EXISTS notify_on_reply();

-- Add comment for future reference
COMMENT ON TABLE forum_notifications IS 'Notification trigger temporarily disabled - needs user_id -> recipient_id migration';

