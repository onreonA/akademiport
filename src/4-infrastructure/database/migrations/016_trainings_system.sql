-- ============================================================================
-- TRAININGS SYSTEM MIGRATION
-- ============================================================================
-- Bu migration eğitim yönetim sistemi için gerekli tabloları oluşturur.
-- ============================================================================

-- 1. TRAININGS TABLOSU
-- ============================================================================

CREATE TABLE IF NOT EXISTS trainings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Program & Consultant (nullable for global trainings)
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  consultant_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Type
  is_global BOOLEAN DEFAULT false NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
  
  -- Priority
  priority VARCHAR(20) DEFAULT 'medium' NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Settings
  is_locked BOOLEAN DEFAULT false NOT NULL, -- Eğitimin kilitli olup olmadığı (sıralı erişim için)
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT trainings_global_or_program CHECK (
    (is_global = true AND program_id IS NULL) OR 
    (is_global = false AND program_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_trainings_program_id ON trainings(program_id);
CREATE INDEX idx_trainings_consultant_id ON trainings(consultant_id);
CREATE INDEX idx_trainings_is_global ON trainings(is_global);
CREATE INDEX idx_trainings_status ON trainings(status);
CREATE INDEX idx_trainings_created_at ON trainings(created_at);

-- Comments
COMMENT ON TABLE trainings IS 'Eğitim ana tablosu. Global veya program bazlı eğitimleri tutar.';
COMMENT ON COLUMN trainings.is_global IS 'Global eğitim ise true, program bazlı ise false';
COMMENT ON COLUMN trainings.is_locked IS 'Eğitimin kilitli olup olmadığı (sıralı erişim kontrolü için)';

-- ============================================================================
-- 2. TRAINING_VIDEOS TABLOSU
-- ============================================================================

CREATE TABLE IF NOT EXISTS training_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Training
  training_id UUID NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- YouTube
  youtube_url TEXT NOT NULL,
  youtube_id VARCHAR(50), -- YouTube video ID (extracted from URL)
  
  -- Order
  order_index INTEGER DEFAULT 0 NOT NULL,
  
  -- Lock
  is_locked BOOLEAN DEFAULT false NOT NULL, -- Önceki video tamamlanmadan bu video açılmaz
  
  -- Duration (optional, can be fetched from YouTube API)
  duration_seconds INTEGER,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT training_videos_order_unique UNIQUE(training_id, order_index),
  CONSTRAINT valid_youtube_url CHECK (youtube_url ~* '^https?://(www\.)?(youtube\.com|youtu\.be)')
);

-- Indexes
CREATE INDEX idx_training_videos_training_id ON training_videos(training_id);
CREATE INDEX idx_training_videos_order_index ON training_videos(training_id, order_index);

-- Comments
COMMENT ON TABLE training_videos IS 'Eğitim videoları tablosu. YouTube video linklerini tutar.';
COMMENT ON COLUMN training_videos.order_index IS 'Videoların sırası (sıralı erişim için)';
COMMENT ON COLUMN training_videos.is_locked IS 'Video kilitli mi (önceki video tamamlanmadan açılmaz)';

-- ============================================================================
-- 3. TRAINING_DOCUMENTS TABLOSU
-- ============================================================================

CREATE TABLE IF NOT EXISTS training_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Training
  training_id UUID NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- File Info
  file_url TEXT NOT NULL, -- Supabase Storage URL
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT, -- Size in bytes
  file_type VARCHAR(50), -- MIME type (application/pdf, etc.)
  
  -- Order
  order_index INTEGER DEFAULT 0 NOT NULL,
  
  -- Lock
  is_locked BOOLEAN DEFAULT false NOT NULL, -- Önceki döküman okunmadan bu döküman açılmaz
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT training_documents_order_unique UNIQUE(training_id, order_index),
  CONSTRAINT valid_file_size CHECK (file_size IS NULL OR file_size > 0)
);

-- Indexes
CREATE INDEX idx_training_documents_training_id ON training_documents(training_id);
CREATE INDEX idx_training_documents_order_index ON training_documents(training_id, order_index);

-- Comments
COMMENT ON TABLE training_documents IS 'Eğitim dökümanları tablosu. Supabase Storage''da saklanan dosyaları tutar.';
COMMENT ON COLUMN training_documents.order_index IS 'Dökümanların sırası (sıralı erişim için)';
COMMENT ON COLUMN training_documents.is_locked IS 'Döküman kilitli mi (önceki döküman okunmadan açılmaz)';

-- ============================================================================
-- 4. COMPANY_TRAININGS TABLOSU (Atama)
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_trainings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Company & Training
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  training_id UUID NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  
  -- Assignment
  assigned_by UUID NOT NULL REFERENCES users(id), -- Consultant who assigned
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'assigned' NOT NULL CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  UNIQUE(company_id, training_id) -- Bir firmaya aynı eğitim sadece bir kez atanabilir
);

-- Indexes
CREATE INDEX idx_company_trainings_company_id ON company_trainings(company_id);
CREATE INDEX idx_company_trainings_training_id ON company_trainings(training_id);
CREATE INDEX idx_company_trainings_status ON company_trainings(status);
CREATE INDEX idx_company_trainings_assigned_by ON company_trainings(assigned_by);

-- Comments
COMMENT ON TABLE company_trainings IS 'Firma-Eğitim atama tablosu. Firmalara atanan eğitimleri tutar.';
COMMENT ON COLUMN company_trainings.status IS 'Eğitimin durumu: assigned (atanmış), in_progress (devam ediyor), completed (tamamlandı), cancelled (iptal edildi)';

-- ============================================================================
-- 5. TRAINING_PROGRESS TABLOSU (İzleme Takibi)
-- ============================================================================

CREATE TABLE IF NOT EXISTS training_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Company & Training
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  training_id UUID NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  
  -- Content (nullable - genel eğitim ilerlemesi için null olabilir)
  video_id UUID REFERENCES training_videos(id) ON DELETE CASCADE,
  document_id UUID REFERENCES training_documents(id) ON DELETE CASCADE,
  
  -- Progress
  progress_percentage INTEGER DEFAULT 0 NOT NULL CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Timestamps
  watched_at TIMESTAMP WITH TIME ZONE, -- Video için izleme zamanı
  read_at TIMESTAMP WITH TIME ZONE, -- Document için okuma zamanı
  completed_at TIMESTAMP WITH TIME ZONE, -- Tamamlanma zamanı
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT training_progress_content_check CHECK (
    (video_id IS NOT NULL AND document_id IS NULL) OR 
    (video_id IS NULL AND document_id IS NOT NULL) OR
    (video_id IS NULL AND document_id IS NULL) -- Genel eğitim ilerlemesi
  )
);

-- Indexes
CREATE INDEX idx_training_progress_company_id ON training_progress(company_id);
CREATE INDEX idx_training_progress_training_id ON training_progress(training_id);
CREATE INDEX idx_training_progress_video_id ON training_progress(video_id);
CREATE INDEX idx_training_progress_document_id ON training_progress(document_id);
CREATE INDEX idx_training_progress_company_training ON training_progress(company_id, training_id);

-- Comments
COMMENT ON TABLE training_progress IS 'Eğitim izleme takibi tablosu. Firmaların eğitimlere ait ilerlemelerini tutar.';
COMMENT ON COLUMN training_progress.progress_percentage IS 'İlerleme yüzdesi (0-100)';
COMMENT ON COLUMN training_progress.video_id IS 'Video izleme takibi için video ID (nullable)';
COMMENT ON COLUMN training_progress.document_id IS 'Döküman okuma takibi için document ID (nullable)';

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_trainings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trainings_updated_at
  BEFORE UPDATE ON trainings
  FOR EACH ROW
  EXECUTE FUNCTION update_trainings_updated_at();

CREATE TRIGGER update_training_videos_updated_at
  BEFORE UPDATE ON training_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_trainings_updated_at();

CREATE TRIGGER update_training_documents_updated_at
  BEFORE UPDATE ON training_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_trainings_updated_at();

CREATE TRIGGER update_company_trainings_updated_at
  BEFORE UPDATE ON company_trainings
  FOR EACH ROW
  EXECUTE FUNCTION update_trainings_updated_at();

CREATE TRIGGER update_training_progress_updated_at
  BEFORE UPDATE ON training_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_trainings_updated_at();

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_progress ENABLE ROW LEVEL SECURITY;

-- Helper Functions
CREATE OR REPLACE FUNCTION is_training_consultant(training_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM trainings 
    WHERE id = training_uuid 
      AND consultant_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_company_member_of_training(company_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE company_id = company_uuid 
      AND id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- TRAININGS POLICIES
-- Master Admin: Full access
CREATE POLICY "Master admin can do everything on trainings"
  ON trainings
  FOR ALL
  USING (is_master_admin());

-- Consultant: Can view/manage own trainings
CREATE POLICY "Consultant can view own trainings"
  ON trainings
  FOR SELECT
  USING (
    is_global = true OR 
    consultant_id = auth.uid() OR
    is_program_manager(program_id) OR
    is_consultant_in_program(program_id)
  );

CREATE POLICY "Consultant can create trainings"
  ON trainings
  FOR INSERT
  WITH CHECK (
    is_master_admin() OR
    consultant_id = auth.uid() OR
    is_program_manager(program_id)
  );

CREATE POLICY "Consultant can update own trainings"
  ON trainings
  FOR UPDATE
  USING (
    is_master_admin() OR
    consultant_id = auth.uid() OR
    is_program_manager(program_id)
  );

CREATE POLICY "Consultant can delete own trainings"
  ON trainings
  FOR DELETE
  USING (
    is_master_admin() OR
    consultant_id = auth.uid() OR
    is_program_manager(program_id)
  );

-- Company: Can view assigned trainings
CREATE POLICY "Company can view assigned trainings"
  ON trainings
  FOR SELECT
  USING (
    is_global = true OR
    EXISTS (
      SELECT 1 FROM company_trainings ct
      INNER JOIN users u ON u.company_id = ct.company_id
      WHERE ct.training_id = trainings.id
        AND u.id = auth.uid()
    )
  );

-- TRAINING_VIDEOS POLICIES
-- Master Admin: Full access
CREATE POLICY "Master admin can do everything on training_videos"
  ON training_videos
  FOR ALL
  USING (is_master_admin());

-- Consultant: Can manage videos of own trainings
CREATE POLICY "Consultant can manage videos of own trainings"
  ON training_videos
  FOR ALL
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM trainings t
      WHERE t.id = training_videos.training_id
        AND (t.consultant_id = auth.uid() OR is_program_manager(t.program_id))
    )
  );

-- Company: Can view videos of assigned trainings
CREATE POLICY "Company can view videos of assigned trainings"
  ON training_videos
  FOR SELECT
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM trainings t
      INNER JOIN company_trainings ct ON ct.training_id = t.id
      INNER JOIN users u ON u.company_id = ct.company_id
      WHERE t.id = training_videos.training_id
        AND u.id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM trainings t
      WHERE t.id = training_videos.training_id
        AND t.is_global = true
    )
  );

-- TRAINING_DOCUMENTS POLICIES
-- Master Admin: Full access
CREATE POLICY "Master admin can do everything on training_documents"
  ON training_documents
  FOR ALL
  USING (is_master_admin());

-- Consultant: Can manage documents of own trainings
CREATE POLICY "Consultant can manage documents of own trainings"
  ON training_documents
  FOR ALL
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM trainings t
      WHERE t.id = training_documents.training_id
        AND (t.consultant_id = auth.uid() OR is_program_manager(t.program_id))
    )
  );

-- Company: Can view documents of assigned trainings
CREATE POLICY "Company can view documents of assigned trainings"
  ON training_documents
  FOR SELECT
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM trainings t
      INNER JOIN company_trainings ct ON ct.training_id = t.id
      INNER JOIN users u ON u.company_id = ct.company_id
      WHERE t.id = training_documents.training_id
        AND u.id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM trainings t
      WHERE t.id = training_documents.training_id
        AND t.is_global = true
    )
  );

-- COMPANY_TRAININGS POLICIES
-- Master Admin: Full access
CREATE POLICY "Master admin can do everything on company_trainings"
  ON company_trainings
  FOR ALL
  USING (is_master_admin());

-- Consultant: Can view/manage assignments
CREATE POLICY "Consultant can view/manage company_trainings"
  ON company_trainings
  FOR ALL
  USING (
    is_master_admin() OR
    assigned_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM trainings t
      WHERE t.id = company_trainings.training_id
        AND (t.consultant_id = auth.uid() OR is_program_manager(t.program_id))
    )
  );

-- Company: Can view own assignments
CREATE POLICY "Company can view own assignments"
  ON company_trainings
  FOR SELECT
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.company_id = company_trainings.company_id
        AND u.id = auth.uid()
    )
  );

-- TRAINING_PROGRESS POLICIES
-- Master Admin: Full access
CREATE POLICY "Master admin can do everything on training_progress"
  ON training_progress
  FOR ALL
  USING (is_master_admin());

-- Consultant: Can view progress of assigned trainings
CREATE POLICY "Consultant can view training_progress"
  ON training_progress
  FOR SELECT
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM trainings t
      WHERE t.id = training_progress.training_id
        AND (t.consultant_id = auth.uid() OR is_program_manager(t.program_id))
    )
  );

-- Company: Can view/update own progress
CREATE POLICY "Company can manage own training_progress"
  ON training_progress
  FOR ALL
  USING (
    is_master_admin() OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.company_id = training_progress.company_id
        AND u.id = auth.uid()
    )
  );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

