-- Fix forum_notifications table schema
-- This migration fixes the user_id column issue in forum_notifications

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS create_reply_notification ON forum_replies;
DROP FUNCTION IF EXISTS notify_on_reply();

-- Update forum_notifications table to use correct column names
ALTER TABLE IF EXISTS forum_notifications 
  DROP COLUMN IF EXISTS user_id;

ALTER TABLE IF EXISTS forum_notifications
  ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES users(id);

-- Create updated notification function
CREATE OR REPLACE FUNCTION notify_on_reply()
RETURNS TRIGGER AS $$
DECLARE
  topic_author_id UUID;
  topic_title TEXT;
BEGIN
  -- Get topic author and title
  SELECT author_id, title INTO topic_author_id, topic_title
  FROM forum_topics
  WHERE id = NEW.topic_id;

  -- Only create notification if reply author is different from topic author
  IF topic_author_id IS NOT NULL AND topic_author_id != NEW.author_id THEN
    INSERT INTO forum_notifications (
      recipient_id,
      sender_id,
      topic_id,
      reply_id,
      type,
      message,
      is_read
    ) VALUES (
      topic_author_id,
      NEW.author_id,
      NEW.topic_id,
      NEW.id,
      'reply',
      'Konunuza yeni bir yanıt geldi: ' || topic_title,
      false
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER create_reply_notification
  AFTER INSERT ON forum_replies
  FOR EACH ROW
  WHEN (NEW.topic_id IS NOT NULL)
  EXECUTE FUNCTION notify_on_reply();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_forum_notifications_recipient 
  ON forum_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_forum_notifications_is_read 
  ON forum_notifications(is_read);

