-- Sub-projects tablosuna progress_percentage kolonu ekle
ALTER TABLE sub_projects 
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100);

-- Mevcut alt projeler için progress_percentage değerlerini hesapla
UPDATE sub_projects 
SET progress_percentage = (
  SELECT COALESCE(
    ROUND(
      (COUNT(CASE WHEN t.status = 'Tamamlandı' THEN 1 END)::DECIMAL / NULLIF(COUNT(t.id), 0)) * 100
    ), 0
  )
  FROM tasks t 
  WHERE t.sub_project_id = sub_projects.id
)
WHERE progress_percentage = 0;
