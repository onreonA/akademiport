-- Check if firma users exist in users table
SELECT
    email,
    role,
    company_id,
    created_at
FROM users
WHERE email IN (
    'info@mundo.com',
    'info@sahbaz.com',
    'info@sarmobi.com'
)
ORDER BY email;

-- Check if firma users exist in company_users table
SELECT
    email,
    role,
    company_id,
    status,
    created_at
FROM company_users
WHERE email IN (
    'info@mundo.com',
    'info@sahbaz.com',
    'info@sarmobi.com'
)
ORDER BY email;

-- Check all users with 'info@' emails
SELECT
    email,
    role,
    company_id,
    created_at
FROM users
WHERE email LIKE 'info@%'
ORDER BY email;
