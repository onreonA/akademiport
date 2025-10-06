-- Add separate message fields to appointments table
-- This separates company messages from admin/consultant messages

-- Add new columns to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS company_notes TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Update existing attendance_notes to admin_notes for existing records
-- (This preserves existing admin notes)
UPDATE appointments 
SET admin_notes = attendance_notes 
WHERE attendance_notes IS NOT NULL;

-- Add comments to clarify the purpose of each field
COMMENT ON COLUMN appointments.company_notes IS 'Notes added by the company user';
COMMENT ON COLUMN appointments.admin_notes IS 'Notes added by admin or consultant (previously attendance_notes)';
COMMENT ON COLUMN appointments.attendance_notes IS 'Legacy field - use admin_notes instead';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_company_notes ON appointments(company_notes) WHERE company_notes IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_admin_notes ON appointments(admin_notes) WHERE admin_notes IS NOT NULL;
