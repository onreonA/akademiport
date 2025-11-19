# 📊 Page Check Script

Bu script, projedeki tüm sayfaları otomatik olarak kontrol eder ve detaylı bir rapor oluşturur.

## 🚀 Hızlı Başlangıç

1. **Development sunucusunu başlatın:**

   ```bash
   npm run dev
   ```

2. **Başka bir terminalde script'i çalıştırın:**

   ```bash
   npm run check:pages
   ```

3. **HTML raporunu açın:**
   ```bash
   open page-check-results/page-check-*.html
   ```

## 📋 Ne Kontrol Edilir?

- ✅ Tüm navigation linklerinin çalışıp çalışmadığı
- ❌ 404 hataları
- 📱 Sidebar'ın tüm sayfalarda render edilmesi
- 🔝 Header'ın tüm sayfalarda render edilmesi
- ✨ "Yeni" sayfalarının varlığı
- ↪️ Yönlendirmeler

## 📄 Çıktılar

- **Konsol:** Özet bilgiler ve hata listesi
- **HTML Rapor:** Detaylı, görsel rapor (`page-check-results/` klasöründe)

## ⚙️ Yapılandırma

Environment variable ile:

```bash
BASE_URL=http://localhost:3000 npm run check:pages
```

## 📚 Daha Fazla Bilgi

- [Page Check Guide](../../docs/PAGE-CHECK-GUIDE.md) - Detaylı kullanım rehberi
- [Manual Checklist](../../docs/MANUAL-CHECKLIST.md) - Manuel kontrol checklist'i
