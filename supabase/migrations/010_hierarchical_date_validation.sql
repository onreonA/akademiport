-- Migration: Hierarchical Date Validation
-- Phase 1: Database constraints and triggers for date hierarchy

-- 1. Alt proje tarihleri ana proje tarihleri içinde mi kontrolü
CREATE OR REPLACE FUNCTION check_sub_project_date_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
  parent_start_date DATE;
  parent_end_date DATE;
BEGIN
  -- Ana proje tarihlerini al
  SELECT pcd.start_date, pcd.end_date
  INTO parent_start_date, parent_end_date
  FROM project_company_dates pcd
  JOIN sub_projects sp ON sp.project_id = pcd.project_id
  WHERE sp.id = NEW.sub_project_id 
    AND pcd.company_id = NEW.company_id;
  
  -- Eğer ana proje tarihi bulunamadıysa hata
  IF parent_start_date IS NULL OR parent_end_date IS NULL THEN
    RAISE EXCEPTION 'Ana proje tarihleri bulunamadı. Önce ana projeye tarih ataması yapın.';
  END IF;
  
  -- Alt proje tarihleri ana proje tarihleri içinde mi?
  IF NEW.start_date < parent_start_date OR NEW.end_date > parent_end_date THEN
    RAISE EXCEPTION 'Alt proje tarihleri ana proje tarihleri dışında olamaz. Ana proje: % - %, Alt proje: % - %', 
      parent_start_date, parent_end_date, NEW.start_date, NEW.end_date;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Görev tarihleri alt proje tarihleri içinde mi kontrolü
CREATE OR REPLACE FUNCTION check_task_date_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
  parent_start_date DATE;
  parent_end_date DATE;
  sub_project_id UUID;
BEGIN
  -- Görevin alt proje ID'sini al
  SELECT t.sub_project_id INTO sub_project_id
  FROM tasks t
  WHERE t.id = NEW.task_id;
  
  -- Eğer görev alt projeye bağlıysa
  IF sub_project_id IS NOT NULL THEN
    -- Alt proje tarihlerini al
    SELECT spcd.start_date, spcd.end_date
    INTO parent_start_date, parent_end_date
    FROM sub_project_company_dates spcd
    WHERE spcd.sub_project_id = sub_project_id 
      AND spcd.company_id = NEW.company_id;
    
    -- Eğer alt proje tarihi bulunamadıysa hata
    IF parent_start_date IS NULL OR parent_end_date IS NULL THEN
      RAISE EXCEPTION 'Alt proje tarihleri bulunamadı. Önce alt projeye tarih ataması yapın.';
    END IF;
    
    -- Görev tarihleri alt proje tarihleri içinde mi?
    IF (NEW.start_date IS NOT NULL AND NEW.start_date < parent_start_date) OR 
       NEW.end_date > parent_end_date THEN
      RAISE EXCEPTION 'Görev tarihleri alt proje tarihleri dışında olamaz. Alt proje: % - %, Görev: % - %', 
        parent_start_date, parent_end_date, NEW.start_date, NEW.end_date;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Triggers oluştur
CREATE TRIGGER trigger_check_sub_project_date_hierarchy
  BEFORE INSERT OR UPDATE ON sub_project_company_dates
  FOR EACH ROW EXECUTE FUNCTION check_sub_project_date_hierarchy();

CREATE TRIGGER trigger_check_task_date_hierarchy
  BEFORE INSERT OR UPDATE ON task_company_dates
  FOR EACH ROW EXECUTE FUNCTION check_task_date_hierarchy();

-- 4. Ana proje tarihi değiştiğinde alt proje ve görev tarihlerini kontrol et
CREATE OR REPLACE FUNCTION cascade_project_date_changes()
RETURNS TRIGGER AS $$
DECLARE
  affected_sub_projects UUID[];
  affected_tasks UUID[];
BEGIN
  -- Değişen ana proje tarihleri
  IF OLD.start_date != NEW.start_date OR OLD.end_date != NEW.end_date THEN
    
    -- Etkilenen alt projeleri bul
    SELECT ARRAY_AGG(spcd.id)
    INTO affected_sub_projects
    FROM sub_project_company_dates spcd
    JOIN sub_projects sp ON sp.id = spcd.sub_project_id
    WHERE sp.project_id = NEW.project_id 
      AND spcd.company_id = NEW.company_id
      AND (spcd.start_date < NEW.start_date OR spcd.end_date > NEW.end_date);
    
    -- Etkilenen görevleri bul
    SELECT ARRAY_AGG(tcd.id)
    INTO affected_tasks
    FROM task_company_dates tcd
    JOIN tasks t ON t.id = tcd.task_id
    JOIN sub_projects sp ON sp.id = t.sub_project_id
    WHERE sp.project_id = NEW.project_id 
      AND tcd.company_id = NEW.company_id
      AND (tcd.start_date < NEW.start_date OR tcd.end_date > NEW.end_date);
    
    -- Uyarı mesajı (gerçek uygulamada notification sistemi kullanılabilir)
    IF array_length(affected_sub_projects, 1) > 0 OR array_length(affected_tasks, 1) > 0 THEN
      RAISE WARNING 'Ana proje tarihi değişikliği % alt proje ve % görevi etkileyebilir', 
        COALESCE(array_length(affected_sub_projects, 1), 0),
        COALESCE(array_length(affected_tasks, 1), 0);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cascade_project_date_changes
  AFTER UPDATE ON project_company_dates
  FOR EACH ROW EXECUTE FUNCTION cascade_project_date_changes();

-- 5. Alt proje tarihi değiştiğinde görev tarihlerini kontrol et
CREATE OR REPLACE FUNCTION cascade_sub_project_date_changes()
RETURNS TRIGGER AS $$
DECLARE
  affected_tasks UUID[];
BEGIN
  -- Değişen alt proje tarihleri
  IF OLD.start_date != NEW.start_date OR OLD.end_date != NEW.end_date THEN
    
    -- Etkilenen görevleri bul
    SELECT ARRAY_AGG(tcd.id)
    INTO affected_tasks
    FROM task_company_dates tcd
    JOIN tasks t ON t.id = tcd.task_id
    WHERE t.sub_project_id = NEW.sub_project_id 
      AND tcd.company_id = NEW.company_id
      AND (tcd.start_date < NEW.start_date OR tcd.end_date > NEW.end_date);
    
    -- Uyarı mesajı
    IF array_length(affected_tasks, 1) > 0 THEN
      RAISE WARNING 'Alt proje tarihi değişikliği % görevi etkileyebilir', 
        COALESCE(array_length(affected_tasks, 1), 0);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cascade_sub_project_date_changes
  AFTER UPDATE ON sub_project_company_dates
  FOR EACH ROW EXECUTE FUNCTION cascade_sub_project_date_changes();
