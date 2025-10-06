# 📰 HABERLER MODÜLÜ - DETAYLI TO-DO LİSTESİ

## 📊 GENEL DURUM

**Mevcut Durum:** Temel yapı hazır, geliştirmeler gerekiyor  
**Hedef:** E-ticaret ve e-ihracat odaklı, kullanıcı dostu haber platformu  
**Öncelik:** Kullanıcı deneyimi ve içerik zenginliği

---

## ✅ MEVCUT ÖZELLİKLER

### **Firma Tarafı (`/firma/haberler`)**

- ✅ Haber listesi (kart görünümü)
- ✅ Kategori filtreleme (E-İhracat, Eğitim, Teknik Güncelleme, Duyuru, Proje)
- ✅ Detay modalı
- ✅ Yorum sistemi (temel)
- ✅ Etiket sistemi
- ✅ Okunmamış haber işaretleme
- ✅ Sabitlenmiş haberler
- ✅ Filtreleme ve sıralama

### **Admin Tarafı (`/admin/haberler-yonetimi`)**

- ✅ Haber CRUD işlemleri
- ✅ Durum yönetimi (Yayınlandı, Taslak, İnceleme bekliyor)
- ✅ Kategori yönetimi
- ✅ Temel filtreleme
- ✅ Görüntülenme sayısı

---

## 🚀 GELİŞTİRME PLANI

### **AŞAMA 1: VERİTABANI YAPISI** 📊

#### **1.1 Haberler Tablosu Genişletme**

- [ ] `news` tablosuna yeni alanlar ekleme:
  - [ ] `video_url` VARCHAR(500) - Video haberler için
  - [ ] `podcast_url` VARCHAR(500) - Podcast haberler için
  - [ ] `reading_time` INTEGER - Okuma süresi (dakika)
  - [ ] `difficulty_level` VARCHAR(20) - Zorluk seviyesi (Başlangıç, Orta, İleri)
  - [ ] `expert_author_id` UUID - Uzman yazar referansı
  - [ ] `is_featured` BOOLEAN - Öne çıkan haber
  - [ ] `seo_keywords` TEXT[] - SEO anahtar kelimeleri
  - [ ] `related_articles` UUID[] - İlgili haberler
  - [ ] `source_url` VARCHAR(500) - Kaynak URL
  - [ ] `last_updated` TIMESTAMP - Son güncelleme tarihi

#### **1.2 Kullanıcı Etkileşim Tablosu**

- [ ] `news_interactions` tablosu oluşturma:
  - [ ] `id` UUID PRIMARY KEY
  - [ ] `user_email` VARCHAR(255) NOT NULL
  - [ ] `news_id` UUID NOT NULL
  - [ ] `interaction_type` VARCHAR(50) - (read, like, share, save, bookmark)
  - [ ] `interaction_data` JSONB - Ek veriler (beğeni sayısı, paylaşım platformu vb.)
  - [ ] `created_at` TIMESTAMP DEFAULT NOW()
  - [ ] İndeksler ve RLS politikaları

#### **1.3 Haber Kategorileri Tablosu**

- [ ] `news_categories` tablosu oluşturma:
  - [ ] `id` UUID PRIMARY KEY
  - [ ] `name` VARCHAR(100) NOT NULL
  - [ ] `description` TEXT
  - [ ] `icon` VARCHAR(50) - Remix icon
  - [ ] `color` VARCHAR(20) - Renk kodu
  - [ ] `is_active` BOOLEAN DEFAULT TRUE
  - [ ] `sort_order` INTEGER - Sıralama
  - [ ] `created_at` TIMESTAMP DEFAULT NOW()

#### **1.4 Uzman Yazarlar Tablosu**

- [ ] `news_experts` tablosu oluşturma:
  - [ ] `id` UUID PRIMARY KEY
  - [ ] `name` VARCHAR(255) NOT NULL
  - [ ] `title` VARCHAR(255) - Unvan
  - [ ] `bio` TEXT - Biyografi
  - [ ] `avatar_url` VARCHAR(500) - Profil resmi
  - [ ] `expertise_areas` TEXT[] - Uzmanlık alanları
  - [ ] `social_links` JSONB - Sosyal medya linkleri
  - [ ] `is_active` BOOLEAN DEFAULT TRUE

#### **1.5 Haber Yorumları Tablosu**

- [ ] `news_comments` tablosu oluşturma:
  - [ ] `id` UUID PRIMARY KEY
  - [ ] `news_id` UUID NOT NULL
  - [ ] `user_email` VARCHAR(255) NOT NULL
  - [ ] `content` TEXT NOT NULL
  - [ ] `parent_id` UUID - Yanıt için
  - [ ] `likes_count` INTEGER DEFAULT 0
  - [ ] `is_approved` BOOLEAN DEFAULT FALSE
  - [ ] `is_edited` BOOLEAN DEFAULT FALSE
  - [ ] `created_at` TIMESTAMP DEFAULT NOW()
  - [ ] `updated_at` TIMESTAMP

#### **1.6 Haber Etiketleri Tablosu**

- [ ] `news_tags` tablosu oluşturma:
  - [ ] `id` UUID PRIMARY KEY
  - [ ] `name` VARCHAR(100) UNIQUE NOT NULL
  - [ ] `description` TEXT
  - [ ] `color` VARCHAR(20) - Renk kodu
  - [ ] `usage_count` INTEGER DEFAULT 0
  - [ ] `is_trending` BOOLEAN DEFAULT FALSE
  - [ ] `created_at` TIMESTAMP DEFAULT NOW()

---

### **AŞAMA 2: API GELİŞTİRMELERİ** 🔧

#### **2.1 Haberler API'si (`/api/news`)**

- [ ] **GET** - Haber listesi (gelişmiş filtreleme)
  - [ ] Kategori filtreleme
  - [ ] Tarih aralığı filtreleme
  - [ ] Zorluk seviyesi filtreleme
  - [ ] Uzman yazar filtreleme
  - [ ] Arama (başlık, içerik, etiketler)
  - [ ] Sıralama (en yeni, en popüler, en çok yorumlanan)
  - [ ] Sayfalama
- [ ] **POST** - Yeni haber oluşturma
- [ ] **PUT** - Haber güncelleme
- [ ] **DELETE** - Haber silme

#### **2.2 Haber Detay API'si (`/api/news/[id]`)**

- [ ] **GET** - Haber detayları
  - [ ] Haber içeriği
  - [ ] İlgili haberler
  - [ ] Yorumlar
  - [ ] Etkileşim istatistikleri
- [ ] **POST** - Görüntülenme kaydetme
- [ ] **PUT** - Haber güncelleme

#### **2.3 Yorumlar API'si (`/api/news/[id]/comments`)**

- [ ] **GET** - Yorum listesi
  - [ ] Sayfalama
  - [ ] Sıralama (en yeni, en çok beğenilen)
- [ ] **POST** - Yorum ekleme
- [ ] **PUT** - Yorum güncelleme
- [ ] **DELETE** - Yorum silme

#### **2.4 Etkileşimler API'si (`/api/news/[id]/interactions`)**

- [ ] **POST** - Beğeni ekleme/çıkarma
- [ ] **POST** - Kaydetme/çıkarma
- [ ] **POST** - Paylaşım kaydetme
- [ ] **GET** - Kullanıcının etkileşimleri

#### **2.5 Öneriler API'si (`/api/news/recommendations`)**

- [ ] **GET** - Kişiselleştirilmiş haber önerileri
  - [ ] Kullanıcının okuma geçmişine göre
  - [ ] Kategori tercihlerine göre
  - [ ] Benzer kullanıcıların okuduklarına göre

#### **2.6 Arama API'si (`/api/news/search`)**

- [ ] **GET** - Gelişmiş arama
  - [ ] Semantic search
  - [ ] Otomatik tamamlama
  - [ ] Filtreleme seçenekleri
  - [ ] Arama geçmişi

#### **2.7 Kategoriler API'si (`/api/news/categories`)**

- [ ] **GET** - Kategori listesi
- [ ] **POST** - Yeni kategori oluşturma
- [ ] **PUT** - Kategori güncelleme
- [ ] **DELETE** - Kategori silme

#### **2.8 Uzmanlar API'si (`/api/news/experts`)**

- [ ] **GET** - Uzman listesi
- [ ] **GET** - Uzman detayları
- [ ] **POST** - Yeni uzman ekleme
- [ ] **PUT** - Uzman güncelleme

---

### **AŞAMA 3: FRONTEND GELİŞTİRMELERİ** 🎨

#### **3.1 Firma Tarafı Geliştirmeleri**

##### **3.1.1 Ana Sayfa İyileştirmeleri**

- [ ] **Gelişmiş Filtreleme Paneli**
  - [ ] Çoklu kategori seçimi
  - [ ] Tarih aralığı seçici
  - [ ] Zorluk seviyesi filtresi
  - [ ] Uzman yazar filtresi
  - [ ] Etiket bazlı filtreleme
  - [ ] Kaydedilen filtreler

- [ ] **Haber Kartı İyileştirmeleri**
  - [ ] Okuma süresi göstergesi
  - [ ] Zorluk seviyesi rozeti
  - [ ] Uzman yazar bilgisi
  - [ ] Video/podcast ikonu
  - [ ] Hızlı etkileşim butonları (beğeni, kaydet)
  - [ ] Paylaşım butonları

- [ ] **Görünüm Seçenekleri**
  - [ ] Liste görünümü
  - [ ] Grid görünümü
  - [ ] Magazine görünümü
  - [ ] Compact görünümü

##### **3.1.2 Detay Sayfası İyileştirmeleri**

- [ ] **İçerik Zenginleştirme**
  - [ ] Video oynatıcı entegrasyonu
  - [ ] Podcast player
  - [ ] İnteraktif içerik (anketler, quiz'ler)
  - [ ] Sosyal medya paylaşım butonları
  - [ ] Yazdırma seçeneği

- [ ] **Yorum Sistemi Geliştirmeleri**
  - [ ] Yanıtlama özelliği
  - [ ] Beğeni sistemi
  - [ ] Yorum düzenleme
  - [ ] Spam koruması
  - [ ] Moderasyon araçları

- [ ] **İlgili İçerikler**
  - [ ] Benzer haberler
  - [ ] Aynı kategoriden haberler
  - [ ] Aynı uzmandan yazılar
  - [ ] Trend haberler

##### **3.1.3 Yeni Özellikler**

- [ ] **Okuma Listesi**
  - [ ] Daha sonra okuma
  - [ ] Favori haberler
  - [ ] Okuma geçmişi
  - [ ] İlerleme takibi

- [ ] **Bildirim Sistemi**
  - [ ] Yeni haber bildirimleri
  - [ ] Kategori bazlı bildirimler
  - [ ] Uzman yazar takibi
  - [ ] Yorum yanıt bildirimleri

- [ ] **Kişiselleştirme**
  - [ ] Kategori tercihleri
  - [ ] Zorluk seviyesi tercihleri
  - [ ] Uzman takibi
  - [ ] Önerilen içerikler

#### **3.2 Admin Tarafı Geliştirmeleri**

##### **3.2.1 Haber Yönetimi İyileştirmeleri**

- [ ] **Gelişmiş Editör**
  - [ ] Rich text editor
  - [ ] Medya yükleme (resim, video, dosya)
  - [ ] SEO optimizasyonu araçları
  - [ ] Önizleme özelliği
  - [ ] Otomatik kaydetme

- [ ] **İçerik Yönetimi**
  - [ ] Toplu işlemler
  - [ ] İçerik şablonları
  - [ ] Zamanlanmış yayınlama
  - [ ] İçerik takvimi
  - [ ] Versiyon kontrolü

- [ ] **Moderasyon Araçları**
  - [ ] Yorum moderasyonu
  - [ ] Spam filtreleme
  - [ ] Kullanıcı yönetimi
  - [ ] İçerik onay süreci

##### **3.2.2 Analitik ve Raporlama**

- [ ] **İçerik Analitikleri**
  - [ ] Görüntülenme istatistikleri
  - [ ] Okuma süreleri
  - [ ] Etkileşim oranları
  - [ ] Popüler kategoriler
  - [ ] Trend analizi

- [ ] **Kullanıcı Analitikleri**
  - [ ] Okuma davranışları
  - [ ] Kategori tercihleri
  - [ ] Etkileşim paternleri
  - [ ] Kullanıcı segmentasyonu

- [ ] **Performans Raporları**
  - [ ] Aylık/haftalık raporlar
  - [ ] Kategori performansı
  - [ ] Uzman performansı
  - [ ] İçerik kalite metrikleri

---

### **AŞAMA 4: ÖZEL ÖZELLİKLER** ⭐

#### **4.1 Video ve Podcast Entegrasyonu**

- [ ] **Video Haberler**
  - [ ] Video yükleme ve yönetimi
  - [ ] Video oynatıcı entegrasyonu
  - [ ] Video transkripti
  - [ ] Video alt yazıları

- [ ] **Podcast Haberler**
  - [ ] Podcast yükleme
  - [ ] Audio player
  - [ ] Podcast transkripti
  - [ ] Bölüm yönetimi

#### **4.2 İnteraktif İçerik**

- [ ] **Anketler ve Quiz'ler**
  - [ ] Haber içinde anketler
  - [ ] Bilgi quiz'leri
  - [ ] Sonuç analizi
  - [ ] Başarı rozetleri

- [ ] **Sosyal Özellikler**
  - [ ] Haber paylaşımı
  - [ ] Sosyal medya entegrasyonu
  - [ ] Kullanıcı profilleri
  - [ ] Topluluk özellikleri

#### **4.3 Uzman Köşesi**

- [ ] **Uzman Profilleri**
  - [ ] Detaylı uzman sayfaları
  - [ ] Uzman takip sistemi
  - [ ] Uzman yazıları arşivi
  - [ ] Uzman ile iletişim

- [ ] **Uzman İçerikleri**
  - [ ] Uzman analizleri
  - [ ] Vaka çalışmaları
  - [ ] Trend yorumları
  - [ ] Uzman söyleşileri

#### **4.4 Gamification Entegrasyonu**

- [ ] **Okuma Başarımları**
  - [ ] Günlük okuma hedefleri
  - [ ] Kategori başarımları
  - [ ] Uzman takip başarımları
  - [ ] Okuma serisi başarımları

- [ ] **Puan Sistemi**
  - [ ] Haber okuma puanları
  - [ ] Yorum yapma puanları
  - [ ] Paylaşım puanları
  - [ ] Liderlik tablosu

---

### **AŞAMA 5: PERFORMANS VE OPTİMİZASYON** ⚡

#### **5.1 Teknik İyileştirmeler**

- [ ] **Caching Sistemi**
  - [ ] Redis cache entegrasyonu
  - [ ] CDN kullanımı
  - [ ] Image optimization
  - [ ] Lazy loading

- [ ] **SEO Optimizasyonu**
  - [ ] Meta tag yönetimi
  - [ ] Sitemap oluşturma
  - [ ] Structured data
  - [ ] URL optimizasyonu

#### **5.2 Mobil Optimizasyon**

- [ ] **Responsive Tasarım**
  - [ ] Mobil uyumlu layout
  - [ ] Touch-friendly arayüz
  - [ ] Offline okuma
  - [ ] Push notifications

---

## 📋 ÖNCELİK SIRASI

### **YÜKSEK ÖNCELİK** 🔴

1. Veritabanı yapısı güncellemeleri
2. Temel API geliştirmeleri
3. Firma tarafı iyileştirmeleri
4. Admin tarafı geliştirmeleri

### **ORTA ÖNCELİK** 🟡

1. Video/podcast entegrasyonu
2. Gamification entegrasyonu
3. Analitik ve raporlama
4. Mobil optimizasyon

### **DÜŞÜK ÖNCELİK** 🟢

1. İnteraktif içerik
2. Sosyal özellikler
3. Uzman köşesi
4. SEO optimizasyonu

---

## 🎯 BAŞLANGIÇ PLANI

### **Hafta 1-2: Veritabanı ve API**

- [ ] Migration dosyaları oluşturma
- [ ] Temel API endpoint'leri
- [ ] Veritabanı testleri

### **Hafta 3-4: Frontend Temel Geliştirmeler**

- [ ] Firma tarafı iyileştirmeleri
- [ ] Admin tarafı geliştirmeleri
- [ ] Temel özellik testleri

### **Hafta 5-6: Gelişmiş Özellikler**

- [ ] Video/podcast entegrasyonu
- [ ] Gamification entegrasyonu
- [ ] Analitik sistemi

### **Hafta 7-8: Optimizasyon ve Test**

- [ ] Performans optimizasyonu
- [ ] Kapsamlı testler
- [ ] Dokümantasyon

---

**Son Güncelleme:** 25 Ağustos 2025  
**Durum:** Planlama aşaması  
**Sonraki Adım:** Veritabanı migration'ları başlatma
