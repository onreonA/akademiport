# 🤖 Sprint 19: AI İçerik Otomasyonu - Başlangıç Planı

**Başlangıç Tarihi:** 17 Kasım 2025  
**Tahmini Süre:** 1 hafta (40 saat)  
**Durum:** 🔴 BAŞLANIYOR  
**Bağımlılıklar:** ✅ Sprint 12, 13, 17, 18 (Tamamlandı)

---

## 🎯 Sprint Hedefi

AI ile otomatik içerik üretimi ve moderasyon:

1. **AI Haber Otomasyonu** (RSS scraping + AI rewrite)
2. **AI Forum Moderasyonu** (spam tespiti, içerik analizi)
3. **Otomatik Spam Tespiti** (haber ve forum için)

---

## 📋 DETAYLI GÖREV LİSTESİ

### Faz 1: AI Haber Otomasyonu (12 saat)

#### 1.1 RSS Feed Scraping Service (4 saat)

**Hedef:** RSS feed'lerden haber çekme servisi

**Yapılacaklar:**

- [ ] `RSSFeedService` oluştur (`src/5-shared/services/rss/`)
  - RSS feed parsing (rss-parser kütüphanesi)
  - Feed URL yönetimi
  - Error handling ve retry logic
  - Rate limiting

- [ ] Database migration: `042_create_rss_feeds_table.sql`
  - `rss_feeds` tablosu
  - `rss_feed_items` tablosu (scraped items)
  - RLS policies

- [ ] Repository: `RSSFeedRepository`
  - Feed CRUD operations
  - Feed item CRUD operations
  - Feed status tracking

**Kullanım Senaryosu:**

1. Admin RSS feed URL'i ekler
2. Cron job RSS feed'leri kontrol eder
3. Yeni haberler `rss_feed_items` tablosuna kaydedilir

---

#### 1.2 AI Haber Yeniden Yazma Use Case (4 saat)

**Hedef:** RSS'den gelen haberleri AI ile yeniden yazma

**Yapılacaklar:**

- [ ] `RewriteNewsWithAIUseCase` oluştur
  - RSS feed item'ı alır
  - AI'a gönderir (rewrite prompt)
  - Yeniden yazılmış içeriği döner
  - Token ve cost tracking

- [ ] Prompt template: `rewrite-news.md`
  - Türkçe'ye çevir
  - E-ihracat odaklı yeniden yaz
  - SEO optimize et
  - Başlık ve özet üret

- [ ] API endpoint: `POST /api/ai/news/rewrite`
  - RSS feed item ID alır
  - AI rewrite yapar
  - Döner (preview için)

**Kullanım Senaryosu:**

1. Admin RSS feed item'ı seçer
2. "AI ile Yeniden Yaz" butonuna tıklar
3. AI haber içeriğini yeniden yazar
4. Admin onaylar veya düzenler
5. Haber olarak kaydedilir

---

#### 1.3 Otomatik Haber Üretimi Cron Job (2 saat)

**Hedef:** Belirli aralıklarla RSS feed'leri kontrol et ve haber üret

**Yapılacaklar:**

- [ ] Cron job: `src/app/api/cron/process-rss-feeds/route.ts`
  - Her 6 saatte bir çalışır
  - Aktif RSS feed'leri kontrol eder
  - Yeni item'ları bulur
  - AI rewrite yapar
  - Otomatik olarak haber oluşturur (draft)

- [ ] Configuration: RSS feed ayarları
  - Otomatik yayınlama (on/off)
  - Kategori mapping
  - Program mapping

**Kullanım Senaryosu:**

1. Cron job çalışır
2. RSS feed'lerden yeni haberler bulur
3. AI ile yeniden yazar
4. Draft olarak haber oluşturur
5. Admin onaylar ve yayınlar

---

#### 1.4 Frontend: RSS Feed Yönetimi (2 saat)

**Hedef:** Admin RSS feed'leri yönetebilsin

**Yapılacaklar:**

- [ ] Sayfa: `src/app/admin-dashboard/news/rss-feeds/page.tsx`
  - RSS feed listesi
  - RSS feed ekleme formu
  - RSS feed düzenleme
  - RSS feed silme
  - RSS feed durumu (aktif/pasif)

- [ ] Component: `RSSFeedList.tsx`
  - Feed listesi
  - Son kontrol zamanı
  - Yeni item sayısı

- [ ] Component: `RSSFeedForm.tsx`
  - Feed URL input
  - Kategori seçimi
  - Program seçimi
  - Otomatik yayınlama toggle

**Kullanım Senaryosu:**

1. Admin RSS feed ekler
2. Feed durumunu görür
3. Yeni item'ları görür
4. AI rewrite yapar ve haber oluşturur

---

### Faz 2: AI Forum Moderasyonu (16 saat)

#### 2.1 Spam Tespiti Use Case (6 saat)

**Hedef:** Forum topic ve reply'lerde spam tespiti

**Yapılacaklar:**

- [ ] `DetectSpamUseCase` oluştur
  - Topic/reply içeriğini analiz eder
  - AI'a gönderir (spam detection prompt)
  - Spam skoru döner (0-100)
  - Spam kriterleri:
    - Link spam
    - Tekrarlayan içerik
    - Promosyon içeriği
    - Uygunsuz dil

- [ ] Prompt template: `detect-spam.md`
  - İçerik analizi
  - Spam skoru (0-100)
  - Spam nedeni
  - Öneri (onayla/reddet)

- [ ] Database migration: `043_add_spam_detection.sql`
  - `spam_detections` tablosu
  - Topic/reply ile ilişki
  - Spam skoru
  - AI analiz sonucu

- [ ] API endpoint: `POST /api/ai/forum/detect-spam`
  - Topic ID veya Reply ID alır
  - Spam analizi yapar
  - Sonucu döner

**Kullanım Senaryosu:**

1. Kullanıcı topic/reply oluşturur
2. Otomatik spam kontrolü yapılır
3. Spam skoru yüksekse (>=70) otomatik reddedilir
4. Orta seviye (40-69) admin onayı bekler
5. Düşük seviye (<40) otomatik onaylanır

---

#### 2.2 İçerik Analizi Use Case (4 saat)

**Hedef:** Forum içeriğini analiz et ve öneriler sun

**Yapılacaklar:**

- [ ] `AnalyzeForumContentUseCase` oluştur
  - Topic/reply içeriğini analiz eder
  - AI'a gönderir (content analysis prompt)
  - Analiz sonucu döner:
    - İçerik kalitesi (0-100)
    - Uygunluk (uygun/değil)
    - Kategori önerisi
    - İyileştirme önerileri

- [ ] Prompt template: `analyze-forum-content.md`
  - İçerik analizi
  - Kalite skoru
  - Uygunluk kontrolü
  - Öneriler

- [ ] API endpoint: `POST /api/ai/forum/analyze-content`
  - Topic ID veya Reply ID alır
  - İçerik analizi yapar
  - Sonucu döner

**Kullanım Senaryosu:**

1. Admin topic/reply'i analiz etmek ister
2. "AI Analiz" butonuna tıklar
3. AI içerik analizi yapar
4. Kalite skoru ve öneriler gösterilir
5. Admin karar verir

---

#### 2.3 Otomatik Moderasyon Cron Job (3 saat)

**Hedef:** Bekleyen topic/reply'leri otomatik moderasyon yap

**Yapılacaklar:**

- [ ] Cron job: `src/app/api/cron/moderate-forum-content/route.ts`
  - Her 15 dakikada bir çalışır
  - Bekleyen topic/reply'leri bulur
  - Spam kontrolü yapar
  - Otomatik onay/reddet yapar
  - Admin'e bildirim gönderir

- [ ] Configuration: Moderasyon ayarları
  - Otomatik onay eşiği (<40)
  - Otomatik reddet eşiği (>=70)
  - Admin onayı gereken eşik (40-69)

**Kullanım Senaryosu:**

1. Cron job çalışır
2. Bekleyen içerikleri bulur
3. Spam kontrolü yapar
4. Skora göre otomatik karar verir
5. Admin'e bildirim gönderir

---

#### 2.4 Frontend: Moderasyon Paneli (3 saat)

**Hedef:** Admin forum içeriklerini moderasyon yapabilsin

**Yapılacaklar:**

- [ ] Sayfa: `src/app/admin-dashboard/forum/moderate/page.tsx`
  - Bekleyen topic/reply listesi
  - Spam skoru gösterimi
  - AI analiz sonuçları
  - Onay/Reddet butonları

- [ ] Component: `ModerationQueue.tsx`
  - Bekleyen içerikler listesi
  - Filtreleme (spam skoru, kategori)
  - Toplu işlemler

- [ ] Component: `ContentAnalysis.tsx`
  - AI analiz sonuçları
  - Spam skoru gösterimi
  - Öneriler

**Kullanım Senaryosu:**

1. Admin moderasyon panelini açar
2. Bekleyen içerikleri görür
3. AI analiz sonuçlarını görür
4. Onay/Reddet kararı verir

---

### Faz 3: Haber Spam Tespiti (4 saat)

#### 3.1 Haber Spam Tespiti Use Case (2 saat)

**Hedef:** Haber içeriğinde spam tespiti

**Yapılacaklar:**

- [ ] `DetectNewsSpamUseCase` oluştur
  - Haber içeriğini analiz eder
  - AI'a gönderir (spam detection prompt)
  - Spam skoru döner
  - Spam kriterleri:
    - Promosyon içeriği
    - Link spam
    - Tekrarlayan içerik

- [ ] API endpoint: `POST /api/ai/news/detect-spam`
  - News ID alır
  - Spam analizi yapar
  - Sonucu döner

**Kullanım Senaryosu:**

1. Admin haber oluşturur
2. Otomatik spam kontrolü yapılır
3. Spam skoru gösterilir
4. Admin karar verir

---

#### 3.2 Frontend: Haber Spam Kontrolü (2 saat)

**Hedef:** Haber oluştururken spam kontrolü

**Yapılacaklar:**

- [ ] Component: `NewsSpamCheck.tsx`
  - Haber içeriğini analiz eder
  - Spam skoru gösterir
  - Uyarı mesajları

- [ ] News form'a entegre et
  - "Spam Kontrolü" butonu
  - Spam skoru gösterimi
  - Uyarı mesajları

**Kullanım Senaryosu:**

1. Admin haber oluşturur
2. "Spam Kontrolü" butonuna tıklar
3. Spam skoru gösterilir
4. Gerekirse içeriği düzenler

---

### Faz 4: Test ve Dokümantasyon (8 saat)

#### 4.1 Unit Tests (4 saat)

**Yapılacaklar:**

- [ ] `RewriteNewsWithAIUseCase.test.ts`
- [ ] `DetectSpamUseCase.test.ts`
- [ ] `AnalyzeForumContentUseCase.test.ts`
- [ ] `DetectNewsSpamUseCase.test.ts`
- [ ] `RSSFeedService.test.ts`

---

#### 4.2 Integration Tests (2 saat)

**Yapılacaklar:**

- [ ] API route testleri
- [ ] Cron job testleri
- [ ] Database migration testleri

---

#### 4.3 Dokümantasyon (2 saat)

**Yapılacaklar:**

- [ ] Sprint 19 tamamlama raporu
- [ ] API dokümantasyonu
- [ ] Kullanım kılavuzu

---

## 📊 İLERLEME TAKİBİ

| Faz | Görev                        | Durum | Tahmini Süre | Gerçek Süre |
| --- | ---------------------------- | ----- | ------------ | ----------- |
| 1   | RSS Feed Scraping            | ⏳    | 4 saat       | -           |
| 1   | AI Haber Yeniden Yazma       | ⏳    | 4 saat       | -           |
| 1   | Otomatik Haber Üretimi       | ⏳    | 2 saat       | -           |
| 1   | RSS Feed Yönetimi Frontend   | ⏳    | 2 saat       | -           |
| 2   | Spam Tespiti Use Case        | ⏳    | 6 saat       | -           |
| 2   | İçerik Analizi Use Case      | ⏳    | 4 saat       | -           |
| 2   | Otomatik Moderasyon Cron     | ⏳    | 3 saat       | -           |
| 2   | Moderasyon Paneli Frontend   | ⏳    | 3 saat       | -           |
| 3   | Haber Spam Tespiti           | ⏳    | 2 saat       | -           |
| 3   | Haber Spam Kontrolü Frontend | ⏳    | 2 saat       | -           |
| 4   | Test ve Dokümantasyon        | ⏳    | 8 saat       | -           |

**Toplam:** 40 saat

---

## 🎯 BAŞARI KRİTERLERİ

- ✅ RSS feed'lerden haber çekilebiliyor
- ✅ AI ile haber yeniden yazılabiliyor
- ✅ Otomatik haber üretimi çalışıyor
- ✅ Forum spam tespiti çalışıyor
- ✅ Forum içerik analizi çalışıyor
- ✅ Otomatik moderasyon çalışıyor
- ✅ Haber spam tespiti çalışıyor
- ✅ Tüm testler geçiyor

---

## 📝 NOTLAR

- RSS feed scraping için `rss-parser` kütüphanesi kullanılacak
- AI prompt'ları Türkçe olacak
- Spam skoru 0-100 arası olacak
- Otomatik moderasyon eşikleri yapılandırılabilir olacak
- Tüm AI işlemleri token ve cost tracking ile takip edilecek

---

## 🚀 SONRAKİ ADIMLAR

1. RSS feed scraping servisi kurulumu
2. AI haber yeniden yazma use case'i
3. Spam tespiti use case'i
4. Frontend entegrasyonları
5. Test ve dokümantasyon

---

**Hazırlayan:** AI Assistant  
**Onay:** Bekliyor  
**Durum:** 🔴 BAŞLANIYOR
