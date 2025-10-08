-- Fix document file types with proper constraint (final version)
-- Migration: 024_fix_document_file_types_final.sql

-- Step 1: Drop existing constraint if it exists
ALTER TABLE documents DROP CONSTRAINT IF EXISTS check_file_type;
ALTER TABLE documents DROP CONSTRAINT IF EXISTS check_file_type_enum;

-- Step 2: Update existing data to uppercase
UPDATE documents 
SET file_type = UPPER(file_type)
WHERE file_type IS NOT NULL;

-- Step 3: Add the new constraint
ALTER TABLE documents 
ADD CONSTRAINT check_file_type_enum 
CHECK (file_type IN ('PDF', 'DOCX', 'DOC', 'PPTX', 'PPT', 'XLSX', 'XLS', 'TXT', 'ZIP'));
