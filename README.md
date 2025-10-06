# İhracat Akademi - E-İhracat Dönüşüm Platformu

Bu proje, Türkiye'nin e-ihracat kapasitesini artırmak için geliştirilmiş kapsamlı bir platformdur.

## 🚀 Özellikler

### Firma Paneli

- **Dashboard** - Genel bakış ve istatistikler
- **Eğitimlerim** - Video ve doküman eğitimleri
- **Proje Yönetimi** - Proje takibi ve yönetimi
- **Randevularım** - Danışman randevuları
- **Forum** - Topluluk etkileşimi
- **Raporlama** - Analiz ve raporlar

### Danışman Paneli

- **Firma Yönetimi** - Atanmış firmalar
- **Proje Takibi** - İlerleme takibi
- **Danışmanlık Notları** - Not ve öneriler
- **Raporlama** - Detaylı analizler

## 🛠️ Teknoloji Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS, Lucide Icons
- **State Management:** Zustand (Optimized)
- **Authentication:** Cookie-based with Middleware
- **Database:** Supabase
- **API:** Next.js API Routes

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Tarayıcıda aç
open http://localhost:3000
```

## 🔐 Authentication

### Test Kullanıcıları

- **Firma:** info@mundo.com / 123456
- **Danışman:** admin@ihracatakademi.com / Admin123!

### Güvenlik

- Cookie-based authentication
- Role-based access control
- Middleware route protection
- CSRF protection

## 📊 Performans Optimizasyonları

### Uygulanan Optimizasyonlar (9 Ocak 2025)

- **Zustand Store** - Selector optimizasyonu
- **Component Memoization** - React.memo ve useMemo
- **API Caching** - 15-20 dakika cache süresi
- **Request Deduplication** - Duplicate request önleme

### Performans İyileştirmeleri

- **%30-50 daha az re-render**
- **%40-60 daha hızlı API**
- **%20-30 daha az memory kullanımı**

## 📁 Proje Yapısı

```
├── app/                    # Next.js App Router
│   ├── admin/             # Danışman paneli
│   ├── firma/             # Firma paneli
│   ├── giris/             # Login sayfası
│   └── api/               # API routes
├── components/            # React component'leri
├── lib/                   # Utility fonksiyonları
│   ├── stores/           # Zustand stores
│   └── hooks/            # Custom hooks
├── docs/                 # Dokümantasyon
└── supabase/            # Database migrations
```

## 🧪 Test

```bash
# API test
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"info@mundo.com","password":"123456"}'

# Middleware test
curl -X GET "http://localhost:3000/firma"
```

## 📚 Dokümantasyon

- [Performans Analizi](docs/performance-analysis-2025-01-09.md)
- [Middleware Authentication](docs/middleware-auth-fix-2025-01-09.md)
- [Günlük Rapor](docs/daily-report-2025-01-09.md)

## 🚀 Deployment

```bash
# Production build
npm run build

# Production start
npm start
```

## 📈 Geliştirme Durumu

### Tamamlanan Fazlar

- ✅ **Faze 1:** Temel yapı ve authentication
- ✅ **Faze 2:** Performans optimizasyonu
- 🔄 **Faze 3:** Yeni özellikler (devam ediyor)

### Son Güncelleme

**9 Ocak 2025** - Performans optimizasyonu ve middleware authentication çözümü

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
