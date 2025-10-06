-- Migration: 011_sub_project_notification_integration.sql
-- Description: Alt proje tamamlama bildirim sistemi entegrasyonu
-- Date: 2024-01-03

-- Alt proje tamamlama trigger fonksiyonunu güncelle
CREATE OR REPLACE FUNCTION check_sub_project_completion()
RETURNS TRIGGER AS $$
DECLARE
    completion_count INTEGER;
    total_tasks INTEGER;
    completion_percentage INTEGER;
    company_id_var UUID;
    sub_project_id_var UUID;
BEGIN
    -- Yeni kayıt için bilgileri al
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        company_id_var := NEW.company_id;
        sub_project_id_var := NEW.task_id;
        
        -- Alt proje ID'sini task'tan al
        SELECT sp.id, sp.project_id 
        INTO sub_project_id_var, completion_count
        FROM sub_projects sp
        JOIN tasks t ON t.sub_project_id = sp.id
        WHERE t.id = NEW.task_id;
        
        -- Bu alt projedeki toplam görev sayısını al
        SELECT COUNT(*)
        INTO total_tasks
        FROM tasks
        WHERE sub_project_id = sub_project_id_var;
        
        -- Bu alt projedeki tamamlanan görev sayısını al
        SELECT COUNT(*)
        INTO completion_count
        FROM company_task_statuses cts
        JOIN tasks t ON t.id = cts.task_id
        WHERE t.sub_project_id = sub_project_id_var
        AND cts.company_id = company_id_var
        AND cts.status = 'Tamamlandı';
        
        -- Tamamlanma yüzdesini hesapla
        completion_percentage := CASE 
            WHEN total_tasks > 0 THEN ROUND((completion_count::DECIMAL / total_tasks) * 100)
            ELSE 0
        END;
        
        -- Eğer %100 tamamlandıysa ve daha önce kayıt yoksa
        IF completion_percentage >= 100 THEN
            INSERT INTO sub_project_completions (
                sub_project_id,
                company_id,
                completed_at,
                completed_by,
                total_tasks,
                completed_tasks,
                completion_percentage,
                status
            )
            VALUES (
                sub_project_id_var,
                company_id_var,
                NOW(),
                NEW.completed_by,
                total_tasks,
                completion_count,
                completion_percentage,
                'pending_review'
            )
            ON CONFLICT (sub_project_id, company_id) DO NOTHING;
            
            -- Bildirim sistemi için trigger (PostgreSQL function call)
            PERFORM pg_notify('sub_project_completed', 
                json_build_object(
                    'sub_project_id', sub_project_id_var,
                    'company_id', company_id_var,
                    'completion_percentage', completion_percentage
                )::text
            );
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Notifications tablosunu kontrol et ve gerekirse oluştur
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Notifications tablosu için index'ler
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Alt proje tamamlama bildirim fonksiyonu
CREATE OR REPLACE FUNCTION create_sub_project_completion_notification()
RETURNS TRIGGER AS $$
DECLARE
    consultant_record RECORD;
    completion_data RECORD;
BEGIN
    -- Tamamlanan alt proje bilgilerini al
    SELECT 
        spc.*,
        sp.name as sub_project_name,
        p.name as main_project_name,
        c.name as company_name,
        cu.name as completed_by_name
    INTO completion_data
    FROM sub_project_completions spc
    JOIN sub_projects sp ON sp.id = spc.sub_project_id
    JOIN projects p ON p.id = sp.project_id
    JOIN companies c ON c.id = spc.company_id
    JOIN company_users cu ON cu.id = spc.completed_by
    WHERE spc.id = NEW.id;
    
    -- Tüm danışmanlara bildirim gönder
    FOR consultant_record IN 
        SELECT id, name, email 
        FROM users 
        WHERE role IN ('admin', 'master_admin', 'consultant')
    LOOP
        INSERT INTO notifications (
            user_id,
            title,
            message,
            type,
            data,
            is_read
        ) VALUES (
            consultant_record.id,
            'Yeni Alt Proje Tamamlama',
            completion_data.company_name || ' firması "' || completion_data.sub_project_name || '" alt projesini %' || completion_data.completion_percentage || ' oranında tamamladı.',
            'sub_project_completion',
            json_build_object(
                'sub_project_completion_id', NEW.id,
                'company_name', completion_data.company_name,
                'sub_project_name', completion_data.sub_project_name,
                'main_project_name', completion_data.main_project_name,
                'completion_percentage', completion_data.completion_percentage,
                'completed_by', completion_data.completed_by_name,
                'completed_at', completion_data.completed_at
            ),
            FALSE
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Alt proje tamamlama tablosu için bildirim trigger'ı
DROP TRIGGER IF EXISTS sub_project_completion_notification_trigger ON sub_project_completions;
CREATE TRIGGER sub_project_completion_notification_trigger
    AFTER INSERT ON sub_project_completions
    FOR EACH ROW
    EXECUTE FUNCTION create_sub_project_completion_notification();

-- RLS (Row Level Security) politikaları
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi bildirimlerini görebilir
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Kullanıcılar kendi bildirimlerini güncelleyebilir
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Admin'ler tüm bildirimleri görebilir
CREATE POLICY "Admins can view all notifications" ON notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role IN ('admin', 'master_admin')
        )
    );
