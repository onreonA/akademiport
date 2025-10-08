-- Fix document file types with proper constraint (corrected version)
-- Migration: 023_fix_document_file_types_corrected.sql

-- First, update existing data to uppercase
UPDATE documents 
SET file_type = UPPER(file_type)
WHERE file_type IS NOT NULL;

-- Now add the constraint
ALTER TABLE documents 
ADD CONSTRAINT check_file_type_enum 
CHECK (file_type IN ('PDF', 'DOCX', 'DOC', 'PPTX', 'PPT', 'XLSX', 'XLS', 'TXT', 'ZIP'));
