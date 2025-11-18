-- Migration: Add News Spam Detection Table
-- Description: Haber spam tespiti için tablo
-- Date: 2025-11-17

-- News Spam Detections Table
CREATE TABLE IF NOT EXISTS news_spam_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID REFERENCES news(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
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
CREATE INDEX IF NOT EXISTS idx_news_spam_detections_news_id ON news_spam_detections(news_id);
CREATE INDEX IF NOT EXISTS idx_news_spam_detections_spam_score ON news_spam_detections(spam_score);
CREATE INDEX IF NOT EXISTS idx_news_spam_detections_is_spam ON news_spam_detections(is_spam);
CREATE INDEX IF NOT EXISTS idx_news_spam_detections_recommendation ON news_spam_detections(recommendation);
CREATE INDEX IF NOT EXISTS idx_news_spam_detections_created_at ON news_spam_detections(created_at DESC);

-- RLS Policies
ALTER TABLE news_spam_detections ENABLE ROW LEVEL SECURITY;

-- Master Admin: Full access
CREATE POLICY news_spam_detections_master_admin_all ON news_spam_detections
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'master_admin'
    )
  );

-- Consultant: Read access to spam detections for their program news
CREATE POLICY news_spam_detections_consultant_read ON news_spam_detections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('consultant', 'program_manager')
    )
    AND EXISTS (
      SELECT 1 FROM news n
      JOIN user_programs up ON up.program_id = n.program_id
      WHERE up.user_id = auth.uid()
      AND up.is_active = true
      AND up.role_in_program IN ('consultant', 'program_manager')
      AND news_spam_detections.news_id = n.id
    )
  );

-- Comments
COMMENT ON TABLE news_spam_detections IS 'Haber spam tespiti sonuçları';
COMMENT ON COLUMN news_spam_detections.spam_score IS 'Spam skoru (0-100)';
COMMENT ON COLUMN news_spam_detections.recommendation IS 'Öneri: approve (<40), reject (>=70), review (40-69)';
COMMENT ON COLUMN news_spam_detections.factors IS 'Spam faktörleri array';
COMMENT ON COLUMN news_spam_detections.ai_analysis IS 'AI analiz sonucu (full JSON response)';

