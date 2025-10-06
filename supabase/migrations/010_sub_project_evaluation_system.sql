-- Migration: 010_sub_project_evaluation_system.sql
-- Description: Alt proje değerlendirme raporları sistemi
-- Date: 2024-01-03

-- Alt proje tamamlama takibi tablosu
CREATE TABLE IF NOT EXISTS sub_project_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_project_id UUID REFERENCES sub_projects(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_by UUID REFERENCES company_users(id),
    total_tasks INTEGER NOT NULL DEFAULT 0,
    completed_tasks INTEGER NOT NULL DEFAULT 0,
    completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    status VARCHAR(50) DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'under_evaluation', 'evaluated', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sub_project_id, company_id)
);

-- Alt proje değerlendirme raporları tablosu
CREATE TABLE IF NOT EXISTS sub_project_evaluation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_project_completion_id UUID REFERENCES sub_project_completions(id) ON DELETE CASCADE,
    consultant_id UUID REFERENCES users(id),
    report_type VARCHAR(100) DEFAULT 'alt_proje_degerlendirme',
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    evaluation_score INTEGER CHECK (evaluation_score >= 1 AND evaluation_score <= 10),
    strengths TEXT[],
    weaknesses TEXT[],
    recommendations TEXT[],
    next_steps TEXT[],
    report_status VARCHAR(50) DEFAULT 'draft' CHECK (report_status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rapor türlerini genişlet
DO $$ 
BEGIN
    -- report_type enum'una yeni değer ekle (eğer yoksa)
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'alt_proje_degerlendirme' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'report_type')) THEN
        ALTER TYPE report_type ADD VALUE 'alt_proje_degerlendirme';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Enum değeri zaten varsa devam et
        NULL;
END $$;

-- Index'ler oluştur
CREATE INDEX IF NOT EXISTS idx_sub_project_completions_sub_project_id ON sub_project_completions(sub_project_id);
CREATE INDEX IF NOT EXISTS idx_sub_project_completions_company_id ON sub_project_completions(company_id);
CREATE INDEX IF NOT EXISTS idx_sub_project_completions_status ON sub_project_completions(status);
CREATE INDEX IF NOT EXISTS idx_sub_project_completions_completed_at ON sub_project_completions(completed_at);

CREATE INDEX IF NOT EXISTS idx_sub_project_evaluation_reports_completion_id ON sub_project_evaluation_reports(sub_project_completion_id);
CREATE INDEX IF NOT EXISTS idx_sub_project_evaluation_reports_consultant_id ON sub_project_evaluation_reports(consultant_id);
CREATE INDEX IF NOT EXISTS idx_sub_project_evaluation_reports_status ON sub_project_evaluation_reports(report_status);
CREATE INDEX IF NOT EXISTS idx_sub_project_evaluation_reports_created_at ON sub_project_evaluation_reports(created_at);

-- RLS politikalarını etkinleştir
ALTER TABLE sub_project_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_project_evaluation_reports ENABLE ROW LEVEL SECURITY;

-- Admin kullanıcıları tüm kayıtları görebilir
CREATE POLICY "Admins can view all sub_project_completions" ON sub_project_completions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'master_admin', 'consultant')
        )
    );

CREATE POLICY "Admins can insert sub_project_completions" ON sub_project_completions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'master_admin', 'consultant')
        )
    );

CREATE POLICY "Admins can update sub_project_completions" ON sub_project_completions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'master_admin', 'consultant')
        )
    );

-- Firma kullanıcıları kendi tamamlamalarını görebilir
CREATE POLICY "Company users can view own completions" ON sub_project_completions
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM company_users 
            WHERE company_users.id = auth.uid()
        )
    );

-- Alt proje değerlendirme raporları için politikalar
CREATE POLICY "Admins can view all evaluation reports" ON sub_project_evaluation_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'master_admin', 'consultant')
        )
    );

CREATE POLICY "Admins can insert evaluation reports" ON sub_project_evaluation_reports
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'master_admin', 'consultant')
        )
    );

CREATE POLICY "Admins can update evaluation reports" ON sub_project_evaluation_reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'master_admin', 'consultant')
        )
    );

-- Firma kullanıcıları kendi şirketlerinin raporlarını görebilir
CREATE POLICY "Company users can view own evaluation reports" ON sub_project_evaluation_reports
    FOR SELECT USING (
        sub_project_completion_id IN (
            SELECT id FROM sub_project_completions 
            WHERE company_id IN (
                SELECT company_id FROM company_users 
                WHERE company_users.id = auth.uid()
            )
        )
    );

-- Updated_at trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Updated_at trigger'ları
CREATE TRIGGER update_sub_project_completions_updated_at 
    BEFORE UPDATE ON sub_project_completions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sub_project_evaluation_reports_updated_at 
    BEFORE UPDATE ON sub_project_evaluation_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Alt proje tamamlama tespit fonksiyonu
CREATE OR REPLACE FUNCTION check_sub_project_completion()
RETURNS TRIGGER AS $$
DECLARE
    v_sub_project_id UUID;
    v_total_tasks INTEGER;
    v_completed_tasks INTEGER;
    v_completion_percentage INTEGER;
BEGIN
    -- Sadece görev tamamlama durumunda çalış
    IF NEW.status = 'Tamamlandı' AND (OLD.status IS NULL OR OLD.status != 'Tamamlandı') THEN
        -- Görevin alt proje ID'sini al
        SELECT sub_project_id INTO v_sub_project_id 
        FROM tasks 
        WHERE id = NEW.task_id;
        
        IF v_sub_project_id IS NOT NULL THEN
            -- Alt proje için tamamlanan görev sayısını hesapla
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN cts.status = 'Tamamlandı' THEN 1 END) as completed
            INTO v_total_tasks, v_completed_tasks
            FROM tasks t
            LEFT JOIN company_task_statuses cts ON t.id = cts.task_id AND cts.company_id = NEW.company_id
            WHERE t.sub_project_id = v_sub_project_id;
            
            -- Tamamlanma yüzdesini hesapla
            IF v_total_tasks > 0 THEN
                v_completion_percentage := (v_completed_tasks * 100 / v_total_tasks);
            ELSE
                v_completion_percentage := 0;
            END IF;
            
            -- Eğer tüm görevler tamamlandıysa kayıt oluştur/güncelle
            IF v_completed_tasks = v_total_tasks AND v_total_tasks > 0 THEN
                INSERT INTO sub_project_completions (
                    sub_project_id, 
                    company_id, 
                    completed_by,
                    total_tasks, 
                    completed_tasks, 
                    completion_percentage,
                    status
                )
                VALUES (
                    v_sub_project_id,
                    NEW.company_id,
                    NEW.completed_by,
                    v_total_tasks,
                    v_completed_tasks,
                    v_completion_percentage,
                    'pending_review'
                )
                ON CONFLICT (sub_project_id, company_id) 
                DO UPDATE SET
                    completed_at = NOW(),
                    completed_tasks = EXCLUDED.completed_tasks,
                    completion_percentage = EXCLUDED.completion_percentage,
                    status = 'pending_review',
                    updated_at = NOW();
                    
                -- Bildirim gönder (gelecekte implement edilecek)
                -- PERFORM send_sub_project_completion_notification(v_sub_project_id, NEW.company_id);
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger oluştur
DROP TRIGGER IF EXISTS trigger_sub_project_completion ON company_task_statuses;
CREATE TRIGGER trigger_sub_project_completion
    AFTER INSERT OR UPDATE ON company_task_statuses
    FOR EACH ROW
    EXECUTE FUNCTION check_sub_project_completion();

-- Fonksiyonları güncelleme
COMMENT ON FUNCTION check_sub_project_completion() IS 'Alt proje tamamlama durumunu otomatik olarak tespit eder ve kayıt oluşturur';
COMMENT ON TABLE sub_project_completions IS 'Alt proje tamamlama takip tablosu - firma bazlı alt proje tamamlanma durumlarını takip eder';
COMMENT ON TABLE sub_project_evaluation_reports IS 'Alt proje değerlendirme raporları - danışmanların alt proje tamamlamaları için yazdığı raporlar';
