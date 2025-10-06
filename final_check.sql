SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."companies" ("id", "name", "description", "logo_url", "website", "phone", "address", "city", "country", "industry", "size", "status", "created_at", "updated_at") VALUES
	('60f57db6-ec3c-4ce4-a1b7-cc7bb66d305e', 'Demo Firma A', 'Tekstil üretimi yapan örnek firma', NULL, NULL, NULL, NULL, NULL, 'Turkey', 'Tekstil', 'medium', 'active', '2025-09-12 09:43:58.827382+00', '2025-09-12 09:43:58.827382+00'),
	('f1d09972-d93f-4ac7-8bc0-670a9b105b2e', 'Demo Firma B', 'Gıda üretimi yapan örnek firma', NULL, NULL, NULL, NULL, NULL, 'Turkey', 'Gıda', 'large', 'active', '2025-09-12 09:43:58.827382+00', '2025-09-12 09:43:58.827382+00'),
	('140bc172-ab96-4ee3-83cc-df98dab8f311', 'Demo Firma C', 'Teknoloji çözümleri sunan örnek firma', NULL, NULL, NULL, NULL, NULL, 'Turkey', 'Teknoloji', 'small', 'pending', '2025-09-12 09:43:58.827382+00', '2025-09-12 09:43:58.827382+00'),
	('94daabf4-fda1-44d5-8f0c-8fb034d6ca77', 'Test Firma 1', NULL, NULL, NULL, '+90 555 123 4567', 'Test Adres 1', 'İstanbul', 'Turkey', 'Teknoloji', 'medium', 'active', '2025-09-12 09:43:59.009655+00', '2025-09-12 09:43:59.009655+00'),
	('bd238a7b-2950-4f06-8fb1-49f065840ab4', 'Test Firma 2', NULL, NULL, NULL, '+90 555 234 5678', 'Test Adres 2', 'Ankara', 'Turkey', 'İmalat', 'large', 'active', '2025-09-12 09:43:59.009655+00', '2025-09-12 09:43:59.009655+00');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "email", "full_name", "avatar_url", "role", "company_id", "created_at", "updated_at") VALUES
	('99e72ade-603c-44ab-890b-22289243b5f8', 'admin@ihracatakademi.com', 'Sistem Yöneticisi', NULL, 'admin', NULL, '2025-09-12 09:43:58.827382+00', '2025-09-12 09:43:58.827382+00');


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."projects" ("id", "company_id", "name", "description", "status", "start_date", "end_date", "progress", "consultant_id", "admin_note", "created_at", "updated_at", "type") VALUES
	('550e8400-e29b-41d4-a716-446655440001', NULL, 'Tekstil Sektörü Dijital Dönüşüm', 'Tekstil firmalarının e-ihracat sürecine geçişi için kapsamlı danışmanlık projesi', 'Aktif', '2024-01-15', '2024-06-30', 67, NULL, NULL, '2025-09-12 09:43:58.908842+00', '2025-09-12 09:43:58.908842+00', 'B2B'),
	('550e8400-e29b-41d4-a716-446655440002', NULL, 'Gıda Ürünleri Küresel Pazarlama', 'Türk gıda ürünlerinin uluslararası e-ticaret platformlarında satışının artırılması', 'Aktif', '2024-02-01', '2024-08-15', 43, NULL, NULL, '2025-09-12 09:43:58.908842+00', '2025-09-12 09:43:58.908842+00', 'B2C'),
	('550e8400-e29b-41d4-a716-446655440003', NULL, 'Makina Sanayi İhracat Eğitimi', 'Makina ve yedek parça sektöründe e-ihracat kapasitesinin geliştirilmesi', 'Tamamlandı', '2023-10-01', '2024-03-31', 100, NULL, NULL, '2025-09-12 09:43:58.908842+00', '2025-09-12 09:43:58.908842+00', 'B2B'),
	('1e94712d-b47b-4a8e-8adc-1e7deec07ae9', '94daabf4-fda1-44d5-8f0c-8fb034d6ca77', 'E-ticaret Platformu Geliştirme', 'Modern e-ticaret platformu geliştirme projesi', 'Aktif', '2024-01-01', '2024-12-31', 25, NULL, 'Bu proje e-ticaret platformu geliştirme için oluşturulmuştur.', '2025-09-12 09:43:59.009655+00', '2025-09-12 09:43:59.009655+00', 'B2B'),
	('f96d2d4c-8824-4045-bfca-c886be813155', 'bd238a7b-2950-4f06-8fb1-49f065840ab4', 'Mobil Uygulama Projesi', 'iOS ve Android mobil uygulama geliştirme', 'Planlandı', '2024-02-01', '2024-11-30', 0, NULL, 'Mobil uygulama geliştirme projesi.', '2025-09-12 09:43:59.009655+00', '2025-09-12 09:43:59.009655+00', 'B2B');


--
-- Data for Name: company_projects; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."courses" ("id", "title", "description", "thumbnail_url", "video_url", "duration", "category", "level", "is_active", "created_at", "updated_at") VALUES
	('8cd40008-c3e7-4d77-86b5-2d8dad9641a8', 'E-İhracat Temelleri', 'E-ihracatın temel kavramları ve başlangıç rehberi', NULL, NULL, 120, 'Temel Eğitim', 'beginner', true, '2025-09-12 09:43:58.827382+00', '2025-09-12 09:43:58.827382+00'),
	('8b80f44d-ab3e-4842-9789-9ff580b2fbbd', 'Pazaryeri Entegrasyonu', 'Amazon, Alibaba gibi pazaryerlerinde satış stratejileri', NULL, NULL, 180, 'Pazaryeri', 'intermediate', true, '2025-09-12 09:43:58.827382+00', '2025-09-12 09:43:58.827382+00'),
	('d61aff00-9cbc-45ea-bcb9-7a71ff72050b', 'Dijital Pazarlama', 'Sosyal medya ve dijital pazarlama teknikleri', NULL, NULL, 150, 'Pazarlama', 'intermediate', true, '2025-09-12 09:43:58.827382+00', '2025-09-12 09:43:58.827382+00'),
	('da99ebb9-b74d-49d6-ba8e-dfe9bf9b0e12', 'Uluslararası Lojistik', 'İhracat lojistiği ve gümrük süreçleri', NULL, NULL, 200, 'Lojistik', 'advanced', true, '2025-09-12 09:43:58.827382+00', '2025-09-12 09:43:58.827382+00');


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: event_registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: forum_topics; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: forum_replies; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: news; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: project_company_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: sub_projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."sub_projects" ("id", "project_id", "name", "description", "start_date", "end_date", "progress", "created_at", "updated_at", "status") VALUES
	('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Platform Analizi ve Uyumluluk Kontrolü', 'Firmanın mevcut sistemlerinin e-ihracat platformlarıyla uyumluluğunun analiz edilmesi', '2024-01-15', '2024-02-15', 100, '2025-09-12 09:43:58.908842+00', '2025-09-12 09:43:58.908842+00', 'Tamamlandı'),
	('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'API Entegrasyonu Dokümantasyonu', 'E-ihracat platformu API''lerinin detaylı dokümantasyonunun incelenmesi', '2024-02-01', '2024-03-01', 100, '2025-09-12 09:43:58.908842+00', '2025-09-12 09:43:58.908842+00', 'Tamamlandı'),
	('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Test Ortamı Kurulumu', 'Entegrasyon testleri için gerekli test ortamının kurulması', '2024-03-01', '2024-03-15', 60, '2025-09-12 09:43:58.908842+00', '2025-09-12 09:43:58.908842+00', 'Aktif'),
	('4c68c918-0070-4cac-b826-dc281242cb98', '1e94712d-b47b-4a8e-8adc-1e7deec07ae9', 'Frontend Geliştirme', 'React.js ile frontend geliştirme', '2024-01-15', '2024-06-30', 40, '2025-09-12 09:43:59.009655+00', '2025-09-12 09:43:59.009655+00', 'Aktif'),
	('2e70568e-fab7-4c99-ba11-cfb69160d906', '1e94712d-b47b-4a8e-8adc-1e7deec07ae9', 'Backend Geliştirme', 'Node.js ile backend API geliştirme', '2024-02-01', '2024-08-31', 10, '2025-09-12 09:43:59.009655+00', '2025-09-12 09:43:59.009655+00', 'Planlandı');


--
-- Data for Name: sub_project_company_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tasks" ("id", "project_id", "sub_project_id", "title", "description", "status", "priority", "start_date", "end_date", "due_date", "assigned_to", "progress", "created_at", "updated_at", "notes", "attachments", "completed_at") VALUES
	('770e8400-e29b-41d4-a716-446655440001', NULL, '660e8400-e29b-41d4-a716-446655440001', 'Sistem Analizi Raporu', 'Mevcut sistemlerin analiz edilmesi ve raporlanması', 'Tamamlandı', 'Yüksek', NULL, NULL, '2024-02-10 00:00:00+00', NULL, 0, '2025-09-12 09:43:58.908842+00', '2025-09-12 09:43:58.908842+00', 'Sistem analizi tamamlandı. ERP entegrasyonu için ek modül gerekiyor.', NULL, NULL),
	('770e8400-e29b-41d4-a716-446655440002', NULL, '660e8400-e29b-41d4-a716-446655440002', 'API Dokümantasyonu İnceleme', 'Platform API dokümantasyonunun detaylı incelenmesi', 'Tamamlandı', 'Orta', NULL, NULL, '2024-02-25 00:00:00+00', NULL, 0, '2025-09-12 09:43:58.908842+00', '2025-09-12 09:43:58.908842+00', 'API dokümantasyonu incelendi ve entegrasyon planı hazırlandı.', NULL, NULL),
	('770e8400-e29b-41d4-a716-446655440003', NULL, '660e8400-e29b-41d4-a716-446655440003', 'Test Ortamı Kurulumu', 'Gerekli test ortamının kurulması', 'İncelemede', 'Yüksek', NULL, NULL, '2024-03-10 00:00:00+00', NULL, 0, '2025-09-12 09:43:58.908842+00', '2025-09-12 09:43:58.908842+00', 'Test ortamı kuruldu, ilk testler yapıldı. Bazı hatalar tespit edildi.', NULL, NULL),
	('5d417733-ec3e-43cf-be2b-fbac4919fec8', '1e94712d-b47b-4a8e-8adc-1e7deec07ae9', '4c68c918-0070-4cac-b826-dc281242cb98', 'Ana Sayfa Tasarımı', 'E-ticaret sitesi ana sayfa tasarımı ve geliştirme', 'Bekliyor', 'Yüksek', '2024-01-20 00:00:00+00', '2024-02-15 00:00:00+00', NULL, NULL, 0, '2025-09-12 09:43:59.009655+00', '2025-09-12 09:43:59.009655+00', NULL, NULL, NULL),
	('4465b0f0-91ef-44c2-9ee4-4a83c74371e0', '1e94712d-b47b-4a8e-8adc-1e7deec07ae9', '4c68c918-0070-4cac-b826-dc281242cb98', 'Ürün Listesi Sayfası', 'Ürün listeleme ve filtreleme sayfası', 'Bekliyor', 'Orta', '2024-02-01 00:00:00+00', '2024-02-28 00:00:00+00', NULL, NULL, 0, '2025-09-12 09:43:59.009655+00', '2025-09-12 09:43:59.009655+00', NULL, NULL, NULL);


--
-- Data for Name: task_company_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
