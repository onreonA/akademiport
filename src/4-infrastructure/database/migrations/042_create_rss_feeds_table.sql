-- Migration: Create RSS Feeds Tables
-- Description: RSS feed yönetimi ve scraped items için tablolar
-- Date: 2025-11-17

-- RSS Feeds Table
CREATE TABLE IF NOT EXISTS rss_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  feed_url TEXT NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100), -- NewsCategory enum değeri
  is_active BOOLEAN DEFAULT true,
  auto_publish BOOLEAN DEFAULT false, -- Otomatik yayınlama
  check_interval_minutes INTEGER DEFAULT 360, -- 6 saat
  last_checked_at TIMESTAMPTZ,
  last_error TEXT,
  error_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- RSS Feed Items Table (Scraped items)
CREATE TABLE IF NOT EXISTS rss_feed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id UUID NOT NULL REFERENCES rss_feeds(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  description TEXT,
  content TEXT, -- Full content if available
  author VARCHAR(255),
  pub_date TIMESTAMPTZ,
  guid TEXT UNIQUE, -- RSS item GUID
  image_url TEXT,
  categories TEXT[], -- Tags/categories from RSS
  is_processed BOOLEAN DEFAULT false, -- AI rewrite yapıldı mı?
  processed_at TIMESTAMPTZ,
  news_id UUID REFERENCES news(id) ON DELETE SET NULL, -- Created news ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rss_feeds_program_id ON rss_feeds(program_id);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_is_active ON rss_feeds(is_active);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_last_checked_at ON rss_feeds(last_checked_at);
CREATE INDEX IF NOT EXISTS idx_rss_feed_items_feed_id ON rss_feed_items(feed_id);
CREATE INDEX IF NOT EXISTS idx_rss_feed_items_is_processed ON rss_feed_items(is_processed);
CREATE INDEX IF NOT EXISTS idx_rss_feed_items_guid ON rss_feed_items(guid);
CREATE INDEX IF NOT EXISTS idx_rss_feed_items_pub_date ON rss_feed_items(pub_date DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_rss_feeds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rss_feeds_updated_at
  BEFORE UPDATE ON rss_feeds
  FOR EACH ROW
  EXECUTE FUNCTION update_rss_feeds_updated_at();

CREATE TRIGGER trigger_update_rss_feed_items_updated_at
  BEFORE UPDATE ON rss_feed_items
  FOR EACH ROW
  EXECUTE FUNCTION update_rss_feeds_updated_at();

-- RLS Policies
ALTER TABLE rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_feed_items ENABLE ROW LEVEL SECURITY;

-- Master Admin: Full access
CREATE POLICY rss_feeds_master_admin_all ON rss_feeds
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'master_admin'
    )
  );

CREATE POLICY rss_feed_items_master_admin_all ON rss_feed_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'master_admin'
    )
  );

-- Consultant: Read access to their program feeds
CREATE POLICY rss_feeds_consultant_read ON rss_feeds
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_programs
      WHERE user_programs.user_id = auth.uid()
      AND user_programs.program_id = rss_feeds.program_id
      AND user_programs.is_active = true
      AND user_programs.role_in_program IN ('consultant', 'program_manager')
    )
  );

CREATE POLICY rss_feed_items_consultant_read ON rss_feed_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rss_feeds
      JOIN user_programs ON user_programs.program_id = rss_feeds.program_id
      WHERE user_programs.user_id = auth.uid()
      AND user_programs.is_active = true
      AND user_programs.role_in_program IN ('consultant', 'program_manager')
      AND rss_feed_items.feed_id = rss_feeds.id
    )
  );

-- Comments
COMMENT ON TABLE rss_feeds IS 'RSS feed yönetimi';
COMMENT ON TABLE rss_feed_items IS 'RSS feed''lerden çekilen haberler';
COMMENT ON COLUMN rss_feeds.auto_publish IS 'Otomatik yayınlama aktif mi?';
COMMENT ON COLUMN rss_feeds.check_interval_minutes IS 'Feed kontrol aralığı (dakika)';
COMMENT ON COLUMN rss_feed_items.is_processed IS 'AI rewrite yapıldı mı?';
COMMENT ON COLUMN rss_feed_items.news_id IS 'Oluşturulan haber ID';


