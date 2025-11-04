# Sprint 9 - Kalan İşler Planı

**Tarih:** Ocak 2025  
**Durum:** ✅ %100 Tamamlandı  
**Süre:** ~4-6 saat

---

## 📋 Kalan İşler Özeti

Sprint 9'ta %98 tamamlandı. Kalan 2 opsiyonel iyileştirme:

1. **Video Metadata İyileştirmesi** (~2-3 saat)
   - YouTube API ile otomatik metadata çekme (duration, title)
2. **Document Viewer İyileştirmesi** (~2-3 saat)
   - Tüm dosya tipleri için embedded viewer
   - setIsViewing hatası düzeltme

---

## 🎯 Görev 1: Video Metadata İyileştirmesi

### Mevcut Durum

- ✅ `TrainingVideo` entity'de `durationSeconds` alanı var (nullable)
- ✅ `youtubeId` otomatik extract ediliyor
- ❌ YouTube API ile otomatik metadata çekme yok
- ❌ Duration ve title manuel giriliyor veya null kalıyor

### Yapılacaklar

#### 1.1 YouTube API Servisi Oluştur (1 saat)

**Dosya:** `src/4-infrastructure/external/youtube-api.service.ts`

**Özellikler:**

- YouTube Data API v3 entegrasyonu
- Video metadata çekme (duration, title, description, thumbnail)
- API key environment variable'dan alınacak
- Error handling ve rate limiting

**API Endpoints:**

- `getVideoMetadata(youtubeId: string): Promise<VideoMetadata>`

**VideoMetadata Interface:**

```typescript
interface VideoMetadata {
  duration: number; // seconds
  title: string;
  description?: string;
  thumbnailUrl?: string;
}
```

#### 1.2 CreateTrainingVideoUseCase Güncelleme (0.5 saat)

**Dosya:** `src/2-application/use-cases/training-video/CreateTrainingVideoUseCase.ts`

**Değişiklikler:**

- YouTube API servisi inject edilecek
- Video oluşturulmadan önce metadata çekilecek
- Duration otomatik set edilecek
- Title opsiyonel (eğer boşsa YouTube'dan çekilecek)

#### 1.3 UpdateTrainingVideoUseCase Güncelleme (0.5 saat)

**Dosya:** `src/2-application/use-cases/training-video/UpdateTrainingVideoUseCase.ts`

**Değişiklikler:**

- YouTube URL güncellendiğinde metadata yeniden çekilecek
- Duration otomatik güncellenecek

#### 1.4 Environment Variables (0.5 saat)

**Dosya:** `.env.local`

**Eklenecek:**

```env
NEXT_PUBLIC_YOUTUBE_API_KEY=your_api_key_here
```

**Not:** YouTube Data API v3 için API key gerekli (Google Cloud Console'dan alınabilir)

### Teknik Detaylar

**YouTube Data API v3:**

- Endpoint: `https://www.googleapis.com/youtube/v3/videos`
- Parameters: `id`, `part=snippet,contentDetails`
- Rate Limit: 10,000 units/day (default quota)
- Cost: Free tier yeterli

**Duration Format:**

- YouTube API ISO 8601 format döndürür: `PT1H2M10S`
- Parse edilip saniyeye çevrilecek

---

## 🎯 Görev 2: Document Viewer İyileştirmesi

### Mevcut Durum

- ✅ PDF için embedded viewer var (iframe)
- ❌ Word, Excel, PowerPoint için viewer yok
- ❌ `setIsViewing` hatası var (undefined)
- ❌ Diğer dosya tipleri için sadece download link

### Yapılacaklar

#### 2.1 setIsViewing Hatası Düzeltme (0.5 saat)

**Dosya:** `src/1-presentation/components/features/trainings/TrainingDocumentViewer.tsx`

**Sorun:** `setIsViewing` tanımlı değil ama kullanılıyor

**Çözüm:**

- `useState` ile `isViewing` state'i ekle
- `setIsViewing` tanımla
- Kullanım yerlerini düzelt

#### 2.2 Document Viewer Service Oluştur (1 saat)

**Dosya:** `src/4-infrastructure/external/document-viewer.service.ts`

**Özellikler:**

- Dosya tipine göre viewer seçimi
- Google Docs Viewer entegrasyonu
- Office Online Viewer entegrasyonu
- Fallback: Download link

**Viewer Options:**

- **PDF:** iframe (mevcut)
- **Word (.doc, .docx):** Google Docs Viewer veya Office Online
- **Excel (.xls, .xlsx):** Google Sheets Viewer veya Office Online
- **PowerPoint (.ppt, .pptx):** Office Online
- **Diğer:** Download link

#### 2.3 TrainingDocumentViewer Component Güncelleme (1 saat)

**Dosya:** `src/1-presentation/components/features/trainings/TrainingDocumentViewer.tsx`

**Değişiklikler:**

- Document viewer service kullanılacak
- Tüm dosya tipleri için viewer desteği
- Google Docs Viewer embed
- Office Online Viewer embed
- Viewer seçimi dosya tipine göre otomatik

**Viewer Components:**

```typescript
// PDF Viewer (mevcut)
<iframe src={fileUrl} />

// Google Docs Viewer
<iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`} />

// Office Online Viewer
<iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`} />
```

### Teknik Detaylar

**Google Docs Viewer:**

- Ücretsiz
- PDF, Word, Excel, PowerPoint destekler
- URL: `https://docs.google.com/viewer?url={encoded_url}&embedded=true`
- Limit: 25MB dosya boyutu

**Office Online Viewer:**

- Microsoft'un resmi viewer'ı
- Word, Excel, PowerPoint destekler
- URL: `https://view.officeapps.live.com/op/embed.aspx?src={encoded_url}`
- Limit: 10MB dosya boyutu

**Not:** Her iki viewer da public URL gerektirir. Supabase Storage signed URL kullanılabilir.

---

## 📊 İş Kırılımı

### Faz 1: Video Metadata (2-3 saat) ✅ TAMAMLANDI

1. ✅ YouTube API servisi oluşturuldu (`youtube-api.service.ts`)
2. ✅ CreateTrainingVideoUseCase güncellendi (metadata otomatik çekiliyor)
3. ✅ UpdateTrainingVideoUseCase güncellendi (URL güncellenince metadata yeniden çekiliyor)
4. ✅ Metadata endpoint oluşturuldu (`/api/trainings/[id]/videos/metadata`)
5. ✅ Frontend'de otomatik doldurma eklendi (onBlur ile)
6. ✅ OrderIndex çakışması düzeltildi
7. ✅ Test edildi ve çalışıyor

### Faz 2: Document Viewer (2-3 saat) ✅ TAMAMLANDI

1. ✅ setIsViewing hatası düzeltildi
2. ✅ Document viewer service oluşturuldu (`document-viewer.service.ts`)
3. ✅ TrainingDocumentViewer component güncellendi (tüm dosya tipleri destekleniyor)
4. ✅ Google Docs Viewer ve Office Online Viewer entegrasyonu eklendi
5. ✅ Test edildi ve çalışıyor

**Toplam Süre:** ~4-6 saat

---

## 🚨 Riskler & Çözümler

### Risk 1: YouTube API Key Gereksinimi

**Risk:** YouTube Data API v3 için API key gerekli  
**Çözüm:**

- Google Cloud Console'dan API key alınacak
- Environment variable'a eklenecek
- Rate limiting ve error handling yapılacak

### Risk 2: Google Docs Viewer CORS Sorunları

**Risk:** Google Docs Viewer bazı dosyalarda CORS hatası verebilir  
**Çözüm:**

- Supabase Storage signed URL kullanılacak
- Fallback: Office Online Viewer
- Son çare: Download link

### Risk 3: Office Online Viewer Limitleri

**Risk:** Office Online Viewer sadece 10MB'a kadar dosya destekler  
**Çözüm:**

- Dosya boyutu kontrolü yapılacak
- Büyük dosyalar için Google Docs Viewer veya download link kullanılacak

---

## ✅ Kabul Kriterleri

### Video Metadata

- ✅ Video oluşturulurken YouTube'dan duration otomatik çekiliyor
- ✅ Video URL güncellendiğinde metadata yeniden çekiliyor
- ✅ API key yoksa veya hata olursa graceful degradation (manuel girilebilir)
- ✅ Duration formatı doğru parse ediliyor (ISO 8601 → seconds)

### Document Viewer

- ✅ setIsViewing hatası düzeltildi
- ✅ PDF için embedded viewer çalışıyor (mevcut)
- ✅ Word dosyaları için viewer gösteriliyor
- ✅ Excel dosyaları için viewer gösteriliyor
- ✅ PowerPoint dosyaları için viewer gösteriliyor
- ✅ Fallback: Download link (viewer yoksa)

---

## 📝 Notlar

### YouTube API Key Alma

1. Google Cloud Console'a git
2. Yeni proje oluştur veya mevcut projeyi seç
3. YouTube Data API v3'ü etkinleştir
4. API key oluştur (Credentials → Create Credentials → API Key)
5. API key'i `.env.local` dosyasına ekle

### Viewer Seçimi Mantığı

```typescript
if (fileType === 'pdf') {
  // iframe with direct URL
} else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
  if (fileSize < 10MB) {
    // Office Online Viewer
  } else if (fileSize < 25MB) {
    // Google Docs Viewer
  } else {
    // Download link
  }
} else {
  // Download link
}
```

---

**Hazırlayan:** AI Assistant  
**Versiyon:** 1.0  
**Tarih:** Ocak 2025
