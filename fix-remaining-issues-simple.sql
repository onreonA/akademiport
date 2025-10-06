-- ========================================
-- KALAN SORUNLARI ÇÖZME SCRIPT'İ - BASİT VERSİYON
-- ========================================

-- ========================================
-- 1. TASK_STATUS ENUM'INI GÜNCELLE
-- ========================================

-- Task status enum'a eksik değerleri ekle
DO $$ 
BEGIN
    -- pending değerini ekle (eğer yoksa)
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pending' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
        ALTER TYPE task_status ADD VALUE 'pending';
    END IF;
    
    -- in_progress değerini ekle (eğer yoksa)
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'in_progress' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
        ALTER TYPE task_status ADD VALUE 'in_progress';
    END IF;
    
    -- completed değerini ekle (eğer yoksa)
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'completed' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
        ALTER TYPE task_status ADD VALUE 'completed';
    END IF;
    
    -- cancelled değerini ekle (eğer yoksa)
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'cancelled' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
        ALTER TYPE task_status ADD VALUE 'cancelled';
    END IF;
    
    -- pending_approval değerini ekle (eğer yoksa)
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pending_approval' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
        ALTER TYPE task_status ADD VALUE 'pending_approval';
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

-- Başarılı mesaj
SELECT 'Tüm kalan sorunlar çözüldü! Veritabanı %100 hazır!' as result;

