-- Orijinal veriyi geri getir
-- Bu dosya orijinal database verilerinizi geri yükler

-- Önce mevcut veriyi temizle
DELETE FROM tasks WHERE id IS NOT NULL;
DELETE FROM sub_projects WHERE id IS NOT NULL;
DELETE FROM projects WHERE id IS NOT NULL;
DELETE FROM companies WHERE id IS NOT NULL;

-- Orijinal companies verilerini ekle
INSERT INTO companies (id, name, phone, address, city, industry, size, status) VALUES
('a35c770c-daeb-4984-be70-e7df07460c5a', 'Mundo Teknoloji', '+90 555 123 4567', 'Teknoloji Mahallesi 123', 'İstanbul', 'Teknoloji', 'medium', 'active'),
('c4074384-1a4f-43b8-a411-5219f7848629', 'İnovasyon A.Ş.', '+90 555 234 5678', 'İnovasyon Caddesi 456', 'Ankara', 'Yazılım', 'large', 'active');

-- Orijinal projects verilerini ekle
INSERT INTO projects (id, company_id, name, description, status, start_date, end_date, progress, consultant_id, admin_note, created_at, updated_at) VALUES
('bc93174e-2743-4b68-ab8e-fc1056300ef0', 'a35c770c-daeb-4984-be70-e7df07460c5a', 'E-ticaret Platformu Geliştirme', 'Modern e-ticaret platformu geliştirme projesi', 'Aktif', '2024-01-01', '2024-12-31', 25, NULL, 'Bu proje e-ticaret platformu geliştirme için oluşturulmuştur.', '2025-09-12 08:00:16.625797+00', '2025-09-12 08:00:16.625797+00'),
('871bc1e0-5a60-4b0b-81ff-46e3714c683e', 'c4074384-1a4f-43b8-a411-5219f7848629', 'Mobil Uygulama Projesi', 'iOS ve Android mobil uygulama geliştirme', 'Planlandı', '2024-02-01', '2024-11-30', 0, NULL, 'Mobil uygulama geliştirme projesi.', '2025-09-12 08:00:16.625797+00', '2025-09-12 08:00:16.625797+00');

-- Orijinal sub_projects verilerini ekle
INSERT INTO sub_projects (id, project_id, name, description, start_date, end_date, progress, created_at, updated_at, status) VALUES
('1764c83b-427b-40b6-a6c0-3c3fc51a46c2', 'bc93174e-2743-4b68-ab8e-fc1056300ef0', 'Frontend Geliştirme', 'React.js ile frontend geliştirme', '2024-01-15', '2024-06-30', 40, '2025-09-12 08:00:16.625797+00', '2025-09-12 08:00:16.625797+00', 'Aktif'),
('2340d444-15e2-4a67-a11f-5dca83373b4f', 'bc93174e-2743-4b68-ab8e-fc1056300ef0', 'Backend Geliştirme', 'Node.js ile backend API geliştirme', '2024-02-01', '2024-08-31', 10, '2025-09-12 08:00:16.625797+00', '2025-09-12 08:00:16.625797+00', 'Planlandı');
