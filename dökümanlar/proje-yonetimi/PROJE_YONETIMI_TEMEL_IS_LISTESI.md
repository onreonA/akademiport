# 🔧 PROJE YÖNETİMİ MODÜLÜ - TEMEL İŞ LİSTESİ

**Oluşturan:** AI Assistant  
**Tarih:** 2024  
**Durum:** Temel Geliştirme  
**Öncelik:** Kritik

---

## 📋 ÖNCELİK SIRASI: YÜKSEK (ACİL)

### 1. **Veritabanı Şeması ve API Altyapısı**

- [ ] **Proje Tablosu** (`projects`)
  - id, name, description, start_date, end_date, type, status, progress
  - company_id, consultant_id, created_at, updated_at

- [ ] **Alt Proje Tablosu** (`sub_projects`)
  - id, project_id, name, description, start_date, end_date
  - status, progress, task_count, completed_tasks

- [ ] **Görev Tablosu** (`tasks`)
  - id, sub_project_id, name, description, priority, status
  - due_date, completed_at, notes, attachments

- [ ] **Firma-Proje İlişki Tablosu** (`company_projects`)
  - id, company_id, project_id, assigned_at, status

### 2. **API Endpoint'leri**

- [ ] **Proje API'leri**
  - `GET /api/projects` - Proje listesi
  - `POST /api/projects` - Yeni proje oluşturma
  - `GET /api/projects/[id]` - Proje detayı
  - `PATCH /api/projects/[id]` - Proje güncelleme
  - `DELETE /api/projects/[id]` - Proje silme

- [ ] **Alt Proje API'leri**
  - `GET /api/projects/[id]/sub-projects` - Alt proje listesi
  - `POST /api/projects/[id]/sub-projects` - Alt proje oluşturma
  - `PATCH /api/sub-projects/[id]` - Alt proje güncelleme

- [ ] **Görev API'leri**
  - `GET /api/sub-projects/[id]/tasks` - Görev listesi
  - `POST /api/sub-projects/[id]/tasks` - Görev oluşturma
  - `PATCH /api/tasks/[id]` - Görev güncelleme

### 3. **URL Routing Düzeltmeleri**

- [ ] **Admin Routing**
  - `/admin/proje-yonetimi` ✅ (Mevcut)
  - `/admin/proje-yonetimi/[id]` ✅ (Mevcut)
  - `/admin/proje-yonetimi/[id]/gorevler/[subId]` ❌ (Düzeltilecek)

- [ ] **Firma Routing**
  - `/firma/projelerim` ✅ (Mevcut)
  - `/firma/projelerim/[projectId]` ✅ (Mevcut)
  - `/firma/projelerim/[projectId]/[subProjectId]` ❌ (Düzeltilecek)

### 4. **Mock Data'dan Gerçek Veriye Geçiş**

- [ ] **Admin Tarafı**
  - Proje listesi API entegrasyonu
  - Alt proje listesi API entegrasyonu
  - Görev listesi API entegrasyonu

- [ ] **Firma Tarafı**
  - Firma projeleri API entegrasyonu
  - Alt proje detayları API entegrasyonu
  - Görev detayları API entegrasyonu

### 5. **Temel CRUD İşlemleri**

- [ ] **Proje Oluşturma** (Admin)
- [ ] **Proje Düzenleme** (Admin)
- [ ] **Proje Silme** (Admin)
- [ ] **Firma Atama** (Admin)
- [ ] **Görev Oluşturma** (Admin)
- [ ] **Görev Güncelleme** (Firma)
- [ ] **İlerleme Güncelleme** (Firma)

---

## 📋 ÖNCELİK SIRASI: ORTA (1-2 HAFTA)

### 6. **Veri Tutarlılığı ve Senkronizasyon**

- [ ] **Admin-Firma Veri Senkronizasyonu**
  - Proje durumu güncellemeleri
  - Görev durumu güncellemeleri
  - İlerleme yüzdesi hesaplamaları

- [ ] **Gerçek Zamanlı Güncellemeler**
  - WebSocket bağlantıları
  - Otomatik sayfa yenileme
  - Bildirim sistemi

### 7. **Temel Güvenlik**

- [ ] **Kimlik Doğrulama**
  - API authentication
  - Role-based access control
  - Firma veri izolasyonu

- [ ] **Veri Doğrulama**
  - Input validation
  - SQL injection koruması
  - XSS koruması

### 8. **Hata Yönetimi**

- [ ] **API Hata Yönetimi**
  - HTTP status codes
  - Error messages
  - Fallback mechanisms

- [ ] **Frontend Hata Yönetimi**
  - Loading states
  - Error boundaries
  - User-friendly error messages

---

## 📋 ÖNCELİK SIRASI: DÜŞÜK (2-4 HAFTA)

### 9. **Temel Raporlama**

- [ ] **Proje İstatistikleri**
  - Toplam proje sayısı
  - Aktif proje sayısı
  - Tamamlanan proje sayısı

- [ ] **İlerleme Raporları**
  - Firma bazlı ilerleme
  - Sektör bazlı ilerleme
  - Genel ilerleme özeti

### 10. **Temel Bildirimler**

- [ ] **Email Bildirimleri**
  - Proje atama bildirimleri
  - Görev tamamlama bildirimleri
  - Deadline yaklaşma uyarıları

- [ ] **Sistem Bildirimleri**
  - In-app notifications
  - Toast messages
  - Status updates

---

## 🎯 BAŞARI KRİTERLERİ

### **Teknik Kriterler**

- [ ] Tüm API endpoint'leri çalışır durumda
- [ ] Veritabanı şeması tamamlanmış
- [ ] URL routing sorunları çözülmüş
- [ ] Mock data'dan gerçek veriye geçiş tamamlanmış

### **Fonksiyonel Kriterler**

- [ ] Admin proje oluşturabiliyor
- [ ] Admin firmalara proje atayabiliyor
- [ ] Firma projelerini görebiliyor
- [ ] Firma görevleri güncelleyebiliyor
- [ ] İlerleme takibi çalışıyor

### **Kullanıcı Kriterleri**

- [ ] Sayfa yükleme hataları yok
- [ ] Veri tutarlılığı sağlanmış
- [ ] Temel CRUD işlemleri çalışıyor
- [ ] Kullanıcı dostu hata mesajları

---

## 🚀 GELİŞTİRME SIRASI

### **1. Hafta: Veritabanı ve API**

1. Veritabanı şeması oluşturma
2. API endpoint'leri geliştirme
3. Temel CRUD işlemleri

### **2. Hafta: Frontend Entegrasyonu**

1. Mock data'dan API'ye geçiş
2. URL routing düzeltmeleri
3. Hata yönetimi

### **3. Hafta: Test ve Optimizasyon**

1. Veri tutarlılığı testleri
2. Güvenlik testleri
3. Performans optimizasyonu

### **4. Hafta: Raporlama ve Bildirimler**

1. Temel raporlama
2. Email bildirimleri
3. Sistem bildirimleri

---

## 📝 NOTLAR

- **Öncelik:** Önce çalışan bir sistem, sonra gelişmiş özellikler
- **Test:** Her adımda test edilmeli
- **Dokümantasyon:** API dokümantasyonu güncel tutulmalı
- **Backup:** Mevcut mock data'lar yedeklenmeli

**Bu temel iş listesi tamamlandıktan sonra gelişmiş özellikler eklenebilir.**
