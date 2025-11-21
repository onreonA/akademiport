# Linter Hataları Analiz Raporu

**Tarih:** $(date)  
**Toplam Problem:** 2,612 (465 errors, 2,147 warnings)

## Özet

### Hata Dağılımı

- **Toplam Error:** 465
- **Toplam Warning:** 2,147
- **Etkilenen Dosya Sayısı:** ~191 dosya

### Hata Kategorileri

#### 1. @typescript-eslint/no-unused-vars (454 hata - %97.6)

**En büyük kategori** - Kullanılmayan değişkenler, import'lar ve parametreler

**Alt kategoriler:**

- Kullanılmayan import'lar (örn: `Link`, `Loader2`, `Card`, `Badge` vb.)
- Kullanılmayan değişkenler (örn: `error`, `e`, `user`, `router` vb.)
- Kullanılmayan parametreler (örn: `children`, `props`, `index` vb.)

**Örnekler:**

```typescript
// Kullanılmayan import
import { Link } from 'next/link'; // Link kullanılmıyor

// Kullanılmayan değişken
const error = result.error; // error kullanılmıyor

// Kullanılmayan parametre
.map((item, index) => { // index kullanılmıyor
```

#### 2. react-hooks/set-state-in-effect (4 hata)

**Kritik kategori** - useEffect/useLayoutEffect içinde setState kullanımı

**Etkilenen dosyalar:**

1. `src/app/company-dashboard/leaderboard/page.tsx` (satır 45)
   - `useEffect` içinde `fetchCurrentUser()` çağrısı
   - `fetchCurrentUser` içinde `setState` kullanılıyor

2. `src/1-presentation/components/features/notifications/NotificationPreferences.tsx` (satır 47-50)
   - `useLayoutEffect` içinde direkt `setState` çağrıları
   - `setEmailEnabled`, `setPushEnabled`, `setInAppEnabled`, `setQuietHoursEnabled`

3. `src/1-presentation/components/features/projects/BulkDatesDialog.tsx` (satır 69, 73)
   - `useLayoutEffect` içinde `setSelectedSubProjectId` çağrıları

4. `src/1-presentation/hooks/usePushNotifications.ts` (satır 26, 29)
   - `useEffect` içinde `setIsSupported` ve `setPermission` çağrıları

**Sorun:** useEffect/useLayoutEffect içinde direkt setState çağrısı performans sorunlarına yol açabilir ve cascading render'lara neden olabilir.

**Çözüm Önerileri:**

- `useLayoutEffect` yerine `useEffect` kullanılabilir (bazı durumlarda)
- State'i başlangıç değeri olarak ayarlamak
- Callback pattern kullanmak
- setTimeout ile async hale getirmek (zaten BulkDatesDialog'da kullanılmış)

#### 3. prefer-const (2 hata)

Değişmeyen değişkenler için `let` yerine `const` kullanılmalı.

#### 4. Diğer (6 hata)

- `@typescript-eslint/ban-ts-comment` (3)
- `@typescript-eslint/no-require-imports` (2)

## Dosya Bazında Analiz

### En Çok Hata İçeren Dosyalar

#### Production Kodları (src/app/, src/1-presentation/, src/2-application/)

- **src/app/dashboard/** - ~50+ hata
- **src/app/company-dashboard/** - ~30+ hata
- **src/app/consultant-dashboard/** - ~40+ hata
- **src/1-presentation/components/features/** - ~100+ hata
- **src/2-application/use-cases/** - ~50+ hata

#### Test/E2E Kodları

- **e2e/** - ~10 hata
- **scripts/** - ~5 hata
- **Test dosyaları** - ~20 hata

## Öncelik Sıralaması

### 🔴 Yüksek Öncelik (Kritik)

1. **react-hooks/set-state-in-effect** (4 hata)
   - Performans sorunlarına yol açabilir
   - Cascading render'lara neden olabilir
   - Hemen düzeltilmeli

### 🟡 Orta Öncelik

2. **no-unused-vars - Production kodları** (~400 hata)
   - Kod kalitesini etkiler
   - Bakımı zorlaştırır
   - Kademeli olarak düzeltilebilir

### 🟢 Düşük Öncelik

3. **no-unused-vars - Test/E2E kodları** (~50 hata)
   - Test kodlarında daha az kritik
   - Sonraki aşamada düzeltilebilir

4. **prefer-const** (2 hata)
   - Kolay düzeltilebilir
   - Otomatik fix ile çözülebilir

## Önerilen Aksiyon Planı

### Faz 1: Kritik Hatalar (Hemen)

1. ⚠️ react-hooks/set-state-in-effect hatalarını düzelt (4 hata)
   - `src/1-presentation/components/features/notifications/NotificationPreferences.tsx` (satır 47-50)
   - `src/1-presentation/components/features/projects/BulkDatesDialog.tsx` (satır 69, 73)
   - `src/1-presentation/hooks/usePushNotifications.ts` (satır 26, 29)
   - `src/app/company-dashboard/leaderboard/page.tsx` (satır 45)

### Faz 2: Production Kodları (Kısa Vadede)

2. no-unused-vars hatalarını kategorize et:
   - Kullanılmayan import'ları kaldır
   - Kullanılmayan değişkenleri temizle
   - Kullanılmayan parametreleri `_` ile işaretle veya kaldır

### Faz 3: Test Kodları (Orta Vadede)

3. Test ve E2E kodlarındaki hataları düzelt

### Faz 4: Otomatik Düzeltmeler

4. `npm run lint:fix` ile otomatik düzeltilebilir hataları çöz

## İstatistikler

### Genel

- **Toplam Error:** 465
- **Toplam Warning:** 2,147 (çoğunlukla `no-console`)
- **Etkilenen Dosya:** ~191 dosya

### Error Dağılımı

- **no-unused-vars:** 454 (%97.6)
  - "is defined but never used": 360 (%79.1)
  - "is assigned a value but never used": 94 (%20.7)
- **set-state-in-effect:** 4 (%0.9)
- **prefer-const:** 2 (%0.4)
- **Diğer:** 5 (%1.1)
  - `@typescript-eslint/ban-ts-comment`: 3
  - `@typescript-eslint/no-require-imports`: 2

### Dosya Bazında Dağılım

- **src/app/**: ~50+ hata
- **src/1-presentation/**: ~200+ hata
- **src/2-application/**: ~100+ hata
- **e2e/**: ~10 hata
- **scripts/**: ~5 hata

## Notlar

- Warning'ler (2,147 adet) çoğunlukla `no-console` kuralından kaynaklanıyor
- Warning'ler non-blocking olduğu için commit'i engellemiyor
- Error'ların çoğu (`no-unused-vars`) kod kalitesini etkiliyor ama runtime'da sorun yaratmıyor
- Kritik hatalar (`set-state-in-effect`) performans sorunlarına yol açabilir
