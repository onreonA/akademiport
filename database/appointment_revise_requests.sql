-- Appointment Revise Requests Table
CREATE TABLE IF NOT EXISTS appointment_revise_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    consultant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_date DATE NOT NULL,
    original_time TIME NOT NULL,
    requested_date DATE NOT NULL,
    requested_time TIME NOT NULL,
    reason TEXT NOT NULL,
    additional_notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_by TEXT NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointment_revise_requests_appointment_id ON appointment_revise_requests(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_revise_requests_company_id ON appointment_revise_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_appointment_revise_requests_consultant_id ON appointment_revise_requests(consultant_id);
CREATE INDEX IF NOT EXISTS idx_appointment_revise_requests_status ON appointment_revise_requests(status);
CREATE INDEX IF NOT EXISTS idx_appointment_revise_requests_requested_at ON appointment_revise_requests(requested_at);

-- RLS Policies
ALTER TABLE appointment_revise_requests ENABLE ROW LEVEL SECURITY;

-- Companies can view their own revise requests
CREATE POLICY "Companies can view their own revise requests" ON appointment_revise_requests
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM company_users WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Companies can create revise requests for their appointments
CREATE POLICY "Companies can create revise requests" ON appointment_revise_requests
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM company_users WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Admins can view all revise requests
CREATE POLICY "Admins can view all revise requests" ON appointment_revise_requests
    FOR SELECT USING (
        auth.jwt() ->> 'email' = 'admin@ihracatakademi.com'
    );

-- Admins can update revise requests
CREATE POLICY "Admins can update revise requests" ON appointment_revise_requests
    FOR UPDATE USING (
        auth.jwt() ->> 'email' = 'admin@ihracatakademi.com'
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_appointment_revise_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_appointment_revise_requests_updated_at
    BEFORE UPDATE ON appointment_revise_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_appointment_revise_requests_updated_at();
