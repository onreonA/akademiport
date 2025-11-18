# 📝 Sprint 23: CMS (Content Management System) - Analiz ve Plan

**Tarih:** Ocak 2025  
**Durum:** 📋 Planlandı  
**Bağımlılıklar:** ✅ Sprint 22 (Public Website) - Tamamlandı  
**Tahmini Süre:** 1 hafta (40 saat)

---

## 🎯 HEDEF

Admin'in public website içeriğini kod yazmadan yönetebilmesi. Sayfaları, bölümleri, medyayı ve site ayarlarını admin panelinden düzenleyebilme.

---

## 📊 MEVCUT DURUM ANALİZİ

### ✅ Tamamlanan (Sprint 22)

- ✅ Public website sayfaları oluşturuldu
- ✅ 8 public sayfa hazır (Ana Sayfa, Program Hakkında, Platform Özellikleri, vb.)
- ✅ ModernNavigation ve ModernFooter component'leri
- ✅ Responsive tasarım
- ✅ SEO temel yapısı

### ❌ Eksikler (Sprint 23'te Yapılacak)

- ❌ CMS database tabloları yok
- ❌ Sayfa yönetimi yok
- ❌ Rich text editor yok
- ❌ Medya yönetimi yok
- ❌ Site ayarları yok
- ❌ Admin panel CMS sayfaları yok

---

## 📦 SPRINT 23 KAPSAMI

### 1. Database Migration (2-3 saat)

**Dosya:** `src/4-infrastructure/database/migrations/049_create_cms_tables.sql`

**Tablolar:**

#### a) `cms_pages` (Sayfalar)

```sql
- id (uuid, PK)
- slug (text, unique) -- URL slug (örn: "ana-sayfa", "program-hakkinda")
- title (text) -- Sayfa başlığı
- content (jsonb) -- Sayfa içeriği (bölümler array'i)
- meta_title (text) -- SEO meta title
- meta_description (text) -- SEO meta description
- meta_keywords (text[]) -- SEO keywords
- og_image_url (text) -- Open Graph image
- status (enum: draft, published, archived)
- published_at (timestamp)
- created_by (uuid, FK -> users)
- created_at (timestamp)
- updated_at (timestamp)
```

#### b) `cms_sections` (Bölümler)

```sql
- id (uuid, PK)
- page_id (uuid, FK -> cms_pages)
- type (enum: hero, text, image, features, testimonials, cta, etc.)
- order_index (integer) -- Drag-drop sıralama için
- content (jsonb) -- Bölüm içeriği (type'a göre değişir)
- settings (jsonb) -- Bölüm ayarları (background, padding, etc.)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

#### c) `cms_media` (Medya)

```sql
- id (uuid, PK)
- filename (text)
- original_filename (text)
- mime_type (text)
- file_size (bigint) -- bytes
- file_url (text) -- Supabase Storage URL
- storage_path (text) -- Storage bucket path
- alt_text (text) -- SEO için
- caption (text)
- uploaded_by (uuid, FK -> users)
- created_at (timestamp)
- updated_at (timestamp)
```

#### d) `cms_settings` (Site Ayarları)

```sql
- id (uuid, PK)
- key (text, unique) -- Setting key (örn: "site_name", "contact_email")
- value (jsonb) -- Setting value (herhangi bir JSON değer)
- category (text) -- Kategori (general, contact, social, analytics)
- description (text) -- Ayar açıklaması
- updated_by (uuid, FK -> users)
- updated_at (timestamp)
```

**RLS Policies:**

- Master Admin: Tüm CRUD işlemleri
- Consultant: Read-only (opsiyonel)
- Company: Read-only (opsiyonel)

**Indexes:**

- `cms_pages.slug` (unique)
- `cms_pages.status`
- `cms_sections.page_id`
- `cms_sections.order_index`
- `cms_media.uploaded_by`
- `cms_settings.key` (unique)

---

### 2. Domain Layer (2-3 saat)

**Dosyalar:**

#### a) `src/3-domain/entities/CMSPage.ts`

```typescript
- CMSPage interface
- CMSSection interface
- CMSPageEntity class
- CreateCMSPageDto
- UpdateCMSPageDto
```

#### b) `src/3-domain/entities/CMSMedia.ts`

```typescript
- CMSMedia interface
- CMSMediaEntity class
- CreateCMSMediaDto
```

#### c) `src/3-domain/entities/CMSSettings.ts`

```typescript
- CMSSettings interface
- CMSSettingsEntity class
- UpdateCMSSettingsDto
```

#### d) `src/3-domain/interfaces/repositories/ICMSPageRepository.ts`

```typescript
- create, update, delete, findById, findBySlug, findMany
- findByStatus
```

#### e) `src/3-domain/interfaces/repositories/ICMSMediaRepository.ts`

```typescript
- create, delete, findById, findMany
- findByUploadedBy
```

#### f) `src/3-domain/interfaces/repositories/ICMSSettingsRepository.ts`

```typescript
(-get, set, getAll, getByCategory);
```

---

### 3. Infrastructure Layer (4-5 saat)

**Dosyalar:**

#### a) `src/4-infrastructure/database/repositories/SupabaseCMSPageRepository.ts`

- Supabase implementasyonu
- Entity mapping
- Section ordering

#### b) `src/4-infrastructure/database/repositories/SupabaseCMSMediaRepository.ts`

- Supabase Storage entegrasyonu
- File upload/download
- Media metadata

#### c) `src/4-infrastructure/database/repositories/SupabaseCMSSettingsRepository.ts`

- Settings CRUD
- Category filtering

---

### 4. Application Layer (4-5 saat)

**Dosyalar:**

#### a) `src/2-application/use-cases/cms/CreatePageUseCase.ts`

- Sayfa oluşturma
- Slug validation
- Default sections

#### b) `src/2-application/use-cases/cms/UpdatePageUseCase.ts`

- Sayfa güncelleme
- Section reordering
- Status management

#### c) `src/2-application/use-cases/cms/DeletePageUseCase.ts`

- Sayfa silme (soft delete)
- Archive management

#### d) `src/2-application/use-cases/cms/GetPageUseCase.ts`

- Sayfa getirme (slug veya id ile)
- Published check

#### e) `src/2-application/use-cases/cms/GetPagesUseCase.ts`

- Sayfa listesi
- Filtering (status, search)
- Pagination

#### f) `src/2-application/use-cases/cms/UploadMediaUseCase.ts`

- Medya upload
- Supabase Storage entegrasyonu
- File validation

#### g) `src/2-application/use-cases/cms/GetSettingsUseCase.ts`

- Site ayarları getirme
- Category filtering

#### h) `src/2-application/use-cases/cms/UpdateSettingsUseCase.ts`

- Site ayarları güncelleme
- Validation

---

### 5. API Routes (3-4 saat)

**Dosyalar:**

#### a) `src/app/api/cms/pages/route.ts`

- `GET /api/cms/pages` - Sayfa listesi
- `POST /api/cms/pages` - Yeni sayfa oluştur

#### b) `src/app/api/cms/pages/[id]/route.ts`

- `GET /api/cms/pages/[id]` - Sayfa detay
- `PUT /api/cms/pages/[id]` - Sayfa güncelle
- `DELETE /api/cms/pages/[id]` - Sayfa sil

#### c) `src/app/api/cms/pages/[id]/sections/route.ts`

- `POST /api/cms/pages/[id]/sections` - Bölüm ekle
- `PUT /api/cms/pages/[id]/sections/reorder` - Bölüm sıralama

#### d) `src/app/api/cms/media/route.ts`

- `GET /api/cms/media` - Medya listesi
- `POST /api/cms/media` - Medya upload

#### e) `src/app/api/cms/media/[id]/route.ts`

- `DELETE /api/cms/media/[id]` - Medya sil

#### f) `src/app/api/cms/settings/route.ts`

- `GET /api/cms/settings` - Ayarları getir
- `PUT /api/cms/settings` - Ayarları güncelle

#### g) `src/app/api/cms/settings/[key]/route.ts`

- `GET /api/cms/settings/[key]` - Tek bir ayar getir
- `PUT /api/cms/settings/[key]` - Tek bir ayar güncelle

---

### 6. Frontend - Admin Panel (8-10 saat)

**Dosyalar:**

#### a) `src/app/admin-dashboard/cms/pages/page.tsx`

- Sayfa listesi
- Filtreleme (status, search)
- Yeni sayfa butonu
- Sayfa düzenleme linki

#### b) `src/app/admin-dashboard/cms/pages/new/page.tsx`

- Yeni sayfa oluşturma formu
- Slug input
- SEO ayarları
- İlk bölüm ekleme

#### c) `src/app/admin-dashboard/cms/pages/[id]/edit/page.tsx`

- Sayfa düzenleme sayfası
- Rich text editor (TipTap)
- Section management (drag-drop)
- SEO ayarları
- Önizleme butonu
- Yayınlama/arşivleme butonları

#### d) `src/app/admin-dashboard/cms/media/page.tsx`

- Medya galerisi
- Upload butonu
- Filtreleme (type, date)
- Medya silme

#### e) `src/app/admin-dashboard/cms/settings/page.tsx`

- Site ayarları formu
- Kategoriler (General, Contact, Social, Analytics)
- Form validation
- Kaydet butonu

**Components:**

#### f) `src/1-presentation/components/features/cms/RichTextEditor.tsx`

- TipTap rich text editor
- Toolbar (bold, italic, headings, lists, links, images)
- Image upload entegrasyonu
- Markdown export/import

#### g) `src/1-presentation/components/features/cms/SectionEditor.tsx`

- Section type seçimi
- Section içerik editörü
- Section ayarları
- Drag-drop sıralama

#### h) `src/1-presentation/components/features/cms/MediaUpload.tsx`

- File upload component
- Drag-drop upload
- Image preview
- Progress indicator

#### i) `src/1-presentation/components/features/cms/MediaGallery.tsx`

- Medya grid görünümü
- Filtreleme
- Seçim (checkbox)
- Silme

#### j) `src/1-presentation/components/features/cms/SEOEditor.tsx`

- Meta title input
- Meta description textarea
- Keywords input (tags)
- OG image upload
- Preview

---

### 7. Frontend - Public Website Entegrasyonu (3-4 saat)

**Dosyalar:**

#### a) `src/app/[slug]/page.tsx` (Dynamic Route)

- CMS sayfalarını render eden dinamik route
- Slug ile sayfa getirme
- Published check
- 404 handling

#### b) `src/1-presentation/components/features/cms/PageRenderer.tsx`

- CMS sayfasını render eden component
- Section type'larına göre render
- Responsive layout

#### c) `src/1-presentation/components/features/cms/SectionRenderer.tsx`

- Tek bir section'ı render eden component
- Type'a göre farklı component'ler

**Section Types:**

- Hero section
- Text section
- Image section
- Features section
- Testimonials section
- CTA section
- Stats section

---

### 8. Rich Text Editor Kurulumu (1-2 saat)

**Kütüphane:** TipTap

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link
```

**Özellikler:**

- Bold, Italic, Underline
- Headings (H1-H6)
- Lists (ordered, unordered)
- Links
- Images (upload entegrasyonu)
- Code blocks
- Blockquote
- Markdown export/import

---

## 📋 DETAYLI GÖREV LİSTESİ

### Faz 1: Backend (12-15 saat)

1. ✅ Database Migration (2-3 saat)
   - `cms_pages` tablosu
   - `cms_sections` tablosu
   - `cms_media` tablosu
   - `cms_settings` tablosu
   - RLS policies
   - Indexes

2. ✅ Domain Layer (2-3 saat)
   - Entities
   - Repository interfaces
   - DTOs

3. ✅ Infrastructure Layer (4-5 saat)
   - Repositories
   - Supabase Storage entegrasyonu

4. ✅ Application Layer (4-5 saat)
   - Use cases
   - Business logic

5. ✅ API Routes (3-4 saat)
   - REST endpoints
   - Validation
   - Error handling

### Faz 2: Frontend (12-15 saat)

6. ✅ Rich Text Editor Kurulumu (1-2 saat)
   - TipTap kurulumu
   - Basic editor component

7. ✅ Admin Panel - Sayfa Yönetimi (4-5 saat)
   - Sayfa listesi
   - Sayfa oluşturma/düzenleme
   - Section management
   - SEO editor

8. ✅ Admin Panel - Medya Yönetimi (2-3 saat)
   - Media gallery
   - Upload component
   - Media CRUD

9. ✅ Admin Panel - Site Ayarları (2-3 saat)
   - Settings form
   - Category tabs
   - Validation

10. ✅ Public Website Entegrasyonu (3-4 saat)
    - Dynamic route
    - Page renderer
    - Section renderers

### Faz 3: Test ve Dokümantasyon (2-3 saat)

11. ✅ Unit Tests (1-2 saat)
    - Use case tests
    - Repository tests

12. ✅ API Route Tests (1 saat)
    - Integration tests

13. ✅ Dokümantasyon (30 dk)
    - Sprint 23 dokümantasyonu

---

## 🎨 UI/UX TASARIMI

### Admin Panel Sayfa Yönetimi

**Sayfa Listesi:**

- Tablo görünümü (slug, title, status, updated_at)
- Filtreleme (status dropdown)
- Arama (title, slug)
- Yeni sayfa butonu
- Düzenleme linki

**Sayfa Düzenleme:**

- Sol panel: Section listesi (drag-drop)
- Orta panel: Rich text editor
- Sağ panel: SEO ayarları, Yayınlama butonları
- Üst bar: Kaydet, Önizleme, Geri

**Section Management:**

- Section type seçimi (dropdown)
- Section içerik editörü (type'a göre)
- Section ayarları (background, padding, etc.)
- Drag-drop sıralama

### Medya Yönetimi

**Media Gallery:**

- Grid görünümü (thumbnail'lar)
- Upload butonu (üstte)
- Filtreleme (type, date)
- Seçim (checkbox)
- Silme butonu

**Upload:**

- Drag-drop alanı
- File picker
- Progress indicator
- Preview

### Site Ayarları

**Settings Form:**

- Tab navigation (General, Contact, Social, Analytics)
- Form fields (her kategori için)
- Kaydet butonu
- Validation messages

---

## 🔧 TEKNİK DETAYLAR

### Rich Text Editor: TipTap

**Kurulum:**

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder
```

**Özellikler:**

- WYSIWYG editor
- Markdown support
- Image upload
- Link insertion
- Code blocks
- Tables (opsiyonel)

### Section Types

1. **Hero Section**
   - Title, subtitle, description
   - CTA buttons
   - Background image/video
   - Overlay settings

2. **Text Section**
   - Rich text content
   - Background color
   - Padding settings

3. **Image Section**
   - Image(s)
   - Caption
   - Layout (single, grid, carousel)

4. **Features Section**
   - Feature cards (icon, title, description)
   - Grid layout
   - Background settings

5. **Testimonials Section**
   - Testimonial cards
   - Carousel/slider
   - Background settings

6. **CTA Section**
   - Title, description
   - Button(s)
   - Background settings

7. **Stats Section**
   - Stat cards (number, label)
   - Grid layout
   - Background settings

### SEO Ayarları

- Meta title (max 60 karakter)
- Meta description (max 160 karakter)
- Keywords (tags)
- OG image
- OG title, description
- Canonical URL

---

## 📊 TAHMİNİ SÜRE DAĞILIMI

| Faz           | Görev                       | Süre     |
| ------------- | --------------------------- | -------- |
| Backend       | Database Migration          | 2-3 saat |
| Backend       | Domain Layer                | 2-3 saat |
| Backend       | Infrastructure Layer        | 4-5 saat |
| Backend       | Application Layer           | 4-5 saat |
| Backend       | API Routes                  | 3-4 saat |
| Frontend      | Rich Text Editor            | 1-2 saat |
| Frontend      | Admin - Sayfa Yönetimi      | 4-5 saat |
| Frontend      | Admin - Medya Yönetimi      | 2-3 saat |
| Frontend      | Admin - Site Ayarları       | 2-3 saat |
| Frontend      | Public Website Entegrasyonu | 3-4 saat |
| Test          | Unit Tests                  | 1-2 saat |
| Test          | API Tests                   | 1 saat   |
| Dokümantasyon | Sprint 23 Docs              | 30 dk    |

**Toplam:** 26-35 saat (~1 hafta)

---

## ✅ KABUL KRİTERLERİ

1. ✅ Admin sayfaları oluşturabiliyor
2. ✅ Admin sayfaları düzenleyebiliyor
3. ✅ Rich text editor çalışıyor
4. ✅ Section'ları drag-drop ile sıralayabiliyor
5. ✅ Medya upload çalışıyor
6. ✅ Site ayarlarını güncelleyebiliyor
7. ✅ Sayfaları yayınlayabiliyor/arşivleyebiliyor
8. ✅ Public website'de CMS sayfaları görüntüleniyor
9. ✅ SEO ayarları çalışıyor
10. ✅ Önizleme çalışıyor

---

## 🚀 BAŞLANGIÇ PLANI

### Adım 1: Database Migration (İlk)

1. Migration dosyası oluştur
2. Tabloları oluştur
3. RLS policies ekle
4. Indexes ekle
5. Test et

### Adım 2: Domain Layer

1. Entities oluştur
2. Repository interfaces tanımla
3. DTOs oluştur

### Adım 3: Infrastructure Layer

1. Repositories implement et
2. Supabase Storage entegrasyonu

### Adım 4: Application Layer

1. Use cases oluştur
2. Business logic

### Adım 5: API Routes

1. REST endpoints
2. Validation

### Adım 6: Frontend - Rich Text Editor

1. TipTap kurulumu
2. Basic editor component

### Adım 7: Frontend - Admin Panel

1. Sayfa yönetimi
2. Medya yönetimi
3. Site ayarları

### Adım 8: Frontend - Public Website Entegrasyonu

1. Dynamic route
2. Page renderer
3. Section renderers

### Adım 9: Test ve Dokümantasyon

1. Unit tests
2. API tests
3. Dokümantasyon

---

## 📝 NOTLAR

- TipTap rich text editor kullanılacak
- Supabase Storage medya için kullanılacak
- Section'lar JSONB formatında saklanacak
- SEO ayarları her sayfa için ayrı
- Site ayarları global (key-value pairs)
- Public website'de CMS sayfaları slug ile erişilecek
- Önizleme mode'da draft sayfalar görüntülenebilir

---

## 🎯 SONUÇ

Sprint 23, public website'in içerik yönetimini admin panelinden yapılabilir hale getirecek. Admin kod yazmadan sayfaları düzenleyebilecek, medya yükleyebilecek ve site ayarlarını güncelleyebilecek.

**Başlangıç:** Database Migration ile başlayalım mı?
