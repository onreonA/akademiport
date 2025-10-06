-- Firma-Spesifik Görev İlerlemesi Sistemi Migration
-- Bu migration global görevler + firma ilerlemesi sistemini oluşturur

-- Task Company Progress tablosu oluştur
CREATE TABLE task_company_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'on_hold', 'cancelled')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    progress_notes TEXT,
    completion_notes TEXT,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(task_id, company_id)
);

-- Indexes for better performance
CREATE INDEX idx_task_company_progress_task_id ON task_company_progress(task_id);
CREATE INDEX idx_task_company_progress_company_id ON task_company_progress(company_id);
CREATE INDEX idx_task_company_progress_status ON task_company_progress(status);
CREATE INDEX idx_task_company_progress_completed_at ON task_company_progress(completed_at);

-- Mevcut görevleri firma-spesifik ilerlemeye dönüştür
-- Önce alt projeye atanmış firmaları al
INSERT INTO task_company_progress (task_id, company_id, status, progress_percentage, started_at, completed_at, progress_notes)
SELECT 
    t.id as task_id,
    spca.company_id,
    CASE 
        WHEN t.status = 'Tamamlandı' THEN 'completed'
        WHEN t.status = 'İncelemede' THEN 'in_progress'
        WHEN t.status = 'Bekliyor' THEN 'pending'
        WHEN t.status = 'İptal Edildi' THEN 'cancelled'
        ELSE 'pending'
    END as status,
    CASE 
        WHEN t.status = 'Tamamlandı' THEN 100
        WHEN t.status = 'İncelemede' THEN 50
        WHEN t.status = 'Bekliyor' THEN 0
        WHEN t.status = 'İptal Edildi' THEN 0
        ELSE 0
    END as progress_percentage,
    t.created_at as started_at,
    CASE 
        WHEN t.status = 'Tamamlandı' THEN t.updated_at
        ELSE NULL
    END as completed_at,
    t.description as progress_notes
FROM tasks t
JOIN sub_projects sp ON t.sub_project_id = sp.id
JOIN sub_project_company_assignments spca ON sp.id = spca.sub_project_id
WHERE spca.status = 'active';

-- Alt proje tamamlama durumunu güncelle
CREATE OR REPLACE FUNCTION update_sub_project_completion_status()
RETURNS TRIGGER AS $$
DECLARE
    sub_proj_id UUID;
    company_assignment_id UUID;
    total_tasks INTEGER;
    completed_tasks INTEGER;
    all_completed BOOLEAN;
BEGIN
    -- Get sub_project_id from the updated task
    sub_proj_id := NEW.sub_project_id;
    
    IF sub_proj_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Her firma için ayrı ayrı kontrol et
    FOR company_assignment_id IN 
        SELECT id FROM sub_project_company_assignments 
        WHERE sub_project_id = sub_proj_id AND status = 'active'
    LOOP
        -- Bu firma için toplam ve tamamlanan görev sayısını al
        SELECT COUNT(*), COUNT(*) FILTER (WHERE tcp.status = 'completed')
        INTO total_tasks, completed_tasks
        FROM tasks t
        JOIN task_company_progress tcp ON t.id = tcp.task_id
        WHERE t.sub_project_id = sub_proj_id 
        AND tcp.company_id = (
            SELECT company_id FROM sub_project_company_assignments 
            WHERE id = company_assignment_id
        );
        
        -- Tüm görevler tamamlandı mı kontrol et
        all_completed := (total_tasks > 0 AND completed_tasks = total_tasks);
        
        -- Alt proje atamasını güncelle
        UPDATE sub_project_company_assignments 
        SET 
            all_tasks_completed = all_completed,
            consultant_review_required = all_completed,
            completion_status = CASE 
                WHEN all_completed THEN 'requires_review'
                ELSE completion_status
            END,
            completed_at = CASE 
                WHEN all_completed AND completed_at IS NULL THEN NOW()
                ELSE completed_at
            END
        WHERE id = company_assignment_id;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ı güncelle
DROP TRIGGER IF EXISTS trigger_check_sub_project_completion ON tasks;
CREATE TRIGGER trigger_check_sub_project_completion
    AFTER UPDATE OF status ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_sub_project_completion_status();

-- Task Company Progress için trigger oluştur
CREATE OR REPLACE FUNCTION update_task_company_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Eğer status completed'a geçiyorsa completed_at'i güncelle
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = NOW();
    END IF;
    
    -- Eğer status in_progress'e geçiyorsa started_at'i güncelle
    IF NEW.status = 'in_progress' AND OLD.status = 'pending' THEN
        NEW.started_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Task Company Progress için trigger oluştur
DROP TRIGGER IF EXISTS trigger_update_task_company_progress_timestamp ON task_company_progress;
CREATE TRIGGER trigger_update_task_company_progress_timestamp
    BEFORE UPDATE ON task_company_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_task_company_progress_timestamp();

-- RLS policies for task_company_progress
ALTER TABLE task_company_progress ENABLE ROW LEVEL SECURITY;

-- Policy for companies to view their own progress
CREATE POLICY "Companies can view their own progress" ON task_company_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()
            AND users.company_id = task_company_progress.company_id
        )
    );

-- Policy for admins and consultants to manage all progress
CREATE POLICY "Admins and consultants can manage progress" ON task_company_progress
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'master_admin', 'danışman')
        )
    );

-- Policy for companies to update their own progress
CREATE POLICY "Companies can update their own progress" ON task_company_progress
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()
            AND users.company_id = task_company_progress.company_id
        )
    );

-- Firma-spesifik görev ilerlemesi istatistikleri fonksiyonu
CREATE OR REPLACE FUNCTION get_company_task_progress_stats(
    p_sub_project_id UUID,
    p_company_id UUID
)
RETURNS TABLE (
    sub_project_id UUID,
    company_id UUID,
    total_tasks INTEGER,
    completed_tasks INTEGER,
    in_progress_tasks INTEGER,
    pending_tasks INTEGER,
    completion_rate DECIMAL,
    average_progress DECIMAL,
    last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p_sub_project_id as sub_project_id,
        p_company_id as company_id,
        COUNT(*)::INTEGER as total_tasks,
        COUNT(*) FILTER (WHERE tcp.status = 'completed')::INTEGER as completed_tasks,
        COUNT(*) FILTER (WHERE tcp.status = 'in_progress')::INTEGER as in_progress_tasks,
        COUNT(*) FILTER (WHERE tcp.status = 'pending')::INTEGER as pending_tasks,
        CASE 
            WHEN COUNT(*) > 0 THEN ROUND(
                (COUNT(*) FILTER (WHERE tcp.status = 'completed') * 100.0 / COUNT(*)), 
                2
            )
            ELSE 0
        END as completion_rate,
        CASE 
            WHEN COUNT(*) > 0 THEN ROUND(
                AVG(tcp.progress_percentage), 
                2
            )
            ELSE 0
        END as average_progress,
        MAX(tcp.updated_at) as last_activity
    FROM tasks t
    JOIN task_company_progress tcp ON t.id = tcp.task_id
    WHERE t.sub_project_id = p_sub_project_id
    AND tcp.company_id = p_company_id;
END;
$$ LANGUAGE plpgsql;

-- Alt proje firma karşılaştırması fonksiyonu
CREATE OR REPLACE FUNCTION get_sub_project_company_comparison(
    p_sub_project_id UUID
)
RETURNS TABLE (
    company_id UUID,
    company_name TEXT,
    total_tasks INTEGER,
    completed_tasks INTEGER,
    completion_rate DECIMAL,
    average_progress DECIMAL,
    last_activity TIMESTAMP WITH TIME ZONE,
    rank_position INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH company_stats AS (
        SELECT 
            tcp.company_id,
            c.name as company_name,
            COUNT(*)::INTEGER as total_tasks,
            COUNT(*) FILTER (WHERE tcp.status = 'completed')::INTEGER as completed_tasks,
            CASE 
                WHEN COUNT(*) > 0 THEN ROUND(
                    (COUNT(*) FILTER (WHERE tcp.status = 'completed') * 100.0 / COUNT(*)), 
                    2
                )
                ELSE 0
            END as completion_rate,
            CASE 
                WHEN COUNT(*) > 0 THEN ROUND(
                    AVG(tcp.progress_percentage), 
                    2
                )
                ELSE 0
            END as average_progress,
            MAX(tcp.updated_at) as last_activity
        FROM tasks t
        JOIN task_company_progress tcp ON t.id = tcp.task_id
        JOIN companies c ON tcp.company_id = c.id
        WHERE t.sub_project_id = p_sub_project_id
        GROUP BY tcp.company_id, c.name
    )
    SELECT 
        cs.company_id,
        cs.company_name,
        cs.total_tasks,
        cs.completed_tasks,
        cs.completion_rate,
        cs.average_progress,
        cs.last_activity,
        ROW_NUMBER() OVER (ORDER BY cs.completion_rate DESC, cs.average_progress DESC)::INTEGER as rank_position
    FROM company_stats cs
    ORDER BY cs.completion_rate DESC, cs.average_progress DESC;
END;
$$ LANGUAGE plpgsql;

-- Comment'ler
COMMENT ON TABLE task_company_progress IS 'Stores company-specific progress for tasks';
COMMENT ON COLUMN task_company_progress.status IS 'Task status for specific company: pending, in_progress, completed, on_hold, cancelled';
COMMENT ON COLUMN task_company_progress.progress_percentage IS 'Percentage completion for this company (0-100)';
COMMENT ON FUNCTION get_company_task_progress_stats(UUID, UUID) IS 'Returns task progress statistics for a specific company in a sub-project';
COMMENT ON FUNCTION get_sub_project_company_comparison(UUID) IS 'Returns company comparison statistics for a sub-project with rankings';
