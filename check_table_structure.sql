-- company_task_statuses tablosunun yapısını kontrol et
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'company_task_statuses' 
ORDER BY ordinal_position;

-- Tablo var mı kontrol et
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'company_task_statuses'
);

-- Constraints kontrol et
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint 
WHERE conrelid = 'public.company_task_statuses'::regclass;
