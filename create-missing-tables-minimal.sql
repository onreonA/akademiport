-- ========================================
-- EKSİK VERİTABANI TABLOLARI - MİNİMAL VERSİYON
-- Test sonuçlarına göre eksik olan tabloları oluşturur
-- ========================================

-- ========================================
-- 1. ENUM'LARI OLUŞTUR
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
    user_id UUID NOT NULL,
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
    uploaded_by UUID NOT NULL,
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
    user_id UUID NOT NULL,
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
-- 3. BAŞARILI MESAJI
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
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Veritabanı hazır! Test script''ini çalıştırabilirsiniz.';
END $$;

