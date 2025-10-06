-- Fix firma user roles to 'user' instead of 'admin'
-- This ensures firma users can only access /firma pages, not /admin pages

-- Update users table: Set firma users to 'user' role
UPDATE users
SET role = 'user'
WHERE email IN (
    'info@mundo.com',
    'info@sahbaz.com',
    'info@sarmobi.com'
);

-- Update company_users table: Set firma users to 'operator' role
-- (company_users table only accepts 'admin', 'manager', 'operator' roles)
UPDATE company_users
SET role = 'operator'
WHERE email IN (
    'info@mundo.com',
    'info@sahbaz.com',
    'info@sarmobi.com'
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
