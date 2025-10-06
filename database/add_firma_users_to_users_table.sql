-- Add firma users to users table with 'user' role
-- This ensures they can access /firma pages but not /admin pages

INSERT INTO users (email, full_name, role, company_id, created_at, updated_at)
SELECT
    cu.email,
    cu.name as full_name,
    'user' as role,
    cu.company_id,
    cu.created_at,
    NOW() as updated_at
FROM company_users cu
WHERE cu.email IN (
    'info@mundo.com',
    'info@sahbaz.com',
    'info@sarmobi.com'
)
AND NOT EXISTS (
    SELECT 1 FROM users u WHERE u.email = cu.email
);

-- Verify the changes
SELECT
    u.email,
    u.role as users_role,
    cu.role as company_users_role,
    c.name as company_name
FROM users u
LEFT JOIN company_users cu ON u.email = cu.email
LEFT JOIN companies c ON cu.company_id = c.id
WHERE u.email IN (
    'admin@ihracatakademi.com',
    'zarife.erdogan@nsl.com.tr',
    'info@mundo.com',
    'info@sahbaz.com',
    'info@sarmobi.com'
)
ORDER BY u.email;
