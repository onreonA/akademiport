-- ========================================
-- KALAN SORUNLARI ÇÖZME SCRIPT'İ
-- ========================================

-- ========================================
-- 1. TASK_STATUS ENUM'INI GÜNCELLE
-- ========================================

-- Önce mevcut task_status enum değerlerini kontrol et
DO $$
DECLARE
    enum_values TEXT;
BEGIN
    SELECT string_agg(enumlabel, ', ') INTO enum_values
    FROM pg_enum 
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status');
    
    RAISE NOTICE 'Mevcut task_status enum değerleri: %', enum_values;
END $$;

-- Task status enum'a eksik değerleri ekle
DO $$ 
BEGIN
    -- pending değerini ekle (eğer yoksa)
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pending' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
        ALTER TYPE task_status ADD VALUE 'pending';
        RAISE NOTICE 'pending değeri task_status enum''una eklendi';
    END IF;
    
    -- in_progress değerini ekle (eğer yoksa)
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'in_progress' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
        ALTER TYPE task_status ADD VALUE 'in_progress';
        RAISE NOTICE 'in_progress değeri task_status enum''una eklendi';
    END IF;
    
    -- completed değerini ekle (eğer yoksa)
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'completed' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
        ALTER TYPE task_status ADD VALUE 'completed';
        RAISE NOTICE 'completed değeri task_status enum''una eklendi';
    END IF;
    
    -- cancelled değerini ekle (eğer yoksa)
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'cancelled' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
        ALTER TYPE task_status ADD VALUE 'cancelled';
        RAISE NOTICE 'cancelled değeri task_status enum''una eklendi';
    END IF;
    
    -- pending_approval değerini ekle (eğer yoksa)
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pending_approval' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
        ALTER TYPE task_status ADD VALUE 'pending_approval';
        RAISE NOTICE 'pending_approval değeri task_status enum''una eklendi';
    END IF;
END $$;

-- ========================================
-- 2. TASKS TABLOSUNA YENİ KOLONLAR EKLE
-- ========================================

-- Tasks tablosuna eksik alanları ekle
DO $$ 
BEGIN
    -- completed_by alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'completed_by') THEN
        ALTER TABLE tasks ADD COLUMN completed_by UUID REFERENCES company_users(id);
        RAISE NOTICE 'completed_by kolonu tasks tablosuna eklendi';
    END IF;
    
    -- completed_at alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'completed_at') THEN
        ALTER TABLE tasks ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'completed_at kolonu tasks tablosuna eklendi';
    END IF;
    
    -- completion_note alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'completion_note') THEN
        ALTER TABLE tasks ADD COLUMN completion_note TEXT;
        RAISE NOTICE 'completion_note kolonu tasks tablosuna eklendi';
    END IF;
    
    -- actual_hours alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'actual_hours') THEN
        ALTER TABLE tasks ADD COLUMN actual_hours DECIMAL(10,2);
        RAISE NOTICE 'actual_hours kolonu tasks tablosuna eklendi';
    END IF;
    
    -- consultant_approval_status alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'consultant_approval_status') THEN
        ALTER TABLE tasks ADD COLUMN consultant_approval_status completion_status;
        RAISE NOTICE 'consultant_approval_status kolonu tasks tablosuna eklendi';
    END IF;
    
    -- consultant_id alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'consultant_id') THEN
        ALTER TABLE tasks ADD COLUMN consultant_id UUID REFERENCES consultants(id);
        RAISE NOTICE 'consultant_id kolonu tasks tablosuna eklendi';
    END IF;
    
    -- approved_at alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'approved_at') THEN
        ALTER TABLE tasks ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'approved_at kolonu tasks tablosuna eklendi';
    END IF;
    
    -- approved_by alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'approved_by') THEN
        ALTER TABLE tasks ADD COLUMN approved_by UUID REFERENCES users(id);
        RAISE NOTICE 'approved_by kolonu tasks tablosuna eklendi';
    END IF;
    
    -- approval_note alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'approval_note') THEN
        ALTER TABLE tasks ADD COLUMN approval_note TEXT;
        RAISE NOTICE 'approval_note kolonu tasks tablosuna eklendi';
    END IF;
    
    -- quality_score alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'quality_score') THEN
        ALTER TABLE tasks ADD COLUMN quality_score DECIMAL(3,2);
        RAISE NOTICE 'quality_score kolonu tasks tablosuna eklendi';
    END IF;
    
    -- rejected_at alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'rejected_at') THEN
        ALTER TABLE tasks ADD COLUMN rejected_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'rejected_at kolonu tasks tablosuna eklendi';
    END IF;
    
    -- rejected_by alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'rejected_by') THEN
        ALTER TABLE tasks ADD COLUMN rejected_by UUID REFERENCES users(id);
        RAISE NOTICE 'rejected_by kolonu tasks tablosuna eklendi';
    END IF;
    
    -- rejection_reason alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'rejection_reason') THEN
        ALTER TABLE tasks ADD COLUMN rejection_reason TEXT;
        RAISE NOTICE 'rejection_reason kolonu tasks tablosuna eklendi';
    END IF;
    
    -- required_actions alanı
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'required_actions') THEN
        ALTER TABLE tasks ADD COLUMN required_actions TEXT;
        RAISE NOTICE 'required_actions kolonu tasks tablosuna eklendi';
    END IF;
END $$;

-- ========================================
-- 3. BAŞARILI MESAJI
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tüm kalan sorunlar çözüldü!';
    RAISE NOTICE '🔧 Task status enum güncellendi';
    RAISE NOTICE '📊 Tasks tablosuna yeni kolonlar eklendi';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Artık veritabanı %100 hazır!';
    RAISE NOTICE '🧪 Test script''ini tekrar çalıştırabilirsiniz.';
END $$;

