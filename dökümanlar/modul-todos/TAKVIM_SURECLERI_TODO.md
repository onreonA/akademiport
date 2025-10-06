# 📅 TAKVİM SÜREÇLERİ GELİŞTİRME PLANI

## 🎯 PROJE GENEL BAKIŞ

**Takvim Entegrasyonu ve Danışman Ajanda Sistemi** - Randevu yönetimi, müsaitlik kontrolü ve etkinlik takvimi entegrasyonu

---

## 🚀 FAZE 1: TEMEL ALTYAPI VE DANIŞMAN AJANDA SİSTEMİ ✅

**Durum:** TAMAMLANDI  
**Süre:** 2-3 gün  
**Öncelik:** YÜKSEK

### ✅ Tamamlanan İşler:

- [x] `consultant_schedule` veritabanı tablosu oluşturuldu
- [x] API endpoint'leri eklendi (CRUD işlemleri)
- [x] Admin panelinde ajanda yönetim sayfası oluşturuldu
- [x] `ScheduleModal` component'i eklendi
- [x] Müsaitlik kontrolü API'si hazırlandı
- [x] Temel altyapı tamamlandı

### 📁 Oluşturulan Dosyalar:

- `database/consultant_schedule_setup_fixed.sql`
- `app/api/consultant-schedule/route.ts`
- `app/api/consultant-schedule/[id]/route.ts`
- `app/api/consultant-schedule/availability/[consultantId]/route.ts`
- `app/admin/consultant-schedule/page.tsx`
- `components/ScheduleModal.tsx`

---

## 🔄 FAZE 2: ÇAKIŞMA KONTROLÜ VE MÜSAİTLİK SİSTEMİ

**Durum:** PLANLANDI  
**Süre:** 3-4 gün  
**Öncelik:** YÜKSEK

### 🎯 Hedefler:

- Randevu çakışma kontrolü
- Otomatik müsaitlik hesaplama
- Çakışma uyarıları sistemi

### 📋 Yapılacak İşler:

#### 2.1 Veritabanı Geliştirmeleri

- [ ] `appointments` tablosuna `consultant_id` alanı ekleme
- [ ] `consultant_schedule` tablosuna `is_available` boolean alanı ekleme
- [ ] Müsaitlik hesaplama için view oluşturma
- [ ] Çakışma kontrolü için index'ler ekleme

#### 2.2 API Geliştirmeleri

- [ ] `POST /api/appointments` - Çakışma kontrolü ekleme
- [ ] `GET /api/consultant-schedule/availability/[consultantId]` - Geliştirme
- [ ] `POST /api/appointments/check-conflict` - Yeni endpoint
- [ ] Müsaitlik hesaplama algoritması

#### 2.3 Frontend Geliştirmeleri

- [ ] Randevu oluştururken danışman seçimi
- [ ] Çakışma uyarıları
- [ ] Müsaitlik gösterimi
- [ ] Otomatik tarih önerileri

### 🔧 Teknik Detaylar:

```sql
-- Örnek müsaitlik hesaplama view'i
CREATE VIEW consultant_availability AS
SELECT
  cs.consultant_id,
  cs.start_time,
  cs.end_time,
  cs.type,
  CASE
    WHEN cs.type = 'available' THEN true
    WHEN cs.type = 'busy' THEN false
    ELSE false
  END as is_available
FROM consultant_schedule cs;
```

---

## 🎨 FAZE 3: DANIŞMAN DASHBOARD VE YÖNETİM SİSTEMİ

**Durum:** ✅ TAMAMLANDI  
**Süre:** 2-3 gün  
**Öncelik:** ORTA

### 🎯 Hedefler:

- Danışman kişisel ajanda görünümü ✅
- Randevu yönetimi ✅
- Müsaitlik ayarlama ✅

### 📋 Yapılan İşler:

#### 3.1 Danışman Sayfaları

- [x] `app/consultant/dashboard/page.tsx` - Ana dashboard
- [x] `app/consultant/schedule/page.tsx` - Kişisel ajanda yönetimi
- [x] `app/consultant/appointments/page.tsx` - Randevu yönetimi
- [x] `app/consultant/reports/page.tsx` - Performans raporları

#### 3.2 Component'ler

- [x] `components/ScheduleModal.tsx` - Ajanda modal'ı (güncellendi)
- [x] `components/MinimalHeader.tsx` - Header component
- [x] `components/AppointmentCalendar.tsx` - Takvim görünümü

#### 3.3 API Geliştirmeleri

- [x] `POST /api/consultant-schedule/availability-status` - Müsaitlik güncelleme
- [x] `GET /api/consultant-schedule?consultant_email=...` - Email ile filtreleme
- [x] `GET /api/appointments?consultant_email=...` - Email ile filtreleme

---

## 📅 FAZE 4: ETKİNLİK TAKVİM ENTEGRASYONU

**Durum:** PLANLANDI  
**Süre:** 2-3 gün  
**Öncelik:** DÜŞÜK

### 🎯 Hedefler:

- Etkinlik takvimi entegrasyonu
- Çoklu takvim görünümü
- Etkinlik-randevu senkronizasyonu

### 📋 Yapılacak İşler:

#### 4.1 Etkinlik Sistemi

- [ ] `events` tablosu oluşturma
- [ ] Etkinlik-randevu ilişkisi
- [ ] Takvim senkronizasyonu

#### 4.2 UI Geliştirmeleri

- [ ] Çoklu takvim görünümü
- [ ] Etkinlik filtreleme
- [ ] Drag & drop etkinlik yönetimi

---

## 🎨 FAZE 5: UI/UX İYİLEŞTİRMELERİ VE TEST

**Durum:** PLANLANDI  
**Süre:** 2-3 gün  
**Öncelik:** DÜŞÜK

### 🎯 Hedefler:

- Kullanıcı deneyimi iyileştirmeleri
- Responsive tasarım
- Performans optimizasyonu

### 📋 Yapılacak İşler:

#### 5.1 UI İyileştirmeleri

- [ ] Modern takvim tasarımı
- [ ] Mobil uyumluluk
- [ ] Dark/Light tema desteği

#### 5.2 Test ve Optimizasyon

- [ ] Unit testler
- [ ] Integration testler
- [ ] Performance testleri
- [ ] Cross-browser uyumluluk

---

## 🔧 TEKNİK GEREKSİNİMLER

### 📚 Kullanılan Teknolojiler:

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase
- **Veritabanı:** PostgreSQL (Supabase)
- **Takvim:** FullCalendar.js
- **State Management:** React Hooks, Context API

### 🗄️ Veritabanı Şeması:

```sql
-- Mevcut tablolar
appointments (id, company_id, consultant_id, start_time, end_time, status, notes)
consultant_schedule (id, consultant_id, title, description, start_time, end_time, type, is_recurring)

-- Planlanan tablolar
events (id, title, description, start_time, end_time, type, company_id)
consultant_availability (view - müsaitlik hesaplama)
```

---

## 📊 İLERLEME TAKİBİ

### ✅ Tamamlanan:

- **FAZE 1:** %100 (2-3 gün)

### 🔄 Devam Eden:

- **FAZE 2:** %0 (3-4 gün)

### ⏳ Bekleyen:

- **FAZE 3:** %0 (2-3 gün)
- **FAZE 4:** %0 (2-3 gün)
- **FAZE 5:** %0 (2-3 gün)

**Toplam Tahmini Süre:** 9-13 gün

---

## 🚨 ÖNCELİK SIRASI

1. **🔴 YÜKSEK:** FAZE 2 - Çakışma kontrolü ve müsaitlik sistemi
2. **🟡 ORTA:** FAZE 3 - Danışman dashboard
3. **🟢 DÜŞÜK:** FAZE 4 - Etkinlik entegrasyonu
4. **🔵 DÜŞÜK:** FAZE 5 - UI/UX iyileştirmeleri

---

## 📝 NOTLAR VE ÖNERİLER

### 💡 Önemli Noktalar:

- Çakışma kontrolü kritik öneme sahip
- Müsaitlik hesaplama algoritması optimize edilmeli
- Real-time güncellemeler için WebSocket düşünülebilir
- Mobile-first tasarım yaklaşımı benimsenmeli

### 🔍 Test Stratejisi:

- Her faz sonunda kapsamlı test
- Farklı senaryolar için test case'ler
- Performance ve scalability testleri
- User acceptance testing

---

## 📞 İLETİŞİM VE GÜNCELLEMELER

**Son Güncelleme:** 2024-12-19  
**Güncelleyen:** AI Assistant  
**Versiyon:** 1.0

**Sonraki Güncelleme:** FAZE 2 tamamlandığında

---

_Bu doküman, takvim süreçleri geliştirme projesinin resmi planıdır ve düzenli olarak güncellenmektedir._
