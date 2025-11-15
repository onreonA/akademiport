-- =====================================================
-- SPRINT 12: NEWS MODULE TABLES
-- =====================================================
-- Description: Haberler modülü için gerekli tablolar
-- Author: AI Assistant
-- Date: 2025-11-10
-- Dependencies: programs, users, companies tables
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

-- News Category Enum
CREATE TYPE news_category AS ENUM (
  'e_commerce',        -- E-ticaret
  'e_export',          -- E-ihracat
  'technology',        -- Teknoloji
  'digital_marketing', -- Dijital Pazarlama
  'logistics',         -- Lojistik
  'finance',           -- Finans
  'legal',             -- Hukuki
  'general'            -- Genel
);

-- News Status Enum
CREATE TYPE news_status AS ENUM (
  'draft',             -- Taslak
  'published',         -- Yayında
  'archived'           -- Arşiv
);

-- =====================================================
-- NEWS TABLE
-- =====================================================
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Program ilişkisi
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  -- Yazar bilgisi
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  
  -- İçerik
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  summary TEXT,                    -- Kısa özet (liste görünümü için)
  content TEXT NOT NULL,           -- Tam içerik (HTML destekli)
  
  -- Kategori ve durum
  category news_category NOT NULL DEFAULT 'general',
  status news_status NOT NULL DEFAULT 'draft',
  
  -- Görsel
  image_url VARCHAR(500),
  image_alt VARCHAR(255),
  
  -- SEO
  meta_description VARCHAR(160),
  meta_keywords TEXT[],
  
  -- Özellikler
  is_featured BOOLEAN DEFAULT FALSE,  -- Öne çıkan haber
  is_pinned BOOLEAN DEFAULT FALSE,    -- Sabitlenmiş haber
  reading_time INTEGER,               -- Tahmini okuma süresi (dakika)
  
  -- İstatistikler
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  
  -- Yayın bilgileri
  published_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT valid_reading_time CHECK (reading_time > 0),
  CONSTRAINT valid_view_count CHECK (view_count >= 0),
  CONSTRAINT valid_like_count CHECK (like_count >= 0),
  CONSTRAINT valid_comment_count CHECK (comment_count >= 0)
);

-- =====================================================
-- NEWS TAGS TABLE
-- =====================================================
CREATE TABLE news_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NEWS TAG RELATIONS TABLE
-- =====================================================
CREATE TABLE news_tag_relations (
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES news_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (news_id, tag_id)
);

-- =====================================================
-- NEWS COMMENTS TABLE
-- =====================================================
CREATE TABLE news_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  parent_id UUID REFERENCES news_comments(id) ON DELETE CASCADE, -- İç içe yorumlar
  
  is_approved BOOLEAN DEFAULT TRUE,
  is_edited BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_content CHECK (LENGTH(content) > 0)
);

-- =====================================================
-- NEWS LIKES TABLE
-- =====================================================
CREATE TABLE news_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(news_id, user_id)
);

-- =====================================================
-- NEWS READS TABLE (Liderlik tablosu için)
-- =====================================================
CREATE TABLE news_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Okuma detayları
  read_duration INTEGER,              -- Okuma süresi (saniye)
  completed BOOLEAN DEFAULT FALSE,    -- Tam okuduysa true (>80% süre)
  scroll_percentage INTEGER DEFAULT 0, -- Kaydırma yüzdesi
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_read_duration CHECK (read_duration >= 0),
  CONSTRAINT valid_scroll_percentage CHECK (scroll_percentage >= 0 AND scroll_percentage <= 100)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- News indexes
CREATE INDEX idx_news_program ON news(program_id);
CREATE INDEX idx_news_author ON news(author_id);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_published_at ON news(published_at DESC);
CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_featured ON news(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_news_pinned ON news(is_pinned) WHERE is_pinned = TRUE;

-- Full-text search index
CREATE INDEX idx_news_search ON news USING gin(
  to_tsvector('turkish', title || ' ' || COALESCE(summary, '') || ' ' || COALESCE(content, ''))
);

-- Comments indexes
CREATE INDEX idx_news_comments_news ON news_comments(news_id);
CREATE INDEX idx_news_comments_user ON news_comments(user_id);
CREATE INDEX idx_news_comments_parent ON news_comments(parent_id);
CREATE INDEX idx_news_comments_created ON news_comments(created_at DESC);

-- Likes indexes
CREATE INDEX idx_news_likes_news ON news_likes(news_id);
CREATE INDEX idx_news_likes_user ON news_likes(user_id);

-- Reads indexes
CREATE INDEX idx_news_reads_news ON news_reads(news_id);
CREATE INDEX idx_news_reads_user ON news_reads(user_id);
CREATE INDEX idx_news_reads_company ON news_reads(company_id);
CREATE INDEX idx_news_reads_completed ON news_reads(completed) WHERE completed = TRUE;

-- Tags indexes
CREATE INDEX idx_news_tags_slug ON news_tags(slug);
CREATE INDEX idx_news_tag_relations_news ON news_tag_relations(news_id);
CREATE INDEX idx_news_tag_relations_tag ON news_tag_relations(tag_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_news_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW
  EXECUTE FUNCTION update_news_updated_at();

-- Update comment count
CREATE OR REPLACE FUNCTION update_news_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE news SET comment_count = comment_count + 1 WHERE id = NEW.news_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE news SET comment_count = comment_count - 1 WHERE id = OLD.news_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_news_comment_count
  AFTER INSERT OR DELETE ON news_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_news_comment_count();

-- Update like count
CREATE OR REPLACE FUNCTION update_news_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE news SET like_count = like_count + 1 WHERE id = NEW.news_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE news SET like_count = like_count - 1 WHERE id = OLD.news_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_news_like_count
  AFTER INSERT OR DELETE ON news_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_news_like_count();

-- Update view count on read
CREATE OR REPLACE FUNCTION update_news_view_count()
RETURNS TRIGGER AS $$
BEGIN
  -- İlk okuma ise view count'u artır
  IF NOT EXISTS (
    SELECT 1 FROM news_reads 
    WHERE news_id = NEW.news_id AND user_id = NEW.user_id
    AND id != NEW.id
  ) THEN
    UPDATE news SET view_count = view_count + 1 WHERE id = NEW.news_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_news_view_count
  AFTER INSERT ON news_reads
  FOR EACH ROW
  EXECUTE FUNCTION update_news_view_count();

-- Update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE news_tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE news_tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tag_usage_count
  AFTER INSERT OR DELETE ON news_tag_relations
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_usage_count();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_tag_relations ENABLE ROW LEVEL SECURITY;

-- News policies
CREATE POLICY "Admin can do everything on news"
  ON news FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('master_admin', 'consultant')
    )
  );

CREATE POLICY "Companies can view published news in their program"
  ON news FOR SELECT
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM users
      JOIN companies ON companies.id = users.company_id
      WHERE users.id = auth.uid()
      AND companies.program_id = news.program_id
    )
  );

-- Comments policies
CREATE POLICY "Users can view approved comments"
  ON news_comments FOR SELECT
  USING (is_approved = TRUE);

CREATE POLICY "Users can create comments"
  ON news_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON news_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON news_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Users can view all likes"
  ON news_likes FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can create likes"
  ON news_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON news_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Reads policies
CREATE POLICY "Users can create reads"
  ON news_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all reads"
  ON news_reads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('master_admin', 'consultant')
    )
  );

-- Tags policies (public read, admin write)
CREATE POLICY "Everyone can view tags"
  ON news_tags FOR SELECT
  USING (TRUE);

CREATE POLICY "Admin can manage tags"
  ON news_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('master_admin', 'consultant')
    )
  );

-- Tag relations policies
CREATE POLICY "Everyone can view tag relations"
  ON news_tag_relations FOR SELECT
  USING (TRUE);

CREATE POLICY "Admin can manage tag relations"
  ON news_tag_relations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('master_admin', 'consultant')
    )
  );

-- =====================================================
-- SEED DATA (Optional)
-- =====================================================

-- Sample tags
INSERT INTO news_tags (name, slug) VALUES
  ('Amazon', 'amazon'),
  ('Alibaba', 'alibaba'),
  ('SEO', 'seo'),
  ('Sosyal Medya', 'sosyal-medya'),
  ('Gümrük', 'gumruk'),
  ('Kargo', 'kargo'),
  ('Ödeme Sistemleri', 'odeme-sistemleri'),
  ('Yapay Zeka', 'yapay-zeka')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE news IS 'Haberler tablosu - Sprint 12';
COMMENT ON TABLE news_tags IS 'Haber etiketleri';
COMMENT ON TABLE news_tag_relations IS 'Haber-etiket ilişkileri';
COMMENT ON TABLE news_comments IS 'Haber yorumları (nested)';
COMMENT ON TABLE news_likes IS 'Haber beğenileri';
COMMENT ON TABLE news_reads IS 'Haber okuma takibi (liderlik tablosu için)';

COMMENT ON COLUMN news.reading_time IS 'Tahmini okuma süresi (dakika) - kelime sayısına göre hesaplanır';
COMMENT ON COLUMN news_reads.completed IS 'Tam okuma (>80% scroll) - liderlik tablosu için bonus puan';
COMMENT ON COLUMN news_reads.scroll_percentage IS 'Kaydırma yüzdesi - tam okuma tespiti için';


