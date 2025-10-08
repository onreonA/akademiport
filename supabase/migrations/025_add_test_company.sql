-- Add test company for document assignment testing
-- Migration: 025_add_test_company.sql

-- Insert test company
INSERT INTO companies (
    id,
    name,
    email,
    phone,
    address,
    website,
    description,
    status,
    created_at,
    updated_at
) VALUES (
    'mundo-company-test-id',
    'Mundo Test Company',
    'info@mundo.com',
    '+90 555 123 4567',
    'Test Address, Istanbul, Turkey',
    'https://mundo-test.com',
    'Test company for document assignment',
    'active',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert company user
INSERT INTO company_users (
    id,
    company_id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    status,
    created_at,
    updated_at
) VALUES (
    'mundo-user-test-id',
    'mundo-company-test-id',
    'info@mundo.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: 123456
    'Mundo',
    'Test User',
    'admin',
    'active',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    company_id = EXCLUDED.company_id,
    updated_at = NOW();
