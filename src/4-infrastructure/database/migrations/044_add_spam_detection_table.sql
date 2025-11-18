-- Migration: Add Spam Detection Table
-- Description: Forum spam tespiti için tablo
-- Date: 2025-11-17

-- Spam Detections Table
CREATE TABLE IF NOT EXISTS spam_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  spam_score INTEGER NOT NULL CHECK (spam_score >= 0 AND spam_score <= 100),
  is_spam BOOLEAN NOT NULL DEFAULT false,
  spam_reason TEXT,
  recommendation VARCHAR(20) NOT NULL CHECK (recommendation IN ('approve', 'reject', 'review')),
  factors JSONB DEFAULT '[]'::jsonb, -- Spam faktörleri
  ai_analysis JSONB, -- AI analiz sonucu (full response)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_spam_detections_topic_id ON spam_detections(topic_id);
CREATE INDEX IF NOT EXISTS idx_spam_detections_reply_id ON spam_detections(reply_id);
CREATE INDEX IF NOT EXISTS idx_spam_detections_spam_score ON spam_detections(spam_score);
CREATE INDEX IF NOT EXISTS idx_spam_detections_is_spam ON spam_detections(is_spam);
CREATE INDEX IF NOT EXISTS idx_spam_detections_recommendation ON spam_detections(recommendation);
CREATE INDEX IF NOT EXISTS idx_spam_detections_created_at ON spam_detections(created_at DESC);

-- Constraint: Either topic_id or reply_id must be set
ALTER TABLE spam_detections
ADD CONSTRAINT spam_detections_topic_or_reply_check
CHECK (
  (topic_id IS NOT NULL AND reply_id IS NULL) OR
  (topic_id IS NULL AND reply_id IS NOT NULL)
);

-- RLS Policies
ALTER TABLE spam_detections ENABLE ROW LEVEL SECURITY;

-- Master Admin: Full access
CREATE POLICY spam_detections_master_admin_all ON spam_detections
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'master_admin'
    )
  );

-- Consultant: Read access to spam detections for their program topics/replies
CREATE POLICY spam_detections_consultant_read ON spam_detections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('consultant', 'program_manager')
    )
    AND (
      -- Topic spam detection
      (topic_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM forum_topics ft
        JOIN user_programs up ON up.program_id = ft.program_id
        WHERE up.user_id = auth.uid()
        AND up.is_active = true
        AND up.role_in_program IN ('consultant', 'program_manager')
        AND spam_detections.topic_id = ft.id
      ))
      OR
      -- Reply spam detection
      (reply_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM forum_replies fr
        JOIN forum_topics ft ON ft.id = fr.topic_id
        JOIN user_programs up ON up.program_id = ft.program_id
        WHERE up.user_id = auth.uid()
        AND up.is_active = true
        AND up.role_in_program IN ('consultant', 'program_manager')
        AND spam_detections.reply_id = fr.id
      ))
    )
  );

-- Comments
COMMENT ON TABLE spam_detections IS 'Forum spam tespiti sonuçları';
COMMENT ON COLUMN spam_detections.spam_score IS 'Spam skoru (0-100)';
COMMENT ON COLUMN spam_detections.recommendation IS 'Öneri: approve (<40), reject (>=70), review (40-69)';
COMMENT ON COLUMN spam_detections.factors IS 'Spam faktörleri array';
COMMENT ON COLUMN spam_detections.ai_analysis IS 'AI analiz sonucu (full JSON response)';

