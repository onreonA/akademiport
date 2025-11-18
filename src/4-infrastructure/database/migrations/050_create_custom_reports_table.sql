-- =====================================================
-- MIGRATION: 050_create_custom_reports_table
-- Description: Custom Reports - Kullanıcıların özel raporlar oluşturması için
-- Created: 2025-01-XX
-- Sprint: 27 - Dashboard & Analytics
-- =====================================================

-- =====================================================
-- CUSTOM REPORT STATUS ENUM
-- =====================================================
DO $$ BEGIN
  CREATE TYPE custom_report_status AS ENUM (
    'draft',      -- Taslak
    'saved',      -- Kaydedilmiş
    'scheduled',  -- Zamanlanmış
    'archived'    -- Arşivlenmiş
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- CUSTOM REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS custom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Rapor bilgileri
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Sahiplik
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  
  -- Rapor yapılandırması
  report_type VARCHAR(50) NOT NULL, -- 'dashboard', 'company', 'program', 'custom'
  template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
  
  -- Seçilen metrikler (JSONB array)
  selected_metrics JSONB DEFAULT '[]'::jsonb,
  -- Örnek: ["user_growth", "program_activity", "company_distribution", "task_completion"]
  
  -- Tarih aralığı
  date_range_start DATE,
  date_range_end DATE,
  date_range_type VARCHAR(50), -- 'custom', 'last_7_days', 'last_30_days', 'last_90_days', 'last_year', 'all_time'
  
  -- Filtreler (JSONB object)
  filters JSONB DEFAULT '{}'::jsonb,
  -- Örnek: {"programId": "uuid", "companyId": "uuid", "status": "active"}
  
  -- Zamanlama (opsiyonel)
  is_scheduled BOOLEAN DEFAULT false,
  schedule_cron VARCHAR(100), -- Cron expression
  schedule_timezone VARCHAR(50) DEFAULT 'Europe/Istanbul',
  last_generated_at TIMESTAMP WITH TIME ZONE,
  next_generation_at TIMESTAMP WITH TIME ZONE,
  
  -- Durum
  status custom_report_status DEFAULT 'draft',
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_custom_reports_user_id ON custom_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_reports_program_id ON custom_reports(program_id);
CREATE INDEX IF NOT EXISTS idx_custom_reports_company_id ON custom_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_custom_reports_status ON custom_reports(status);
CREATE INDEX IF NOT EXISTS idx_custom_reports_is_scheduled ON custom_reports(is_scheduled);
CREATE INDEX IF NOT EXISTS idx_custom_reports_next_generation ON custom_reports(next_generation_at) WHERE is_scheduled = true;
CREATE INDEX IF NOT EXISTS idx_custom_reports_created_at ON custom_reports(created_at DESC);

-- RLS Policies
ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports
DROP POLICY IF EXISTS "Users can view their own reports" ON custom_reports;
CREATE POLICY "Users can view their own reports"
  ON custom_reports
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own reports
DROP POLICY IF EXISTS "Users can create their own reports" ON custom_reports;
CREATE POLICY "Users can create their own reports"
  ON custom_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reports
DROP POLICY IF EXISTS "Users can update their own reports" ON custom_reports;
CREATE POLICY "Users can update their own reports"
  ON custom_reports
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reports
DROP POLICY IF EXISTS "Users can delete their own reports" ON custom_reports;
CREATE POLICY "Users can delete their own reports"
  ON custom_reports
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all reports
DROP POLICY IF EXISTS "Admins can view all reports" ON custom_reports;
CREATE POLICY "Admins can view all reports"
  ON custom_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('master_admin', 'program_manager')
    )
  );

-- Consultants can view reports for their programs/companies
DROP POLICY IF EXISTS "Consultants can view related reports" ON custom_reports;
CREATE POLICY "Consultants can view related reports"
  ON custom_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'consultant'
      AND (
        custom_reports.program_id IN (
          SELECT program_id FROM user_programs
          WHERE user_id = auth.uid()
          AND is_active = true
        )
        OR custom_reports.company_id IN (
          SELECT company_id FROM consultant_companies
          WHERE consultant_id = auth.uid()
          AND is_active = true
        )
      )
    )
  );

-- Comments
COMMENT ON TABLE custom_reports IS 'Kullanıcıların oluşturduğu özel raporlar';
COMMENT ON COLUMN custom_reports.selected_metrics IS 'Seçilen metrikler listesi (JSONB array)';
COMMENT ON COLUMN custom_reports.filters IS 'Rapor filtreleri (JSONB object)';
COMMENT ON COLUMN custom_reports.schedule_cron IS 'Zamanlanmış raporlar için cron expression';
COMMENT ON COLUMN custom_reports.date_range_type IS 'Tarih aralığı tipi: custom, last_7_days, last_30_days, last_90_days, last_year, all_time';

