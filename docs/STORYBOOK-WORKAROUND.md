# 📚 Storybook Network Hatası - Workaround

**Tarih:** 29 Ekim 2025  
**Durum:** Bilinen macOS Sorunu - Workaround Aktif

---

## ⚠️ Sorun

### Hata Mesajı

```
SystemError [ERR_SYSTEM_ERROR]: A system error occurred: uv_interface_addresses returned Unknown system error 1
```

### Sebep

- **Platform:** macOS 14+ (Sonoma/Sequoia)
- **Node.js:** v22+ sürümlerinde bilinen sorun
- **Etki:** Storybook sunucusu başlatılamıyor
- **Kaynak:** Node.js'in `uv_interface_addresses` sistem çağrısı hatası

### Referanslar

- [Node.js Issue #50550](https://github.com/nodejs/node/issues/50550)
- [Storybook Issue #24692](https://github.com/storybookjs/storybook/issues/24692)

---

## ✅ Aktif Workaround

### Components Demo Sayfası

Storybook yerine Next.js içinde bir demo sayfası oluşturduk:

**URL:** http://localhost:3000/components-demo

**Dosya:** `src/app/components-demo/page.tsx`

### Özellikler

✅ **Tüm UI componentlerini gösterir:**

- 22 Atom component
- 5 Molecule component
- 4 Organism component
- 3 Layout template

✅ **Dark mode toggle**

✅ **Responsive design**

✅ **Canlı örnekler** (Storybook gibi)

✅ **Hızlı erişim** (Storybook'tan daha hızlı)

---

## 🔧 Denenen Çözümler (Başarısız)

### 1. Hostname Değiştirme

```json
// package.json
"storybook": "storybook dev -p 6006 --host localhost"
"storybook": "storybook dev -p 6006 --host 127.0.0.1"
```

❌ **Sonuç:** Hata devam etti

### 2. Environment Variable

```bash
HOSTNAME=localhost npm run storybook
```

❌ **Sonuç:** Hata devam etti

### 3. Telemetry Devre Dışı

```typescript
// .storybook/main.ts
core: {
  disableTelemetry: true,
}
```

❌ **Sonuç:** Hata devam etti

### 4. Port Değiştirme

```bash
storybook dev -p 6007
storybook dev -p 6008
```

❌ **Sonuç:** Hata devam etti

---

## 🚀 Gelecek Çözümler

### Seçenek 1: Node.js Downgrade

```bash
# Node.js v20 LTS'ye geç
nvm install 20
nvm use 20
npm install
npm run storybook
```

⚠️ **Risk:** Proje Node.js v22 için optimize edildi

### Seçenek 2: macOS Güncelleme Bekle

- Apple'ın sistem güncellemesi
- Node.js'in fix'i

### Seçenek 3: Components Demo'yu Geliştir

- ✅ **Önerilen:** Zaten çalışıyor
- Daha fazla interaktif örnek ekle
- Props kontrolü ekle (Storybook Controls gibi)

---

## 📝 Kullanım Kılavuzu

### Components Demo Sayfasını Kullan

1. **Projeyi Başlat:**

```bash
npm run dev
```

2. **Demo Sayfasını Aç:**

```
http://localhost:3000/components-demo
```

3. **Componentleri İncele:**

- Tüm componentler kategorilere ayrılmış
- Dark mode toggle ile test et
- Responsive design için tarayıcıyı küçült

### Storybook Stories Hala Kullanılabilir

Storybook sunucusu çalışmasa da, story dosyaları:

- ✅ Kod dokümantasyonu olarak değerli
- ✅ Component prop'larını gösteriyor
- ✅ Kullanım örnekleri içeriyor
- ✅ Gelecekte Storybook çalıştığında hazır

**Story Dosyaları:**

```
src/1-presentation/components/ui/
├── atoms/*.stories.tsx (15 dosya)
├── molecules/*.stories.tsx (5 dosya)
├── organisms/*.stories.tsx (4 dosya)
└── templates/*.stories.tsx (3 dosya)
```

---

## 🎯 Sonuç

**Durum:** ✅ Çözüldü (Workaround ile)

**Etki:** ❌ Yok (Components Demo sayfası tam işlevsel)

**Öneri:** Components Demo sayfasını kullanmaya devam et. Storybook gelecekte düzeltildiğinde bonus olacak.

---

## 📊 Karşılaştırma

| Özellik           | Storybook       | Components Demo  |
| ----------------- | --------------- | ---------------- |
| **Çalışıyor mu?** | ❌ macOS hatası | ✅ Tam çalışıyor |
| **Hız**           | Orta            | ⚡ Hızlı         |
| **Componentler**  | 26 story        | 34 component     |
| **Dark Mode**     | ✅              | ✅               |
| **Responsive**    | ✅              | ✅               |
| **Props Control** | ✅              | ⚠️ Manuel        |
| **Dokümantasyon** | ✅ Otomatik     | ⚠️ Manuel        |

---

## 🔗 İlgili Dosyalar

- `src/app/components-demo/page.tsx` - Demo sayfası
- `src/app/page.tsx` - Ana sayfa (demo linki)
- `.storybook/main.ts` - Storybook config
- `package.json` - Storybook scripts

---

**Not:** Bu workaround Sprint 3'te başarıyla uygulandı ve proje çalışır durumda. Sprint 4'e geçmek için engel yok.
