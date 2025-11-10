# 🚀 AKADEMİ PORT - GENEL SPRINT PLANI

**Proje Başlangıç:** 28 Ekim 2025  
**Güncel Tarih:** 10 Kasım 2025  
**Tahmini Tamamlanma:** Nisan-Mayıs 2026 (21-23 hafta)  
**Toplam Sprint:** 28  
**Metodoloji:** Agile + Vertical Slice Architecture + Clean Architecture

---

## 📊 SPRINT DURUMU TABLOSU

| Sprint        | Modül                 | Durum           | Süre      | Bağımlılık              |
| ------------- | --------------------- | --------------- | --------- | ----------------------- |
| **Sprint 1**  | Proje Kurulumu        | ✅ Tamamlandı   | 1 hafta   | -                       |
| **Sprint 2**  | Database & Auth       | ✅ Tamamlandı   | 1 hafta   | Sprint 1                |
| **Sprint 3**  | Design System         | ✅ Tamamlandı   | 1 hafta   | Sprint 1                |
| **Sprint 4**  | Program Yönetimi      | ✅ Tamamlandı   | 1 hafta   | Sprint 2                |
| **Sprint 5**  | User Management       | ✅ Tamamlandı   | 1 hafta   | Sprint 2, 4             |
| **Sprint 6**  | Company Management    | ✅ Tamamlandı   | 1 hafta   | Sprint 4, 5             |
| **Sprint 7**  | Consultant Panel      | ✅ Tamamlandı   | 1 hafta   | Sprint 4, 5, 6          |
| **Sprint 8**  | Proje Yönetimi        | ✅ Tamamlandı   | 1.5 hafta | Sprint 6, 7             |
| **Sprint 9**  | Eğitim Yönetimi       | ✅ Tamamlandı   | 1 hafta   | Sprint 6, 7             |
| **Sprint 10** | Etkinlik Yönetimi     | ✅ Tamamlandı   | 1 hafta   | Sprint 6, 7             |
| **Sprint 11** | Randevu Yönetimi      | ✅ Tamamlandı   | 1 hafta   | Sprint 7, 10            |
| **Sprint 12** | **Haberler Modülü**   | 🏃 Devam Ediyor | 1 hafta   | Sprint 6                |
| **Sprint 13** | Forum Modülü          | 📋 Planlandı    | 1 hafta   | Sprint 6, 7             |
| **Sprint 14** | Liderlik Tablosu      | 📋 Planlandı    | 1 hafta   | Sprint 8, 9, 10, 12, 13 |
| **Sprint 15** | E-ticaret Metrikleri  | 📋 Planlandı    | 1 hafta   | Sprint 6                |
| **Sprint 16** | AI Raporlama          | 📋 Planlandı    | 1 hafta   | Sprint 15, 17           |
| **Sprint 17** | AI Altyapısı          | 📋 Planlandı    | 1 hafta   | Sprint 2                |
| **Sprint 18** | AI Özellikleri        | 📋 Planlandı    | 1 hafta   | Sprint 8, 9, 17         |
| **Sprint 19** | AI İçerik Otomasyonu  | 📋 Planlandı    | 1 hafta   | Sprint 12, 13, 17, 18   |
| **Sprint 20** | Kariyer Portalı       | 📋 Planlandı    | 1 hafta   | Sprint 6                |
| **Sprint 21** | AI Kariyer Matching   | 📋 Planlandı    | 1 hafta   | Sprint 17, 18, 20       |
| **Sprint 22** | Public Website        | 📋 Planlandı    | 1 hafta   | -                       |
| **Sprint 23** | CMS (Site Yönetimi)   | 📋 Planlandı    | 1 hafta   | Sprint 22               |
| **Sprint 24** | Email Sistemi         | 📋 Planlandı    | 0.5 hafta | Sprint 2                |
| **Sprint 25** | Chatbot               | 📋 Planlandı    | 1 hafta   | Sprint 9, 17, 18        |
| **Sprint 26** | Bildirim Sistemi      | 📋 Planlandı    | 0.5 hafta | Sprint 2, 24            |
| **Sprint 27** | Dashboard & Analytics | 📋 Planlandı    | 0.5 hafta | Sprint 17, 18           |
| **Sprint 28** | Production Hazırlık   | 📋 Planlandı    | 0.5 hafta | Tümü                    |

**Gösterim:**

- ✅ Tamamlandı
- 🏃 Devam Ediyor
- 📋 Planlandı
- ⚠️ Bloke

---

## 🎯 FAZ 1: TEMEL ALTYAPI (3 Hafta) ✅ TAMAMLANDI

### Sprint 1: Proje Kurulumu ✅

- Next.js 16 + TypeScript + Tailwind CSS v4
- 6 katmanlı Clean Architecture
- Design tokens & Storybook

### Sprint 2: Database & Auth ✅

- Supabase setup
- Database schema & migrations
- JWT Authentication
- Role-based middleware

### Sprint 3: Design System ✅

- UI Components (Shadcn/ui)
- Atomic Design System
- Responsive layouts
- Dark mode support

---

## 🎯 FAZ 2: CORE MODULES (4 Hafta) ✅ TAMAMLANDI

### Sprint 4: Program Yönetimi ✅

- Program CRUD
- Program-Company ilişkisi
- Program-Consultant ilişkisi
- Dashboard & analytics

### Sprint 5: User Management ✅

- User CRUD
- Role management
- User-Program ilişkisi
- Profile management

### Sprint 6: Company Management ✅

- Company CRUD
- Company users (max 2 aktif)
- Company-Program ilişkisi
- Company dashboard

### Sprint 7: Consultant Panel ✅

- Consultant dashboard
- Company listesi
- Program seçimi
- Analytics

---

## 🎯 FAZ 3: PROJECT & TRAINING (2.5 Hafta) ✅ TAMAMLANDI

### Sprint 8: Proje Yönetimi ✅

- Project → Sub-Project → Task hiyerarşisi
- Toplu firma atama
- Toplu tarih atama
- Matris görünümü
- Task dependencies
- Comments & activity log

### Sprint 9: Eğitim Yönetimi ✅

- Video eğitimler (YouTube entegrasyonu)
- Dökümanlar (PDF/Word)
- Sıralı izleme sistemi
- Progress tracking
- Firma atama

### Sprint 10: Etkinlik Yönetimi ✅

- Event CRUD
- Zoom entegrasyonu
- Katılım takibi
- Otomatik hatırlatmalar (email + cron)
- FullCalendar entegrasyonu

### Sprint 11: Randevu Yönetimi ✅

- Appointment CRUD
- Consultant availability management
- Zoom entegrasyonu
- Onay/red sistemi
- Revize (reschedule)
- UnifiedCalendar (events + appointments)

---

## 🎯 FAZ 4: İÇERİK & TOPLULUK YÖNETİMİ (3 Hafta)

### Sprint 12: Haberler Modülü (1 hafta) 🏃 DEVAM EDİYOR

**Hedef:** Haber yönetimi + Liderlik tablosu entegrasyonu

**Database:**

```sql
- news (ana tablo)
- news_comments (yorumlar)
- news_likes (beğeniler)
- news_reads (okuma takibi - liderlik için)
- news_tags (etiketler)
- news_tag_relations (haber-etiket ilişkisi)
```

**Backend:**

- Domain: News entity + NewsEntity class
- Enums: NewsCategory, NewsStatus
- Repository: INewsRepository, SupabaseNewsRepository
- Use Cases: Create, Update, Delete, Publish, Like, Comment, RecordRead
- API Routes: /api/news/\*

**Frontend:**

- Components: NewsList, NewsCard, NewsDetail, NewsForm, NewsComments
- Admin Panel: Haber oluşturma, düzenleme, yayınlama
- Company Panel: Haber okuma, beğeni, yorum
- Public Blog: /blog

**Liderlik Tablosu Entegrasyonu:**

- Haber okuma: +2 puan
- Tam okuma (>80% scroll): +5 puan bonus
- Yorum yapma: +3 puan
- Okuma süresi tracking

**Çıktılar:**

- ✅ Manuel haber oluşturma/düzenleme
- ✅ Kategori, etiket, görsel yönetimi
- ✅ Yayınlama/arşivleme
- ✅ Beğeni, yorum sistemi
- ✅ Okuma süresi tracking
- ✅ Liderlik tablosu entegrasyonu
- ✅ Public blog görünümü

**Kabul Kriterleri:**

- Admin/Consultant haber oluşturabiliyor
- Firma haberleri okuyup yorum yapabiliyor
- Okuma süresi liderlik tablosuna yansıyor
- Public blog erişilebilir

**Bağımlılıklar:** Sprint 6

**Detaylı Plan:** `sprint-detaylari/sprint-12-haberler-modulu.md`

---

### Sprint 13: Forum Modülü (1 hafta)

**Hedef:** Forum sistemi + Liderlik tablosu entegrasyonu

**Database:**

```sql
- forum_categories (kategoriler)
- forum_topics (konular)
- forum_replies (yanıtlar - nested)
- forum_likes (beğeniler)
- forum_notifications (bildirimler)
- forum_activity (aktivite log)
```

**Backend:**

- Domain: ForumCategory, ForumTopic, ForumReply entities
- Enums: TopicStatus, TopicPriority
- Repository: IForumRepository
- Use Cases: CreateTopic, ReplyTopic, LikeTopic, PinTopic, CloseTopic, MarkSolution
- API Routes: /api/forum/\*

**Frontend:**

- Components: CategoryList, TopicList, TopicDetail, ReplyForm, ReplyCard
- Admin Panel: Kategori yönetimi, moderasyon
- Consultant Panel: Moderasyon, pin/unpin, close/open
- Company Panel: Konu oluşturma, yanıt yazma, beğeni

**Liderlik Tablosu Entegrasyonu:**

- Konu açma: +10 puan
- Yanıt yazma: +5 puan
- Çözüm işaretlenme: +20 puan

**Özellikler:**

- ✅ Kategori sistemi (Admin oluşturur)
- ✅ Konu oluşturma (Firma kullanıcıları)
- ✅ Yanıt sistemi (iç içe - nested)
- ✅ Beğeni sistemi
- ✅ Çözüm işaretleme (best answer)
- ✅ Moderasyon (Consultant)
- ✅ Pin/Unpin (önemli konular)
- ✅ Konu kapatma/açma
- ✅ Bildirimler (yanıt geldiğinde)
- ✅ Arama & filtreleme
- ✅ Liderlik tablosu entegrasyonu

**Çıktılar:**

- ✅ Forum kategorileri oluşturulabiliyor
- ✅ Firmalar konu açabiliyor
- ✅ Yanıt sistemi çalışıyor
- ✅ Moderasyon çalışıyor
- ✅ Bildirimler çalışıyor
- ✅ Liderlik tablosuna yansıyor

**Kabul Kriterleri:**

- Firma kullanıcıları konu açıp yanıt yazabiliyor
- Consultant moderasyon yapabiliyor
- Bildirimler çalışıyor
- Liderlik tablosuna puan yansıyor

**Bağımlılıklar:** Sprint 6, Sprint 7

**Detaylı Plan:** `sprint-detaylari/sprint-13-forum-modulu.md`

---

### Sprint 14: Liderlik Tablosu Sistemi (1 hafta)

**Hedef:** Kapsamlı liderlik tablosu + Rozet sistemi

**Database:**

```sql
- leaderboard_scores (puan kayıtları)
- leaderboard_badges (rozet tanımları)
- company_badges (firma rozetleri)
- leaderboard_rankings (materialized view)
```

**Puan Kaynakları:**

- Proje Yönetimi: Görev tamamlama, alt proje tamamlama, zamanında tamamlama
- Eğitimler: Video izleme, döküman okuma, modül tamamlama
- Etkinlikler: Katılım, zamanında katılım
- Forum: Konu açma, yanıt yazma, çözüm işaretlenme
- Haberler: Haber okuma, tam okuma, yorum yapma
- Randevular: Randevu tamamlama, not ekleme

**Rozet Sistemi:**

- Proje rozetleri: İlk Adım, Görev Avcısı, Proje Ustası
- Eğitim rozetleri: Öğrenmeye Açık, Bilgi Aşığı, Eğitim Şampiyonu
- Etkinlik rozetleri: Katılımcı, Etkinlik Bağımlısı
- Forum rozetleri: Soru Soran, Yardımsever, Çözüm Üreticisi
- Haberler rozetleri: Bilgili, Sektör Takipçisi

**Frontend:**

- Liderlik tablosu sayfası (program bazlı)
- Firma detay modal (puan dağılımı, rozetler)
- Rozet galerisi
- Puan geçmişi
- Trend grafiği (haftalık/aylık)
- Dashboard widget'ı

**Özellikler:**

- ✅ Çok kaynaklı puan sistemi
- ✅ Otomatik puan hesaplama
- ✅ Rozet kazanma sistemi
- ✅ Program bazlı sıralama
- ✅ Trend analizi
- ✅ Puan geçmişi
- ✅ Materialized view (performans)
- ✅ Cron job (günlük güncelleme)

**Çıktılar:**

- ✅ Liderlik tablosu çalışıyor
- ✅ Puanlar otomatik hesaplanıyor
- ✅ Rozetler otomatik veriliyor
- ✅ Trend analizi görüntülenebiliyor

**Kabul Kriterleri:**

- Tüm aktiviteler puan olarak yansıyor
- Liderlik tablosu program bazlı çalışıyor
- Rozetler otomatik veriliyor
- Dashboard'da görüntülenebiliyor

**Bağımlılıklar:** Sprint 8, 9, 10, 12, 13

**Detaylı Plan:** `sprint-detaylari/sprint-14-liderlik-tablosu.md`

---

## 🎯 FAZ 5: E-TİCARET & RAPORLAMA (2 Hafta)

### Sprint 15: E-ticaret Metrikleri & Dashboard (1 hafta)

**Hedef:** Firma e-ticaret verilerini toplama ve görselleştirme

**Database:**

```sql
- ecommerce_metrics (aylık metrikler)
- ecommerce_performance (materialized view)
```

**Metrikler:**

- Alibaba (B2B): Ziyaretçi, ürün, RFQ, sipariş
- B2C (Amazon, Etsy, vb.): Ziyaretçi, ürün, sipariş, gelir

**Frontend:**

- Company Dashboard: Aylık veri girişi formu
- E-ticaret performans tablosu (ayrı liderlik)
- Admin/Consultant: Tüm firmaların verileri
- Bakanlık Dashboard: Toplu istatistikler
- Grafikler: Ziyaretçi, ürün, sipariş, gelir trendi

**Özellikler:**

- ✅ Aylık veri girişi
- ✅ Otomatik hatırlatma (her ayın sonu)
- ✅ E-ticaret performans tablosu
- ✅ Bakanlık dashboard'u
- ✅ Karşılaştırma analizi
- ✅ Trend grafikleri

**Çıktılar:**

- ✅ Firmalar aylık veri girebiliyor
- ✅ E-ticaret performans tablosu çalışıyor
- ✅ Bakanlık dashboard'u hazır
- ✅ Grafikler görüntülenebiliyor

**Kabul Kriterleri:**

- Firma aylık veri girebiliyor
- Veriler görselleştiriliyor
- Bakanlık dashboard'u erişilebilir
- Karşılaştırma analizi çalışıyor

**Bağımlılıklar:** Sprint 6

**Detaylı Plan:** `sprint-detaylari/sprint-15-eticaret-metrikleri.md`

---

### Sprint 16: AI Raporlama Sistemi (1 hafta)

**Hedef:** AI destekli otomatik rapor üretimi

**Database:**

```sql
- progress_reports (raporlar)
- report_templates (şablonlar)
```

**Rapor Tipleri:**

- Ara Rapor (alt proje tamamlandığında)
- Aylık Rapor (her ayın sonu - otomatik)
- Program Raporu (program bitişinde)
- Firma Raporu (istek üzerine)
- Bakanlık Raporu (istek üzerine)

**AI Analizi:**

- Özet (summary)
- Güçlü yönler (strengths)
- Zayıf yönler (weaknesses)
- Öneriler (recommendations)
- Risk skoru (0-100)
- Başarı olasılığı (0-100)

**Özellikler:**

- ✅ Otomatik rapor üretimi (cron job)
- ✅ AI analizi ve öneriler
- ✅ PDF export
- ✅ Email ile gönderim
- ✅ Rapor geçmişi
- ✅ Bakanlık özel dashboard

**Çıktılar:**

- ✅ Otomatik raporlar oluşuyor
- ✅ AI analizi çalışıyor
- ✅ PDF export çalışıyor
- ✅ Bakanlık dashboard'u hazır

**Kabul Kriterleri:**

- Raporlar otomatik oluşuyor
- AI analizi kaliteli
- PDF export çalışıyor
- Bakanlık dashboard'u kullanılabilir

**Bağımlılıklar:** Sprint 15, Sprint 17 (AI Altyapısı)

**Detaylı Plan:** `sprint-detaylari/sprint-16-ai-raporlama.md`

---

## 🎯 FAZ 6: AI ALTYAPISI & OTOMASYON (3 Hafta)

### Sprint 17: AI Altyapısı (1 hafta)

**Hedef:** OpenAI + Claude entegrasyonu

**Services:**

- openai.service.ts (OpenAI GPT-4)
- claude.service.ts (Anthropic Claude)
- ai-router.service.ts (use case bazlı provider seçimi)
- prompt-manager.service.ts (prompt yönetimi)
- token-tracker.service.ts (token sayımı)
- cost-tracker.service.ts (maliyet hesaplama)

**Database:**

```sql
- ai_usage_logs (kullanım logları)
- ai_prompts (prompt şablonları)
```

**Özellikler:**

- ✅ OpenAI API entegrasyonu
- ✅ Claude API entegrasyonu
- ✅ AI router (use case bazlı)
- ✅ Prompt management
- ✅ Token tracking
- ✅ Cost tracking
- ✅ Error handling & retry
- ✅ Rate limiting
- ✅ Caching

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

**Detaylı Plan:** `sprint-detaylari/sprint-17-ai-altyapisi.md`

---

### Sprint 18: AI Özellikleri (1 hafta)

**Hedef:** AI asistan özellikleri

**Özellikler:**

- Görev açıklaması üretimi (AI)
- Eğitim özeti çıkarma (AI)
- Rapor otomatik oluşturma (AI)
- Firma risk analizi (AI)
- Başarı tahmini (AI)
- Trend analizi (AI)

**Frontend:**

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

**Bağımlılıklar:** Sprint 8, 9, 17

**Detaylı Plan:** `sprint-detaylari/sprint-18-ai-ozellikleri.md`

---

### Sprint 19: AI İçerik Otomasyonu (1 hafta)

**Hedef:** AI ile otomatik içerik üretimi ve moderasyon

**AI Haber Otomasyonu:**

- N8N kurulumu (veya custom scraper)
- Haber kaynakları (RSS feed'ler)
- AI ile relevance analizi
- AI ile haber yeniden yazma
- Taslak olarak kaydetme
- Admin/Consultant onay paneli
- Otomatik yayınlama
- Cron job (her gün sabah 09:00)

**AI Forum Moderasyonu:**

- Otomatik spam tespiti (AI)
- Uygunsuz içerik tespiti (AI)
- Konu kategorisi önerisi (AI)
- Benzer konuları bulma (AI)
- Otomatik yanıt önerisi (AI)

**Çıktılar:**

- ✅ Otomatik haber toplama çalışıyor
- ✅ AI ile haber yeniden yazma çalışıyor
- ✅ Onay sistemi çalışıyor
- ✅ Forum moderasyonu çalışıyor

**Kabul Kriterleri:**

- Her gün otomatik haber taslakları oluşuyor
- Admin/Consultant onaylayabiliyor
- Forum spam tespiti çalışıyor

**Bağımlılıklar:** Sprint 12, 13, 17, 18

**Detaylı Plan:** `sprint-detaylari/sprint-19-ai-icerik-otomasyonu.md`

---

## 🎯 FAZ 7: İK YÖNETİMİ (2 Hafta)

### Sprint 20: Kariyer Portalı - Program Bazlı (1 hafta)

**Hedef:** Kariyer başvuru sistemi (program bazlı onay)

**Database:**

```sql
- career_applications (başvurular)
- career_jobs (iş ilanları)
- hr_pool (İK havuzu)
- application_status_history (durum geçmişi)
```

**Akış:**

1. Aday başvuru yapar (program seçer)
2. Danışman'a bildirim gider
3. Danışman inceler → Onaylar/Reddeder
4. Onaylanırsa → İK havuzuna ekler (sadece o program için)
5. Program firmaları İK havuzunda görür

**Frontend:**

- Public kariyer sayfası (/kariyer)
- 3 başvuru formu (Danışman, Stajyer, İK Personeli)
- Program seçimi
- CV upload
- Admin panel: Başvuru yönetimi
- Company panel: İK havuzu

**Çıktılar:**

- ✅ Kariyer başvuruları alınabiliyor
- ✅ Danışman başvuruları inceleyebiliyor
- ✅ İK havuzu çalışıyor
- ✅ Firmalar adayları görebiliyor

**Kabul Kriterleri:**

- Başvuru formu çalışıyor
- CV upload çalışıyor
- Danışman başvuruları yönetebiliyor
- Firmalar İK havuzunu görebiliyor

**Bağımlılıklar:** Sprint 6

**Detaylı Plan:** `sprint-detaylari/sprint-20-kariyer-portali.md`

---

### Sprint 21: AI Kariyer Matching (1 hafta)

**Hedef:** AI ile aday-firma eşleştirme

**AI Matching:**

- CV analizi (AI)
- Firma-aday eşleştirme (AI)
- Match score hesaplama (0-100)
- Otomatik öneri sistemi
- Smart search

**İş İlanları:**

- Firma iş ilanı oluşturma
- AI ile ilan optimizasyonu
- Otomatik aday önerisi (AI)

**Çıktılar:**

- ✅ CV analizi çalışıyor
- ✅ AI matching çalışıyor
- ✅ İş ilanları yayınlanabiliyor
- ✅ Otomatik öneriler çalışıyor

**Kabul Kriterleri:**

- AI CV'yi analiz edebiliyor
- Match score hesaplanıyor
- Firmaya uygun adaylar öneriliyor
- İş ilanları çalışıyor

**Bağımlılıklar:** Sprint 17, 18, 20

**Detaylı Plan:** `sprint-detaylari/sprint-21-ai-kariyer-matching.md`

---

## 🎯 FAZ 8: PUBLIC WEBSITE & CMS (2 Hafta)

### Sprint 22: Public Website (1 hafta)

**Hedef:** Public website sayfaları

**Sayfalar:**

- Ana Sayfa (/)
- Program Hakkında (/program)
- Destekler (/destekler)
- Platform Özellikleri (/ozellikler)
- Başarı Hikayeleri (/basari-hikayeleri)
- SSS (/sss)
- İletişim & Başvuru (/iletisim)
- Kariyer (/kariyer) - Sprint 20'de yapıldı
- Blog (/blog) - Sprint 12'de yapıldı
- Login (/login) - Zaten var

**Özellikler:**

- ✅ Responsive design
- ✅ SEO optimization
- ✅ Performance optimization
- ✅ Contact form
- ✅ Application form

**Çıktılar:**

- ✅ Public website yayında
- ✅ SEO optimize edildi
- ✅ Responsive

**Kabul Kriterleri:**

- Public website erişilebilir
- SEO skorları yüksek
- Responsive çalışıyor

**Bağımlılıklar:** -

**Detaylı Plan:** `sprint-detaylari/sprint-22-public-website.md`

---

### Sprint 23: CMS (Site Yönetimi) (1 hafta)

**Hedef:** Admin'in site içeriğini yönetebilmesi

**Database:**

```sql
- cms_pages (sayfalar)
- cms_sections (bölümler)
- cms_media (medya)
- cms_settings (ayarlar)
```

**Özellikler:**

- Sayfa yönetimi (CRUD)
- Bölüm yönetimi (drag-drop)
- Medya yönetimi (upload)
- Site ayarları (genel, iletişim, sosyal medya, analytics)
- Rich text editor (TipTap)
- Image upload
- SEO ayarları
- Önizleme
- Yayınlama/arşivleme

**Çıktılar:**

- ✅ Admin site içeriğini yönetebiliyor
- ✅ Rich text editor çalışıyor
- ✅ Medya yönetimi çalışıyor
- ✅ Site ayarları çalışıyor

**Kabul Kriterleri:**

- Admin sayfaları düzenleyebiliyor
- Medya upload çalışıyor
- Site ayarları kaydediliyor
- Önizleme çalışıyor

**Bağımlılıklar:** Sprint 22

**Detaylı Plan:** `sprint-detaylari/sprint-23-cms.md`

---

## 🎯 FAZ 9: CHATBOT & BİLDİRİMLER (2 Hafta)

### Sprint 24: Email Sistemi (0.5 hafta)

**Hedef:** SendGrid entegrasyonu + Email templates

**Özellikler:**

- SendGrid API entegrasyonu
- Email service layer
- Email templates (MJML)
- Email queue system
- Email analytics
- Email tercihleri

**Çıktılar:**

- ✅ Email gönderimi çalışıyor
- ✅ Template sistemi hazır
- ✅ Queue sistemi çalışıyor

**Kabul Kriterleri:**

- Email'ler gönderiliyor
- Template'ler render ediliyor
- Kullanıcılar tercihleri yönetebiliyor

**Bağımlılıklar:** Sprint 2

**Detaylı Plan:** `sprint-detaylari/sprint-24-email-sistemi.md`

---

### Sprint 25: Chatbot (1 hafta)

**Hedef:** AI Chatbot tüm panellerde

**Özellikler:**

- Chatbot UI component
- Chatbot backend (streaming)
- Context management
- Intent detection
- Eğitim içeriği arama
- Akıllı yönlendirme
- Tüm panellere entegrasyon
- Chatbot analytics

**Çıktılar:**

- ✅ Chatbot tüm panellerde çalışıyor
- ✅ Streaming responses çalışıyor
- ✅ Intent detection çalışıyor
- ✅ Eğitim arama çalışıyor

**Kabul Kriterleri:**

- Chatbot soruları anlayıp yanıt verebiliyor
- Kullanıcıları doğru yönlendirebiliyor
- Eğitim içeriği arayabiliyor
- Tüm panellerde erişilebilir

**Bağımlılıklar:** Sprint 9, 17, 18

**Detaylı Plan:** `sprint-detaylari/sprint-25-chatbot.md`

---

### Sprint 26: Bildirim Sistemi (0.5 hafta)

**Hedef:** Kapsamlı bildirim sistemi

**Özellikler:**

- In-app notifications
- Push notifications (OneSignal)
- WhatsApp entegrasyonu
- Bildirim tercihleri
- Bildirim geçmişi
- Real-time bildirimler

**Çıktılar:**

- ✅ In-app bildirimler çalışıyor
- ✅ Push notifications çalışıyor
- ✅ WhatsApp entegrasyonu çalışıyor
- ✅ Bildirim tercihleri çalışıyor

**Kabul Kriterleri:**

- Bildirimler gerçek zamanlı geliyor
- Kullanıcılar tercihlerini yönetebiliyor
- WhatsApp mesajları gidiyor

**Bağımlılıklar:** Sprint 2, 24

**Detaylı Plan:** `sprint-detaylari/sprint-26-bildirim-sistemi.md`

---

## 🎯 FAZ 10: DASHBOARD & PRODUCTION (1 Hafta)

### Sprint 27: Dashboard & Analytics (0.5 hafta)

**Hedef:** Gelişmiş dashboard ve analitik

**Özellikler:**

- Dashboard iyileştirmeleri
- Custom reports
- Export functionality (PDF, Excel)
- Google Analytics 4 entegrasyonu
- Mixpanel entegrasyonu
- AI-powered insights

**Çıktılar:**

- ✅ Dashboard'lar iyileştirildi
- ✅ Custom raporlar oluşturulabiliyor
- ✅ Analytics çalışıyor
- ✅ AI insights çalışıyor

**Kabul Kriterleri:**

- Dashboard'lar bilgilendirici
- Raporlar export edilebiliyor
- Analytics verisi toplanıyor
- AI insights üretilebiliyor

**Bağımlılıklar:** Sprint 17, 18

**Detaylı Plan:** `sprint-detaylari/sprint-27-dashboard-analytics.md`

---

### Sprint 28: Production Hazırlık (0.5 hafta)

**Hedef:** Production'a hazır

**Görevler:**

- Environment variables kontrolü
- Database migration kontrolü
- RLS policies kontrolü
- Error tracking (Sentry)
- Monitoring setup
- Backup stratejisi
- SSL sertifikası
- Domain setup
- CDN setup
- Performance optimization
- Security audit
- Documentation completion

**Çıktılar:**

- ✅ Production ortamı hazır
- ✅ Monitoring aktif
- ✅ Backup çalışıyor
- ✅ Security audit tamamlandı

**Kabul Kriterleri:**

- Production ortamı çalışıyor
- Monitoring aktif
- Backup stratejisi hazır
- Security audit tamamlandı

**Bağımlılıklar:** Tüm sprint'ler

**Detaylı Plan:** `sprint-detaylari/sprint-28-production-hazirlik.md`

---

## 📊 PROJE İSTATİSTİKLERİ

### Tamamlanan Sprint'ler: 11/28 (%39)

### Kalan Sprint'ler: 17/28 (%61)

### Tahmini Kalan Süre: 17-19 hafta

### Modül Dağılımı:

- ✅ Temel Altyapı: 3 sprint (Tamamlandı)
- ✅ Core Modules: 4 sprint (Tamamlandı)
- ✅ Project & Training: 4 sprint (Tamamlandı)
- 🏃 İçerik & Topluluk: 3 sprint (Devam ediyor)
- 📋 E-ticaret & Raporlama: 2 sprint (Planlandı)
- 📋 AI Altyapısı: 3 sprint (Planlandı)
- 📋 İK Yönetimi: 2 sprint (Planlandı)
- 📋 Public Website & CMS: 2 sprint (Planlandı)
- 📋 Chatbot & Bildirimler: 2 sprint (Planlandı)
- 📋 Dashboard & Production: 1 sprint (Planlandı)

---

## 🎯 SONRAKİ ADIMLAR

1. ✅ **Sprint 12: Haberler Modülü** - Devam ediyor
2. 📋 **Sprint 13: Forum Modülü** - Sonraki
3. 📋 **Sprint 14: Liderlik Tablosu** - Kritik (tüm modülleri birleştirir)

---

## 📚 DOKÜMANTASYON

- ✅ [Architecture](../docs/ARCHITECTURE.md)
- ✅ [API Documentation](../docs/API-DOCUMENTATION.md)
- ✅ [Developer Guide](../docs/DEVELOPER.md)
- ✅ [Proje Durum Raporu](../docs/PROJE-DURUM-RAPORU.md)

---

**Son Güncelleme:** 10 Kasım 2025  
**Güncelleme Notu:** Kullanıcı notlarına göre kapsamlı revize edildi. Liderlik tablosu, e-ticaret metrikleri, AI raporlama, program bazlı İK yönetimi ve CMS modülleri eklendi.
