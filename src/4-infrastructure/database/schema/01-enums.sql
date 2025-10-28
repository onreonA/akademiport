-- =====================================================
-- ENUMS
-- =====================================================
-- Enum types for type safety

-- User Roles
CREATE TYPE user_role AS ENUM (
  'master_admin',      -- Tüm sistemi yöneten
  'program_manager',   -- Program yöneticisi
  'consultant',        -- Danışman
  'company_admin',     -- Firma yöneticisi
  'company_user',      -- Firma kullanıcısı
  'observer'           -- Gözlemci (sadece görüntüleme)
);

-- Program Status
CREATE TYPE program_status AS ENUM (
  'planned',           -- Planlandı
  'active',            -- Aktif
  'completed',         -- Tamamlandı
  'paused',            -- Duraklatıldı
  'cancelled'          -- İptal edildi
);

-- Project Status
CREATE TYPE project_status AS ENUM (
  'not_started',       -- Başlanmadı
  'in_progress',       -- Devam ediyor
  'review',            -- İncelemede
  'completed',         -- Tamamlandı
  'on_hold',           -- Beklemede
  'cancelled'          -- İptal edildi
);

-- Task Status
CREATE TYPE task_status AS ENUM (
  'todo',              -- Yapılacak
  'in_progress',       -- Devam ediyor
  'review',            -- İncelemede
  'completed',         -- Tamamlandı
  'blocked'            -- Bloke
);

-- Task Priority
CREATE TYPE task_priority AS ENUM (
  'low',               -- Düşük
  'medium',            -- Orta
  'high',              -- Yüksek
  'urgent'             -- Acil
);

-- Training Type
CREATE TYPE training_type AS ENUM (
  'video',             -- Video eğitim
  'document',          -- Döküman
  'live_event',        -- Canlı etkinlik
  'quiz',              -- Quiz
  'assignment'         -- Ödev
);

-- Event Type
CREATE TYPE event_type AS ENUM (
  'online',            -- Online etkinlik
  'offline',           -- Yüz yüze etkinlik
  'hybrid'             -- Hibrit
);

-- Notification Type
CREATE TYPE notification_type AS ENUM (
  'info',              -- Bilgilendirme
  'success',           -- Başarı
  'warning',           -- Uyarı
  'error',             -- Hata
  'task_assigned',     -- Görev atandı
  'task_completed',    -- Görev tamamlandı
  'event_reminder',    -- Etkinlik hatırlatması
  'deadline_approaching' -- Deadline yaklaşıyor
);

