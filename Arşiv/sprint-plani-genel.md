# 🚀 AKADEMİ PORT - GENEL SPRINT PLANI

**Proje Başlangıç:** 28 Ekim 2025  
**Tahmini Tamamlanma:** Mart-Nisan 2026 (18-22 hafta)  
**Toplam Sprint:** 23  
**Metodoloji:** Agile + Vertical Slice Architecture

---

## 📊 SPRINT DURUMU

| Sprint   | Durum        | Başlangıç | Bitiş | Süre    |
| -------- | ------------ | --------- | ----- | ------- |
| Sprint 1 | ⏳ Hazır     | -         | -     | 1 hafta |
| Sprint 2 | 📋 Planlandı | -         | -     | 1 hafta |
| Sprint 3 | 📋 Planlandı | -         | -     | 1 hafta |
| ...      | ...          | ...       | ...   | ...     |

**Gösterim:**

- ⏳ Hazır (Başlamaya hazır)
- 🏃 Devam Ediyor
- ✅ Tamamlandı
- 🔄 Review
- ⚠️ Bloke
- 📋 Planlandı

---

## 🎯 FAZ 1: TEMEL ALTYAPI (2-3 Hafta)

### Sprint 1: Proje Kurulumu (1 hafta)

**Hedef:** Çalışan boş proje + Design System temeli

**Görevler:**

- Next.js 15 + TypeScript kurulumu
- Tailwind CSS + Shadcn/ui kurulumu
- 6 katmanlı klasör yapısı oluşturma
- ESLint + Prettier konfigürasyonu
- Git repository setup
- Storybook kurulumu
- Design tokens (colors, typography, spacing)

**Çıktılar:**

- ✅ Çalışan Next.js projesi
- ✅ Klasör yapısı hazır
- ✅ Design tokens tanımlandı
- ✅ Storybook çalışıyor
- ✅ Git repository hazır

**Kabul Kriterleri:**

- `npm run dev` çalışıyor
- `npm run storybook` çalışıyor
- Klasör yapısı dokümana uygun
- Design tokens kullanılabilir

**Bağımlılıklar:** Yok

**Detaylı Plan:** `sprint-detaylari/sprint-01-proje-kurulumu.md`

---

### Sprint 2: Database & Auth (1 hafta)

**Hedef:** Supabase + Authentication sistemi çalışıyor

**Görevler:**

- Supabase projesi oluşturma
- Database schema tasarımı (tüm tablolar)
- Migration dosyaları (programs, users, companies, etc.)
- Seed data hazırlama
- Authentication sistemi (JWT + Zustand)
- Role-based middleware
- API route structure

**Çıktılar:**

- ✅ Supabase projesi hazır
- ✅ Tüm tablolar oluşturuldu
- ✅ Login/Logout çalışıyor
- ✅ Role-based routing çalışıyor
- ✅ Middleware koruma aktif

**Kabul Kriterleri:**

- Login yapılabiliyor
- Roller kontrol ediliyor
- Database'e bağlanılıyor
- Migration'lar çalışıyor

**Bağımlılıklar:** Sprint 1

**Detaylı Plan:** `sprint-detaylari/sprint-02-database-auth.md`

---

### Sprint 3: UI Foundation (1 hafta)

**Hedef:** Atomic Design System + Layout'lar hazır

**Görevler:**

- Atomic components (Button, Input, Badge, Avatar, etc.)
- Molecule components (FormField, Card, Modal, etc.)
- Organism components (Header, Sidebar, DataTable)
- Layout templates (DashboardLayout, AuthLayout, PublicLayout)
- Dark mode setup
- Storybook documentation
- Accessibility testing (WCAG 2.1 AA)

**Çıktılar:**

- ✅ 20+ atom component
- ✅ 10+ molecule component
- ✅ 5+ organism component
- ✅ 3 layout template
- ✅ Dark mode çalışıyor
- ✅ Storybook'ta dokümante edildi

**Kabul Kriterleri:**

- Tüm componentler Storybook'ta
- Dark mode toggle çalışıyor
- Accessibility testleri geçiyor
- Responsive tasarım

**Bağımlılıklar:** Sprint 1

**Detaylı Plan:** `sprint-detaylari/sprint-03-ui-foundation.md`

---

## 🎯 FAZ 2: CORE MODULES (3-4 Hafta)

### Sprint 4: Program Yönetimi (1 hafta)

**Hedef:** Program CRUD + Master Admin paneli çalışıyor

**Görevler:**

- Program entity + repository
- Program use cases (Create, Update, Delete, Get)
- Program API routes
- Master Admin: Program dashboard
- Master Admin: Program CRUD sayfaları
- Program yöneticisi atama
- Danışman atama (Many-to-Many)
- Firma atama
- Program filtreleme ve arama

**Çıktılar:**

- ✅ Program oluşturulabiliyor
- ✅ Program yöneticisi atanabiliyor
- ✅ Danışman atanabiliyor
- ✅ Firma atanabiliyor
- ✅ Program listesi görüntülenebiliyor

**Kabul Kriterleri:**

- Master Admin program oluşturabiliyor
- Program yöneticisi atayabiliyor
- Danışman atayabiliyor
- Firma ekleyebiliyor

**Bağımlılıklar:** Sprint 2, Sprint 3

**Detaylı Plan:** `sprint-detaylari/sprint-04-program-yonetimi.md`

---

### Sprint 5: Kullanıcı Yönetimi (1 hafta)

**Hedef:** Multi-role kullanıcı yönetimi çalışıyor

**Görevler:**

- User entity + repository
- User use cases (CRUD, role management)
- User API routes
- Master Admin: User CRUD
- Program bazlı yetkilendirme
- User profile sayfası
- User settings sayfası
- Role değiştirme
- Program atama (user_programs)

**Çıktılar:**

- ✅ Kullanıcı oluşturulabiliyor
- ✅ Roller atanabiliyor
- ✅ Program'a kullanıcı atanabiliyor
- ✅ Profil güncellenebiliyor

**Kabul Kriterleri:**

- Master Admin kullanıcı ekleyebiliyor
- Roller doğru çalışıyor
- Program ataması yapılabiliyor
- Profil sayfası çalışıyor

**Bağımlılıklar:** Sprint 2, Sprint 3, Sprint 4

**Detaylı Plan:** `sprint-detaylari/sprint-05-kullanici-yonetimi.md`

---

### Sprint 6: Firma Yönetimi (1 hafta)

**Hedef:** Firma CRUD + Firma paneli temeli

**Görevler:**

- Company entity + repository
- Company use cases (CRUD)
- Company API routes
- Master Admin: Company CRUD
- Program Manager: Company CRUD (kendi programı)
- Company dashboard (temel)
- Company profile
- Company users management
- Alt kullanıcı ekleme/çıkarma (max 2 aktif)

**Çıktılar:**

- ✅ Firma oluşturulabiliyor
- ✅ Programa atanabiliyor
- ✅ Alt kullanıcı eklenebiliyor
- ✅ Firma dashboard çalışıyor

**Kabul Kriterleri:**

- Firma oluşturulabiliyor
- Programa atanabiliyor
- Alt kullanıcı eklenebiliyor (max 2)
- Firma paneline giriş yapılabiliyor

**Bağımlılıklar:** Sprint 4, Sprint 5

**Detaylı Plan:** `sprint-detaylari/sprint-06-firma-yonetimi.md`

---

### Sprint 7: Danışman Paneli (1 hafta)

**Hedef:** Danışman paneli + Program seçici çalışıyor

**Görevler:**

- Consultant dashboard
- Program seçici component
- Atandığı programlar listesi
- Atandığı firmalar listesi (program bazlı)
- Firma detay sayfası
- Quick actions (görev ata, proje oluştur, etc.)
- Program bazlı filtreleme
- İstatistikler (program bazlı)

**Çıktılar:**

- ✅ Danışman paneline giriş yapılabiliyor
- ✅ Program seçebiliyor
- ✅ Firmalarını görebiliyor
- ✅ Quick actions çalışıyor

**Kabul Kriterleri:**

- Danışman giriş yapabiliyor
- Program seçebiliyor
- Sadece atandığı firmaları görebiliyor
- Program değiştirince liste güncelleniyor

**Bağımlılıklar:** Sprint 4, Sprint 5, Sprint 6

**Detaylı Plan:** `sprint-detaylari/sprint-07-danisman-paneli.md`

---

## 🎯 FAZ 3: İŞ MODÜLLERİ (4-5 Hafta)

### Sprint 8: Proje Yönetimi (1.5 hafta)

**Hedef:** Ana Proje → Alt Proje → Görev hiyerarşisi çalışıyor

**Görevler:**

- Project entity + repository
- SubProject entity + repository
- Task entity + repository
- Use cases (CRUD, hierarchy, assignment)
- API routes (projects, sub-projects, tasks)
- Admin: Proje şablonları
- Consultant: Proje oluşturma/atama
- Consultant: Görev oluşturma/atama
- Consultant: Görev onaylama
- Company: Proje görüntüleme
- Company: Görev tamamlama
- Durum yönetimi (todo, in-progress, review, done)
- İlerleme hesaplama
- Görev altında yorum/soru sistemi

**Çıktılar:**

- ✅ Proje oluşturulabiliyor
- ✅ Alt proje eklenebiliyor
- ✅ Görev atanabiliyor
- ✅ Görev tamamlanabiliyor
- ✅ İlerleme hesaplanıyor
- ✅ Danışman onaylayabiliyor

**Kabul Kriterleri:**

- Proje hiyerarşisi çalışıyor
- Görev atama çalışıyor
- Durum değişiklikleri çalışıyor
- İlerleme doğru hesaplanıyor
- Yorum sistemi çalışıyor

**Bağımlılıklar:** Sprint 6, Sprint 7

**Detaylı Plan:** `sprint-detaylari/sprint-08-proje-yonetimi.md`

#### Sprint 8 Ek: Bulk & Matrix Yönetimi (Kasım 2025)

**Hedef:** Çoklu firma atamaları ve tarih yönetimini matris tabanlı arayüzle tamamlamak.

**Kapsam:**

- `company_project_assignments` tablosu ve RLS politikaları
- Alt proje → görev kalıtımı (firmaya atanınca görevler otomatik görünür)
- `BulkAssignSubProjectsToCompaniesUseCase`, `BulkAssignDatesToCompanySubProjectsUseCase`
- `GetAssignmentMatrixUseCase`, `GetCompanyTasksWithInheritedDatesUseCase`
- Matris sayfaları: Firma x Alt Proje atama, tarih matrisi, firma bazlı görev görünümü
- Rol bazlı akışlar: Admin (tam kontrol), Danışman (atama/yönetim), Firma (takip)

**Durum:** 🔴 Başlangıçta – analiz ve detay plan hazır, uygulama beklemede.

**Bağımlılıklar:** Sprint 6, Sprint 7, Sprint 8 temel altyapısı

**Notlar:** Ayrıntılı analiz ve görev listesi için `docs/SPRINT-8-TOPLU-ISLEMLER-ANALIZI.md` ve `docs/SPRINT-8-TOPLU-ISLEMLER-DETAYLI-PLAN.md` dosyalarına bakınız.

---

### Sprint 9: Eğitim Yönetimi (1.5 hafta)

**Hedef:** Video + Döküman eğitim sistemi çalışıyor

**Görevler:**

- Training entity + repository
- TrainingVideo entity + repository
- TrainingDocument entity + repository
- Use cases (CRUD, assignment, tracking)
- API routes (trainings, videos, documents)
- Admin: Eğitim CRUD
- Admin: Video yükleme (YouTube unlisted)
- Admin: Döküman yükleme (Supabase Storage)
- Admin: Global vs Program eğitimleri
- Consultant: Firmaya eğitim atama
- Company: Eğitim listesi
- Company: Video izleme + tracking
- Company: Döküman okuma + tracking
- Sıralı eğitim sistemi (video 1 bitince video 2 açılır)
- Kilitli içerik
- İzleme yüzdesi hesaplama

**Çıktılar:**

- ✅ Eğitim oluşturulabiliyor
- ✅ Video eklenebiliyor (YouTube)
- ✅ Döküman eklenebiliyor
- ✅ Firmaya atanabiliyor
- ✅ İzleme takibi çalışıyor
- ✅ Sıralı sistem çalışıyor

**Kabul Kriterleri:**

- Eğitim oluşturulabiliyor
- Video izlenebiliyor
- Döküman okunabiliyor
- İzleme kaydediliyor
- Sıralı sistem çalışıyor

**Bağımlılıklar:** Sprint 6, Sprint 7

**Detaylı Plan:** `sprint-detaylari/sprint-09-egitim-yonetimi.md`

---

### Sprint 10: Etkinlik Yönetimi (1 hafta)

**Hedef:** Etkinlik + Takvim + Zoom entegrasyonu çalışıyor

**Görevler:**

- Event entity + repository
- Use cases (CRUD, attendance)
- API routes (events, attendance)
- Zoom API entegrasyonu
- Admin: Etkinlik CRUD
- Admin: Zoom meeting oluşturma
- Consultant: Etkinlik oluşturma (program bazlı)
- Company: Etkinlik listesi
- Company: Etkinlik detay
- Company: Katılım kaydı
- Takvim görünümü (FullCalendar)
- Otomatik hatırlatmalar (email + WhatsApp)
- Katılım takibi
- Zoom link paylaşımı

**Çıktılar:**

- ✅ Etkinlik oluşturulabiliyor
- ✅ Zoom meeting otomatik oluşuyor
- ✅ Takvim görünümü çalışıyor
- ✅ Katılım kaydediliyor
- ✅ Hatırlatmalar gidiyor

**Kabul Kriterleri:**

- Etkinlik oluşturulabiliyor
- Zoom entegrasyonu çalışıyor
- Takvim görünümü çalışıyor
- Katılım takibi çalışıyor

**Bağımlılıklar:** Sprint 6, Sprint 7

**Detaylı Plan:** `sprint-detaylari/sprint-10-etkinlik-yonetimi.md`

---

### Sprint 11: Randevu Yönetimi (1 hafta)

**Hedef:** Danışman-Firma randevu sistemi çalışıyor

**Görevler:**

- Appointment entity + repository
- Use cases (CRUD, reschedule)
- API routes (appointments)
- Zoom API entegrasyonu
- Consultant: Müsaitlik takvimi
- Consultant: Randevu oluşturma
- Company: Randevu talep etme
- Company: Randevu listesi
- Randevu onay/red sistemi
- Revize sistemi (reschedule)
- Zoom meeting otomatik oluşturma
- Otomatik hatırlatmalar (1 gün önce, 1 saat önce)
- Katılım takibi
- Randevu notları

**Çıktılar:**

- ✅ Randevu oluşturulabiliyor
- ✅ Müsaitlik takvimi çalışıyor
- ✅ Zoom meeting oluşuyor
- ✅ Hatırlatmalar gidiyor
- ✅ Revize yapılabiliyor

**Kabul Kriterleri:**

- Randevu oluşturulabiliyor
- Müsaitlik kontrolü çalışıyor
- Zoom entegrasyonu çalışıyor
- Revize yapılabiliyor

**Bağımlılıklar:** Sprint 7, Sprint 10

**Detaylı Plan:** `sprint-detaylari/sprint-11-randevu-yonetimi.md`

---

## 🎯 FAZ 4: AI & OTOMASYON (2-3 Hafta)

### Sprint 12: AI Altyapısı (1 hafta)

**Hedef:** OpenAI + Claude entegrasyonu çalışıyor

**Görevler:**

- OpenAI API entegrasyonu
- Anthropic (Claude) API entegrasyonu
- Vercel AI SDK setup
- AI service layer (Infrastructure)
- AI service interface (Domain)
- Prompt management sistemi
- Token tracking
- Cost tracking
- Error handling
- Rate limiting
- Caching stratejisi

**Çıktılar:**

- ✅ OpenAI API çalışıyor
- ✅ Claude API çalışıyor
- ✅ AI service layer hazır
- ✅ Token tracking çalışıyor
- ✅ Cost tracking çalışıyor

**Kabul Kriterleri:**

- AI API'ler çalışıyor
- Token sayılıyor
- Maliyet hesaplanıyor
- Error handling çalışıyor

**Bağımlılıklar:** Sprint 2

**Detaylı Plan:** `sprint-detaylari/sprint-12-ai-altyapisi.md`

---

### Sprint 13: AI Özellikleri (1 hafta)

**Hedef:** AI asistan özellikleri çalışıyor

**Görevler:**

- Görev açıklaması üretimi (AI)
- Eğitim özeti çıkarma (AI)
- Rapor otomatik oluşturma (AI)
- Firma risk analizi (AI)
- Başarı tahmini (AI)
- Trend analizi (AI)
- Admin: AI özellikleri kullanımı
- Consultant: AI asistan kullanımı
- AI önerilerini kaydetme
- AI geçmişi görüntüleme

**Çıktılar:**

- ✅ Görev açıklaması AI ile üretilebiliyor
- ✅ Eğitim özeti AI ile çıkarılabiliyor
- ✅ Rapor AI ile oluşturulabiliyor
- ✅ Risk analizi çalışıyor
- ✅ Başarı tahmini çalışıyor

**Kabul Kriterleri:**

- AI özellikleri çalışıyor
- Sonuçlar kullanılabilir kalitede
- Kullanıcı AI önerilerini görebiliyor
- AI geçmişi kaydediliyor

**Bağımlılıklar:** Sprint 8, Sprint 9, Sprint 12

**Detaylı Plan:** `sprint-detaylari/sprint-13-ai-ozellikleri.md`

---

### Sprint 14: Chatbot (1 hafta)

**Hedef:** AI Chatbot tüm panellerde çalışıyor

**Görevler:**

- Chatbot UI component
- Chatbot backend (streaming)
- Context management (conversation history)
- Eğitim içeriği arama (semantic search)
- Akıllı yönlendirme (intent detection)
- Danışman atama önerisi
- Randevu oluşturma (chatbot üzerinden)
- Public website chatbot
- Admin panel chatbot
- Consultant panel chatbot
- Company panel chatbot
- Chatbot analytics
- Conversation history

**Çıktılar:**

- ✅ Chatbot UI çalışıyor
- ✅ Streaming responses çalışıyor
- ✅ Context management çalışıyor
- ✅ Tüm panellerde aktif
- ✅ Akıllı yönlendirme çalışıyor

**Kabul Kriterleri:**

- Chatbot tüm panellerde çalışıyor
- Streaming responses çalışıyor
- Context hatırlanıyor
- Akıllı yönlendirme çalışıyor

**Bağımlılıklar:** Sprint 12, Sprint 13

**Detaylı Plan:** `sprint-detaylari/sprint-14-chatbot.md`

---

## 🎯 FAZ 5: İLETİŞİM & BİLDİRİMLER (2 Hafta)

### Sprint 15: Email Sistemi (1 hafta)

**Hedef:** Email otomasyonu çalışıyor

**Görevler:**

- SendGrid entegrasyonu
- Email templates (MJML)
- Transactional emails:
  - Hoş geldiniz emaili
  - Görev atama bildirimi
  - Deadline hatırlatması
  - Haftalık özet raporu
  - Başarı kutlaması
  - Sertifika gönderimi
- Email queue system
- Email scheduling
- Email analytics
- Unsubscribe management
- AI personalization (email içeriği)

**Çıktılar:**

- ✅ SendGrid entegrasyonu çalışıyor
- ✅ Email templates hazır
- ✅ Otomatik emailler gidiyor
- ✅ Email queue çalışıyor
- ✅ Analytics çalışıyor

**Kabul Kriterleri:**

- Emailler gönderiliyor
- Templates çalışıyor
- Queue sistemi çalışıyor
- Analytics görüntülenebiliyor

**Bağımlılıklar:** Sprint 8, Sprint 9, Sprint 10, Sprint 11

**Detaylı Plan:** `sprint-detaylari/sprint-15-email-sistemi.md`

---

### Sprint 16: Bildirim Sistemi (1 hafta)

**Hedef:** Multi-channel bildirim sistemi çalışıyor

**Görevler:**

- In-app notifications
- Push notifications (OneSignal)
- WhatsApp Business API entegrasyonu
- Notification entity + repository
- Notification use cases
- API routes (notifications)
- Bildirim tercihleri (user settings)
- Bildirim geçmişi
- Okundu/okunmadı takibi
- Toplu bildirim gönderme
- Program bazlı bildirimler
- Otomatik bildirim kuralları:
  - Görev atandı
  - Görev deadline yaklaşıyor
  - Etkinlik hatırlatması
  - Randevu hatırlatması
  - Yeni eğitim eklendi

**Çıktılar:**

- ✅ In-app bildirimler çalışıyor
- ✅ Push notifications çalışıyor
- ✅ WhatsApp entegrasyonu çalışıyor
- ✅ Bildirim tercihleri çalışıyor
- ✅ Otomatik kurallar çalışıyor

**Kabul Kriterleri:**

- Bildirimler gönderiliyor
- Kullanıcı tercihleri çalışıyor
- WhatsApp mesajları gidiyor
- Otomatik kurallar çalışıyor

**Bağımlılıklar:** Sprint 8, Sprint 9, Sprint 10, Sprint 11, Sprint 15

**Detaylı Plan:** `sprint-detaylari/sprint-16-bildirim-sistemi.md`

---

## 🎯 FAZ 6: RAPORLAMA & ANALİTİK (2 Hafta)

### Sprint 17: Dashboard & Raporlar (1 hafta)

**Hedef:** Tüm paneller için dashboard ve raporlar çalışıyor

**Görevler:**

- Master Admin dashboard:
  - Tüm programlar özeti
  - Toplam istatistikler
  - Program karşılaştırması
  - Grafik ve chartlar
- Program Manager dashboard:
  - Program özeti
  - Firma ilerlemeleri
  - Danışman performansı
- Consultant dashboard:
  - Atandığı firmalar
  - Görev durumları
  - Yaklaşan deadline'lar
- Company dashboard:
  - Proje ilerlemesi
  - Eğitim tamamlanma
  - Yaklaşan etkinlikler
- Custom reports:
  - Firma ilerleme raporu
  - Proje tamamlanma raporu
  - Eğitim katılım raporu
  - Etkinlik katılım raporu
- Export functionality (PDF, Excel)
- Grafik ve chartlar (Recharts)

**Çıktılar:**

- ✅ Tüm dashboard'lar çalışıyor
- ✅ Raporlar oluşturulabiliyor
- ✅ Export çalışıyor
- ✅ Grafikler görüntüleniyor

**Kabul Kriterleri:**

- Dashboard'lar çalışıyor
- Raporlar doğru
- Export çalışıyor
- Grafikler responsive

**Bağımlılıklar:** Sprint 4, Sprint 5, Sprint 6, Sprint 7, Sprint 8, Sprint 9

**Detaylı Plan:** `sprint-detaylari/sprint-17-dashboard-raporlar.md`

---

### Sprint 18: Analytics (1 hafta)

**Hedef:** Google Analytics + Mixpanel entegrasyonu çalışıyor

**Görevler:**

- Google Analytics 4 entegrasyonu
- Mixpanel entegrasyonu
- Custom event tracking:
  - Sayfa görüntülemeleri
  - Button clicks
  - Form submissions
  - Video izleme
  - Döküman okuma
  - Görev tamamlama
  - Etkinlik katılımı
- Funnel analysis
- Cohort analysis
- User segmentation
- A/B testing setup
- AI-powered insights
- Analytics dashboard
- Custom reports

**Çıktılar:**

- ✅ Google Analytics çalışıyor
- ✅ Mixpanel çalışıyor
- ✅ Event tracking çalışıyor
- ✅ Funnel analysis çalışıyor
- ✅ AI insights çalışıyor

**Kabul Kriterleri:**

- Analytics çalışıyor
- Events kaydediliyor
- Funnel görüntülenebiliyor
- Insights görülebiliyor

**Bağımlılıklar:** Sprint 17

**Detaylı Plan:** `sprint-detaylari/sprint-18-analytics.md`

---

## 🎯 FAZ 7: PUBLIC WEBSITE (1-2 Hafta)

### Sprint 19: Public Pages (1 hafta)

**Hedef:** Public website tamamlandı

**Görevler:**

- Ana sayfa:
  - Hero section
  - Program özeti
  - Dönüşüm modeli
  - Hedef kitle
  - Başarı hikayeleri slider
  - İstatistikler
- Program Hakkında sayfası:
  - 12 aylık süreç
  - AI destekli sistem
  - Neden katılmalı
- Platform Özellikleri sayfası:
  - Panel modülleri
  - AI destekleri
  - Raporlama & izleme
  - Teknoloji altyapısı
- Başarı Hikayeleri sayfası:
  - Firma hikayeleri
  - Sektör filtreleme
  - Arama
  - Detaylı modal
- SSS sayfası:
  - 6 kategori
  - 24 soru-cevap
  - Arama
- İletişim/Başvuru sayfası:
  - İletişim formu
  - Başvuru formu
  - Harita
- Kariyer sayfası:
  - Danışman başvurusu
  - Stajyer başvurusu
  - Firma İK havuzu

**Çıktılar:**

- ✅ Tüm public sayfalar tamamlandı
- ✅ Responsive tasarım
- ✅ SEO optimizasyonu
- ✅ Performance optimizasyonu

**Kabul Kriterleri:**

- Tüm sayfalar çalışıyor
- Mobile responsive
- SEO skorları yüksek
- Performance iyi

**Bağımlılıklar:** Sprint 3

**Detaylı Plan:** `sprint-detaylari/sprint-19-public-pages.md`

---

### Sprint 20: SEO & Performance (1 hafta)

**Hedef:** SEO ve performance optimizasyonu tamamlandı

**Görevler:**

- SEO optimization:
  - Meta tags
  - Open Graph tags
  - Twitter cards
  - Structured data (JSON-LD)
  - Sitemap.xml
  - Robots.txt
  - Canonical URLs
- Performance optimization:
  - Image optimization (Next.js Image)
  - Code splitting
  - Lazy loading
  - Font optimization
  - CSS optimization
  - JavaScript optimization
- Lighthouse optimization:
  - Performance > 90
  - Accessibility > 90
  - Best Practices > 90
  - SEO > 90
- Core Web Vitals:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

**Çıktılar:**

- ✅ SEO optimizasyonu tamamlandı
- ✅ Performance optimizasyonu tamamlandı
- ✅ Lighthouse skorları > 90
- ✅ Core Web Vitals iyi

**Kabul Kriterleri:**

- Lighthouse skorları > 90
- Core Web Vitals yeşil
- Sitemap çalışıyor
- Meta tags doğru

**Bağımlılıklar:** Sprint 19

**Detaylı Plan:** `sprint-detaylari/sprint-20-seo-performance.md`

---

## 🎯 FAZ 8: TESTING & QA (2 Hafta)

### Sprint 21: Testing (1 hafta)

**Hedef:** Test coverage > 80%

**Görevler:**

- Unit tests (Jest):
  - Use cases
  - Services
  - Utilities
  - Helpers
- Integration tests:
  - API routes
  - Database operations
  - External services
- E2E tests (Playwright):
  - Critical user flows
  - Login/Logout
  - Proje oluşturma
  - Görev atama
  - Eğitim izleme
- Component tests (Testing Library):
  - UI components
  - Forms
  - Modals
- Accessibility tests:
  - Keyboard navigation
  - Screen reader
  - Color contrast
- Performance tests:
  - Load testing
  - Stress testing

**Çıktılar:**

- ✅ Unit test coverage > 80%
- ✅ Integration tests yazıldı
- ✅ E2E tests yazıldı
- ✅ Accessibility tests geçiyor
- ✅ Performance tests geçiyor

**Kabul Kriterleri:**

- Test coverage > 80%
- Tüm critical flows test edildi
- Accessibility testleri geçiyor
- Performance testleri geçiyor

**Bağımlılıklar:** Tüm önceki sprint'ler

**Detaylı Plan:** `sprint-detaylari/sprint-21-testing.md`

---

### Sprint 22: QA & Bug Fixes (1 hafta)

**Hedef:** Tüm bug'lar düzeltildi, QA tamamlandı

**Görevler:**

- Manual testing:
  - Tüm user flows
  - Tüm paneller
  - Tüm roller
- Cross-browser testing:
  - Chrome
  - Firefox
  - Safari
  - Edge
- Mobile testing:
  - iOS Safari
  - Android Chrome
- Bug fixing:
  - Critical bugs
  - High priority bugs
  - Medium priority bugs
- Security audit:
  - SQL injection
  - XSS
  - CSRF
  - Authentication
  - Authorization
- Performance audit:
  - Database queries
  - API response times
  - Frontend performance
- Code review:
  - Code quality
  - Best practices
  - Security

**Çıktılar:**

- ✅ Tüm critical bug'lar düzeltildi
- ✅ Cross-browser uyumlu
- ✅ Mobile responsive
- ✅ Security audit geçti
- ✅ Performance audit geçti

**Kabul Kriterleri:**

- Kritik bug kalmadı
- Tüm tarayıcılarda çalışıyor
- Mobile'da çalışıyor
- Security testleri geçti

**Bağımlılıklar:** Sprint 21

**Detaylı Plan:** `sprint-detaylari/sprint-22-qa-bug-fixes.md`

---

## 🎯 FAZ 9: DEPLOYMENT & LAUNCH (1 Hafta)

### Sprint 23: Production Setup & Launch (1 hafta)

**Hedef:** Production'a deploy edildi, sistem canlıda

**Görevler:**

- Production database setup:
  - Supabase production project
  - Migration'ları çalıştırma
  - Seed data (production)
- Environment variables:
  - Production secrets
  - API keys
  - Database URLs
- CI/CD pipeline (GitHub Actions):
  - Automated testing
  - Automated deployment
  - Rollback strategy
- Monitoring setup:
  - Sentry (error tracking)
  - Vercel Analytics
  - Uptime monitoring
- Backup strategy:
  - Database backups
  - Automated backups
  - Backup retention
- Documentation:
  - API documentation
  - User guide (Admin)
  - User guide (Consultant)
  - User guide (Company)
  - Developer documentation
- User training materials:
  - Video tutorials
  - PDF guides
  - FAQ
- Launch checklist:
  - DNS setup
  - SSL certificate
  - Domain configuration
  - Email configuration
  - Analytics setup
- Soft launch:
  - Beta users
  - Feedback collection
  - Bug fixing
- Official launch:
  - Announcement
  - Marketing
  - Onboarding

**Çıktılar:**

- ✅ Production'da canlı
- ✅ CI/CD çalışıyor
- ✅ Monitoring aktif
- ✅ Backup'lar çalışıyor
- ✅ Dokümantasyon hazır
- ✅ Kullanıcı eğitimleri hazır

**Kabul Kriterleri:**

- Production'da çalışıyor
- Monitoring çalışıyor
- Backup'lar alınıyor
- Dokümantasyon tamamlandı

**Bağımlılıklar:** Sprint 22

**Detaylı Plan:** `sprint-detaylari/sprint-23-production-launch.md`

---

## 📊 SPRINT ÖZET TABLOSU

| Faz       | Sprint    | Konu                 | Süre      | Bağımlılık              | Durum        |
| --------- | --------- | -------------------- | --------- | ----------------------- | ------------ |
| **Faz 1** | Sprint 1  | Proje Kurulumu       | 1 hafta   | -                       | ⏳ Hazır     |
| **Faz 1** | Sprint 2  | Database & Auth      | 1 hafta   | Sprint 1                | 📋 Planlandı |
| **Faz 1** | Sprint 3  | UI Foundation        | 1 hafta   | Sprint 1                | 📋 Planlandı |
| **Faz 2** | Sprint 4  | Program Yönetimi     | 1 hafta   | Sprint 2, 3             | 📋 Planlandı |
| **Faz 2** | Sprint 5  | Kullanıcı Yönetimi   | 1 hafta   | Sprint 2, 3, 4          | 📋 Planlandı |
| **Faz 2** | Sprint 6  | Firma Yönetimi       | 1 hafta   | Sprint 4, 5             | 📋 Planlandı |
| **Faz 2** | Sprint 7  | Danışman Paneli      | 1 hafta   | Sprint 4, 5, 6          | 📋 Planlandı |
| **Faz 3** | Sprint 8  | Proje Yönetimi       | 1.5 hafta | Sprint 6, 7             | 📋 Planlandı |
| **Faz 3** | Sprint 9  | Eğitim Yönetimi      | 1.5 hafta | Sprint 6, 7             | 📋 Planlandı |
| **Faz 3** | Sprint 10 | Etkinlik Yönetimi    | 1 hafta   | Sprint 6, 7             | 📋 Planlandı |
| **Faz 3** | Sprint 11 | Randevu Yönetimi     | 1 hafta   | Sprint 7, 10            | 📋 Planlandı |
| **Faz 4** | Sprint 12 | AI Altyapısı         | 1 hafta   | Sprint 2                | 📋 Planlandı |
| **Faz 4** | Sprint 13 | AI Özellikleri       | 1 hafta   | Sprint 8, 9, 12         | 📋 Planlandı |
| **Faz 4** | Sprint 14 | Chatbot              | 1 hafta   | Sprint 12, 13           | 📋 Planlandı |
| **Faz 5** | Sprint 15 | Email Sistemi        | 1 hafta   | Sprint 8, 9, 10, 11     | 📋 Planlandı |
| **Faz 5** | Sprint 16 | Bildirim Sistemi     | 1 hafta   | Sprint 8, 9, 10, 11, 15 | 📋 Planlandı |
| **Faz 6** | Sprint 17 | Dashboard & Raporlar | 1 hafta   | Sprint 4-9              | 📋 Planlandı |
| **Faz 6** | Sprint 18 | Analytics            | 1 hafta   | Sprint 17               | 📋 Planlandı |
| **Faz 7** | Sprint 19 | Public Pages         | 1 hafta   | Sprint 3                | 📋 Planlandı |
| **Faz 7** | Sprint 20 | SEO & Performance    | 1 hafta   | Sprint 19               | 📋 Planlandı |
| **Faz 8** | Sprint 21 | Testing              | 1 hafta   | Tümü                    | 📋 Planlandı |
| **Faz 8** | Sprint 22 | QA & Bug Fixes       | 1 hafta   | Sprint 21               | 📋 Planlandı |
| **Faz 9** | Sprint 23 | Production & Launch  | 1 hafta   | Sprint 22               | 📋 Planlandı |

**TOPLAM:** 18-22 Hafta (4.5-5.5 Ay)

---

## 🎯 KRİTİK YOLLAR (Critical Path)

### MVP İçin Minimum Sprint'ler

```
Sprint 1 → Sprint 2 → Sprint 3 → Sprint 4 → Sprint 5 → Sprint 6 → Sprint 7 → Sprint 8 → Sprint 23

Minimum Süre: 10 hafta (2.5 ay)
```

### Full Launch İçin

```
Tüm 23 sprint tamamlanmalı

Tahmini Süre: 18-22 hafta (4.5-5.5 ay)
```

---

## 📝 NOTLAR

### Sprint Değişiklik Yönetimi

- Her sprint sonunda retrospective yapılacak
- Öğrenilen dersler kaydedilecek
- Gerekirse sonraki sprint'ler güncellenecek
- Bu dosya yaşayan bir döküman

### Sprint Detayları

- Her sprint başında detaylı plan oluşturulacak
- `sprint-detaylari/sprint-XX-konu.md` formatında
- Günlük görev breakdown'u içerecek
- Kabul kriterleri net olacak

### Başarı Kriterleri

- Her sprint sonunda demo yapılacak
- Kabul kriterleri kontrol edilecek
- Test coverage kontrol edilecek
- Code review yapılacak

---

## 🔄 VERSİYON TAKIP

| Versiyon | Tarih        | Değişiklik               | Yapan     |
| -------- | ------------ | ------------------------ | --------- |
| 1.0      | 28 Ekim 2025 | İlk versiyon oluşturuldu | AI + Ömer |
|          |              |                          |           |

---

## 📞 İLETİŞİM

Sprint planı ile ilgili sorular, öneriler veya değişiklikler için:

- Bu dökümanı güncelleyin
- Versiyon numarasını artırın
- Değişiklik tarihini ekleyin

---

**Hazırlayan:** AI Assistant + Ömer Ünsal  
**Tarih:** 28 Ekim 2025  
**Durum:** Aktif 🚀  
**Sonraki Review:** Sprint 5 sonrası

---

🎉 **AKADEMİ PORT - SPRINT PLANI HAZIR!** 🚀
