# ETKİNLİK YÖNETİMİ MODÜLÜ - TO-DO LİSTESİ

**Proje:** İhracat Akademi Etkinlik Yönetimi Sistemi  
**Versiyon:** 1.0  
**Tarih:** 24 Ağustos 2025  
**Durum:** Planlama Aşaması

---

## 📋 **GENEL BAKIŞ**

Bu to-do listesi, etkinlik yönetimi modülünün mevcut durumundan tam fonksiyonel bir sisteme dönüştürülmesi için gerekli tüm görevleri içermektedir. Görevler öncelik sırasına göre organize edilmiştir.

---

## 🚀 **VERSİYON 1.0 - TEMEL ALTYAPI GÜNCELLEMESİ**

### **1.1 Database Schema Güncellemeleri**

#### **1.1.1 Events Tablosu Güncellemesi**

- [ ] `events` tablosuna `is_free` alanı ekleme (BOOLEAN DEFAULT TRUE)
- [ ] `events` tablosuna `meeting_platform` alanı ekleme (VARCHAR(50))
- [ ] `events` tablosuna `meeting_link` alanı ekleme (TEXT)
- [ ] `events` tablosuna `meeting_id` alanı ekleme (VARCHAR(255))
- [ ] `events` tablosuna `meeting_password` alanı ekleme (VARCHAR(255))
- [ ] `events` tablosuna `consultant_id` alanı ekleme (UUID REFERENCES users(id))
- [ ] `events` tablosuna `requirements` alanı ekleme (JSONB)
- [ ] `events` tablosuna `materials` alanı ekleme (JSONB)
- [ ] `events` tablosuna `attendance_tracking` alanı ekleme (BOOLEAN DEFAULT FALSE)
- [ ] `events` tablosuna `gamification_enabled` alanı ekleme (BOOLEAN DEFAULT TRUE)
- [ ] `events` tablosuna `points_reward` alanı ekleme (INTEGER DEFAULT 0)
- [ ] `events` tablosundan `price` alanını kaldırma
- [ ] `events` tablosuna yeni index'ler ekleme

#### **1.1.2 Yeni Tablolar Oluşturma**

- [ ] `event_participants` tablosu oluşturma
- [ ] `event_attendance` tablosu oluşturma
- [ ] `event_materials` tablosu oluşturma
- [ ] `event_notifications` tablosu oluşturma
- [ ] `event_consultants` tablosu oluşturma

#### **1.1.3 RLS Politikaları**

- [ ] Yeni tablolar için RLS politikaları oluşturma
- [ ] Mevcut politikaları güncelleme
- [ ] Test ve doğrulama

### **1.2 API Güncellemeleri**

#### **1.2.1 Events API Güncellemesi**

- [ ] `GET /api/events` - Ücret alanlarını kaldırma
- [ ] `POST /api/events` - Yeni alanları ekleme
- [ ] `PUT /api/events/[id]` - Güncelleme
- [ ] `DELETE /api/events/[id]` - Silme
- [ ] Validation kurallarını güncelleme

#### **1.2.2 Yeni API Endpoint'leri**

- [ ] `GET /api/events/[id]/participants` - Katılımcı listesi
- [ ] `POST /api/events/[id]/participants` - Katılımcı ekleme
- [ ] `PUT /api/events/[id]/participants/[participantId]` - Katılımcı güncelleme
- [ ] `DELETE /api/events/[id]/participants/[participantId]` - Katılımcı silme
- [ ] `GET /api/events/[id]/attendance` - Yoklama listesi
- [ ] `POST /api/events/[id]/attendance` - Yoklama alma
- [ ] `GET /api/events/[id]/materials` - Materyal listesi
- [ ] `POST /api/events/[id]/materials` - Materyal ekleme
- [ ] `DELETE /api/events/[id]/materials/[materialId]` - Materyal silme

#### **1.2.3 Bildirim API'leri**

- [ ] `POST /api/events/[id]/notifications` - Etkinlik bildirimi gönderme
- [ ] `GET /api/events/notifications` - Bildirim listesi
- [ ] `PUT /api/events/notifications/[id]/read` - Bildirim okundu işaretleme

### **1.3 Frontend Güncellemeleri**

#### **1.3.1 Admin Panel Güncellemeleri**

- [ ] `app/admin/etkinlik-yonetimi/page.tsx` - Ücret alanlarını kaldırma
- [ ] `app/admin/etkinlik-yonetimi/page.tsx` - Yeni alanları ekleme
- [ ] `app/admin/etkinlik-yonetimi/page.tsx` - Form validation güncelleme
- [ ] `app/admin/etkinlik-yonetimi/page.tsx` - UI/UX iyileştirmeleri

#### **1.3.2 Firma Panel Güncellemeleri**

- [ ] `app/firma/etkinlikler/page.tsx` - Ücret gösterimini kaldırma
- [ ] `app/firma/etkinlikler/page.tsx` - Yeni alanları gösterme
- [ ] `app/firma/etkinlikler/[id]/EventDetailClient.tsx` - Güncelleme
- [ ] `app/firma/etkinlikler/[id]/EventDetailClient.tsx` - Katılım durumu iyileştirme

---

## 🔧 **VERSİYON 2.0 - GELİŞMİŞ ÖZELLİKLER**

### **2.1 Zoom/Google Meet Entegrasyonu**

#### **2.1.1 Zoom API Entegrasyonu**

- [ ] Zoom API credentials kurulumu
- [ ] `app/api/zoom/meetings/route.ts` - Toplantı oluşturma API'si
- [ ] `app/api/zoom/meetings/[id]/route.ts` - Toplantı yönetimi
- [ ] `app/api/zoom/webhooks/route.ts` - Webhook entegrasyonu
- [ ] Otomatik toplantı oluşturma fonksiyonu
- [ ] Toplantı linki güncelleme sistemi

#### **2.1.2 Google Meet API Entegrasyonu**

- [ ] Google Calendar API kurulumu
- [ ] `app/api/google/meetings/route.ts` - Toplantı oluşturma
- [ ] `app/api/google/meetings/[id]/route.ts` - Toplantı yönetimi
- [ ] Google Meet linki oluşturma
- [ ] Takvim entegrasyonu

#### **2.1.3 Platform Seçimi**

- [ ] Platform seçim arayüzü
- [ ] Platform bazlı form alanları
- [ ] Platform bazlı link yönetimi
- [ ] Platform bazlı katılım takibi

### **2.2 Bildirim Sistemi**

#### **2.2.1 Etkinlik Bildirimleri**

- [ ] `app/api/events/notifications/route.ts` - Bildirim API'si
- [ ] Yeni etkinlik bildirimi
- [ ] Etkinlik güncelleme bildirimi
- [ ] Etkinlik iptal bildirimi
- [ ] Hatırlatma bildirimleri

#### **2.2.2 Geri Sayım Sistemi**

- [ ] `app/components/CountdownTimer.tsx` - Geri sayım komponenti
- [ ] Geri sayım bildirimleri
- [ ] Otomatik bildirim gönderimi
- [ ] Bildirim zamanlaması

#### **2.2.3 Bildirim Ayarları**

- [ ] `app/firma/etkinlikler/bildirim-ayarlari/page.tsx` - Bildirim ayarları sayfası
- [ ] E-posta bildirimleri
- [ ] Push bildirimleri
- [ ] SMS bildirimleri
- [ ] Bildirim tercihleri

### **2.3 Yoklama Sistemi**

#### **2.3.1 Danışman Yoklama Arayüzü**

- [ ] `app/admin/etkinlik-yonetimi/[id]/yoklama/page.tsx` - Yoklama sayfası
- [ ] Katılımcı listesi görüntüleme
- [ ] Yoklama alma arayüzü
- [ ] Yoklama kaydetme
- [ ] Yoklama raporu

#### **2.3.2 Otomatik Yoklama**

- [ ] Online etkinlikler için otomatik yoklama
- [ ] Zoom/Meet API entegrasyonu ile katılım takibi
- [ ] Katılım süresi hesaplama
- [ ] Minimum katılım süresi kontrolü

#### **2.3.3 Yoklama Raporları**

- [ ] `app/admin/etkinlik-yonetimi/[id]/yoklama-raporu/page.tsx` - Rapor sayfası
- [ ] Katılım istatistikleri
- [ ] Katılım grafikleri
- [ ] Excel/PDF export
- [ ] E-posta ile rapor gönderimi

### **2.4 Döküman Yönetimi**

#### **2.4.1 Materyal Yükleme**

- [ ] `app/api/events/[id]/materials/upload/route.ts` - Materyal yükleme API'si
- [ ] Dosya yükleme arayüzü
- [ ] Dosya türü kontrolü
- [ ] Dosya boyutu kontrolü
- [ ] Supabase Storage entegrasyonu

#### **2.4.2 Materyal Paylaşımı**

- [ ] `app/firma/etkinlikler/[id]/materyaller/page.tsx` - Materyal sayfası
- [ ] Materyal listesi görüntüleme
- [ ] Materyal indirme
- [ ] Materyal önizleme
- [ ] Materyal arama

#### **2.4.3 Materyal Yönetimi**

- [ ] `app/admin/etkinlik-yonetimi/[id]/materyaller/page.tsx` - Admin materyal sayfası
- [ ] Materyal ekleme/düzenleme/silme
- [ ] Materyal kategorileri
- [ ] Materyal versiyon kontrolü
- [ ] Materyal erişim kontrolü

---

## 📊 **VERSİYON 3.0 - GELİŞMİŞ YÖNETİM**

### **3.1 Gelişmiş Takvim**

#### **3.1.1 Takvim Görünümü**

- [ ] `app/components/AdvancedCalendar.tsx` - Gelişmiş takvim komponenti
- [ ] Gün görünümü
- [ ] Hafta görünümü
- [ ] Ay görünümü
- [ ] Yıl görünümü

#### **3.1.2 Drag & Drop**

- [ ] Etkinlik tarih değiştirme
- [ ] Etkinlik süre değiştirme
- [ ] Etkinlik kopyalama
- [ ] Etkinlik silme

#### **3.1.3 Takvim Filtreleme**

- [ ] Kategori bazlı filtreleme
- [ ] Durum bazlı filtreleme
- [ ] Danışman bazlı filtreleme
- [ ] Firma bazlı filtreleme
- [ ] Tarih aralığı filtreleme

### **3.2 Raporlama ve Analitik**

#### **3.2.1 Etkinlik Raporları**

- [ ] `app/admin/etkinlik-yonetimi/raporlar/page.tsx` - Raporlar sayfası
- [ ] Etkinlik performans raporu
- [ ] Katılım oranları raporu
- [ ] Danışman performans raporu
- [ ] Firma katılım raporu

#### **3.2.2 Grafik ve İstatistikler**

- [ ] `app/components/EventCharts.tsx` - Grafik komponentleri
- [ ] Katılım trendi grafiği
- [ ] Kategori dağılımı grafiği
- [ ] Danışman performans grafiği
- [ ] Firma katılım grafiği

#### **3.2.3 Export ve Paylaşım**

- [ ] Excel export
- [ ] PDF export
- [ ] CSV export
- [ ] E-posta ile rapor gönderimi
- [ ] Otomatik rapor gönderimi

### **3.3 Gamification Entegrasyonu**

#### **3.3.1 Etkinlik Puanları**

- [ ] Etkinlik katılımına puan verme
- [ ] Etkinlik türüne göre puan farklılaştırma
- [ ] Katılım süresine göre puan hesaplama
- [ ] Etkinlik sonrası değerlendirme puanları

#### **3.3.2 Rozet Sistemi**

- [ ] Etkinlik katılım rozetleri
- [ ] Seri katılım rozetleri
- [ ] Kategori bazlı rozetler
- [ ] Özel etkinlik rozetleri

#### **3.3.3 Liderlik Tablosu**

- [ ] Etkinlik katılım liderliği
- [ ] Puan bazlı sıralama
- [ ] Kategori bazlı liderlik
- [ ] Zaman bazlı liderlik

---

## 🔄 **VERSİYON 4.0 - GELİŞMİŞ ÖZELLİKLER**

### **4.1 Gerçek Zamanlı Özellikler**

#### **4.1.1 WebSocket Entegrasyonu**

- [ ] Supabase Realtime kurulumu
- [ ] Gerçek zamanlı bildirimler
- [ ] Gerçek zamanlı katılım güncellemeleri
- [ ] Gerçek zamanlı etkinlik durumu

#### **4.1.2 Canlı Chat**

- [ ] `app/components/EventChat.tsx` - Chat komponenti
- [ ] Etkinlik öncesi chat
- [ ] Etkinlik sırası chat
- [ ] Etkinlik sonrası chat
- [ ] Dosya paylaşımı

### **4.2 Mobil Optimizasyon**

#### **4.2.1 Responsive Tasarım**

- [ ] Mobil öncelikli tasarım
- [ ] Touch-friendly arayüz
- [ ] Mobil gesture desteği
- [ ] Offline desteği

#### **4.2.2 PWA Özellikleri**

- [ ] Service Worker kurulumu
- [ ] Offline çalışma
- [ ] Push bildirimleri
- [ ] App-like deneyim

### **4.3 AI Destekli Özellikler**

#### **4.3.1 Akıllı Öneriler**

- [ ] Firma bazlı etkinlik önerileri
- [ ] Kategori bazlı öneriler
- [ ] Zaman bazlı öneriler
- [ ] Kişiselleştirilmiş öneriler

#### **4.3.2 Otomatik Kategorizasyon**

- [ ] Etkinlik içeriğine göre otomatik kategorilendirme
- [ ] Etiket önerileri
- [ ] İçerik analizi
- [ ] Akıllı filtreleme

---

## 🧪 **TEST VE KALİTE GÜVENCE**

### **5.1 Unit Testler**

- [ ] API endpoint testleri
- [ ] Component testleri
- [ ] Utility function testleri
- [ ] Database function testleri

### **5.2 Integration Testler**

- [ ] API entegrasyon testleri
- [ ] Database entegrasyon testleri
- [ ] Third-party API testleri
- [ ] End-to-end testleri

### **5.3 Performance Testleri**

- [ ] Load testing
- [ ] Stress testing
- [ ] Database performance testing
- [ ] Frontend performance testing

### **5.4 Security Testleri**

- [ ] Authentication testing
- [ ] Authorization testing
- [ ] Input validation testing
- [ ] SQL injection testing

---

## 📚 **DOKÜMANTASYON**

### **6.1 Teknik Dokümantasyon**

- [ ] API dokümantasyonu
- [ ] Database schema dokümantasyonu
- [ ] Component dokümantasyonu
- [ ] Deployment dokümantasyonu

### **6.2 Kullanıcı Dokümantasyonu**

- [ ] Admin kullanıcı kılavuzu
- [ ] Firma kullanıcı kılavuzu
- [ ] Video tutorial'lar
- [ ] FAQ sayfası

### **6.3 Geliştirici Dokümantasyonu**

- [ ] Setup kılavuzu
- [ ] Development workflow
- [ ] Code style guide
- [ ] Contribution guidelines

---

## 🚀 **DEPLOYMENT VE OPERASYON**

### **7.1 Deployment**

- [ ] Production environment setup
- [ ] CI/CD pipeline kurulumu
- [ ] Environment variables yönetimi
- [ ] Database migration scripts

### **7.2 Monitoring**

- [ ] Error tracking kurulumu
- [ ] Performance monitoring
- [ ] User analytics
- [ ] System health monitoring

### **7.3 Backup ve Recovery**

- [ ] Database backup strategy
- [ ] File backup strategy
- [ ] Disaster recovery plan
- [ ] Data retention policy

---

## 📊 **PROJE TAKİP**

### **8.1 Görev Yönetimi**

- [ ] GitHub Issues kurulumu
- [ ] Project board oluşturma
- [ ] Milestone tanımlama
- [ ] Sprint planning

### **8.2 İlerleme Takibi**

- [ ] Burndown chart
- [ ] Velocity tracking
- [ ] Quality metrics
- [ ] User feedback tracking

### **8.3 Risk Yönetimi**

- [ ] Risk assessment
- [ ] Mitigation strategies
- [ ] Contingency plans
- [ ] Regular risk reviews

---

## 🎯 **BAŞARI KRİTERLERİ**

### **9.1 Teknik Kriterler**

- [ ] %95+ test coverage
- [ ] <2s sayfa yükleme süresi
- [ ] %99.9 uptime
- [ ] Zero critical security vulnerabilities

### **9.2 Kullanıcı Kriterleri**

- [ ] %90+ user satisfaction
- [ ] <5% error rate
- [ ] %80+ feature adoption
- [ ] Positive user feedback

### **9.3 İş Kriterleri**

- [ ] %100 requirement completion
- [ ] On-time delivery
- [ ] Within budget
- [ ] Stakeholder approval

---

## 📅 **ZAMAN ÇİZELGESİ**

### **Faz 1 (Hafta 1-2): Temel Altyapı**

- Database schema güncellemeleri
- API güncellemeleri
- Frontend temel güncellemeleri

### **Faz 2 (Hafta 3-4): Gelişmiş Özellikler**

- Zoom/Meet entegrasyonu
- Bildirim sistemi
- Yoklama sistemi

### **Faz 3 (Hafta 5-6): Yönetim Özellikleri**

- Gelişmiş takvim
- Raporlama sistemi
- Döküman yönetimi

### **Faz 4 (Hafta 7-8): Test ve Optimizasyon**

- Kapsamlı testler
- Performance optimizasyonu
- Dokümantasyon

---

**Toplam Görev Sayısı:** 150+  
**Tahmini Süre:** 8-10 Hafta  
**Öncelik:** Yüksek  
**Durum:** Planlama Aşaması

---

**Son Güncelleme:** 24 Ağustos 2025  
**Hazırlayan:** AI Assistant  
**Versiyon:** 1.0
