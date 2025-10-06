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
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."companies" ("id", "name", "description", "logo_url", "website", "phone", "address", "city", "country", "industry", "size", "status", "created_at", "updated_at") VALUES
	('fd3bcdf5-1c9f-42df-ace9-17ec304c9c1d', 'Demo Firma A', 'Tekstil üretimi yapan örnek firma', NULL, NULL, NULL, NULL, NULL, 'Turkey', 'Tekstil', 'medium', 'active', '2025-09-12 08:00:15.19694+00', '2025-09-12 08:00:15.19694+00'),
	('0e5cc85b-7011-44a8-84eb-0bd1b66ac72f', 'Demo Firma B', 'Gıda üretimi yapan örnek firma', NULL, NULL, NULL, NULL, NULL, 'Turkey', 'Gıda', 'large', 'active', '2025-09-12 08:00:15.19694+00', '2025-09-12 08:00:15.19694+00'),
	('e676c295-82c3-4e4c-9617-b4df6c052c84', 'Demo Firma C', 'Teknoloji çözümleri sunan örnek firma', NULL, NULL, NULL, NULL, NULL, 'Turkey', 'Teknoloji', 'small', 'pending', '2025-09-12 08:00:15.19694+00', '2025-09-12 08:00:15.19694+00'),
	('a35c770c-daeb-4984-be70-e7df07460c5a', 'Test Firma 1', NULL, NULL, NULL, '+90 555 123 4567', 'Test Adres 1', 'İstanbul', 'Turkey', 'Teknoloji', 'medium', 'active', '2025-09-12 08:00:16.625797+00', '2025-09-12 08:00:16.625797+00'),
	('c4074384-1a4f-43b8-a411-5219f7848629', 'Test Firma 2', NULL, NULL, NULL, '+90 555 234 5678', 'Test Adres 2', 'Ankara', 'Turkey', 'İmalat', 'large', 'active', '2025-09-12 08:00:16.625797+00', '2025-09-12 08:00:16.625797+00');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "email", "full_name", "avatar_url", "role", "company_id", "created_at", "updated_at") VALUES
	('b951774f-59b1-4a2c-b013-528067f239c9', 'admin@ihracatakademi.com', 'Sistem Yöneticisi', NULL, 'admin', NULL, '2025-09-12 08:00:15.19694+00', '2025-09-12 08:00:15.19694+00');


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."courses" ("id", "title", "description", "thumbnail_url", "video_url", "duration", "category", "level", "is_active", "created_at", "updated_at") VALUES
	('34b5d9b7-a62d-4c95-9406-496ed323065b', 'E-İhracat Temelleri', 'E-ihracatın temel kavramları ve başlangıç rehberi', NULL, NULL, 120, 'Temel Eğitim', 'beginner', true, '2025-09-12 08:00:15.19694+00', '2025-09-12 08:00:15.19694+00'),
	('686155af-8975-4117-af53-18d249898bae', 'Pazaryeri Entegrasyonu', 'Amazon, Alibaba gibi pazaryerlerinde satış stratejileri', NULL, NULL, 180, 'Pazaryeri', 'intermediate', true, '2025-09-12 08:00:15.19694+00', '2025-09-12 08:00:15.19694+00'),
	('27554f26-1f3c-4606-8fda-71c26741699d', 'Dijital Pazarlama', 'Sosyal medya ve dijital pazarlama teknikleri', NULL, NULL, 150, 'Pazarlama', 'intermediate', true, '2025-09-12 08:00:15.19694+00', '2025-09-12 08:00:15.19694+00'),
	('1c449247-ec79-4e8d-8aa1-76b1793dc4bf', 'Uluslararası Lojistik', 'İhracat lojistiği ve gümrük süreçleri', NULL, NULL, 200, 'Lojistik', 'advanced', true, '2025-09-12 08:00:15.19694+00', '2025-09-12 08:00:15.19694+00');


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
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."projects" ("id", "company_id", "name", "description", "status", "start_date", "end_date", "progress", "consultant_id", "admin_note", "created_at", "updated_at") VALUES
	('bc93174e-2743-4b68-ab8e-fc1056300ef0', 'a35c770c-daeb-4984-be70-e7df07460c5a', 'E-ticaret Platformu Geliştirme', 'Modern e-ticaret platformu geliştirme projesi', 'active', '2024-01-01', '2024-12-31', 25, NULL, 'Bu proje e-ticaret platformu geliştirme için oluşturulmuştur.', '2025-09-12 08:00:16.625797+00', '2025-09-12 08:00:16.625797+00'),
	('871bc1e0-5a60-4b0b-81ff-46e3714c683e', 'c4074384-1a4f-43b8-a411-5219f7848629', 'Mobil Uygulama Projesi', 'iOS ve Android mobil uygulama geliştirme', 'planning', '2024-02-01', '2024-11-30', 0, NULL, 'Mobil uygulama geliştirme projesi.', '2025-09-12 08:00:16.625797+00', '2025-09-12 08:00:16.625797+00');


--
-- Data for Name: project_company_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: sub_projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."sub_projects" ("id", "project_id", "name", "description", "status", "start_date", "end_date", "progress", "created_at", "updated_at") VALUES
	('1764c83b-427b-40b6-a6c0-3c3fc51a46c2', 'bc93174e-2743-4b68-ab8e-fc1056300ef0', 'Frontend Geliştirme', 'React.js ile frontend geliştirme', 'active', '2024-01-15', '2024-06-30', 40, '2025-09-12 08:00:16.625797+00', '2025-09-12 08:00:16.625797+00'),
	('2340d444-15e2-4a67-a11f-5dca83373b4f', 'bc93174e-2743-4b68-ab8e-fc1056300ef0', 'Backend Geliştirme', 'Node.js ile backend API geliştirme', 'planning', '2024-02-01', '2024-08-31', 10, '2025-09-12 08:00:16.625797+00', '2025-09-12 08:00:16.625797+00');


--
-- Data for Name: sub_project_company_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tasks" ("id", "project_id", "sub_project_id", "title", "description", "status", "priority", "start_date", "end_date", "due_date", "assigned_to", "progress", "created_at", "updated_at") VALUES
	('dc774aa6-1215-42c2-bd1b-95996166eb4c', 'bc93174e-2743-4b68-ab8e-fc1056300ef0', '1764c83b-427b-40b6-a6c0-3c3fc51a46c2', 'Ana Sayfa Tasarımı', 'E-ticaret sitesi ana sayfa tasarımı ve geliştirme', 'pending', 'high', '2024-01-20 00:00:00+00', '2024-02-15 00:00:00+00', NULL, NULL, 0, '2025-09-12 08:00:16.625797+00', '2025-09-12 08:00:16.625797+00'),
	('10907400-e01a-4426-bf6b-296576422bb4', 'bc93174e-2743-4b68-ab8e-fc1056300ef0', '1764c83b-427b-40b6-a6c0-3c3fc51a46c2', 'Ürün Listesi Sayfası', 'Ürün listeleme ve filtreleme sayfası', 'pending', 'medium', '2024-02-01 00:00:00+00', '2024-02-28 00:00:00+00', NULL, NULL, 0, '2025-09-12 08:00:16.625797+00', '2025-09-12 08:00:16.625797+00');


--
-- Data for Name: task_company_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- PostgreSQL database dump complete
--

RESET ALL;
