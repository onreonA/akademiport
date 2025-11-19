# 📊 Page Check Script Rehberi

Bu rehber, projedeki tüm sayfaları otomatik olarak kontrol eden script'in nasıl kullanılacağını açıklar.

## 🎯 Amaç

Bu script şunları kontrol eder:

- ✅ Tüm navigation linklerinin çalışıp çalışmadığı
- ❌ 404 hatalarını bulur
- 📱 Sidebar'ın tüm sayfalarda render edildiğini kontrol eder
- 🔝 Header'ın tüm sayfalarda render edildiğini kontrol eder
- ✨ "Yeni" sayfalarının varlığını kontrol eder
- 📄 Detaylı HTML rapor oluşturur

## 🚀 Kullanım

### 1. Gereksinimler

Script çalıştırılmadan önce:

- Proje development modunda çalışıyor olmalı (`npm run dev`)
- `tsx` paketi kurulu olmalı (otomatik kurulur)

### 2. Script'i Çalıştırma

```bash
# Development sunucusu çalışıyorken başka bir terminalde:
npm run check:pages
```

veya direkt:

```bash
npx tsx scripts/check-pages.ts
```

### 3. Sonuçlar

Script çalıştıktan sonra:

- Konsol çıktısında özet bilgiler görünür
- Detaylı HTML rapor `page-check-results/` klasörüne kaydedilir
- Rapor dosyası: `page-check-results/page-check-[timestamp].html`

## 📋 Rapor İçeriği

HTML rapor şu bölümleri içerir:

### 1. Özet Kartları

- ✅ Başarılı sayfalar
- ❌ Hatalı sayfalar
- ↪️ Yönlendirmeler
- ⏱️ Timeout'lar
- 📱 Sidebar eksik sayfalar
- 🔝 Header eksik sayfalar

### 2. Hata Listesi

Tüm 404 ve diğer hataların detaylı listesi

### 3. Yönlendirmeler

Yönlendirme yapan sayfaların listesi

### 4. Sidebar Eksik Sayfalar

Sidebar'ı olmayan sayfaların listesi

### 5. Header Eksik Sayfalar

Header'ı olmayan sayfaların listesi

### 6. "Yeni" Sayfalar Kontrolü

Navigation'da "Yeni" içeren tüm sayfaların durumu

### 7. Tüm Sonuçlar

Tüm kontrol edilen sayfaların tam listesi

## ⚙️ Yapılandırma

Script'i özelleştirmek için `scripts/check-pages.ts` dosyasındaki değişkenleri düzenleyebilirsiniz:

```typescript
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TIMEOUT = 30000; // 30 saniye
```

Environment variable ile:

```bash
BASE_URL=http://localhost:3000 npm run check:pages
```

## 🔍 Kontrol Edilen Sayfalar

Script şu navigation konfigürasyonlarından tüm linkleri çıkarır:

- Master Admin Navigation
- Consultant Navigation
- Company Admin Navigation
- Company User Navigation

## 📝 Örnek Çıktı

```
🚀 Starting page check...

Base URL: http://localhost:3000
Timeout: 30000ms

Found 87 unique links to check

Checking 87/87: /dashboard...

✅ Check completed!

📊 Summary:
  Total: 87
  ✅ Success: 82
  ❌ Errors: 3
  ↪️  Redirects: 2
  ⏱️  Timeouts: 0
  📱 Missing Sidebar: 1
  🔝 Missing Header: 0

📄 HTML report saved to: page-check-results/page-check-1234567890.html

❌ Errors found:
  - [Master Admin] CMS > Medya: /dashboard/cms/media (404)
  - [Consultant] Görevler: /consultant-dashboard/tasks (404)
  - [Company Admin] Projeler: /company-dashboard/projects (404)
```

## 🐛 Sorun Giderme

### Script çalışmıyor

1. Development sunucusunun çalıştığından emin olun:

   ```bash
   npm run dev
   ```

2. `tsx` paketinin kurulu olduğundan emin olun:

   ```bash
   npm install
   ```

3. Port'un doğru olduğundan emin olun (varsayılan: 3000)

### Timeout hataları

Sayfa yüklenmesi çok uzun sürüyorsa:

- `TIMEOUT` değerini artırın
- Sayfanın gerçekten yavaş yüklenip yüklenmediğini kontrol edin

### Sidebar/Header bulunamıyor

Eğer sayfa başarılı yükleniyor ama Sidebar/Header bulunamıyorsa:

- Sayfanın layout kullanıp kullanmadığını kontrol edin
- Selector'ları `scripts/check-pages.ts` dosyasında güncelleyin

## 🔄 CI/CD Entegrasyonu

CI/CD pipeline'ında kullanmak için:

```yaml
# .github/workflows/page-check.yml
- name: Check Pages
  run: |
    npm run dev &
    sleep 10
    npm run check:pages
```

## 📚 İlgili Dosyalar

- `scripts/check-pages.ts` - Ana script
- `src/5-shared/constants/navigation.ts` - Navigation konfigürasyonu
- `page-check-results/` - Rapor çıktı klasörü

## 💡 İpuçları

1. **Düzenli Kontrol**: Her önemli değişiklikten sonra script'i çalıştırın
2. **Raporları Saklayın**: HTML raporları git'e commit etmeyin ama saklayın
3. **Önceliklendirme**: Önce kritik hataları (404) düzeltin
4. **Manuel Kontrol**: Otomatik kontrollerden sonra manuel checklist'i de kullanın

## 🎯 Sonraki Adımlar

1. Script'i çalıştırın: `npm run check:pages`
2. HTML raporunu açın ve inceleyin
3. Bulunan sorunları önceliklendirin
4. Sorunları düzeltin
5. Tekrar kontrol edin
