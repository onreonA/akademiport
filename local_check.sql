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
	('c7bed99d-6e10-47d2-98b5-fe90bd7f87af', 'Demo Firma A', 'Tekstil üretimi yapan örnek firma', NULL, NULL, NULL, NULL, NULL, 'Turkey', 'Tekstil', 'medium', 'active', '2025-09-12 09:28:05.499979+00', '2025-09-12 09:28:05.499979+00'),
	('6502df4f-22df-461f-b8e8-91a6ae91471e', 'Demo Firma B', 'Gıda üretimi yapan örnek firma', NULL, NULL, NULL, NULL, NULL, 'Turkey', 'Gıda', 'large', 'active', '2025-09-12 09:28:05.499979+00', '2025-09-12 09:28:05.499979+00'),
	('38ffb901-7591-484c-824d-9a732af2e6c6', 'Demo Firma C', 'Teknoloji çözümleri sunan örnek firma', NULL, NULL, NULL, NULL, NULL, 'Turkey', 'Teknoloji', 'small', 'pending', '2025-09-12 09:28:05.499979+00', '2025-09-12 09:28:05.499979+00');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "email", "full_name", "avatar_url", "role", "company_id", "created_at", "updated_at") VALUES
	('4226f402-a2a5-4814-b4e2-990b43eb08cd', 'admin@ihracatakademi.com', 'Sistem Yöneticisi', NULL, 'admin', NULL, '2025-09-12 09:28:05.499979+00', '2025-09-12 09:28:05.499979+00');


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
	('550e8400-e29b-41d4-a716-446655440001', NULL, 'Tekstil Sektörü Dijital Dönüşüm', 'Tekstil firmalarının e-ihracat sürecine geçişi için kapsamlı danışmanlık projesi', 'Aktif', '2024-01-15', '2024-06-30', 67, NULL, NULL, '2025-09-12 09:28:05.557071+00', '2025-09-12 09:28:05.557071+00', 'B2B'),
	('550e8400-e29b-41d4-a716-446655440002', NULL, 'Gıda Ürünleri Küresel Pazarlama', 'Türk gıda ürünlerinin uluslararası e-ticaret platformlarında satışının artırılması', 'Aktif', '2024-02-01', '2024-08-15', 43, NULL, NULL, '2025-09-12 09:28:05.557071+00', '2025-09-12 09:28:05.557071+00', 'B2C'),
	('550e8400-e29b-41d4-a716-446655440003', NULL, 'Makina Sanayi İhracat Eğitimi', 'Makina ve yedek parça sektöründe e-ihracat kapasitesinin geliştirilmesi', 'Tamamlandı', '2023-10-01', '2024-03-31', 100, NULL, NULL, '2025-09-12 09:28:05.557071+00', '2025-09-12 09:28:05.557071+00', 'B2B');


--
-- Data for Name: company_projects; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."courses" ("id", "title", "description", "thumbnail_url", "video_url", "duration", "category", "level", "is_active", "created_at", "updated_at") VALUES
	('51035a96-cbab-4cca-9c40-ac84ff8d5c1e', 'E-İhracat Temelleri', 'E-ihracatın temel kavramları ve başlangıç rehberi', NULL, NULL, 120, 'Temel Eğitim', 'beginner', true, '2025-09-12 09:28:05.499979+00', '2025-09-12 09:28:05.499979+00'),
	('304c3345-5022-44fe-bb31-c3618a28e4af', 'Pazaryeri Entegrasyonu', 'Amazon, Alibaba gibi pazaryerlerinde satış stratejileri', NULL, NULL, 180, 'Pazaryeri', 'intermediate', true, '2025-09-12 09:28:05.499979+00', '2025-09-12 09:28:05.499979+00'),
	('99f93957-9faa-4e58-8896-a4d37f51f18a', 'Dijital Pazarlama', 'Sosyal medya ve dijital pazarlama teknikleri', NULL, NULL, 150, 'Pazarlama', 'intermediate', true, '2025-09-12 09:28:05.499979+00', '2025-09-12 09:28:05.499979+00'),
	('0b97f90c-a5f4-43f7-9320-e01df48ad961', 'Uluslararası Lojistik', 'İhracat lojistiği ve gümrük süreçleri', NULL, NULL, 200, 'Lojistik', 'advanced', true, '2025-09-12 09:28:05.499979+00', '2025-09-12 09:28:05.499979+00');


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
	('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Platform Analizi ve Uyumluluk Kontrolü', 'Firmanın mevcut sistemlerinin e-ihracat platformlarıyla uyumluluğunun analiz edilmesi', '2024-01-15', '2024-02-15', 100, '2025-09-12 09:28:05.557071+00', '2025-09-12 09:28:05.557071+00', 'Tamamlandı'),
	('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'API Entegrasyonu Dokümantasyonu', 'E-ihracat platformu API''lerinin detaylı dokümantasyonunun incelenmesi', '2024-02-01', '2024-03-01', 100, '2025-09-12 09:28:05.557071+00', '2025-09-12 09:28:05.557071+00', 'Tamamlandı'),
	('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Test Ortamı Kurulumu', 'Entegrasyon testleri için gerekli test ortamının kurulması', '2024-03-01', '2024-03-15', 60, '2025-09-12 09:28:05.557071+00', '2025-09-12 09:28:05.557071+00', 'Aktif');


--
-- Data for Name: sub_project_company_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tasks" ("id", "project_id", "sub_project_id", "title", "description", "status", "priority", "start_date", "end_date", "due_date", "assigned_to", "progress", "created_at", "updated_at", "notes", "attachments", "completed_at") VALUES
	('770e8400-e29b-41d4-a716-446655440001', NULL, '660e8400-e29b-41d4-a716-446655440001', 'Sistem Analizi Raporu', 'Mevcut sistemlerin analiz edilmesi ve raporlanması', 'Tamamlandı', 'Yüksek', NULL, NULL, '2024-02-10 00:00:00+00', NULL, 0, '2025-09-12 09:28:05.557071+00', '2025-09-12 09:28:05.557071+00', 'Sistem analizi tamamlandı. ERP entegrasyonu için ek modül gerekiyor.', NULL, NULL),
	('770e8400-e29b-41d4-a716-446655440002', NULL, '660e8400-e29b-41d4-a716-446655440002', 'API Dokümantasyonu İnceleme', 'Platform API dokümantasyonunun detaylı incelenmesi', 'Tamamlandı', 'Orta', NULL, NULL, '2024-02-25 00:00:00+00', NULL, 0, '2025-09-12 09:28:05.557071+00', '2025-09-12 09:28:05.557071+00', 'API dokümantasyonu incelendi ve entegrasyon planı hazırlandı.', NULL, NULL),
	('770e8400-e29b-41d4-a716-446655440003', NULL, '660e8400-e29b-41d4-a716-446655440003', 'Test Ortamı Kurulumu', 'Gerekli test ortamının kurulması', 'İncelemede', 'Yüksek', NULL, NULL, '2024-03-10 00:00:00+00', NULL, 0, '2025-09-12 09:28:05.557071+00', '2025-09-12 09:28:05.557071+00', 'Test ortamı kuruldu, ilk testler yapıldı. Bazı hatalar tespit edildi.', NULL, NULL);


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
