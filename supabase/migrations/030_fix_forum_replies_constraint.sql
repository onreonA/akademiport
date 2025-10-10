-- Fix forum_replies foreign key constraint issue
-- Remove the foreign key constraint that requires author_id to exist in users table
-- This allows company users to post replies even if they don't exist in users table

-- First, drop the existing foreign key constraint
ALTER TABLE forum_replies 
DROP CONSTRAINT IF EXISTS forum_replies_author_id_fkey;

-- Add a comment explaining the change
COMMENT ON COLUMN forum_replies.author_id IS 'Author ID - can be from users table or companies table';

-- Update existing replies with null author_id to use a valid user ID
UPDATE forum_replies 
SET author_id = 'cd9bf9ec-f2ef-4672-87e4-428fb1b5241e'
WHERE author_id IS NULL;

-- Ensure all replies have a valid author_id
UPDATE forum_replies 
SET author_id = 'cd9bf9ec-f2ef-4672-87e4-428fb1b5241e'
WHERE author_id NOT IN (
  SELECT id FROM users 
  WHERE id = forum_replies.author_id
);
