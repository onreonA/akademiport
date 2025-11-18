# Sprint 19: AI İçerik Otomasyonu

## Genel Bakış

Sprint 19, AI destekli içerik otomasyonu ve moderasyon sistemini içerir. RSS feed'lerden haber çekme, AI ile haber yeniden yazma, forum ve haber spam tespiti gibi özellikler eklenmiştir.

## Tamamlanan Özellikler

### Faz 1: AI Haber Otomasyonu ✅

#### 1.1 RSS Feed Scraping Service

- RSS feed parsing servisi (`rss-feed.service.ts`)
- `rss-parser` kütüphanesi entegrasyonu
- Feed item'ları parse etme ve kaydetme

#### 1.2 AI Haber Yeniden Yazma

- `RewriteNewsWithAIUseCase` - AI ile haber yeniden yazma
- Prompt template yönetimi
- SEO uyumlu içerik üretimi

#### 1.3 Cron Job

- `process-rss-feeds` cron job
- Aktif feed'leri otomatik kontrol
- Yeni item'ları bulma ve kaydetme
- Otomatik yayınlama (opsiyonel)

#### 1.4 Frontend

- RSS Feed yönetim paneli (`/admin-dashboard/news/rss-feeds`)
- Feed listesi ve form
- Feed durumu ve istatistikleri

### Faz 2: AI Forum Moderasyonu ✅

#### 2.1 DetectSpamUseCase

- Forum topic ve reply spam tespiti
- Spam skoru (0-100)
- Otomatik öneriler (approve/reject/review)

#### 2.2 AnalyzeForumContentUseCase

- Forum içerik kalite analizi
- Duygu analizi
- Kategori uyumu kontrolü

#### 2.3 Cron Job

- `moderate-forum-content` cron job
- Bekleyen topic/reply'leri otomatik moderasyon
- Spam detection sonuçlarına göre otomatik işlem

#### 2.4 Frontend

- Forum moderasyon paneli (`/admin-dashboard/forum/moderate`)
- Bekleyen içerik listesi
- Spam skoru gösterimi
- Manuel onay/reddet butonları

### Faz 3: Haber Spam Tespiti ✅

#### 3.1 DetectNewsSpamUseCase

- Haber spam tespiti
- Clickbait, promosyon, SEO spam tespiti
- Spam skoru ve öneriler

#### 3.2 Frontend

- Haber moderasyon paneli (`/admin-dashboard/news/moderate`)
- Bekleyen haber listesi
- Spam skoru gösterimi
- Manuel onay/reddet/yayınla butonları

## Database Migrations

1. **042_create_rss_feeds_table.sql** - RSS feed'ler ve feed item'ları tablosu
2. **043_add_news_rewrite_prompt.sql** - Haber yeniden yazma prompt template
3. **044_add_spam_detection_table.sql** - Forum spam detection tablosu
4. **045_add_forum_moderation_prompt.sql** - Forum moderasyon prompt template
5. **046_add_news_spam_detection_table.sql** - Haber spam detection tablosu

## API Endpoints

### RSS Feeds

- `GET /api/rss-feeds` - RSS feed listesi
- `POST /api/rss-feeds` - Yeni RSS feed oluştur
- `GET /api/rss-feeds/[id]` - RSS feed detayı
- `PUT /api/rss-feeds/[id]` - RSS feed güncelle
- `DELETE /api/rss-feeds/[id]` - RSS feed sil
- `GET /api/rss-feeds/[id]/items` - Feed item'ları

### AI News

- `POST /api/ai/news/rewrite` - AI ile haber yeniden yaz
- `POST /api/ai/news/detect-spam` - Haber spam tespiti

### AI Forum

- `POST /api/ai/forum/detect-spam` - Forum spam tespiti
- `POST /api/ai/forum/analyze-content` - Forum içerik analizi

### Moderation

- `GET /api/forum/moderate` - Bekleyen forum içerikleri
- `POST /api/forum/moderate` - Forum içeriği onayla/reddet
- `GET /api/news/moderate` - Bekleyen haberler
- `POST /api/news/moderate` - Haber onayla/reddet/yayınla

### Cron Jobs

- `GET /api/cron/process-rss-feeds` - RSS feed'leri işle
- `GET /api/cron/moderate-forum-content` - Forum içeriklerini moderasyon yap

## Kullanım Örnekleri

### RSS Feed Ekleme

```typescript
const response = await fetch('/api/rss-feeds', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    programId: 'prog-1',
    name: 'E-İhracat Haberleri',
    feedUrl: 'https://example.com/rss.xml',
    description: 'E-ihracat ile ilgili haberler',
    category: 'E-İhracat',
    isActive: true,
    autoPublish: false,
    checkIntervalMinutes: 360,
  }),
});
```

### Haber Yeniden Yazma

```typescript
const response = await fetch('/api/ai/news/rewrite', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    feedItemId: 'item-1',
    targetCategory: 'E-İhracat',
    targetProgramId: 'prog-1',
  }),
});
```

### Spam Tespiti

```typescript
// Forum spam tespiti
const response = await fetch('/api/ai/forum/detect-spam', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topicId: 'topic-1',
    content: 'Topic content',
  }),
});

// Haber spam tespiti
const response = await fetch('/api/ai/news/detect-spam', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    newsId: 'news-1',
  }),
});
```

## Testler

- `DetectSpamUseCase.test.ts` - Forum spam tespiti testleri
- `DetectNewsSpamUseCase.test.ts` - Haber spam tespiti testleri
- `RewriteNewsWithAIUseCase.test.ts` - Haber yeniden yazma testleri

## Notlar

- RSS feed'ler her 6 saatte bir kontrol edilir (varsayılan)
- Spam skoru < 40: Otomatik onay
- Spam skoru >= 70: Otomatik reddet
- Spam skoru 40-69: Admin onayı gerekli
- Cron job'lar `CRON_SECRET` header'ı ile korunur

## Gelecek Geliştirmeler

- [ ] RSS feed kategorileri
- [ ] Feed item filtreleme ve arama
- [ ] Spam detection istatistikleri
- [ ] Otomatik moderasyon kuralları özelleştirme
- [ ] Email bildirimleri (spam tespiti sonrası)
