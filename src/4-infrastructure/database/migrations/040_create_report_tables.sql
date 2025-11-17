-- =====================================================
-- MIGRATION: 040_create_report_tables
-- Description: AI-powered progress reporting system
-- Created: 2025-11-17
-- Sprint: 16 - AI Raporlama Sistemi
-- =====================================================

-- =====================================================
-- REPORT TYPE ENUM
-- =====================================================
DO $$ BEGIN
  CREATE TYPE report_type AS ENUM (
    'interim',      -- Ara Rapor (alt proje tamamlandığında)
    'monthly',      -- Aylık Rapor (her ayın sonu)
    'program',      -- Program Raporu (program bitişinde)
    'company',      -- Firma Raporu (istek üzerine)
    'ministry'      -- Bakanlık Raporu (istek üzerine, tüm program)
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- REPORT STATUS ENUM
-- =====================================================
DO $$ BEGIN
  CREATE TYPE report_status AS ENUM (
    'pending',      -- Oluşturuluyor
    'generating',   -- AI analizi yapılıyor
    'completed',    -- Tamamlandı
    'failed'         -- Başarısız
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- REPORT TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Template bilgileri
  name VARCHAR(255) NOT NULL,
  description TEXT,
  report_type report_type NOT NULL,
  
  -- Template içeriği
  template_content JSONB NOT NULL DEFAULT '{}'::jsonb, -- PDF template yapısı
  sections JSONB DEFAULT '[]'::jsonb, -- Rapor bölümleri
  
  -- AI ayarları
  ai_enabled BOOLEAN DEFAULT true,
  ai_use_case VARCHAR(100) DEFAULT 'report_generation',
  
  -- Versiyonlama
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_report_templates_type ON report_templates(report_type);
CREATE INDEX IF NOT EXISTS idx_report_templates_active ON report_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_report_templates_created_at ON report_templates(created_at DESC);

-- Partial unique index: Bir tip için aktif tek template olabilir
CREATE UNIQUE INDEX IF NOT EXISTS idx_report_templates_unique_active_type 
ON report_templates(report_type) 
WHERE is_active = true;

-- Comments
COMMENT ON TABLE report_templates IS 'Rapor şablonları - PDF ve AI analizi için template yapıları';
COMMENT ON COLUMN report_templates.template_content IS 'PDF template yapısı (JSONB)';
COMMENT ON COLUMN report_templates.sections IS 'Rapor bölümleri listesi (JSONB array)';
COMMENT ON COLUMN report_templates.ai_use_case IS 'AI kullanım durumu (ai_prompts.use_case ile eşleşir)';

-- =====================================================
-- PROGRESS REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS progress_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- İlişkiler
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  sub_project_id UUID REFERENCES sub_projects(id) ON DELETE SET NULL,
  consultant_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Rapor bilgileri
  report_type report_type NOT NULL,
  status report_status DEFAULT 'pending',
  title VARCHAR(255) NOT NULL,
  
  -- Dönem bilgisi (aylık raporlar için)
  period_year INTEGER,
  period_month INTEGER CHECK (period_month IS NULL OR (period_month >= 1 AND period_month <= 12)),
  
  -- Template referansı
  template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
  
  -- Rapor içeriği
  content JSONB DEFAULT '{}'::jsonb, -- Rapor verileri (projeler, metrikler, vb.)
  
  -- AI Analizi
  ai_analysis JSONB DEFAULT '{}'::jsonb, -- AI analiz sonuçları
  -- ai_analysis yapısı:
  -- {
  --   "summary": "Genel durum özeti",
  --   "strengths": ["Güçlü yön 1", "Güçlü yön 2"],
  --   "weaknesses": ["Zayıf yön 1", "Zayıf yön 2"],
  --   "recommendations": ["Öneri 1", "Öneri 2"],
  --   "riskScore": 0-100,
  --   "successProbability": 0-100
  -- }
  
  -- PDF bilgileri
  pdf_url TEXT, -- Supabase Storage URL
  pdf_generated_at TIMESTAMP WITH TIME ZONE,
  
  -- Email bilgileri
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  email_recipients JSONB DEFAULT '[]'::jsonb, -- Email alıcıları listesi
  
  -- Hata bilgileri
  error_message TEXT,
  error_details JSONB,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  generated_by UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL ise otomatik
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validasyonlar
  CONSTRAINT valid_period CHECK (
    (report_type = 'monthly' AND period_year IS NOT NULL AND period_month IS NOT NULL) OR
    (report_type != 'monthly' AND period_year IS NULL AND period_month IS NULL)
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_progress_reports_company_id ON progress_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_program_id ON progress_reports(program_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_project_id ON progress_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_sub_project_id ON progress_reports(sub_project_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_type ON progress_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_progress_reports_status ON progress_reports(status);
CREATE INDEX IF NOT EXISTS idx_progress_reports_period ON progress_reports(period_year, period_month);
CREATE INDEX IF NOT EXISTS idx_progress_reports_created_at ON progress_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_reports_email_sent ON progress_reports(email_sent);

-- Comments
COMMENT ON TABLE progress_reports IS 'İlerleme raporları - AI destekli otomatik rapor üretimi';
COMMENT ON COLUMN progress_reports.content IS 'Rapor verileri (projeler, metrikler, istatistikler)';
COMMENT ON COLUMN progress_reports.ai_analysis IS 'AI analiz sonuçları (özet, güçlü/zayıf yönler, öneriler, risk skoru)';
COMMENT ON COLUMN progress_reports.pdf_url IS 'PDF dosyasının Supabase Storage URL''si';
COMMENT ON COLUMN progress_reports.email_recipients IS 'Email alıcıları listesi (JSONB array)';
COMMENT ON COLUMN progress_reports.generated_by IS 'NULL ise otomatik oluşturulmuş, aksi halde kullanıcı ID';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated_at trigger for report_templates
DROP TRIGGER IF EXISTS trigger_update_report_templates_updated_at ON report_templates;
CREATE TRIGGER trigger_update_report_templates_updated_at
  BEFORE UPDATE ON report_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Updated_at trigger for progress_reports
DROP TRIGGER IF EXISTS trigger_update_progress_reports_updated_at ON progress_reports;
CREATE TRIGGER trigger_update_progress_reports_updated_at
  BEFORE UPDATE ON progress_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_reports ENABLE ROW LEVEL SECURITY;

-- Report Templates Policies
DROP POLICY IF EXISTS "Master admins can manage report templates" ON report_templates;
CREATE POLICY "Master admins can manage report templates"
  ON report_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'master_admin'
    )
  );

DROP POLICY IF EXISTS "Consultants can view active report templates" ON report_templates;
CREATE POLICY "Consultants can view active report templates"
  ON report_templates
  FOR SELECT
  USING (
    is_active = true AND (
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('consultant', 'master_admin', 'program_manager')
      )
    )
  );

-- Progress Reports Policies
DROP POLICY IF EXISTS "Master admins can manage all reports" ON progress_reports;
CREATE POLICY "Master admins can manage all reports"
  ON progress_reports
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'master_admin'
    )
  );

DROP POLICY IF EXISTS "Consultants can view reports for their programs" ON progress_reports;
CREATE POLICY "Consultants can view reports for their programs"
  ON progress_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('consultant', 'program_manager')
      AND (
        progress_reports.consultant_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM user_programs up
          WHERE up.user_id = auth.uid()
          AND up.program_id = progress_reports.program_id
          AND up.role_in_program IN ('consultant', 'program_manager')
          AND up.is_active = true
        )
      )
    )
  );

DROP POLICY IF EXISTS "Companies can view their own reports" ON progress_reports;
CREATE POLICY "Companies can view their own reports"
  ON progress_reports
  FOR SELECT
  USING (
    progress_reports.company_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.company_id = progress_reports.company_id
      AND users.role IN ('company_user', 'company_admin')
    )
  );

DROP POLICY IF EXISTS "Consultants can create reports" ON progress_reports;
CREATE POLICY "Consultants can create reports"
  ON progress_reports
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('consultant', 'program_manager', 'master_admin')
      AND (
        progress_reports.consultant_id = auth.uid()
        OR progress_reports.program_id IS NULL
        OR EXISTS (
          SELECT 1 FROM user_programs up
          WHERE up.user_id = auth.uid()
          AND up.program_id = progress_reports.program_id
          AND up.role_in_program IN ('consultant', 'program_manager')
          AND up.is_active = true
        )
      )
    )
  );

DROP POLICY IF EXISTS "Consultants can update their reports" ON progress_reports;
CREATE POLICY "Consultants can update their reports"
  ON progress_reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('consultant', 'program_manager', 'master_admin')
      AND (
        progress_reports.consultant_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM user_programs up
          WHERE up.user_id = auth.uid()
          AND up.program_id = progress_reports.program_id
          AND up.role_in_program IN ('consultant', 'program_manager')
          AND up.is_active = true
        )
      )
    )
  );

-- =====================================================
-- DEFAULT TEMPLATES
-- =====================================================

-- Interim Report Template
INSERT INTO report_templates (name, description, report_type, template_content, sections, ai_enabled, is_active, created_at)
VALUES (
  'Ara Rapor Şablonu',
  'Alt proje tamamlandığında otomatik oluşturulan ara rapor şablonu',
  'interim',
  '{"title": "Ara Rapor", "sections": ["summary", "progress", "achievements", "challenges", "nextSteps"]}'::jsonb,
  '["summary", "progress", "achievements", "challenges", "nextSteps"]'::jsonb,
  true,
  true,
  NOW()
) ON CONFLICT DO NOTHING;

-- Monthly Report Template
INSERT INTO report_templates (name, description, report_type, template_content, sections, ai_enabled, is_active, created_at)
VALUES (
  'Aylık Rapor Şablonu',
  'Her ayın sonunda otomatik oluşturulan aylık rapor şablonu',
  'monthly',
  '{"title": "Aylık İlerleme Raporu", "sections": ["summary", "metrics", "projects", "trainings", "ecommerce", "aiAnalysis"]}'::jsonb,
  '["summary", "metrics", "projects", "trainings", "ecommerce", "aiAnalysis"]'::jsonb,
  true,
  true,
  NOW()
) ON CONFLICT DO NOTHING;

-- Program Report Template
INSERT INTO report_templates (name, description, report_type, template_content, sections, ai_enabled, is_active, created_at)
VALUES (
  'Program Raporu Şablonu',
  'Program bitişinde oluşturulan kapsamlı program raporu şablonu',
  'program',
  '{"title": "Program Sonu Raporu", "sections": ["executiveSummary", "overview", "achievements", "metrics", "projects", "trainings", "ecommerce", "aiAnalysis", "recommendations"]}'::jsonb,
  '["executiveSummary", "overview", "achievements", "metrics", "projects", "trainings", "ecommerce", "aiAnalysis", "recommendations"]'::jsonb,
  true,
  true,
  NOW()
) ON CONFLICT DO NOTHING;

-- Company Report Template
INSERT INTO report_templates (name, description, report_type, template_content, sections, ai_enabled, is_active, created_at)
VALUES (
  'Firma Raporu Şablonu',
  'Firma için istek üzerine oluşturulan özel rapor şablonu',
  'company',
  '{"title": "Firma İlerleme Raporu", "sections": ["summary", "companyOverview", "projects", "trainings", "metrics", "aiAnalysis"]}'::jsonb,
  '["summary", "companyOverview", "projects", "trainings", "metrics", "aiAnalysis"]'::jsonb,
  true,
  true,
  NOW()
) ON CONFLICT DO NOTHING;

-- Ministry Report Template
INSERT INTO report_templates (name, description, report_type, template_content, sections, ai_enabled, is_active, created_at)
VALUES (
  'Bakanlık Raporu Şablonu',
  'Tüm programlar için bakanlık raporu şablonu',
  'ministry',
  '{"title": "Bakanlık Raporu", "sections": ["executiveSummary", "programOverview", "allCompanies", "aggregatedMetrics", "ecommerceMetrics", "aiAnalysis", "recommendations"]}'::jsonb,
  '["executiveSummary", "programOverview", "allCompanies", "aggregatedMetrics", "ecommerceMetrics", "aiAnalysis", "recommendations"]'::jsonb,
  true,
  true,
  NOW()
) ON CONFLICT DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE report_templates IS 'Rapor şablonları - PDF ve AI analizi için template yapıları';
COMMENT ON TABLE progress_reports IS 'İlerleme raporları - AI destekli otomatik rapor üretimi';

