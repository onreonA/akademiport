-- Add missing columns to assignment tables
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- 1. project_company_assignments tablosuna assigned_by column'u ekle
ALTER TABLE project_company_assignments 
ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES users(id);

-- 2. sub_project_company_assignments tablosuna assigned_by column'u ekle
ALTER TABLE sub_project_company_assignments 
ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES users(id);

-- 3. Mevcut assignment'lara admin user'ı ata
UPDATE project_company_assignments 
SET assigned_by = 'cd9bf9ec-f2ef-4672-87e4-428fb1b5241e' 
WHERE assigned_by IS NULL;

UPDATE sub_project_company_assignments 
SET assigned_by = 'cd9bf9ec-f2ef-4672-87e4-428fb1b5241e' 
WHERE assigned_by IS NULL;

-- 4. Kontrol sorgusu
SELECT 'Missing columns added successfully' as status;
