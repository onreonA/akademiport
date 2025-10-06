# 🎓 EĞİTİM YÖNETİMİ MODÜLÜ - TO-DO LİSTESİ

**Proje:** İhracat Akademi - Eğitim Yönetimi Sistemi  
**Başlangıç Tarihi:** 24 Ağustos 2025  
**Durum:** Planlama Aşaması

---

## 📋 **GENEL BAKIŞ**

### **Hedefler:**

- ✅ Kapsamlı eğitim yönetimi sistemi
- ✅ Gelişmiş analitik ve raporlama
- ✅ Gamifikasyon ve motivasyon sistemi
- ✅ Kilitli içerik yönetimi
- ✅ Sıralı video izleme sistemi
- ✅ Danışman iletişim sistemi

### **Öncelik Sırası:**

1. **Aşama 1:** Veritabanı ve API Altyapısı
2. **Aşama 2:** Temel Eğitim Yönetimi
3. **Aşama 3:** Firma Arayüzü
4. **Aşama 4:** Gamifikasyon Sistemi
5. **Aşama 5:** Gelişmiş Analitik ve Raporlama
6. **Aşama 6:** Dashboard ve İstatistikler

---

## 🏗️ **AŞAMA 1: VERİTABANI VE API ALTYAPISI**

### **1.1 Veritabanı Tabloları**

- [ ] `education_sets` tablosu oluştur
  - [ ] id, name, description, category, status
  - [ ] total_duration, video_count, document_count
  - [ ] created_at, updated_at
  - [ ] created_by, is_active

- [ ] `videos` tablosu oluştur
  - [ ] id, set_id, title, description, youtube_url
  - [ ] duration, order_index, status
  - [ ] created_at, updated_at
  - [ ] thumbnail_url, tags

- [ ] `documents` tablosu oluştur
  - [ ] id, set_id, title, description, file_url
  - [ ] file_type, file_size, order_index, status
  - [ ] created_at, updated_at
  - [ ] uploaded_by, download_count

- [ ] `company_education_assignments` tablosu oluştur
  - [ ] id, company_id, set_id, assigned_by
  - [ ] assigned_at, status, progress_percentage
  - [ ] completed_at, last_accessed_at

- [ ] `video_watches` tablosu oluştur
  - [ ] id, company_id, video_id, watched_at
  - [ ] duration_watched, is_completed, notes
  - [ ] watch_count, last_position

- [ ] `document_reads` tablosu oluştur
  - [ ] id, company_id, document_id, read_at
  - [ ] reading_time, is_completed, notes
  - [ ] read_count, last_page

- [ ] `education_comments` tablosu oluştur
  - [ ] id, company_id, video_id, document_id
  - [ ] consultant_id, message, created_at
  - [ ] is_consultant_reply, is_resolved

- [ ] `education_attachments` tablosu oluştur
  - [ ] id, video_id, document_id, file_url
  - [ ] file_name, file_type, uploaded_by
  - [ ] created_at, download_count

### **1.2 Gamifikasyon Tabloları**

- [ ] `company_points` tablosu oluştur
  - [ ] id, company_id, total_points, current_level
  - [ ] experience_points, created_at, updated_at

- [ ] `company_badges` tablosu oluştur
  - [ ] id, company_id, badge_id, earned_at
  - [ ] badge_type, badge_name, badge_icon

- [ ] `badges` tablosu oluştur
  - [ ] id, name, description, icon, points_required
  - [ ] badge_type, created_at

- [ ] `achievements` tablosu oluştur
  - [ ] id, company_id, achievement_type, achieved_at
  - [ ] achievement_name, points_earned

### **1.3 Analitik Tabloları**

- [ ] `education_analytics` tablosu oluştur
  - [ ] id, company_id, set_id, video_id, document_id
  - [ ] action_type, action_data, created_at
  - [ ] session_id, device_info

- [ ] `learning_paths` tablosu oluştur
  - [ ] id, company_id, path_name, current_step
  - [ ] total_steps, completed_steps, created_at

### **1.4 Migration Dosyaları**

- [ ] `061_create_education_sets_table.sql`
- [ ] `062_create_videos_table.sql`
- [ ] `063_create_documents_table.sql`
- [ ] `064_create_company_education_assignments.sql`
- [ ] `065_create_video_watches_table.sql`
- [ ] `066_create_document_reads_table.sql`
- [ ] `067_create_education_comments_table.sql`
- [ ] `068_create_education_attachments_table.sql`
- [ ] `069_create_gamification_tables.sql`
- [ ] `070_create_analytics_tables.sql`

### **1.5 API Endpoints**

- [ ] `GET/POST /api/education-sets` - Eğitim setleri
- [ ] `GET/PATCH/DELETE /api/education-sets/[id]` - Set detay
- [ ] `GET/POST /api/videos` - Videolar
- [ ] `GET/PATCH/DELETE /api/videos/[id]` - Video detay
- [ ] `GET/POST /api/documents` - Dökümanlar
- [ ] `GET/PATCH/DELETE /api/documents/[id]` - Döküman detay
- [ ] `GET/POST /api/company/education-assignments` - Firma atamaları
- [ ] `GET/POST /api/company/video-watches` - Video izleme kayıtları
- [ ] `GET/POST /api/company/document-reads` - Döküman okuma kayıtları
- [ ] `GET/POST /api/education-comments` - Yorumlar
- [ ] `GET/POST /api/company/points` - Puan sistemi
- [ ] `GET/POST /api/company/badges` - Rozet sistemi
- [ ] `GET /api/analytics/company-progress` - Firma ilerleme analizi
- [ ] `GET /api/analytics/education-stats` - Eğitim istatistikleri

---

## 🎯 **AŞAMA 2: TEMEL EĞİTİM YÖNETİMİ**

### **2.1 Admin Eğitim Seti Yönetimi**

- [ ] `app/admin/egitim-yonetimi/setler/page.tsx` - Set listesi
- [ ] `app/admin/egitim-yonetimi/setler/[id]/page.tsx` - Set detay
- [ ] `app/admin/egitim-yonetimi/setler/yeni/page.tsx` - Yeni set oluşturma
- [ ] Set CRUD işlemleri
- [ ] Kategori yönetimi
- [ ] Durum yönetimi (Aktif/Pasif)

### **2.2 Admin Video Yönetimi**

- [ ] `app/admin/egitim-yonetimi/videolar/page.tsx` - Video listesi
- [ ] `app/admin/egitim-yonetimi/videolar/[id]/page.tsx` - Video detay
- [ ] `app/admin/egitim-yonetimi/videolar/yeni/page.tsx` - Yeni video ekleme
- [ ] YouTube entegrasyonu
- [ ] Video sıralama sistemi
- [ ] Video durum yönetimi

### **2.3 Admin Döküman Yönetimi**

- [ ] `app/admin/egitim-yonetimi/dokumanlar/page.tsx` - Döküman listesi
- [ ] `app/admin/egitim-yonetimi/dokumanlar/[id]/page.tsx` - Döküman detay
- [ ] `app/admin/egitim-yonetimi/dokumanlar/yeni/page.tsx` - Yeni döküman ekleme
- [ ] Dosya yükleme sistemi
- [ ] Dosya format kontrolü
- [ ] Döküman sıralama sistemi

### **2.4 Firma Atama Sistemi**

- [ ] `app/admin/egitim-yonetimi/firma-atama/page.tsx` - Atama sayfası
- [ ] Toplu firma atama
- [ ] Tekil firma atama
- [ ] Atama geçmişi
- [ ] Atama kaldırma

---

## 🏢 **AŞAMA 3: FİRMA ARAYÜZÜ**

### **3.1 Firma Video Eğitimleri**

- [ ] `app/firma/egitimlerim/videolar/page.tsx` - Video setleri listesi
- [ ] `app/firma/egitimlerim/videolar/[id]/page.tsx` - Set detay
- [ ] `app/firma/egitimlerim/videolar/[id]/video/[videoId]/page.tsx` - Video izleme
- [ ] Kilitli set görünümü
- [ ] Sıralı video izleme
- [ ] İlerleme takibi
- [ ] YouTube video entegrasyonu

### **3.2 Firma Döküman Eğitimleri**

- [ ] `app/firma/egitimlerim/dokumanlar/page.tsx` - Döküman listesi
- [ ] `app/firma/egitimlerim/dokumanlar/[id]/page.tsx` - Döküman detay
- [ ] PDF görüntüleme
- [ ] Döküman indirme
- [ ] Okuma ilerlemesi

### **3.3 Danışman İletişim Sistemi**

- [ ] `app/firma/egitimlerim/mesajlar/page.tsx` - Mesaj listesi
- [ ] Video/döküman içinde mesajlaşma
- [ ] Danışman yanıt sistemi
- [ ] Dosya ekleme özelliği

### **3.4 Firma Dashboard**

- [ ] `app/firma/egitimlerim/dashboard/page.tsx` - Eğitim dashboard'u
- [ ] İlerleme istatistikleri
- [ ] Son aktiviteler
- [ ] Önerilen eğitimler

---

## 🎮 **AŞAMA 4: GAMİFİKASYON SİSTEMİ**

### **4.1 Puan Sistemi**

- [ ] Video izleme puanları
- [ ] Döküman okuma puanları
- [ ] Quiz tamamlama puanları
- [ ] Günlük aktivite puanları
- [ ] Seviye sistemi

### **4.2 Rozet Sistemi**

- [ ] İlk video izleme rozeti
- [ ] Set tamamlama rozetleri
- [ ] Hızlı öğrenme rozetleri
- [ ] Tutarlılık rozetleri
- [ ] Uzmanlık rozetleri

### **4.3 Liderlik Tablosu**

- [ ] `app/firma/egitimlerim/leaderboard/page.tsx` - Liderlik tablosu
- [ ] En aktif firmalar
- [ ] En çok puan toplayanlar
- [ ] En çok rozet kazananlar
- [ ] Haftalık/aylık sıralamalar

### **4.4 Başarı Sistemi**

- [ ] Başarı rozetleri
- [ ] Başarı sertifikaları
- [ ] Başarı paylaşımı
- [ ] Başarı geçmişi

### **4.5 Gamification Components**

- [ ] `components/GamificationCard.tsx` - Gamification kartı
- [ ] `components/PointsDisplay.tsx` - Puan gösterimi
- [ ] `components/BadgeDisplay.tsx` - Rozet gösterimi
- [ ] `components/LevelProgress.tsx` - Seviye ilerlemesi
- [ ] `components/AchievementModal.tsx` - Başarı modalı

---

## 📊 **AŞAMA 5: GELİŞMİŞ ANALİTİK VE RAPORLAMA**

### **5.1 Admin Analitik Dashboard**

- [ ] `app/admin/egitim-yonetimi/analitik/page.tsx` - Analitik dashboard
- [ ] Firma ilerleme grafikleri
- [ ] Eğitim popülerlik analizi
- [ ] Zaman bazlı analizler
- [ ] Kategori performans analizi

### **5.2 Firma Performans Raporları**

- [ ] `app/admin/egitim-yonetimi/raporlar/firma-performans/page.tsx`
- [ ] Firma bazlı ilerleme raporları
- [ ] Karşılaştırmalı analizler
- [ ] Trend analizleri
- [ ] Performans tahminleri

### **5.3 Eğitim İçerik Analizi**

- [ ] `app/admin/egitim-yonetimi/raporlar/icerik-analizi/page.tsx`
- [ ] Video izlenme istatistikleri
- [ ] Döküman okuma istatistikleri
- [ ] İçerik etkileşim analizi
- [ ] Popülerlik trendleri

### **5.4 Öğrenme Davranış Analizi**

- [ ] `app/admin/egitim-yonetimi/raporlar/ogrenme-davranisi/page.tsx`
- [ ] Öğrenme hızı analizi
- [ ] Zorluk noktaları tespiti
- [ ] Öğrenme stili analizi
- [ ] Motivasyon faktörleri

### **5.5 ROI ve İş Metrikleri**

- [ ] `app/admin/egitim-yonetimi/raporlar/roi-analizi/page.tsx`
- [ ] Eğitim yatırım geri dönüşü
- [ ] Firma performans korelasyonu
- [ ] Maliyet-fayda analizi
- [ ] İş etkisi ölçümü

### **5.6 Analitik Components**

- [ ] `components/analytics/ProgressChart.tsx` - İlerleme grafiği
- [ ] `components/analytics/HeatMap.tsx` - Isı haritası
- [ ] `components/analytics/TrendChart.tsx` - Trend grafiği
- [ ] `components/analytics/ComparisonChart.tsx` - Karşılaştırma grafiği
- [ ] `components/analytics/PredictiveChart.tsx` - Tahmin grafiği

---

## 📈 **AŞAMA 6: DASHBOARD VE İSTATİSTİKLER**

### **6.1 Admin Dashboard**

- [ ] `app/admin/egitim-yonetimi/dashboard/page.tsx` - Ana dashboard
- [ ] Toplam eğitim seti sayısı
- [ ] Toplam video sayısı
- [ ] Toplam döküman sayısı
- [ ] Aktif firma sayısı
- [ ] Ortalama tamamlanma oranı
- [ ] En popüler eğitimler
- [ ] Son aktiviteler

### **6.2 Firma Dashboard**

- [ ] `app/firma/egitimlerim/dashboard/page.tsx` - Firma dashboard'u
- [ ] Atanan set sayısı
- [ ] Tamamlanan video sayısı
- [ ] Okunan döküman sayısı
- [ ] Genel ilerleme yüzdesi
- [ ] Kalan süre
- [ ] Son aktiviteler
- [ ] Önerilen eğitimler

### **6.3 Real-time İzleme**

- [ ] Canlı eğitim aktiviteleri
- [ ] Anlık ilerleme güncellemeleri
- [ ] Aktif kullanıcı sayısı
- [ ] Sistem performans metrikleri

### **6.4 Export ve Raporlama**

- [ ] PDF rapor export
- [ ] Excel veri export
- [ ] CSV veri export
- [ ] Otomatik rapor gönderimi
- [ ] Özelleştirilebilir raporlar

---

## 🔧 **TEKNİK ÖZELLİKLER**

### **7.1 Güvenlik**

- [ ] Firma bazlı yetkilendirme
- [ ] Kilitli içerik kontrolü
- [ ] Video sıralı izleme zorunluluğu
- [ ] Dosya erişim kontrolü
- [ ] API güvenliği

### **7.2 Performans**

- [ ] Video önbellekleme
- [ ] Lazy loading
- [ ] CDN entegrasyonu
- [ ] Database optimizasyonu
- [ ] Caching stratejisi

### **7.3 Kullanıcı Deneyimi**

- [ ] Responsive tasarım
- [ ] Modern UI/UX
- [ ] Loading states
- [ ] Error handling
- [ ] Accessibility

### **7.4 Entegrasyonlar**

- [ ] YouTube API entegrasyonu
- [ ] File upload sistemi
- [ ] Real-time mesajlaşma
- [ ] Notification sistemi
- [ ] Email entegrasyonu

---

## 📅 **GELİŞTİRME TAKVİMİ**

### **Hafta 1-2: Aşama 1**

- Veritabanı tabloları
- Migration dosyaları
- Temel API endpoints

### **Hafta 3-4: Aşama 2**

- Admin eğitim yönetimi
- Video ve döküman yönetimi
- Firma atama sistemi

### **Hafta 5-6: Aşama 3**

- Firma video eğitimleri
- Firma döküman eğitimleri
- Danışman iletişim sistemi

### **Hafta 7-8: Aşama 4**

- Gamification sistemi
- Puan ve rozet sistemi
- Liderlik tablosu

### **Hafta 9-10: Aşama 5**

- Gelişmiş analitik
- Raporlama sistemi
- Dashboard'lar

### **Hafta 11-12: Aşama 6**

- Final testler
- Optimizasyon
- Dokümantasyon

---

## 🎯 **BAŞARI KRİTERLERİ**

### **Minimum Başarı (Hedef: %85)**

- [ ] Temel eğitim yönetimi çalışıyor
- [ ] Video ve döküman sistemi aktif
- [ ] Firma atama sistemi çalışıyor
- [ ] Gamification sistemi aktif
- [ ] Temel analitik çalışıyor

### **Tam Başarı (Hedef: %100)**

- [ ] Tüm özellikler aktif
- [ ] Gelişmiş analitik çalışıyor
- [ ] Performans optimize edilmiş
- [ ] Kullanıcı deneyimi mükemmel
- [ ] Güvenlik tam sağlanmış

---

## 📝 **NOTLAR**

### **Önemli Noktalar:**

- Kart tasarımı component olarak kaydedildi
- Gamification sistemi öncelikli
- Analitik sistemi detaylı olacak
- Kilitli içerik sistemi kritik
- Sıralı video izleme zorunlu

### **Teknik Notlar:**

- YouTube API kullanılacak
- Real-time mesajlaşma gerekli
- Responsive tasarım önemli
- Performance kritik
- Security öncelikli

---

**Hazırlayan:** AI Assistant  
**Son Güncelleme:** 24 Ağustos 2025  
**Versiyon:** 1.0
