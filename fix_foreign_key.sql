-- company_task_statuses tablosundaki completed_by foreign key'ini düzelt
-- Önce mevcut constraint'i kaldır
ALTER TABLE company_task_statuses 
DROP CONSTRAINT IF EXISTS company_task_statuses_completed_by_fkey;

-- Yeni constraint ekle - company_users tablosuna referans versin
ALTER TABLE company_task_statuses 
ADD CONSTRAINT company_task_statuses_completed_by_fkey 
FOREIGN KEY (completed_by) REFERENCES company_users(id) ON DELETE CASCADE;
