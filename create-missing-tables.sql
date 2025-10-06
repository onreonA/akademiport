-- ========================================
-- EKSİK VERİTABANI TABLOLARI OLUŞTURMA SCRIPT'İ
-- Test sonuçlarına göre eksik olan tabloları oluşturur
-- ========================================

-- ========================================
-- ÖNCE ENUM'LARI OLUŞTUR
-- ========================================

-- Completion status enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'completion_status') THEN
        CREATE TYPE completion_status AS ENUM (
            'pending_approval',
            'approved',
            'rejected'
        );
        RAISE NOTICE 'completion_status enum oluşturuldu';
    ELSE
        RAISE NOTICE 'completion_status enum zaten mevcut';
    END IF;
END $$;

-- User type enum (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type_enum') THEN
        CREATE TYPE user_type_enum AS ENUM (
            'company_user',
            'admin_user',
            'consultant'
        );
        RAISE NOTICE 'user_type_enum oluşturuldu';
    ELSE
        RAISE NOTICE 'user_type_enum zaten mevcut';
    END IF;
END $$;

-- Task status enum güncellemesi (eğer gerekirse)
DO $$ 
BEGIN
    -- Mevcut enum'u genişlet
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        -- Yeni değerleri ekle (eğer yoksa)
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pending_approval' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
            ALTER TYPE task_status ADD VALUE 'pending_approval';
            RAISE NOTICE 'pending_approval değeri task_status enum''una eklendi';
        END IF;
    ELSE
        -- Enum yoksa oluştur
        CREATE TYPE task_status AS ENUM (
            'pending',
            'in_progress',
            'completed',
            'cancelled',
            'pending_approval'
        );
        RAISE NOTICE 'task_status enum oluşturuldu';
    END IF;
END $$;

-- ========================================
-- ŞİMDİ TABLOLARI OLUŞTUR
-- ========================================

-- 1. TASK_COMPLETIONS TABLOSU
-- Görev tamamlama kayıtlarını tutar
CREATE TABLE IF NOT EXISTS task_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    company_user_id UUID NOT NULL REFERENCES company_users(id) ON DELETE CASCADE,
    completion_note TEXT,
    completion_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actual_hours DECIMAL(10,2),
    status completion_status DEFAULT 'pending_approval',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TASK_COMMENTS TABLOSU
-- Görev yorumlarını tutar
CREATE TABLE IF NOT EXISTS task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- company_users veya users tablosundan
    user_type user_type_enum DEFAULT 'company_user',
    comment TEXT NOT NULL,
    comment_type VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TASK_FILES TABLOSU
-- Görev dosyalarını tutar
CREATE TABLE IF NOT EXISTS task_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    file_extension VARCHAR(10),
    description TEXT,
    file_type_category VARCHAR(50) DEFAULT 'attachment',
    uploaded_by UUID NOT NULL, -- company_users veya users tablosundan
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TASK_HISTORY TABLOSU
-- Görev geçmişini tutar
CREATE TABLE IF NOT EXISTS task_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    notes TEXT,
    user_id UUID NOT NULL, -- company_users veya users tablosundan
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CONSULTANTS TABLOSU
-- Danışman bilgilerini tutar
CREATE TABLE IF NOT EXISTS consultants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(255),
    experience_years INTEGER,
    rating DECIMAL(3,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'active',
    availability_schedule JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ENUM TANIMLAMALARI (YUKARIDA ZATEN YAPILDI)
-- ========================================

-- ========================================
-- INDEX'LER
-- ========================================

-- Task completions indexes
CREATE INDEX IF NOT EXISTS idx_task_completions_task_id ON task_completions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_company_user_id ON task_completions(company_user_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_status ON task_completions(status);
CREATE INDEX IF NOT EXISTS idx_task_completions_created_at ON task_completions(created_at);

-- Task comments indexes
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON task_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON task_comments(created_at);

-- Task files indexes
CREATE INDEX IF NOT EXISTS idx_task_files_task_id ON task_files(task_id);
CREATE INDEX IF NOT EXISTS idx_task_files_uploaded_by ON task_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_task_files_uploaded_at ON task_files(uploaded_at);

-- Task history indexes
CREATE INDEX IF NOT EXISTS idx_task_history_task_id ON task_history(task_id);
CREATE INDEX IF NOT EXISTS idx_task_history_user_id ON task_history(user_id);
CREATE INDEX IF NOT EXISTS idx_task_history_created_at ON task_history(created_at);

-- Consultants indexes
CREATE INDEX IF NOT EXISTS idx_consultants_user_id ON consultants(user_id);
CREATE INDEX IF NOT EXISTS idx_consultants_status ON consultants(status);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Task completions RLS
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "task_completions_company_access" ON task_completions
    FOR ALL USING (
        company_user_id IN (
            SELECT id FROM company_users 
            WHERE company_id = (
                SELECT company_id FROM company_users 
                WHERE id = auth.uid()::text::uuid
            )
        )
    );

-- Task comments RLS
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "task_comments_company_access" ON task_comments
    FOR ALL USING (
        task_id IN (
            SELECT t.id FROM tasks t
            JOIN sub_projects sp ON t.sub_project_id = sp.id
            JOIN projects p ON sp.project_id = p.id
            JOIN project_company_assignments pca ON p.id = pca.project_id
            JOIN company_users cu ON pca.company_id = cu.company_id
            WHERE cu.id = auth.uid()::text::uuid
        )
    );

-- Task files RLS
ALTER TABLE task_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "task_files_company_access" ON task_files
    FOR ALL USING (
        task_id IN (
            SELECT t.id FROM tasks t
            JOIN sub_projects sp ON t.sub_project_id = sp.id
            JOIN projects p ON sp.project_id = p.id
            JOIN project_company_assignments pca ON p.id = pca.project_id
            JOIN company_users cu ON pca.company_id = cu.company_id
            WHERE cu.id = auth.uid()::text::uuid
        )
    );

-- Task history RLS
ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "task_history_company_access" ON task_history
    FOR ALL USING (
        task_id IN (
            SELECT t.id FROM tasks t
            JOIN sub_projects sp ON t.sub_project_id = sp.id
            JOIN projects p ON sp.project_id = p.id
            JOIN project_company_assignments pca ON p.id = pca.project_id
            JOIN company_users cu ON pca.company_id = cu.company_id
            WHERE cu.id = auth.uid()::text::uuid
        )
    );

-- Consultants RLS
ALTER TABLE consultants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consultants_admin_access" ON consultants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text::uuid 
            AND user_role = 'master_admin'
        )
    );

-- ========================================
-- TRIGGER'LAR
-- ========================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Task completions updated_at trigger
CREATE TRIGGER update_task_completions_updated_at 
    BEFORE UPDATE ON task_completions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Task comments updated_at trigger
CREATE TRIGGER update_task_comments_updated_at 
    BEFORE UPDATE ON task_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Consultants updated_at trigger
CREATE TRIGGER update_consultants_updated_at 
    BEFORE UPDATE ON consultants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- VERİTABANI GÜNCELLEMELERİ
-- ========================================

-- Tasks tablosuna eksik alanları ekle (eğer yoksa)
DO $$ 
BEGIN
    -- completed_by alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'completed_by') THEN
        ALTER TABLE tasks ADD COLUMN completed_by UUID REFERENCES company_users(id);
    END IF;
    
    -- completed_at alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'completed_at') THEN
        ALTER TABLE tasks ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- completion_note alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'completion_note') THEN
        ALTER TABLE tasks ADD COLUMN completion_note TEXT;
    END IF;
    
    -- actual_hours alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'actual_hours') THEN
        ALTER TABLE tasks ADD COLUMN actual_hours DECIMAL(10,2);
    END IF;
    
    -- consultant_approval_status alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'consultant_approval_status') THEN
        ALTER TABLE tasks ADD COLUMN consultant_approval_status completion_status;
    END IF;
    
    -- consultant_id alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'consultant_id') THEN
        ALTER TABLE tasks ADD COLUMN consultant_id UUID REFERENCES consultants(id);
    END IF;
    
    -- approved_at alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'approved_at') THEN
        ALTER TABLE tasks ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- approved_by alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'approved_by') THEN
        ALTER TABLE tasks ADD COLUMN approved_by UUID REFERENCES users(id);
    END IF;
    
    -- approval_note alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'approval_note') THEN
        ALTER TABLE tasks ADD COLUMN approval_note TEXT;
    END IF;
    
    -- quality_score alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'quality_score') THEN
        ALTER TABLE tasks ADD COLUMN quality_score DECIMAL(3,2);
    END IF;
    
    -- rejected_at alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'rejected_at') THEN
        ALTER TABLE tasks ADD COLUMN rejected_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- rejected_by alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'rejected_by') THEN
        ALTER TABLE tasks ADD COLUMN rejected_by UUID REFERENCES users(id);
    END IF;
    
    -- rejection_reason alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'rejection_reason') THEN
        ALTER TABLE tasks ADD COLUMN rejection_reason TEXT;
    END IF;
    
    -- required_actions alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'required_actions') THEN
        ALTER TABLE tasks ADD COLUMN required_actions TEXT;
    END IF;
END $$;

-- ========================================
-- BAŞARILI MESAJI
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '✅ Tüm eksik tablolar başarıyla oluşturuldu!';
    RAISE NOTICE '📋 Oluşturulan tablolar:';
    RAISE NOTICE '   - task_completions';
    RAISE NOTICE '   - task_comments';
    RAISE NOTICE '   - task_files';
    RAISE NOTICE '   - task_history';
    RAISE NOTICE '   - consultants';
    RAISE NOTICE '🔧 Güncellenen enum''lar:';
    RAISE NOTICE '   - completion_status';
    RAISE NOTICE '   - user_type_enum';
    RAISE NOTICE '   - task_status (genişletildi)';
    RAISE NOTICE '🔒 RLS policies uygulandı';
    RAISE NOTICE '📊 Index''ler oluşturuldu';
    RAISE NOTICE '⚡ Trigger''lar eklendi';
    RAISE NOTICE '🎯 Tasks tablosu güncellendi';
END $$;
