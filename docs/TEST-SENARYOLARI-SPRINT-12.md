# 📋 SPRINT 12: HABERLER MODÜLÜ - TEST SENARYOLARI

## 🎯 TEST STRATEJİSİ

Testler küçük gruplar halinde, aşağıdan yukarıya (bottom-up) yaklaşımla yazılacak:

1. **GRUP 1: Domain Layer Tests** (Entity, Enums, Validation)
2. **GRUP 2: Use Case Tests** (Business Logic)
3. **GRUP 3: Repository Integration Tests** (Database)
4. **GRUP 4: API Route Tests** (HTTP Endpoints)
5. **GRUP 5: Component Tests** (React Components)
6. **GRUP 6: E2E Tests** (User Flows)

---

## 📝 TEST SENARYOLARI

### GRUP 1: Domain Layer Tests

#### 1.1 NewsEnums Tests

- ✅ `NewsCategory` enum değerleri doğru mu?
- ✅ `NewsStatus` enum değerleri doğru mu?
- ✅ Label mapping'ler doğru mu?
- ✅ Status color mapping'ler doğru mu?

#### 1.2 NewsEntity Tests

- ✅ Entity oluşturma başarılı mı?
- ✅ `isPublished()` metodu doğru çalışıyor mu?
- ✅ `isDraft()` metodu doğru çalışıyor mu?
- ✅ `isArchived()` metodu doğru çalışıyor mu?
- ✅ `publish()` metodu status'u güncelliyor mu?
- ✅ `archive()` metodu status'u güncelliyor mu?
- ✅ `unpublish()` metodu status'u güncelliyor mu?
- ✅ `feature()` / `unfeature()` metodları çalışıyor mu?
- ✅ `pin()` / `unpin()` metodları çalışıyor mu?
- ✅ `calculateReadingTime()` metodu doğru hesaplıyor mu?
- ✅ `validate()` metodu tüm hataları yakalıyor mu?
  - Boş başlık
  - Çok uzun başlık (>500)
  - Boş içerik
  - Eksik programId
  - Eksik authorId
  - Çok uzun özet (>500)
  - Çok uzun meta description (>160)

---

### GRUP 2: Use Case Tests

#### 2.1 CreateNewsUseCase Tests

- ✅ Geçerli DTO ile haber oluşturma başarılı mı?
- ✅ Slug otomatik oluşturuluyor mu? (Türkçe karakter desteği)
- ✅ Aynı başlıkta haber oluşturma engelleniyor mu?
- ✅ Reading time otomatik hesaplanıyor mu?
- ✅ Tag'ler doğru ekleniyor mu?
- ✅ Validation hataları doğru dönüyor mu?
- ✅ Program ID eksikse hata veriyor mu?
- ✅ Author ID eksikse hata veriyor mu?

#### 2.2 UpdateNewsUseCase Tests

- ✅ Haber bulunamazsa hata veriyor mu?
- ✅ Geçerli güncelleme başarılı mı?
- ✅ Content değiştiğinde reading time yeniden hesaplanıyor mu?
- ✅ Tag'ler doğru güncelleniyor mu? (ekleme, çıkarma)
- ✅ Validation hataları doğru dönüyor mu?

#### 2.3 PublishNewsUseCase Tests

- ✅ Haber bulunamazsa hata veriyor mu?
- ✅ Draft haber yayınlanıyor mu?
- ✅ Zaten yayında olan haber tekrar yayınlanamıyor mu?
- ✅ `publishedAt` tarihi set ediliyor mu?

#### 2.4 RecordNewsReadUseCase Tests

- ✅ Haber bulunamazsa hata veriyor mu?
- ✅ Okuma kaydı başarılı mı?
- ✅ Scroll percentage >80 ise `completed` true oluyor mu?
- ✅ Read duration doğru kaydediliyor mu?

#### 2.5 GetNewsListUseCase Tests

- ✅ Filtreleme çalışıyor mu? (programId, category, status)
- ✅ Arama çalışıyor mu? (title, summary, content)
- ✅ Pagination çalışıyor mu?
- ✅ Sıralama doğru mu? (pinned first, then published_at DESC)

---

### GRUP 3: Repository Integration Tests

#### 3.1 SupabaseNewsRepository CRUD Tests

- ✅ `create()` başarılı mı?
- ✅ `findById()` doğru haber döndürüyor mu?
- ✅ `findBySlug()` doğru haber döndürüyor mu?
- ✅ `findAll()` filtreleme ile çalışıyor mu?
- ✅ `update()` başarılı mı?
- ✅ `delete()` başarılı mı?

#### 3.2 Status Operations Tests

- ✅ `publish()` başarılı mı?
- ✅ `archive()` başarılı mı?
- ✅ `unpublish()` başarılı mı?

#### 3.3 Feature Operations Tests

- ✅ `feature()` / `unfeature()` çalışıyor mu?
- ✅ `pin()` / `unpin()` çalışıyor mu?

#### 3.4 Tag Operations Tests

- ✅ `getTags()` tüm tag'leri döndürüyor mu?
- ✅ `createTag()` başarılı mı?
- ✅ `addTagToNews()` başarılı mı?
- ✅ `removeTagFromNews()` başarılı mı?
- ✅ `getNewsTags()` doğru tag'leri döndürüyor mu?

#### 3.5 Comment Operations Tests

- ✅ `createComment()` başarılı mı?
- ✅ `getComments()` doğru yorumları döndürüyor mu?
- ✅ `updateComment()` başarılı mı?
- ✅ `deleteComment()` başarılı mı?
- ✅ `approveComment()` başarılı mı?

#### 3.6 Like Operations Tests

- ✅ `likeNews()` başarılı mı?
- ✅ `unlikeNews()` başarılı mı?
- ✅ `isLikedByUser()` doğru sonuç döndürüyor mu?

#### 3.7 Read Operations Tests

- ✅ `recordRead()` başarılı mı?
- ✅ `getUserReads()` doğru okumaları döndürüyor mu?
- ✅ `getNewsReads()` doğru okumaları döndürüyor mu?

#### 3.8 Statistics Tests

- ✅ `getStatistics()` doğru istatistikleri döndürüyor mu?

---

### GRUP 4: API Route Tests

#### 4.1 GET /api/news Tests

- ✅ Yetkisiz kullanıcı erişemiyor mu?
- ✅ Liste başarıyla dönüyor mu?
- ✅ Filtreleme query params ile çalışıyor mu?
- ✅ Pagination çalışıyor mu?

#### 4.2 POST /api/news Tests

- ✅ Yetkisiz kullanıcı erişemiyor mu?
- ✅ Non-admin/consultant erişemiyor mu?
- ✅ Geçerli haber oluşturma başarılı mı?
- ✅ Validation hataları doğru dönüyor mu?
- ✅ 201 status code dönüyor mu?

#### 4.3 GET /api/news/[id] Tests

- ✅ Yetkisiz kullanıcı erişemiyor mu?
- ✅ Haber bulunamazsa 404 dönüyor mu?
- ✅ Başarılı detay dönüyor mu?
- ✅ Tag'ler dahil mi?

#### 4.4 PUT /api/news/[id] Tests

- ✅ Yetkisiz kullanıcı erişemiyor mu?
- ✅ Non-admin/consultant erişemiyor mu?
- ✅ Geçerli güncelleme başarılı mı?
- ✅ Haber bulunamazsa 404 dönüyor mu?

#### 4.5 DELETE /api/news/[id] Tests

- ✅ Yetkisiz kullanıcı erişemiyor mu?
- ✅ Non-admin/consultant erişemiyor mu?
- ✅ Silme başarılı mı?
- ✅ Haber bulunamazsa 404 dönüyor mu?

#### 4.6 POST /api/news/[id]/publish Tests

- ✅ Yetkisiz kullanıcı erişemiyor mu?
- ✅ Non-admin/consultant erişemiyor mu?
- ✅ Yayınlama başarılı mı?
- ✅ Zaten yayında olan haber tekrar yayınlanamıyor mu?

#### 4.7 POST /api/news/[id]/like Tests

- ✅ Yetkisiz kullanıcı erişemiyor mu?
- ✅ Beğeni başarılı mı?
- ✅ Duplicate beğeni engelleniyor mu?

#### 4.8 DELETE /api/news/[id]/like Tests

- ✅ Yetkisiz kullanıcı erişemiyor mu?
- ✅ Beğeni kaldırma başarılı mı?

#### 4.9 POST /api/news/[id]/read Tests

- ✅ Yetkisiz kullanıcı erişemiyor mu?
- ✅ Şirket bilgisi yoksa hata veriyor mu?
- ✅ Okuma kaydı başarılı mı?
- ✅ Scroll percentage >80 ise completed true oluyor mu?

---

### GRUP 5: Component Tests

#### 5.1 NewsCard Component Tests

- ✅ Haber bilgileri doğru render ediliyor mu?
- ✅ Image varsa gösteriliyor mu?
- ✅ Tags render ediliyor mu?
- ✅ Stats (view, like, comment) gösteriliyor mu?
- ✅ Featured/Pinned badge'leri gösteriliyor mu?
- ✅ Actions butonları (showActions=true) gösteriliyor mu?
- ✅ Link doğru URL'e gidiyor mu?

#### 5.2 NewsList Component Tests

- ✅ Liste render ediliyor mu?
- ✅ Loading state gösteriliyor mu?
- ✅ Empty state gösteriliyor mu?
- ✅ Filtreleme çalışıyor mu? (search, category, status)
- ✅ Create button onClick çalışıyor mu?
- ✅ Grid layout doğru mu?

#### 5.3 NewsForm Component Tests

- ✅ Form alanları render ediliyor mu?
- ✅ Initial data doğru yükleniyor mu?
- ✅ Validation çalışıyor mu?
  - Boş başlık
  - Çok uzun başlık
  - Boş içerik
- ✅ Submit başarılı mı?
- ✅ isSubmitting state doğru mu?
- ✅ HTML content destekleniyor mu?

---

### GRUP 6: E2E Tests (User Flows)

#### 6.1 Admin: Haber Oluşturma ve Yayınlama Flow

1. Admin login olur
2. Haberler sayfasına gider
3. "Yeni Haber" butonuna tıklar
4. Formu doldurur (başlık, içerik, kategori)
5. "Oluştur" butonuna tıklar
6. Haber taslak olarak oluşturulur
7. Haber detay sayfasına gider
8. "Yayınla" butonuna tıklar
9. Haber yayınlanır
10. Company dashboard'da görünür

#### 6.2 Company User: Haber Okuma ve Beğenme Flow

1. Company user login olur
2. Haberler sayfasına gider
3. Bir habere tıklar
4. Haber detayını görüntüler
5. "Beğen" butonuna tıklar
6. Beğeni sayısı artar
7. Sayfayı scroll eder (>80%)
8. Okuma kaydı oluşturulur (completed=true)

#### 6.3 Admin: Haber Düzenleme Flow

1. Admin login olur
2. Haberler sayfasına gider
3. Bir habere tıklar
4. "Düzenle" butonuna tıklar
5. Formu günceller
6. "Güncelle" butonuna tıklar
7. Değişiklikler kaydedilir

#### 6.4 Filtreleme ve Arama Flow

1. User login olur
2. Haberler sayfasına gider
3. Kategori filtresini seçer
4. Liste filtrelenir
5. Arama kutusuna metin girer
6. Liste aranır
7. Durum filtresini seçer
8. Liste tekrar filtrelenir

#### 6.5 Tag Yönetimi Flow (Admin)

1. Admin login olur
2. Haber oluştururken tag seçer
3. Haber kaydedilir
4. Tag'ler haber detayında görünür
5. Haberi düzenler, tag ekler/çıkarır
6. Değişiklikler kaydedilir

---

## 📊 TEST İLERLEME DURUMU

- [x] GRUP 1: Domain Layer Tests (15/15) ✅
- [x] GRUP 2: Use Case Tests (25/25) ✅
- [x] GRUP 3: Repository Integration Tests (30/30) ✅
- [x] GRUP 4: API Route Tests (25/25) ✅
- [x] GRUP 5: Component Tests (51/51) ✅
- [ ] GRUP 6: E2E Tests (0/5) 🟡 Başlatıldı

**Toplam:** 146/146 test geçti (%100 başarı oranı)

### Test Detayları

#### GRUP 1: Domain Layer Tests ✅

- NewsEnums validation: 4 test
- NewsEntity business logic: 11 test
- **Sonuç:** 15/15 ✅

#### GRUP 2: Use Case Tests ✅

- CreateNewsUseCase: 8 test
- UpdateNewsUseCase: 5 test
- PublishNewsUseCase: 4 test
- RecordNewsReadUseCase: 4 test
- GetNewsListUseCase: 4 test
- **Sonuç:** 25/25 ✅

#### GRUP 3: Repository Integration Tests ✅

- CRUD operations: 6 test
- Status operations: 3 test
- Feature operations: 4 test
- Tag operations: 5 test
- Comment operations: 5 test
- Like operations: 3 test
- Read operations: 3 test
- Statistics: 1 test
- **Sonuç:** 30/30 ✅

#### GRUP 4: API Route Tests ✅

- GET /api/news: 4 test
- POST /api/news: 5 test
- GET /api/news/[id]: 4 test
- PUT /api/news/[id]: 4 test
- DELETE /api/news/[id]: 4 test
- POST /api/news/[id]/publish: 4 test
- POST /api/news/[id]/like: 3 test
- DELETE /api/news/[id]/like: 2 test
- POST /api/news/[id]/read: 4 test
- **Sonuç:** 25/25 ✅

#### GRUP 5: Component Tests ✅

- NewsCard component: 15 test
- NewsList component: 18 test
- NewsForm component: 18 test
- **Sonuç:** 51/51 ✅

#### GRUP 6: E2E Tests 🟡

- Haber oluşturma flow: Başlatıldı
- Haber yayınlama flow: Başlatıldı
- Haber okuma flow: Başlatıldı
- Beğeni flow: Başlatıldı
- Yorum flow: Başlatıldı
- **Not:** Form submit sorunları nedeniyle tamamlanması ertelendi

---

## 🚀 TEST ÇALIŞTIRMA KOMUTLARI

```bash
# Tüm testler
npm test

# Domain layer tests
npm test -- src/3-domain

# Use case tests
npm test -- src/2-application/use-cases/news

# Repository tests
npm test -- src/4-infrastructure/database/repositories/SupabaseNewsRepository

# API route tests
npm test -- src/app/api/news

# Component tests
npm test -- src/1-presentation/components/features/news

# E2E tests
npm run test:e2e -- e2e/news
```
