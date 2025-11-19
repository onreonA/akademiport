# 🧪 Page Check Script Test Rehberi

## Hızlı Test

### 1. Dry Run (Sunucu Gerektirmez)

```bash
npx tsx scripts/check-pages-dry-run.ts
```

Bu komut sadece navigation linklerini listeler, gerçek sayfa kontrolü yapmaz.

**Beklenen Çıktı:**

- 60 benzersiz link
- 10 "Yeni" sayfa
- Role bazında gruplandırılmış linkler

### 2. Gerçek Test (Sunucu Gerektirir)

#### Adım 1: Sunucuyu Başlat

```bash
npm run dev
```

#### Adım 2: Script'i Çalıştır (Yeni Terminal)

```bash
npm run check:pages
```

veya test helper ile:

```bash
./scripts/test-check-pages.sh
```

## Test Sonuçları

### Başarılı Test

```
🚀 Starting page check...

Base URL: http://localhost:3000
Timeout: 30000ms

Found 60 unique links to check

[1/60] Checking: /dashboard...
[2/60] Checking: /dashboard/programs...
...

✅ Check completed!

📊 Summary:
  Total: 60
  ✅ Success: 55
  ❌ Errors: 3
  ↪️  Redirects: 2
  ⏱️  Timeouts: 0
  📱 Missing Sidebar: 1
  🔝 Missing Header: 0

📄 HTML report saved to: page-check-results/page-check-1234567890.html
```

### Hata Durumları

#### Sunucu Çalışmıyor

```
Error: net::ERR_CONNECTION_REFUSED
```

**Çözüm:** `npm run dev` çalıştırın

#### Authentication Gerekiyor

```
Redirected to login (authentication required)
```

**Not:** Bu normaldir, protected sayfalar login'e yönlendirilir.

## Test Senaryoları

### Senaryo 1: Tüm Sayfaları Kontrol Et

```bash
npm run check:pages
```

### Senaryo 2: Sadece Linkleri Listele

```bash
npx tsx scripts/check-pages-dry-run.ts
```

### Senaryo 3: Belirli Role Göre Kontrol

Script'i düzenleyerek sadece belirli role'ün linklerini kontrol edebilirsiniz.

## Beklenen Sonuçlar

### ✅ Başarılı Sayfalar

- HTTP 200 status
- Sidebar render edilmiş
- Header render edilmiş

### ❌ Hatalı Sayfalar

- HTTP 404
- 404 sayfası gösteriliyor
- Sayfa bulunamadı mesajı

### ↪️ Yönlendirmeler

- Login sayfasına yönlendirme (normal)
- Başka sayfaya yönlendirme

### ⚠️ Eksikler

- Sidebar yok (public sayfalar için normal)
- Header yok (public sayfalar için normal)

## Sorun Giderme

### Script çalışmıyor

1. `tsx` paketinin kurulu olduğundan emin olun: `npm install`
2. TypeScript hatası varsa: `npm run type-check`

### Sunucu bağlantı hatası

1. Sunucunun çalıştığından emin olun: `curl http://localhost:3000`
2. Port'un doğru olduğundan emin olun (varsayılan: 3000)
3. Environment variable ile farklı URL: `BASE_URL=http://localhost:3001 npm run check:pages`

### Timeout hataları

- Sayfa yüklenmesi çok uzun sürüyorsa `TIMEOUT` değerini artırın
- Script'teki `TIMEOUT` değişkenini düzenleyin

## Sonraki Adımlar

1. ✅ Script'i test edin
2. 📊 HTML raporunu inceleyin
3. 🔧 Bulunan sorunları düzeltin
4. 🔄 Tekrar test edin
5. ✅ Manuel checklist ile detaylı kontrol yapın
