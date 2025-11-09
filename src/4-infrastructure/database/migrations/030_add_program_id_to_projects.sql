-- ============================================================================
-- ADD PROGRAM_ID TO PROJECTS TABLE
-- ============================================================================
-- Bu migration proje yönetimi matris sisteminin performansını artırmak için
-- projects tablosuna program_id kolonu ekler.
-- ============================================================================

-- 1. program_id kolonunu ekle
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES programs(id) ON DELETE SET NULL;

-- 2. İndeks ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_projects_program_id ON projects(program_id);

-- 3. Mevcut projeler için program_id'yi doldur
-- Consultant'ın programlarından birini seç (eğer varsa)
UPDATE projects p
SET program_id = (
  SELECT up.program_id
  FROM user_programs up
  WHERE up.user_id = p.consultant_id
    AND up.is_active = true
    AND up.role_in_program = 'consultant'
  LIMIT 1
)
WHERE p.program_id IS NULL
  AND p.consultant_id IS NOT NULL;

-- 4. Company üzerinden program_id'yi doldur (eğer consultant yoksa)
UPDATE projects p
SET program_id = (
  SELECT c.program_id
  FROM companies c
  WHERE c.id = p.company_id
)
WHERE p.program_id IS NULL
  AND p.company_id IS NOT NULL
  AND p.consultant_id IS NULL;

-- 5. Yorum ekle
COMMENT ON COLUMN projects.program_id IS 'Projenin bağlı olduğu program. Matris sisteminde firmaları bulmak için kullanılır.';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

