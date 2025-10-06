-- Görev durumunu kontrol et
SELECT 
    cts.*,
    t.title as task_title,
    c.name as company_name
FROM company_task_statuses cts
JOIN tasks t ON t.id = cts.task_id
JOIN companies c ON c.id = cts.company_id
WHERE cts.task_id = 'b35aacd9-0e30-4963-b403-edd588aa50ad'
AND cts.company_id = '6fcc9e92-4169-4b06-9c2f-a8c6cc284d73';
