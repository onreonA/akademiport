-- =====================================================
-- MIGRATION: 049_create_cms_tables
-- Description: CMS (Content Management System) tabloları
-- Created: 2025-01-XX
-- Sprint: 23 - CMS
-- =====================================================

-- =====================================================
-- CMS PAGE STATUS ENUM
-- =====================================================
DO $$ BEGIN
  CREATE TYPE cms_page_status AS ENUM (
    'draft',      -- Taslak
    'published',  -- Yayınlandı
    'archived'    -- Arşivlendi
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- CMS SECTION TYPE ENUM
-- =====================================================
DO $$ BEGIN
  CREATE TYPE cms_section_type AS ENUM (
    'hero',          -- Hero section (başlık, alt başlık, CTA)
    'text',          -- Metin bölümü
    'image',          -- Görsel bölümü
    'features',       -- Özellikler bölümü
    'testimonials',   -- Müşteri yorumları
    'cta',            -- Call-to-action
    'stats',          -- İstatistikler
    'gallery',        -- Galeri
    'video',          -- Video
    'form',           -- Form
    'faq',            -- SSS
    'pricing',        -- Fiyatlandırma
    'team',           -- Takım
    'contact',        -- İletişim bilgileri
    'map',            -- Harita
    'custom'          -- Özel bölüm
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- CMS PAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Sayfa bilgileri
  slug VARCHAR(255) NOT NULL UNIQUE, -- URL slug (örn: "ana-sayfa", "program-hakkinda")
  title VARCHAR(255) NOT NULL, -- Sayfa başlığı
  content JSONB DEFAULT '[]'::jsonb, -- Sayfa içeriği (sections array'i)
  
  -- SEO ayarları
  meta_title VARCHAR(255), -- SEO meta title (max 60 karakter önerilir)
  meta_description TEXT, -- SEO meta description (max 160 karakter önerilir)
  meta_keywords TEXT[], -- SEO keywords array
  og_image_url TEXT, -- Open Graph image URL
  og_title VARCHAR(255), -- Open Graph title
  og_description TEXT, -- Open Graph description
  canonical_url TEXT, -- Canonical URL
  
  -- Durum ve yayınlama
  status cms_page_status DEFAULT 'draft',
  published_at TIMESTAMPTZ, -- Yayınlanma tarihi
  
  -- Metadata
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX IF NOT EXISTS idx_cms_pages_status ON cms_pages(status);
CREATE INDEX IF NOT EXISTS idx_cms_pages_published_at ON cms_pages(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_cms_pages_created_at ON cms_pages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cms_pages_created_by ON cms_pages(created_by);

-- Comments
COMMENT ON TABLE cms_pages IS 'CMS sayfaları - Public website sayfaları için içerik yönetimi';
COMMENT ON COLUMN cms_pages.slug IS 'URL slug - unique ve URL-friendly olmalı';
COMMENT ON COLUMN cms_pages.content IS 'Sayfa içeriği - sections array (JSONB)';
COMMENT ON COLUMN cms_pages.meta_title IS 'SEO meta title - maksimum 60 karakter önerilir';
COMMENT ON COLUMN cms_pages.meta_description IS 'SEO meta description - maksimum 160 karakter önerilir';

-- =====================================================
-- CMS SECTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cms_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- İlişkiler
  page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
  
  -- Bölüm bilgileri
  type cms_section_type NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0, -- Drag-drop sıralama için
  content JSONB DEFAULT '{}'::jsonb, -- Bölüm içeriği (type'a göre değişir)
  settings JSONB DEFAULT '{}'::jsonb, -- Bölüm ayarları (background, padding, colors, etc.)
  
  -- Durum
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cms_sections_page_id ON cms_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_cms_sections_order_index ON cms_sections(page_id, order_index);
CREATE INDEX IF NOT EXISTS idx_cms_sections_type ON cms_sections(type);
CREATE INDEX IF NOT EXISTS idx_cms_sections_is_active ON cms_sections(is_active);

-- Comments
COMMENT ON TABLE cms_sections IS 'CMS bölümleri - Sayfa içindeki bölümler (hero, text, image, etc.)';
COMMENT ON COLUMN cms_sections.content IS 'Bölüm içeriği - type''a göre farklı yapıda JSONB';
COMMENT ON COLUMN cms_sections.settings IS 'Bölüm ayarları - background, padding, colors, etc.';

-- =====================================================
-- CMS MEDIA TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cms_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dosya bilgileri
  filename VARCHAR(255) NOT NULL, -- Dosya adı (storage'da)
  original_filename VARCHAR(255) NOT NULL, -- Orijinal dosya adı
  mime_type VARCHAR(100) NOT NULL, -- MIME type (image/jpeg, image/png, etc.)
  file_size BIGINT NOT NULL, -- Dosya boyutu (bytes)
  
  -- Storage bilgileri
  file_url TEXT NOT NULL, -- Supabase Storage URL
  storage_path TEXT NOT NULL, -- Storage bucket path
  
  -- SEO ve metadata
  alt_text TEXT, -- SEO için alt text
  caption TEXT, -- Görsel açıklaması
  
  -- İlişkiler
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cms_media_uploaded_by ON cms_media(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_cms_media_mime_type ON cms_media(mime_type);
CREATE INDEX IF NOT EXISTS idx_cms_media_created_at ON cms_media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cms_media_filename ON cms_media(filename);

-- Comments
COMMENT ON TABLE cms_media IS 'CMS medya dosyaları - Upload edilen görseller, videolar, dosyalar';
COMMENT ON COLUMN cms_media.file_url IS 'Supabase Storage URL - Public erişim için';
COMMENT ON COLUMN cms_media.storage_path IS 'Storage bucket path - Dosya yolu';

-- =====================================================
-- CMS SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cms_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ayar bilgileri
  key VARCHAR(255) NOT NULL UNIQUE, -- Setting key (örn: "site_name", "contact_email")
  value JSONB NOT NULL DEFAULT '{}'::jsonb, -- Setting value (herhangi bir JSON değer)
  category VARCHAR(50) NOT NULL DEFAULT 'general', -- Kategori (general, contact, social, analytics)
  description TEXT, -- Ayar açıklaması
  
  -- Metadata
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cms_settings_key ON cms_settings(key);
CREATE INDEX IF NOT EXISTS idx_cms_settings_category ON cms_settings(category);

-- Comments
COMMENT ON TABLE cms_settings IS 'CMS site ayarları - Global site ayarları (key-value pairs)';
COMMENT ON COLUMN cms_settings.key IS 'Setting key - unique identifier';
COMMENT ON COLUMN cms_settings.value IS 'Setting value - herhangi bir JSON değer';
COMMENT ON COLUMN cms_settings.category IS 'Kategori - general, contact, social, analytics';

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_cms_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cms_pages_updated_at
  BEFORE UPDATE ON cms_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_cms_pages_updated_at();

CREATE OR REPLACE FUNCTION update_cms_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cms_sections_updated_at
  BEFORE UPDATE ON cms_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_cms_sections_updated_at();

CREATE OR REPLACE FUNCTION update_cms_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cms_media_updated_at
  BEFORE UPDATE ON cms_media
  FOR EACH ROW
  EXECUTE FUNCTION update_cms_media_updated_at();

CREATE OR REPLACE FUNCTION update_cms_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cms_settings_updated_at
  BEFORE UPDATE ON cms_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_cms_settings_updated_at();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- CMS Pages RLS
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;

-- Master Admin: Full access
CREATE POLICY cms_pages_admin_all ON cms_pages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'master_admin'
    )
  );

-- Public: Read-only access to published pages
CREATE POLICY cms_pages_public_select ON cms_pages
  FOR SELECT
  TO authenticated, anon
  USING (status = 'published');

-- CMS Sections RLS
ALTER TABLE cms_sections ENABLE ROW LEVEL SECURITY;

-- Master Admin: Full access
CREATE POLICY cms_sections_admin_all ON cms_sections
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'master_admin'
    )
  );

-- Public: Read-only access to active sections of published pages
CREATE POLICY cms_sections_public_select ON cms_sections
  FOR SELECT
  TO authenticated, anon
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM cms_pages
      WHERE cms_pages.id = cms_sections.page_id
      AND cms_pages.status = 'published'
    )
  );

-- CMS Media RLS
ALTER TABLE cms_media ENABLE ROW LEVEL SECURITY;

-- Master Admin: Full access
CREATE POLICY cms_media_admin_all ON cms_media
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'master_admin'
    )
  );

-- Authenticated users: Can upload media
CREATE POLICY cms_media_authenticated_insert ON cms_media
  FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

-- Public: Read-only access
CREATE POLICY cms_media_public_select ON cms_media
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- CMS Settings RLS
ALTER TABLE cms_settings ENABLE ROW LEVEL SECURITY;

-- Master Admin: Full access
CREATE POLICY cms_settings_admin_all ON cms_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'master_admin'
    )
  );

-- Public: Read-only access
CREATE POLICY cms_settings_public_select ON cms_settings
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- =====================================================
-- DEFAULT SETTINGS
-- =====================================================
INSERT INTO cms_settings (key, value, category, description) VALUES
  ('site_name', '"Akademi Port"', 'general', 'Site adı'),
  ('site_description', '"E-İhracat Dönüşüm Platformu"', 'general', 'Site açıklaması'),
  ('site_logo_url', '""', 'general', 'Site logo URL'),
  ('contact_email', '""', 'contact', 'İletişim e-posta adresi'),
  ('contact_phone', '""', 'contact', 'İletişim telefonu'),
  ('contact_address', '""', 'contact', 'İletişim adresi'),
  ('social_facebook', '""', 'social', 'Facebook URL'),
  ('social_twitter', '""', 'social', 'Twitter URL'),
  ('social_linkedin', '""', 'social', 'LinkedIn URL'),
  ('social_instagram', '""', 'social', 'Instagram URL'),
  ('social_youtube', '""', 'social', 'YouTube URL'),
  ('google_analytics_id', '""', 'analytics', 'Google Analytics ID'),
  ('google_tag_manager_id', '""', 'analytics', 'Google Tag Manager ID')
ON CONFLICT (key) DO NOTHING;


