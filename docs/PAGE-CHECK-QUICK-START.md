# 🚀 Page Check - Hızlı Başlangıç

## ⚡ 3 Adımda Kontrol

### 1️⃣ Development Sunucusunu Başlat

```bash
npm run dev
```

### 2️⃣ Script'i Çalıştır (Yeni Terminal)

```bash
npm run check:pages
```

### 3️⃣ Raporu İncele

```bash
open page-check-results/page-check-*.html
```

## 📊 Ne Kontrol Edilir?

✅ **404 Kontrolü** - Tüm navigation linklerinin çalışıp çalışmadığı  
📱 **Sidebar Kontrolü** - Tüm sayfalarda sidebar'ın render edilmesi  
🔝 **Header Kontrolü** - Tüm sayfalarda header'ın render edilmesi  
✨ **"Yeni" Sayfalar** - Yeni oluşturma sayfalarının varlığı  
↪️ **Yönlendirmeler** - Beklenmeyen yönlendirmeler

## 📄 Çıktılar

- **Konsol:** Özet bilgiler ve hata listesi
- **HTML Rapor:** Detaylı, görsel rapor (`page-check-results/` klasöründe)

## 🎯 Sonraki Adımlar

1. Script'i çalıştırın ve sorunları görün
2. HTML raporunu açın ve detaylı inceleyin
3. Bulunan sorunları önceliklendirin:
   - 🔴 **Kritik:** 404 hataları
   - 🟡 **Önemli:** Eksik sidebar/header
   - 🟢 **İyileştirme:** UX sorunları
4. Sorunları düzeltin
5. Manuel checklist ile detaylı kontrol yapın (`docs/MANUAL-CHECKLIST.md`)

## 💡 İpuçları

- Script'i her önemli değişiklikten sonra çalıştırın
- HTML raporlarını saklayın (git'e commit etmeyin)
- Önce kritik hataları (404) düzeltin
- Otomatik kontrollerden sonra manuel checklist'i de kullanın

## 📚 Daha Fazla Bilgi

- [Detaylı Rehber](./PAGE-CHECK-GUIDE.md)
- [Manuel Checklist](./MANUAL-CHECKLIST.md)
