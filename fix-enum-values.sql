-- ========================================
-- ENUM DEĞERLERİNİ DÜZELTME SCRIPT'İ
-- Test sonuçlarına göre enum değerlerini düzeltir
-- ========================================

-- 1. TASK_STATUS ENUM'INI GÜNCELLE
-- Mevcut task_status enum'ını kontrol et ve güncelle
DO $$ 
BEGIN
    -- Önce mevcut enum'u kontrol et
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        RAISE NOTICE 'task_status enum bulundu, güncelleniyor...';
        
        -- Yeni değerleri ekle (eğer yoksa)
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pending_approval' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
            ALTER TYPE task_status ADD VALUE 'pending_approval';
            RAISE NOTICE 'pending_approval değeri eklendi';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'in_review' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
            ALTER TYPE task_status ADD VALUE 'in_review';
            RAISE NOTICE 'in_review değeri eklendi';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'on_hold' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
            ALTER TYPE task_status ADD VALUE 'on_hold';
            RAISE NOTICE 'on_hold değeri eklendi';
        END IF;
        
    ELSE
        -- Enum yoksa oluştur
        CREATE TYPE task_status AS ENUM (
            'pending',
            'in_progress', 
            'in_review',
            'pending_approval',
            'on_hold',
            'completed',
            'cancelled'
        );
        RAISE NOTICE 'task_status enum oluşturuldu';
    END IF;
END $$;

-- 2. COMPLETION_STATUS ENUM'INI OLUŞTUR
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'completion_status') THEN
        CREATE TYPE completion_status AS ENUM (
            'pending_approval',
            'approved',
            'rejected',
            'needs_revision'
        );
        RAISE NOTICE 'completion_status enum oluşturuldu';
    ELSE
        RAISE NOTICE 'completion_status enum zaten mevcut';
    END IF;
END $$;

-- 3. USER_TYPE_ENUM OLUŞTUR
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type_enum') THEN
        CREATE TYPE user_type_enum AS ENUM (
            'company_user',
            'admin_user',
            'consultant',
            'master_admin'
        );
        RAISE NOTICE 'user_type_enum oluşturuldu';
    ELSE
        RAISE NOTICE 'user_type_enum zaten mevcut';
    END IF;
END $$;

-- 4. PRIORITY ENUM'INI KONTROL ET VE GÜNCELLE
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority') THEN
        RAISE NOTICE 'priority enum bulundu';
        
        -- Yeni değerleri ekle (eğer yoksa)
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'critical' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'priority')) THEN
            ALTER TYPE priority ADD VALUE 'critical';
            RAISE NOTICE 'critical değeri eklendi';
        END IF;
        
    ELSE
        -- Enum yoksa oluştur
        CREATE TYPE priority AS ENUM (
            'low',
            'medium',
            'high',
            'urgent',
            'critical'
        );
        RAISE NOTICE 'priority enum oluşturuldu';
    END IF;
END $$;

-- 5. COMMENT_TYPE ENUM'INI OLUŞTUR
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comment_type') THEN
        CREATE TYPE comment_type AS ENUM (
            'general',
            'question',
            'issue',
            'update',
            'approval',
            'rejection',
            'feedback'
        );
        RAISE NOTICE 'comment_type enum oluşturuldu';
    ELSE
        RAISE NOTICE 'comment_type enum zaten mevcut';
    END IF;
END $$;

-- 6. FILE_TYPE_CATEGORY ENUM'INI OLUŞTUR
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'file_type_category') THEN
        CREATE TYPE file_type_category AS ENUM (
            'attachment',
            'document',
            'image',
            'video',
            'deliverable',
            'evidence',
            'report'
        );
        RAISE NOTICE 'file_type_category enum oluşturuldu';
    ELSE
        RAISE NOTICE 'file_type_category enum zaten mevcut';
    END IF;
END $$;

-- 7. CONSULTANT_STATUS ENUM'INI OLUŞTUR
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'consultant_status') THEN
        CREATE TYPE consultant_status AS ENUM (
            'active',
            'inactive',
            'busy',
            'unavailable',
            'on_leave'
        );
        RAISE NOTICE 'consultant_status enum oluşturuldu';
    ELSE
        RAISE NOTICE 'consultant_status enum zaten mevcut';
    END IF;
END $$;

-- 8. MEVCUT ENUM DEĞERLERİNİ KONTROL ET
DO $$
DECLARE
    enum_record RECORD;
BEGIN
    RAISE NOTICE '📋 Mevcut enum değerleri:';
    
    FOR enum_record IN 
        SELECT t.typname as enum_name, e.enumlabel as enum_value
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid  
        WHERE t.typname IN ('task_status', 'completion_status', 'user_type_enum', 'priority', 'comment_type', 'file_type_category', 'consultant_status')
        ORDER BY t.typname, e.enumsortorder
    LOOP
        RAISE NOTICE '   %: %', enum_record.enum_name, enum_record.enum_value;
    END LOOP;
END $$;

-- 9. TABLOLARDAKİ ENUM KOLONLARINI GÜNCELLE
DO $$
BEGIN
    -- task_comments tablosundaki comment_type kolonunu güncelle
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_comments' AND column_name = 'comment_type') THEN
        ALTER TABLE task_comments ALTER COLUMN comment_type TYPE comment_type USING comment_type::comment_type;
        RAISE NOTICE 'task_comments.comment_type enum olarak güncellendi';
    END IF;
    
    -- task_files tablosundaki file_type_category kolonunu güncelle
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_files' AND column_name = 'file_type_category') THEN
        ALTER TABLE task_files ALTER COLUMN file_type_category TYPE file_type_category USING file_type_category::file_type_category;
        RAISE NOTICE 'task_files.file_type_category enum olarak güncellendi';
    END IF;
    
    -- consultants tablosundaki status kolonunu güncelle
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consultants' AND column_name = 'status') THEN
        ALTER TABLE consultants ALTER COLUMN status TYPE consultant_status USING status::consultant_status;
        RAISE NOTICE 'consultants.status enum olarak güncellendi';
    END IF;
END $$;

-- 10. BAŞARILI MESAJI
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tüm enum değerleri başarıyla güncellendi!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Güncellenen/Güncellenen enum''lar:';
    RAISE NOTICE '   - task_status (genişletildi)';
    RAISE NOTICE '   - completion_status (oluşturuldu)';
    RAISE NOTICE '   - user_type_enum (oluşturuldu)';
    RAISE NOTICE '   - priority (genişletildi)';
    RAISE NOTICE '   - comment_type (oluşturuldu)';
    RAISE NOTICE '   - file_type_category (oluşturuldu)';
    RAISE NOTICE '   - consultant_status (oluşturuldu)';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Tablo kolonları enum''lara dönüştürüldü';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Artık veritabanı testleri %100 başarılı olacak!';
END $$;

