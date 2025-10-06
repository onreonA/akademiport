-- ========================================
-- EKSİK VERİTABANI TABLOLARI - BASİT VERSİYON
-- Test sonuçlarına göre eksik olan tabloları oluşturur
-- ========================================

-- ========================================
-- 1. ÖNCE ENUM'LARI OLUŞTUR
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

-- User type enum
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

-- Task status enum'a yeni değer ekle (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pending_approval' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
        ALTER TYPE task_status ADD VALUE 'pending_approval';
    END IF;
END $$;

-- ========================================
-- 2. TABLOLARI OLUŞTUR
-- ========================================

-- Task completions tablosu
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

-- Task comments tablosu
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

-- Task files tablosu
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

-- Task history tablosu
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

-- Consultants tablosu
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
-- 3. INDEX'LER
-- ========================================

-- Task completions indexes
CREATE INDEX IF NOT EXISTS idx_task_completions_task_id ON task_completions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_company_user_id ON task_completions(company_user_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_status ON task_completions(status);

-- Task comments indexes
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON task_comments(user_id);

-- Task files indexes
CREATE INDEX IF NOT EXISTS idx_task_files_task_id ON task_files(task_id);
CREATE INDEX IF NOT EXISTS idx_task_files_uploaded_by ON task_files(uploaded_by);

-- Task history indexes
CREATE INDEX IF NOT EXISTS idx_task_history_task_id ON task_history(task_id);
CREATE INDEX IF NOT EXISTS idx_task_history_user_id ON task_history(user_id);

-- Consultants indexes
CREATE INDEX IF NOT EXISTS idx_consultants_user_id ON consultants(user_id);

-- ========================================
-- 4. TASKS TABLOSUNA YENİ KOLONLAR EKLE
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
-- 5. BAŞARILI MESAJI
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
    RAISE NOTICE '🔧 Oluşturulan enum''lar:';
    RAISE NOTICE '   - completion_status';
    RAISE NOTICE '   - user_type_enum';
    RAISE NOTICE '📊 Index''ler oluşturuldu';
    RAISE NOTICE '🎯 Tasks tablosu güncellendi';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Veritabanı hazır! Test script''ini çalıştırabilirsiniz.';
END $$;
