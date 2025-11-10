# E2E Test Düzeltme Planı

## 📊 Mevcut Durum

- **Toplam Test:** 36
- **Başarısız:** 36 (%100)
- **Geçen:** 0 (%0)

## 🎯 Test Grupları ve Öncelik Sırası

### **GRUP 1: AppointmentRequestForm Component Test'leri** (5 test) ⚡ YÜKSEK ÖNCELİK

**Dosya:** `e2e/components/appointment-request-form.spec.ts`

**Testler:**

1. ✅ Form alanlarını render eder
2. ❌ Firma programı yoksa hata mesajı gösterir
3. ❌ Kullanıcı form alanlarını doldurabilir
4. ❌ Form submit edildiğinde başarı mesajı gösterir
5. ❌ İptal butonuna tıklandığında dialog kapanır

**Beklenen Sorunlar:**

- Form render bekleme sorunları
- Consultant select (Radix UI) selector sorunları
- Toast notification selector sorunları
- Form state yönetimi

**Tahmini Süre:** 15-20 dakika

---

### **GRUP 2: EventForm Component Test'leri** (5 test) ⚡ YÜKSEK ÖNCELİK

**Dosya:** `e2e/components/event-form.spec.ts`

**Testler:**

1. ✅ Form alanlarını render eder
2. ❌ Zorunlu alanlar doğrulanır
3. ❌ Başlangıç zamanı bitiş zamanından önce olmalı
4. ❌ Form submit edildiğinde başarı mesajı gösterir
5. ❌ Mevcut etkinlik düzenlenebilir
6. ❌ İptal butonuna tıklandığında dialog kapanır

**Beklenen Sorunlar:**

- Validation mesajları görünmüyor (toast veya form error)
- Dialog kapanma kontrolü
- Form submit sonrası toast notification

**Tahmini Süre:** 15-20 dakika

---

### **GRUP 3: AvailabilityManagement Component Test'leri** (7 test) 🔶 ORTA ÖNCELİK

**Dosya:** `e2e/components/availability-management.spec.ts`

**Testler:**

1. ❌ Müsaitlik yönetimi sayfası yüklenir
2. ❌ Yeni müsaitlik kuralı ekle butonu görünür
3. ❌ Yeni müsait olmama tarihi ekle butonu görünür
4. ❌ Müsaitlik kuralı dialog açılır
5. ❌ Müsait olmama tarihi dialog açılır
6. ❌ Müsaitlik kuralı oluşturulabilir
7. ❌ Müsait olmama tarihi eklenebilir
8. ❌ Boş durumda mesaj gösterilir

**Beklenen Sorunlar:**

- Sayfa başlığı selector sorunları
- Dialog başlığı selector sorunları
- Submit button selector sorunları (strict mode violation)
- Toast notification selector sorunları

**Tahmini Süre:** 20-25 dakika

---

### **GRUP 4: BulkDatesDialog Component Test'leri** (5 test) 🔶 ORTA ÖNCELİK

**Dosya:** `e2e/components/bulk-dates-dialog.spec.ts`

**Testler:**

1. ❌ Dialog açılır ve form alanları görünür
2. ❌ Alt proje seçilebilir
3. ❌ Tarih aralığı seçilebilir
4. ❌ Form submit edildiğinde başarı mesajı gösterir
5. ❌ İptal butonuna tıklandığında dialog kapanır

**Beklenen Sorunlar:**

- Dialog açılma kontrolü
- Select component selector sorunları
- Date input selector sorunları
- Toast notification

**Tahmini Süre:** 15-20 dakika

---

### **GRUP 5: Appointment Flow Test'leri** (4 test) ⚡ YÜKSEK ÖNCELİK

**Dosya:** `e2e/appointments/appointment-flow.spec.ts`

**Testler:**

1. ❌ Randevu oluşturma → Danışman onaylama → Randevu tamamlama
2. ❌ Randevu oluşturma → Danışman reddetme
3. ❌ Randevu revize etme
4. ❌ Müsaitlik kontrolü - Çakışan randevu

**Beklenen Sorunlar:**

- Consultant select sorunları (Page Object)
- Login/logout mekanizması
- Appointment status kontrolü
- Zoom link kontrolü
- Conflict detection

**Tahmini Süre:** 25-30 dakika

---

### **GRUP 6: Event Flow Test'leri** (4 test) 🔶 ORTA ÖNCELİK

**Dosya:** `e2e/events/event-flow.spec.ts`

**Testler:**

1. ❌ Etkinlik oluşturma → Katılım kaydı → Hatırlatma gönderimi
2. ❌ Etkinlik güncelleme → Zoom güncelleme
3. ❌ Etkinlik iptal etme
4. ❌ Etkinlik istatistikleri görüntüleme

**Beklenen Sorunlar:**

- Event creation (Page Object)
- Toast notification
- Attendance registration
- Zoom link kontrolü
- Event cancellation
- Statistics page

**Tahmini Süre:** 25-30 dakika

---

### **GRUP 7: Project Flow Test'leri** (4 test) 🔶 ORTA ÖNCELİK

**Dosya:** `e2e/projects/project-flow.spec.ts`

**Testler:**

1. ❌ Proje oluşturma → Görev atama → Görev tamamlama
2. ❌ Toplu firma atama
3. ❌ Toplu tarih atama
4. ❌ Matris görünümü

**Beklenen Sorunlar:**

- Project creation (Page Object)
- Company select sorunları
- Project list görünürlüğü
- Bulk assignment dialogs
- Matrix view

**Tahmini Süre:** 25-30 dakika

---

## 📋 Çalışma Stratejisi

### Faz 1: Component Test'leri (Öncelik: YÜKSEK)

1. **GRUP 1:** AppointmentRequestForm (5 test)
2. **GRUP 2:** EventForm (5 test)
3. **GRUP 3:** AvailabilityManagement (7 test)
4. **GRUP 4:** BulkDatesDialog (5 test)

**Toplam:** 22 test
**Tahmini Süre:** 65-85 dakika

### Faz 2: Flow Test'leri (Öncelik: ORTA)

5. **GRUP 5:** Appointment Flow (4 test)
6. **GRUP 6:** Event Flow (4 test)
7. **GRUP 7:** Project Flow (4 test)

**Toplam:** 12 test
**Tahmini Süre:** 75-90 dakika

---

## 🔧 Ortak Sorunlar ve Çözümler

### 1. Toast Notification Selector Sorunları

**Sorun:** Toast notification'lar görünmüyor
**Çözüm:**

- `[data-sonner-toast]` selector'ını kontrol et
- `[role="status"]` alternatif selector
- Timeout sürelerini artır

### 2. Radix UI Select Component Sorunları

**Sorun:** Select dropdown açılmıyor veya seçim yapılamıyor
**Çözüm:**

- `[role="combobox"]` trigger'ı bul
- `[role="option"]` seçenekleri bekle
- Dropdown açılması için `waitForTimeout` ekle

### 3. Dialog Açılma/Kapanma Sorunları

**Sorun:** Dialog görünmüyor veya kapanmıyor
**Çözüm:**

- `[role="dialog"]` selector'ını kontrol et
- Dialog state kontrolü için `waitFor` kullan
- Dialog kapanma için `not.toBeVisible` kontrolü

### 4. Form Render Bekleme Sorunları

**Sorun:** Form alanları render edilmeden işlem yapılıyor
**Çözüm:**

- API response'larını bekle (`waitForResponse`)
- Form label'larını kontrol et
- `waitForTimeout` ekle

### 5. Login/Logout Mekanizması

**Sorun:** Farklı kullanıcılar arasında geçiş sorunları
**Çözüm:**

- `loginAs` fonksiyonunda otomatik logout
- Mevcut kullanıcı kontrolü
- URL bazlı role kontrolü

---

## ✅ Başarı Kriterleri

Her grup için:

- ✅ Tüm testler geçiyor olmalı
- ✅ Test süresi makul olmalı (< 2 dakika/grup)
- ✅ Hata mesajları anlaşılır olmalı
- ✅ Test tekrar çalıştırılabilir olmalı

---

## 📝 Notlar

- Her grup tamamlandıktan sonra testleri çalıştır ve sonuçları kaydet
- Ortak sorunlar için çözümleri tüm gruplara uygula
- Page Object pattern'i kullanarak kod tekrarını azalt
- Selector'ları id bazlı yap (daha güvenilir)
