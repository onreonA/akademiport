# 🚀 KARİYER PORTALI MODÜLÜ - GELİŞTİRME PLANI

## 📋 PROJE GENEL BİLGİLERİ

- **Modül Adı:** Kariyer Portalı
- **Hedef:** 3 tip başvuru sistemi (Danışman, Stajyer, Firma İK)
- **Başlangıç Tarihi:** 26 Ağustos 2025
- **Tahmini Tamamlanma:** 6-8 hafta
- **Öncelik:** Yüksek

---

## 🎯 HEDEFLENEN İŞ AKIŞI

```
1. Başvuru Alınır (/kariyer)
   ↓
2. Admin Paneline Düşer (/admin/kariyer-portali)
   ↓
3. Admin Değerlendirmesi:
   - Danışman: Sadece admin değerlendirir
   - Stajyer/Firma İK: Admin onayı → Firma havuzuna
   ↓
4. Firma Havuzuna Yönlendirme (/firma/ik-havuzu)
   ↓
5. Firma İşe Alımı → Havuzdan Çıkarma
```

---

## 📊 FAZ 1: TEMEL ALTYAPI (1-2 HAFTA)

### 🔧 VERİTABANI YAPISI

#### **1.1 Başvuru Tablosu (career_applications)**

- [ ] `id` - UUID PRIMARY KEY
- [ ] `application_type` - ENUM ('consultant', 'intern', 'hr_staff')
- [ ] `name` - VARCHAR(255)
- [ ] `email` - VARCHAR(255)
- [ ] `phone` - VARCHAR(50)
- [ ] `city` - VARCHAR(100)
- [ ] `education` - VARCHAR(100)
- [ ] `experience` - TEXT
- [ ] `interests` - TEXT
- [ ] `position` - VARCHAR(100)
- [ ] `expertise` - JSONB (uzmanlık alanları)
- [ ] `cv_file_path` - VARCHAR(500)
- [ ] `cv_file_name` - VARCHAR(255)
- [ ] `status` - ENUM ('pending', 'admin_approved', 'consultant_approved', 'in_pool', 'hired', 'rejected')
- [ ] `kvkk_accepted` - BOOLEAN
- [ ] `created_at` - TIMESTAMP
- [ ] `updated_at` - TIMESTAMP

#### **1.2 Durum Geçmişi Tablosu (application_status_history)**

- [ ] `id` - UUID PRIMARY KEY
- [ ] `application_id` - UUID (FK)
- [ ] `previous_status` - VARCHAR(50)
- [ ] `new_status` - VARCHAR(50)
- [ ] `updated_by` - UUID (FK users)
- [ ] `notes` - TEXT
- [ ] `created_at` - TIMESTAMP

#### **1.3 Firma Havuzu Tablosu (hr_pool)**

- [ ] `id` - UUID PRIMARY KEY
- [ ] `application_id` - UUID (FK)
- [ ] `company_id` - UUID (FK companies)
- [ ] `status` - ENUM ('available', 'viewed', 'contacted', 'hired', 'removed')
- [ ] `viewed_at` - TIMESTAMP
- [ ] `contacted_at` - TIMESTAMP
- [ ] `hired_at` - TIMESTAMP
- [ ] `hired_by_company` - UUID (FK companies)
- [ ] `notes` - TEXT
- [ ] `created_at` - TIMESTAMP

#### **1.4 İş İlanları Tablosu (job_postings)**

- [ ] `id` - UUID PRIMARY KEY
- [ ] `title` - VARCHAR(255)
- [ ] `company` - VARCHAR(255)
- [ ] `department` - VARCHAR(100)
- [ ] `location` - VARCHAR(255)
- [ ] `type` - ENUM ('full_time', 'part_time', 'project', 'internship')
- [ ] `level` - ENUM ('entry', 'mid', 'senior', 'manager')
- [ ] `salary_min` - INTEGER
- [ ] `salary_max` - INTEGER
- [ ] `description` - TEXT
- [ ] `requirements` - JSONB
- [ ] `benefits` - JSONB
- [ ] `status` - ENUM ('active', 'inactive', 'filled')
- [ ] `posted_date` - TIMESTAMP
- [ ] `deadline` - TIMESTAMP
- [ ] `views_count` - INTEGER DEFAULT 0
- [ ] `applications_count` - INTEGER DEFAULT 0
- [ ] `created_at` - TIMESTAMP

### 🔌 API ENDPOINT'LERİ

#### **1.5 Başvuru API'leri**

- [ ] `POST /api/career/applications` - Yeni başvuru gönderme
- [ ] `GET /api/career/applications` - Başvuruları listeleme (admin)
- [ ] `GET /api/career/applications/:id` - Başvuru detayı
- [ ] `PUT /api/career/applications/:id/status` - Durum güncelleme
- [ ] `DELETE /api/career/applications/:id` - Başvuru silme

#### **1.6 Firma Havuzu API'leri**

- [ ] `GET /api/hr-pool` - Havuz listesi (firma)
- [ ] `PUT /api/hr-pool/:id/status` - Havuz durumu güncelleme
- [ ] `POST /api/hr-pool/:id/hire` - İşe alım işaretleme
- [ ] `GET /api/hr-pool/statistics` - Havuz istatistikleri

#### **1.7 İş İlanları API'leri**

- [ ] `GET /api/jobs` - İş ilanları listesi
- [ ] `POST /api/jobs` - Yeni iş ilanı oluşturma
- [ ] `PUT /api/jobs/:id` - İş ilanı güncelleme
- [ ] `DELETE /api/jobs/:id` - İş ilanı silme
- [ ] `POST /api/jobs/:id/apply` - İş başvurusu gönderme

### 📁 DOSYA YÖNETİMİ

#### **1.8 Supabase Storage Entegrasyonu**

- [ ] CV dosyaları için bucket oluşturma
- [ ] Dosya yükleme fonksiyonları
- [ ] Dosya güvenlik politikaları
- [ ] Dosya silme ve güncelleme işlemleri

---

## 🔄 FAZ 2: İŞ AKIŞI ENTEGRASYONU (1 HAFTA)

### 🎯 ADMIN PANELİ GELİŞTİRMELERİ

#### **2.1 Başvuru Yönetimi**

- [ ] Başvuru tipi bazlı filtreleme
- [ ] Toplu durum güncelleme
- [ ] Gelişmiş arama ve filtreleme
- [ ] Excel export özelliği
- [ ] Başvuru detay modalı geliştirme

#### **2.2 Onay Sistemi**

- [ ] Admin onay/red işlemleri
- [ ] Otomatik firma havuzuna yönlendirme
- [ ] Danışman onay sistemi (gerekirse)
- [ ] Bildirim sistemi entegrasyonu

#### **2.3 İş İlanları Yönetimi**

- [ ] İş ilanı CRUD işlemleri
- [ ] İlan durumu yönetimi
- [ ] Başvuru sayısı takibi
- [ ] Görüntülenme istatistikleri

### 🏢 FİRMA PANELİ GELİŞTİRMELERİ

#### **2.4 İK Havuzu Güncellemeleri**

- [ ] Admin onaylı adayları gösterme
- [ ] Aday durumu güncelleme
- [ ] İşe alım işaretleme
- [ ] Havuzdan otomatik çıkarma
- [ ] Aday detay görüntüleme

#### **2.5 Filtreleme ve Arama**

- [ ] Başvuru tipi bazlı filtreleme
- [ ] Deneyim ve eğitim filtreleri
- [ ] Konum bazlı arama
- [ ] Uzmanlık alanı filtreleme

### 🌐 KARİYER SAYFASI GELİŞTİRMELERİ

#### **2.6 Backend Entegrasyonu**

- [ ] Form verilerini API'ye gönderme
- [ ] CV dosya yükleme
- [ ] Form validasyonu
- [ ] Başarı/hata mesajları
- [ ] KVKK onayı entegrasyonu

#### **2.7 Kullanıcı Deneyimi**

- [ ] Yükleme durumları
- [ ] Form temizleme
- [ ] Responsive tasarım iyileştirmeleri
- [ ] Erişilebilirlik geliştirmeleri

---

## 🚀 FAZ 3: GELİŞMİŞ ÖZELLİKLER (2-3 HAFTA)

### 🤖 AKILLI EŞLEŞTİRME SİSTEMİ

#### **3.1 Eşleştirme Algoritması**

- [ ] Firma ihtiyaçları analizi
- [ ] Aday profili skorlama
- [ ] Otomatik öneri sistemi
- [ ] Eşleştirme skorları
- [ ] Öneri geçmişi

#### **3.2 Firma Profil Sistemi**

- [ ] Firma ihtiyaç profili
- [ ] Pozisyon tanımları
- [ ] Gereksinim matrisi
- [ ] Öncelik belirleme

### 💬 İLETİŞİM SİSTEMİ

#### **3.3 Mesajlaşma Sistemi**

- [ ] Firma-aday mesajlaşma
- [ ] Görüşme planlama
- [ ] Otomatik hatırlatmalar
- [ ] Mesaj geçmişi
- [ ] Dosya paylaşımı

#### **3.4 Bildirim Sistemi**

- [ ] Yeni başvuru bildirimleri
- [ ] Durum değişikliği bildirimleri
- [ ] Görüşme hatırlatmaları
- [ ] Email bildirimleri
- [ ] Push notification

### 📊 ANALİTİK VE RAPORLAMA

#### **3.5 İstatistikler**

- [ ] Başvuru istatistikleri
- [ ] İşe alım oranları
- [ ] Firma performans analizi
- [ ] Aday kalite metrikleri
- [ ] Trend analizleri

#### **3.6 Dashboard'lar**

- [ ] Admin dashboard
- [ ] Firma dashboard
- [ ] Gerçek zamanlı veriler
- [ ] Grafik ve chart'lar
- [ ] Export özellikleri

### 🎮 GAMIFICATION

#### **3.7 Puanlama Sistemi**

- [ ] Aday puanlama algoritması
- [ ] Başarı rozetleri
- [ ] Liderlik tablosu
- [ ] Seviye sistemi
- [ ] Ödül sistemi

---

## ⚡ FAZ 4: OPTİMİZASYON (1 HAFTA)

### 🚀 PERFORMANS İYİLEŞTİRMELERİ

#### **4.1 Veritabanı Optimizasyonu**

- [ ] İndeksler oluşturma
- [ ] Query optimizasyonu
- [ ] Caching stratejileri
- [ ] Pagination iyileştirmeleri

#### **4.2 Frontend Optimizasyonu**

- [ ] Lazy loading
- [ ] Image optimization
- [ ] Bundle size optimization
- [ ] Code splitting

### 🎨 UI/UX GELİŞTİRMELERİ

#### **4.3 Kullanıcı Deneyimi**

- [ ] Loading states
- [ ] Error handling
- [ ] Success feedback
- [ ] Accessibility improvements
- [ ] Mobile optimization

#### **4.4 Tasarım İyileştirmeleri**

- [ ] Modern UI components
- [ ] Dark mode support
- [ ] Custom animations
- [ ] Responsive design
- [ ] Brand consistency

### 🧪 TEST VE KALITE

#### **4.5 Test Senaryoları**

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance tests
- [ ] Security tests

#### **4.6 Hata Düzeltmeleri**

- [ ] Bug fixes
- [ ] Edge case handling
- [ ] Error logging
- [ ] Monitoring setup

---

## 📋 GÖREV TAKİP SİSTEMİ

### ✅ TAMAMLANAN GÖREVLER

- [x] Mevcut sayfaların analizi
- [x] TODO listesi oluşturuldu

### 🔄 DEVAM EDEN GÖREVLER

- [ ] Veritabanı tabloları oluşturma
- [ ] API endpoint'leri geliştirme

### ⏳ BEKLİYEN GÖREVLER

- [ ] Dosya yükleme sistemi
- [ ] Admin panel entegrasyonu
- [ ] Firma panel entegrasyonu
- [ ] Kariyer sayfası backend entegrasyonu

---

## 🎯 ÖNCELİK SIRASI

### 🔥 YÜKSEK ÖNCELİK

1. Veritabanı tabloları
2. API endpoint'leri
3. Dosya yükleme sistemi
4. Admin onay sistemi
5. Firma havuzu entegrasyonu

### 🔶 ORTA ÖNCELİK

1. Gelişmiş filtreleme
2. Bildirim sistemi
3. Excel export
4. İstatistikler
5. UI/UX iyileştirmeleri

### 🔵 DÜŞÜK ÖNCELİK

1. Eşleştirme algoritması
2. Mesajlaşma sistemi
3. Gamification
4. Dark mode
5. Gelişmiş analitik

---

## 📊 TAHMİNİ TAMAMLANMA SÜRELERİ

- **Faz 1:** 1-2 hafta
- **Faz 2:** 1 hafta
- **Faz 3:** 2-3 hafta
- **Faz 4:** 1 hafta
- **Toplam:** 5-7 hafta

---

## 🚀 SONRAKI ADIMLAR

1. **Veritabanı Migration'ları** oluşturma
2. **API endpoint'leri** geliştirme
3. **Dosya yükleme sistemi** kurma
4. **Admin panel entegrasyonu** başlatma

---

## 📝 NOTLAR

- Mevcut sayfalar analiz edildi ve ihtiyaçlar belirlendi
- 3 tip başvuru sistemi (Danışman, Stajyer, Firma İK) hedefleniyor
- Admin onay sistemi kritik öneme sahip
- Firma havuzu otomatik yönetimi gerekiyor
- Dosya güvenliği ve KVKK uyumluluğu önemli

---

**Son Güncelleme:** 26 Ağustos 2025  
**Versiyon:** 1.0  
**Durum:** Planlama Aşaması 📋
