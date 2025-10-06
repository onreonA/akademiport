-- Migration: 052_create_project_management_tables.sql
-- Description: Proje yönetimi modülü için gerekli tablolar ve güncellemeler
-- Date: 2024

-- Proje türü enum'u ekle
CREATE TYPE project_type AS ENUM ('B2B', 'B2C');

-- Mevcut projects tablosuna type kolonu ekle
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS type project_type DEFAULT 'B2B';

-- Önce mevcut enum'ları güncelle (Türkçe değerler için)
-- Projects tablosundaki status enum'unu güncelle
ALTER TABLE projects ALTER COLUMN status TYPE text USING status::text;
DROP TYPE IF EXISTS project_status CASCADE;
CREATE TYPE project_status AS ENUM ('Planlandı', 'Aktif', 'Tamamlandı', 'Duraklatıldı');
ALTER TABLE projects ALTER COLUMN status TYPE project_status USING 
    CASE 
        WHEN status = 'planning' THEN 'Planlandı'
        WHEN status = 'active' THEN 'Aktif'
        WHEN status = 'completed' THEN 'Tamamlandı'
        WHEN status = 'paused' THEN 'Duraklatıldı'
        ELSE 'Planlandı'
    END::project_status;

-- Tasks tablosundaki status enum'unu güncelle
ALTER TABLE tasks ALTER COLUMN status TYPE text USING status::text;
DROP TYPE IF EXISTS task_status CASCADE;
CREATE TYPE task_status AS ENUM ('Bekliyor', 'İncelemede', 'Tamamlandı', 'İptal Edildi');
ALTER TABLE tasks ALTER COLUMN status TYPE task_status USING 
    CASE 
        WHEN status = 'pending' THEN 'Bekliyor'
        WHEN status = 'in_progress' THEN 'İncelemede'
        WHEN status = 'completed' THEN 'Tamamlandı'
        WHEN status = 'cancelled' THEN 'İptal Edildi'
        ELSE 'Bekliyor'
    END::task_status;

-- Tasks tablosundaki priority enum'unu güncelle
ALTER TABLE tasks ALTER COLUMN priority TYPE text USING priority::text;
DROP TYPE IF EXISTS task_priority CASCADE;
CREATE TYPE task_priority AS ENUM ('Düşük', 'Orta', 'Yüksek');
ALTER TABLE tasks ALTER COLUMN priority TYPE task_priority USING 
    CASE 
        WHEN priority = 'low' THEN 'Düşük'
        WHEN priority = 'medium' THEN 'Orta'
        WHEN priority = 'high' THEN 'Yüksek'
        ELSE 'Orta'
    END::task_priority;

-- Alt projeler tablosu oluştur
CREATE TABLE IF NOT EXISTS sub_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    task_count INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    is_auto_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sub_projects tablosuna status kolonu ekle (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sub_projects' AND column_name = 'status') THEN
        ALTER TABLE sub_projects ADD COLUMN status project_status DEFAULT 'Planlandı';
    END IF;
END $$;

-- Firma-proje ilişki tablosu oluştur
CREATE TABLE IF NOT EXISTS company_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status project_status DEFAULT 'Planlandı',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, project_id)
);

-- Tasks tablosunu güncelle (sub_project_id ekle)
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS sub_project_id UUID REFERENCES sub_projects(id) ON DELETE CASCADE;

-- Tasks tablosuna notes ve attachments kolonları ekle
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS attachments TEXT[];

-- Tasks tablosuna completed_at kolonu ekle
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Index'ler oluştur
CREATE INDEX IF NOT EXISTS idx_sub_projects_project_id ON sub_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_company_projects_company_id ON company_projects(company_id);
CREATE INDEX IF NOT EXISTS idx_company_projects_project_id ON company_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sub_project_id ON tasks(sub_project_id);
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_consultant_id ON projects(consultant_id);

-- RLS (Row Level Security) politikaları
ALTER TABLE sub_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_projects ENABLE ROW LEVEL SECURITY;

-- Sub_projects için RLS politikaları
CREATE POLICY "Users can view sub_projects for their company projects" ON sub_projects
    FOR SELECT USING (
        project_id IN (
            SELECT cp.project_id 
            FROM company_projects cp 
            WHERE cp.company_id IN (
                SELECT company_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can manage all sub_projects" ON sub_projects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Company_projects için RLS politikaları
CREATE POLICY "Users can view their company projects" ON company_projects
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all company_projects" ON company_projects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Updated_at trigger fonksiyonu (eğer yoksa)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'lar oluştur
CREATE TRIGGER update_sub_projects_updated_at 
    BEFORE UPDATE ON sub_projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_projects_updated_at 
    BEFORE UPDATE ON company_projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Örnek veriler ekle (test için)
INSERT INTO projects (id, name, description, type, status, start_date, end_date, progress) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Tekstil Sektörü Dijital Dönüşüm', 'Tekstil firmalarının e-ihracat sürecine geçişi için kapsamlı danışmanlık projesi', 'B2B', 'Aktif', '2024-01-15', '2024-06-30', 67),
    ('550e8400-e29b-41d4-a716-446655440002', 'Gıda Ürünleri Küresel Pazarlama', 'Türk gıda ürünlerinin uluslararası e-ticaret platformlarında satışının artırılması', 'B2C', 'Aktif', '2024-02-01', '2024-08-15', 43),
    ('550e8400-e29b-41d4-a716-446655440003', 'Makina Sanayi İhracat Eğitimi', 'Makina ve yedek parça sektöründe e-ihracat kapasitesinin geliştirilmesi', 'B2B', 'Tamamlandı', '2023-10-01', '2024-03-31', 100)
ON CONFLICT (id) DO NOTHING;

-- Alt projeler ekle
INSERT INTO sub_projects (id, project_id, name, description, start_date, end_date, status, progress) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Platform Analizi ve Uyumluluk Kontrolü', 'Firmanın mevcut sistemlerinin e-ihracat platformlarıyla uyumluluğunun analiz edilmesi', '2024-01-15', '2024-02-15', 'Tamamlandı', 100),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'API Entegrasyonu Dokümantasyonu', 'E-ihracat platformu API''lerinin detaylı dokümantasyonunun incelenmesi', '2024-02-01', '2024-03-01', 'Tamamlandı', 100),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Test Ortamı Kurulumu', 'Entegrasyon testleri için gerekli test ortamının kurulması', '2024-03-01', '2024-03-15', 'Aktif', 60)
ON CONFLICT (id) DO NOTHING;

-- Görevler ekle
INSERT INTO tasks (id, sub_project_id, title, description, status, priority, due_date, notes) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Sistem Analizi Raporu', 'Mevcut sistemlerin analiz edilmesi ve raporlanması', 'Tamamlandı', 'Yüksek', '2024-02-10', 'Sistem analizi tamamlandı. ERP entegrasyonu için ek modül gerekiyor.'),
    ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'API Dokümantasyonu İnceleme', 'Platform API dokümantasyonunun detaylı incelenmesi', 'Tamamlandı', 'Orta', '2024-02-25', 'API dokümantasyonu incelendi ve entegrasyon planı hazırlandı.'),
    ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', 'Test Ortamı Kurulumu', 'Gerekli test ortamının kurulması', 'İncelemede', 'Yüksek', '2024-03-10', 'Test ortamı kuruldu, ilk testler yapıldı. Bazı hatalar tespit edildi.')
ON CONFLICT (id) DO NOTHING;
