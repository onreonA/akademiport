# Company Dashboard Dark Mode Güncelleme Planı

## Ana Sayfa Standartları (Referans)

**Sayfa:** `/company-dashboard/page.tsx`

### Dark Mode Renk Standartları:

- **Background:** `bg-gray-50 dark:bg-gray-900`
- **Container:** `max-w-7xl mx-auto p-4 md:p-6`
- **Text Colors:**
  - Başlıklar: `text-gray-900 dark:text-white`
  - Alt başlıklar/Açıklamalar: `text-gray-600 dark:text-gray-400`
- **Cards:**
  - Background: `bg-white dark:bg-gray-900` (varsayılan)
  - Border: `border border-gray-200 dark:border-gray-800`
  - Shadow: `shadow-sm`
- **Icon Backgrounds:**
  - Blue: `bg-blue-50 dark:bg-blue-950/20`
  - Green: `bg-green-50 dark:bg-green-950/20`
  - Purple: `bg-purple-50 dark:bg-purple-950/20`
  - Orange: `bg-orange-50 dark:bg-orange-950/20`
- **Icon Colors:**
  - Blue: `text-blue-600 dark:text-blue-400`
  - Green: `text-green-600 dark:text-green-400`
  - Purple: `text-purple-600 dark:text-purple-400`
  - Orange: `text-orange-600 dark:text-orange-400`
- **Progress Bars:**
  - Background: `bg-gray-200 dark:bg-gray-800`
  - Fill: `bg-blue-500`, `bg-green-500` (sabit renkler)

## Güncellenecek Sayfalar

### 1. Projects List Page

**Dosya:** `src/app/company-dashboard/projects/page.tsx`
**Durum:** ❌ Eski tasarım (GradientHeader, EnhancedCard kullanıyor)
**Yapılacaklar:**

- Background: `bg-gray-50 dark:bg-gray-900`
- Container: `max-w-7xl mx-auto p-4 md:p-6`
- GradientHeader → Flat header
- EnhancedCard → Card (flat design)
- Text colors güncelle
- Loading/Error states güncelle

### 2. Project Detail Page

**Dosya:** `src/app/company-dashboard/projects/[id]/page.tsx`
**Durum:** ❌ Eski tasarım (GradientHeader, EnhancedCard, ModernStatCard kullanıyor)
**Yapılacaklar:**

- Background: `bg-gray-50 dark:bg-gray-900`
- Container: `max-w-7xl mx-auto p-4 md:p-6`
- GradientHeader → Flat header
- EnhancedCard → Card (flat design)
- ModernStatCard → Custom Card veya daha basit stat cards
- Tabs styling güncelle
- Text colors güncelle

### 3. Training Detail Page

**Dosya:** `src/app/company-dashboard/trainings/[id]/page.tsx`
**Durum:** ⚠️ Kısmen güncel (Card kullanıyor ama renkler kontrol edilmeli)
**Yapılacaklar:**

- Background: `bg-gray-50 dark:bg-gray-900`
- Container: `max-w-7xl mx-auto p-4 md:p-6`
- Text colors kontrol et ve güncelle
- Tabs styling güncelle
- Loading/Error states güncelle

### 4. Trainings List Page

**Dosya:** `src/app/company-dashboard/trainings/page.tsx`
**Durum:** ✅ Özel tasarım (koyu lacivert background, glow efekti)
**Not:** Bu sayfa özel tasarıma sahip, dokunulmayacak

### 5. Users Page

**Dosya:** `src/app/company-dashboard/users/page.tsx`
**Durum:** ❌ Eski tasarım (container kullanıyor, dark mode renkleri eksik)
**Yapılacaklar:**

- Background: `bg-gray-50 dark:bg-gray-900`
- Container: `max-w-7xl mx-auto p-4 md:p-6`
- Text colors güncelle
- Card styling güncelle
- Loading/Error states güncelle

### 6. Profile Page

**Dosya:** `src/app/company-dashboard/profile/page.tsx`
**Durum:** ❌ Eski tasarım (container kullanıyor, dark mode renkleri eksik)
**Yapılacaklar:**

- Background: `bg-gray-50 dark:bg-gray-900`
- Container: `max-w-7xl mx-auto p-4 md:p-6`
- Text colors güncelle
- Loading/Error states güncelle

### 7. Settings Page

**Dosya:** `src/app/company-dashboard/settings/page.tsx`
**Durum:** ❌ Eski tasarım (container kullanıyor, dark mode renkleri eksik)
**Yapılacaklar:**

- Background: `bg-gray-50 dark:bg-gray-900`
- Container: `max-w-7xl mx-auto p-4 md:p-6`
- Text colors güncelle
- Card styling güncelle
- Form elements güncelle
- Loading/Error states güncelle

### 8. Task Detail Page

**Dosya:** `src/app/company-dashboard/tasks/[id]/page.tsx`
**Durum:** ❌ Eski tasarım (GradientHeader, EnhancedCard kullanıyor)
**Yapılacaklar:**

- Background: `bg-gray-50 dark:bg-gray-900`
- Container: `max-w-7xl mx-auto p-4 md:p-6`
- GradientHeader → Flat header
- EnhancedCard → Card (flat design)
- Text colors güncelle
- Loading/Error states güncelle

## Uygulama Sırası

1. ✅ **Trainings List** - Zaten özel tasarıma sahip, dokunulmayacak
2. **Projects List** - List sayfası, daha basit
3. **Project Detail** - Detay sayfası, daha kompleks
4. **Training Detail** - Detay sayfası, kısmen güncel
5. **Users** - Basit list sayfası
6. **Profile** - Basit detay sayfası
7. **Settings** - Form sayfası
8. **Task Detail** - Detay sayfası

## Notlar

- Tüm sayfalarda `bg-gray-50 dark:bg-gray-900` kullanılacak
- GradientHeader yerine flat header kullanılacak
- EnhancedCard yerine Card (flat design) kullanılacak
- ModernStatCard yerine custom Card veya basit stat cards kullanılacak
- Tüm text colors ana sayfa standartlarına göre güncellenecek
- Loading ve Error states ana sayfa standartlarına göre güncellenecek
