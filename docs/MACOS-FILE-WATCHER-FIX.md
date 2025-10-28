# 🔧 macOS File Watcher Limit Sorunu - Çözüm

**Tarih:** 29 Ekim 2025  
**Platform:** macOS (Darwin)  
**Durum:** Sistem Ayarı Gerekli

---

## ⚠️ Sorun

### Hata Mesajı
```
Watchpack Error (watcher): Error: EMFILE: too many open files, watch
```

### Sebep
- **macOS Limiti:** Varsayılan file descriptor limiti düşük (256-1024)
- **Next.js/Turbopack:** Çok sayıda dosya izliyor (hot reload için)
- **Proje Boyutu:** 200+ dosya, node_modules, .next cache

### Etki
- ⚠️ Hot reload çalışmayabilir
- ⚠️ Development server yavaşlayabilir
- ⚠️ Build hatası verebilir

---

## ✅ Kalıcı Çözüm (Önerilen)

### 1. Mevcut Limiti Kontrol Et

```bash
# Soft limit (mevcut oturum)
ulimit -n

# Hard limit (maksimum)
ulimit -Hn
```

**Beklenen:** 256-1024 (düşük)  
**Hedef:** 65536 (yüksek)

### 2. Kalıcı Limit Artırma

#### macOS Sonoma/Sequoia (14+)

```bash
# 1. LaunchDaemon oluştur
sudo nano /Library/LaunchDaemons/limit.maxfiles.plist
```

**Dosya İçeriği:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>limit.maxfiles</string>
    <key>ProgramArguments</key>
    <array>
      <string>launchctl</string>
      <string>limit</string>
      <string>maxfiles</string>
      <string>65536</string>
      <string>200000</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>ServiceIPC</key>
    <false/>
  </dict>
</plist>
```

```bash
# 2. Dosya izinlerini ayarla
sudo chown root:wheel /Library/LaunchDaemons/limit.maxfiles.plist
sudo chmod 644 /Library/LaunchDaemons/limit.maxfiles.plist

# 3. Servisi yükle
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist

# 4. Bilgisayarı yeniden başlat
sudo reboot
```

### 3. Doğrulama

Yeniden başlattıktan sonra:

```bash
ulimit -n
# Beklenen: 65536

launchctl limit maxfiles
# Beklenen: maxfiles 65536 200000
```

---

## 🚀 Geçici Çözüm (Oturum İçin)

Kalıcı çözümü uygulayana kadar:

```bash
# Mevcut terminal oturumu için
ulimit -n 65536

# Sonra projeyi başlat
npm run dev
```

⚠️ **Not:** Terminal kapatıldığında sıfırlanır.

---

## 🔧 Shell Profile'a Ekle (Alternatif)

### Zsh (macOS varsayılan)

```bash
# .zshrc dosyasını düzenle
nano ~/.zshrc

# Şunu ekle:
ulimit -n 65536

# Kaydet ve uygula
source ~/.zshrc
```

### Bash

```bash
# .bash_profile dosyasını düzenle
nano ~/.bash_profile

# Şunu ekle:
ulimit -n 65536

# Kaydet ve uygula
source ~/.bash_profile
```

---

## 📊 Limit Seviyeleri

| Seviye | Soft Limit | Hard Limit | Kullanım |
|--------|-----------|-----------|----------|
| **Düşük** | 256 | 1024 | ❌ Küçük projeler |
| **Orta** | 4096 | 8192 | ⚠️ Orta projeler |
| **Yüksek** | 65536 | 200000 | ✅ Büyük projeler |

**Akademi Port:** Yüksek seviye gerekli (200+ dosya)

---

## 🛠️ Proje Bazlı Çözümler

### 1. Node_modules Cache Temizle

```bash
cd /Users/omerunsal/Desktop/akademi-port
rm -rf node_modules/.cache
rm -rf .next
```

### 2. Watchpack Ignore Ekle

`next.config.ts` dosyasına:

```typescript
const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      root: '/Users/omerunsal/Desktop/akademi-port',
    },
  },
  // Gereksiz dosyaları izleme
  webpack: (config) => {
    config.watchOptions = {
      ignored: /node_modules/,
      poll: 1000, // Polling interval (ms)
    };
    return config;
  },
};
```

### 3. .gitignore ve .cursorignore Optimize Et

Gereksiz dosyaları ignore et:

```
# .gitignore
node_modules/
.next/
.turbo/
*.log
.DS_Store
```

---

## 🔍 Sorun Giderme

### Hala Hata Alıyorsanız

1. **Terminal'i Yeniden Başlat:**
```bash
# Mevcut process'leri durdur
pkill -f "next dev"

# Terminal'i kapat ve yeniden aç
# Limiti kontrol et
ulimit -n
```

2. **Bilgisayarı Yeniden Başlat:**
```bash
sudo reboot
```

3. **Limit Uygulandı mı Kontrol Et:**
```bash
launchctl limit maxfiles
ulimit -n
```

4. **macOS Versiyonunu Kontrol Et:**
```bash
sw_vers
# Sonoma/Sequoia için yukarıdaki çözüm geçerli
```

---

## 📝 Akademi Port İçin Önerilen Ayarlar

### Kalıcı Çözüm (Önerilen)

✅ **LaunchDaemon oluştur** (yukarıdaki adımlar)  
✅ **Bilgisayarı yeniden başlat**  
✅ **Doğrula:** `ulimit -n` → 65536

### Proje Ayarları

✅ **next.config.ts** - Turbopack root ayarlandı  
✅ **Cache temizleme** - `rm -rf .next node_modules/.cache`  
✅ **Gereksiz dosyalar ignore** - .gitignore optimize

---

## 🎯 Sonuç

**Durum:** ⚠️ Sistem Ayarı Gerekli (Kullanıcı tarafından)

**Etki:** Düşük (Geçici çözümle çalışıyor)

**Öneri:** 
1. Kalıcı çözümü uygula (LaunchDaemon)
2. Bilgisayarı yeniden başlat
3. Sprint 4'e devam et

---

## 🔗 Referanslar

- [Node.js File Descriptor Limits](https://nodejs.org/api/fs.html#file-system-flags)
- [macOS launchctl Documentation](https://ss64.com/osx/launchctl.html)
- [Next.js Webpack Configuration](https://nextjs.org/docs/app/api-reference/next-config-js/webpack)
- [Turbopack Configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack)

---

**Not:** Bu ayar bir kez yapıldığında tüm Node.js projeleri için geçerli olur. Sadece Akademi Port için değil.

