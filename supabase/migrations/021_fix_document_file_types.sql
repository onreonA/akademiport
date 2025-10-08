-- Fix document file types with proper enum
-- Migration: 021_fix_document_file_types.sql

-- Create file type enum
CREATE TYPE document_file_type AS ENUM (
    'PDF',
    'DOCX', 
    'DOC',
    'PPTX',
    'PPT',
    'XLSX',
    'XLS',
    'TXT',
    'ZIP'
);

-- Add check constraint to documents table
ALTER TABLE documents 
ADD CONSTRAINT check_file_type_enum 
CHECK (file_type IN ('PDF', 'DOCX', 'DOC', 'PPTX', 'PPT', 'XLSX', 'XLS', 'TXT', 'ZIP'));

-- Update existing documents to use proper file types
UPDATE documents 
SET file_type = UPPER(file_type)
WHERE file_type IS NOT NULL;
