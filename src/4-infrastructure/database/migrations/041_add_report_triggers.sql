-- =====================================================
-- MIGRATION: 041_add_report_triggers
-- Description: Triggers for automatic report generation
-- Created: 2025-11-17
-- Sprint: 16 - AI Raporlama Sistemi
-- =====================================================

-- =====================================================
-- REPORT GENERATION QUEUE TABLE
-- =====================================================
-- Bu tablo otomatik rapor oluşturma isteklerini tutar
-- Trigger'lar bu tabloya kayıt ekler, cron job bunları işler

CREATE TABLE IF NOT EXISTS report_generation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Rapor bilgileri
  report_type report_type NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  sub_project_id UUID REFERENCES sub_projects(id) ON DELETE SET NULL,
  consultant_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Dönem bilgisi (aylık raporlar için)
  period_year INTEGER,
  period_month INTEGER CHECK (period_month IS NULL OR (period_month >= 1 AND period_month <= 12)),
  
  -- Durum
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Hata bilgileri
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_report_generation_queue_status ON report_generation_queue(status);
CREATE INDEX IF NOT EXISTS idx_report_generation_queue_created_at ON report_generation_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_report_generation_queue_sub_project_id ON report_generation_queue(sub_project_id);

-- RLS Policies
ALTER TABLE report_generation_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Master admins can manage report queue" ON report_generation_queue;
CREATE POLICY "Master admins can manage report queue"
  ON report_generation_queue
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'master_admin'
    )
  );

DROP POLICY IF EXISTS "System can insert into report queue" ON report_generation_queue;
CREATE POLICY "System can insert into report queue"
  ON report_generation_queue
  FOR INSERT
  WITH CHECK (true); -- System can insert

-- =====================================================
-- TRIGGER FUNCTION: Alt Proje Tamamlandığında Ara Rapor
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_generate_interim_report()
RETURNS TRIGGER AS $$
DECLARE
  project_record RECORD;
  company_record RECORD;
BEGIN
  -- Sadece status 'done' olduğunda ve progress 100 olduğunda tetikle
  IF NEW.status = 'done' AND NEW.progress = 100 AND (OLD.status != 'done' OR OLD.progress != 100) THEN
    -- Proje bilgilerini al
    SELECT * INTO project_record
    FROM projects
    WHERE id = NEW.project_id;
    
    -- Firma bilgilerini al
    IF project_record.company_id IS NOT NULL THEN
      SELECT * INTO company_record
      FROM companies
      WHERE id = project_record.company_id;
      
      -- Rapor oluşturma kuyruğuna ekle
      INSERT INTO report_generation_queue (
        report_type,
        company_id,
        program_id,
        project_id,
        sub_project_id,
        consultant_id,
        status,
        metadata
      ) VALUES (
        'interim',
        project_record.company_id,
        company_record.program_id,
        NEW.project_id,
        NEW.id,
        project_record.consultant_id,
        'pending',
        jsonb_build_object(
          'triggered_by', 'sub_project_completion',
          'sub_project_name', NEW.name,
          'project_name', project_record.name
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı oluştur
DROP TRIGGER IF EXISTS trigger_sub_project_completed_report ON sub_projects;
CREATE TRIGGER trigger_sub_project_completed_report
  AFTER UPDATE OF status, progress ON sub_projects
  FOR EACH ROW
  WHEN (NEW.status = 'done' AND NEW.progress = 100 AND (OLD.status != 'done' OR OLD.progress != 100))
  EXECUTE FUNCTION trigger_generate_interim_report();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE report_generation_queue IS 'Otomatik rapor oluşturma kuyruğu - Triggerlar bu tabloya kayıt ekler, cron job işler';
COMMENT ON FUNCTION trigger_generate_interim_report() IS 'Alt proje tamamlandığında ara rapor oluşturma kuyruğuna ekler';

