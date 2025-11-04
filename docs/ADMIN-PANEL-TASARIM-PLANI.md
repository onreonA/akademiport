# Admin Panel Tasarım Güncelleme Planı

## 📋 Admin Sayfaları Envanteri

### ✅ Sidebar'da Mevcut Olan Sayfalar

1. **Dashboard** (`/dashboard`)
   - ✅ Zaten güncellendi

2. **Programlar** (`/dashboard/programs`)
   - Liste sayfası: `/dashboard/programs`
   - Yeni sayfa: `/dashboard/programs/new`
   - Detay sayfası: `/dashboard/programs/[id]`
   - Düzenleme sayfası: `/dashboard/programs/[id]/edit`

3. **Firmalar** (`/dashboard/companies`)
   - Liste sayfası: `/dashboard/companies`
   - Yeni sayfa: `/dashboard/companies/new`
   - Detay sayfası: `/dashboard/companies/[id]`
   - Düzenleme sayfası: `/dashboard/companies/[id]/edit`
   - Firma kullanıcıları: `/dashboard/companies/[id]/users`
   - Yeni kullanıcı: `/dashboard/companies/[id]/users/new`
   - Kullanıcı düzenleme: `/dashboard/companies/[id]/users/[userId]/edit`

4. **Kullanıcılar** (`/dashboard/users`)
   - Liste sayfası: `/dashboard/users`
   - Yeni sayfa: `/dashboard/users/new`
   - Detay sayfası: `/dashboard/users/[id]`
   - Düzenleme sayfası: `/dashboard/users/[id]/edit`

5. **Raporlar** (`/dashboard/reports`)
   - Liste sayfası: `/dashboard/reports`

6. **Ayarlar** (`/dashboard/settings`)
   - ⚠️ Sayfa henüz oluşturulmamış

### ❌ Sidebar'da Olmayan Sayfalar (Eksik Ana Bölümler)

1. **Projeler** (`/dashboard/projects`)
   - Liste sayfası: `/dashboard/projects`
   - Detay sayfası: `/dashboard/projects/[id]`
   - Silinen projeler: `/dashboard/projects/deleted`
   - ⚠️ **EKSİK:** Sidebar'a eklenmeli

2. **Eğitimler** (`/dashboard/trainings`)
   - Liste sayfası: `/dashboard/trainings`
   - Yeni sayfa: `/dashboard/trainings/new`
   - Düzenleme sayfası: `/dashboard/trainings/[id]/edit`
   - ⚠️ **EKSİK:** Sidebar'a eklenmeli

3. **Proje Şablonları** (`/dashboard/project-templates`)
   - Liste sayfası: `/dashboard/project-templates`
   - Yeni sayfa: `/dashboard/project-templates/new`
   - Düzenleme sayfası: `/dashboard/project-templates/[id]/edit`
   - ⚠️ **EKSİK:** Sidebar'a eklenmeli

---

## 🎯 İlerleme Planı

### Faz 1: Sidebar Navigation Güncellemesi (Öncelikli)

**Hedef:** Eksik ana bölümleri sidebar'a ekle

1. ✅ Navigation dosyasını güncelle
   - Projeler bölümü ekle
   - Eğitimler bölümü ekle
   - Proje Şablonları bölümü ekle

### Faz 2: Ana Liste Sayfaları (Öncelik: Yüksek)

**Hedef:** Tüm liste sayfalarını akademiport.com standartlarına göre güncelle

1. ✅ **Dashboard** (`/dashboard/page.tsx`) - TAMAMLANDI
2. 🔄 **Programlar Listesi** (`/dashboard/programs/page.tsx`)
3. 🔄 **Firmalar Listesi** (`/dashboard/companies/page.tsx`)
4. 🔄 **Kullanıcılar Listesi** (`/dashboard/users/page.tsx`)
5. 🔄 **Projeler Listesi** (`/dashboard/projects/page.tsx`) - YENİ
6. 🔄 **Eğitimler Listesi** (`/dashboard/trainings/page.tsx`) - YENİ
7. 🔄 **Proje Şablonları Listesi** (`/dashboard/project-templates/page.tsx`) - YENİ
8. 🔄 **Raporlar** (`/dashboard/reports/page.tsx`)

### Faz 3: Detay Sayfaları (Öncelik: Orta)

**Hedef:** Tüm detay sayfalarını güncelle

1. 🔄 **Program Detay** (`/dashboard/programs/[id]/page.tsx`)
2. 🔄 **Firma Detay** (`/dashboard/companies/[id]/page.tsx`)
3. 🔄 **Kullanıcı Detay** (`/dashboard/users/[id]/page.tsx`)
4. 🔄 **Proje Detay** (`/dashboard/projects/[id]/page.tsx`)
5. 🔄 **Silinen Projeler** (`/dashboard/projects/deleted/page.tsx`)

### Faz 4: Form Sayfaları (Öncelik: Orta)

**Hedef:** Yeni oluşturma ve düzenleme formlarını güncelle

#### Yeni Oluşturma Sayfaları:

1. 🔄 **Yeni Program** (`/dashboard/programs/new/page.tsx`)
2. 🔄 **Yeni Firma** (`/dashboard/companies/new/page.tsx`)
3. 🔄 **Yeni Kullanıcı** (`/dashboard/users/new/page.tsx`)
4. 🔄 **Yeni Eğitim** (`/dashboard/trainings/new/page.tsx`)
5. 🔄 **Yeni Proje Şablonu** (`/dashboard/project-templates/new/page.tsx`)
6. 🔄 **Firma Kullanıcısı Ekle** (`/dashboard/companies/[id]/users/new/page.tsx`)

#### Düzenleme Sayfaları:

1. 🔄 **Program Düzenle** (`/dashboard/programs/[id]/edit/page.tsx`)
2. 🔄 **Firma Düzenle** (`/dashboard/companies/[id]/edit/page.tsx`)
3. 🔄 **Kullanıcı Düzenle** (`/dashboard/users/[id]/edit/page.tsx`)
4. 🔄 **Eğitim Düzenle** (`/dashboard/trainings/[id]/edit/page.tsx`)
5. 🔄 **Proje Şablonu Düzenle** (`/dashboard/project-templates/[id]/edit/page.tsx`)
6. 🔄 **Firma Kullanıcısı Düzenle** (`/dashboard/companies/[id]/users/[userId]/edit/page.tsx`)

### Faz 5: Alt Sayfalar (Öncelik: Düşük)

**Hedef:** Firma alt sayfalarını güncelle

1. 🔄 **Firma Kullanıcıları** (`/dashboard/companies/[id]/users/page.tsx`)

### Faz 6: Ayarlar Sayfası (Öncelik: Düşük)

1. ⚠️ **Ayarlar** (`/dashboard/settings/page.tsx`) - Henüz oluşturulmamış

---

## 📊 İstatistikler

- **Toplam Sayfa:** 26
- **Tamamlanan:** 1 (Dashboard)
- **Kalan:** 25
- **Yeni Sidebar Bölümü:** 3 (Projeler, Eğitimler, Proje Şablonları)

---

## 🎨 Tasarım Standartları

Tüm sayfalar şu standartlara göre güncellenecek:

1. **Flat Tasarım**
   - Gradient kaldırılacak
   - Glassmorphism kaldırılacak
   - Solid renkler kullanılacak

2. **Renk Paleti**
   - Arka plan: `bg-gray-50 dark:bg-gray-900`
   - Kartlar: `bg-white dark:bg-gray-900`
   - Border: `border-gray-200 dark:border-gray-800`
   - Text: `text-gray-900 dark:text-white`
   - Muted text: `text-gray-600 dark:text-gray-400`

3. **Shadow**
   - Minimal: `shadow-sm`

4. **Rounded**
   - Kartlar: `rounded-lg`
   - Butonlar: `rounded-lg` veya `rounded-md`

5. **Primary Color**
   - Sadece aktif durumlarda ve önemli elementlerde kullanılacak
   - `bg-primary` (flat, gradient yok)

---

## ✅ İlk Adım: Sidebar Navigation Güncellemesi

Sidebar'a eksik bölümleri ekleyeceğiz.
