# 📋 ALİBABA VERIFIED PAKET ŞABLONU - MIGRATION REHBERİ

**Oluşturulma Tarihi:** Ocak 2025  
**Hazırlayan:** Danışman Ekibi  
**Durum:** ✅ Migration Hazır - Uygulanacak

---

## 📊 ÖZET

Alibaba Verified Paket Kurulumu için detaylı bir proje şablonu oluşturuldu:

- **1 Ana Proje:** Alibaba Verified Paket Kurulumu ve Yönetimi
- **10 Alt Proje:** Ön Hazırlık, Hesap Kurulumu, Verified Paket, Mağaza, Ürün Yönetimi, Reklam, Müşteri İlişkileri, Sipariş, Performans Analizi, Eğitim
- **Toplam ~50 Görev:** Her alt projede detaylı görevler

**Migration Dosyası:** `src/4-infrastructure/database/migrations/029_alibaba_verified_paket_template.sql`

**Dosya Boyutu:** 1820 satır

---

## 🚀 MIGRATION UYGULAMA ADIMLARI

### Adım 1: Supabase Dashboard'a Giriş

1. [Supabase Dashboard](https://supabase.com/dashboard) açın
2. **Akademi Port** projesini seçin
3. Sol menüden **SQL Editor** seçin
4. **New Query** butonuna tıklayın

### Adım 2: Migration Dosyasını Yükleme

1. `src/4-infrastructure/database/migrations/029_alibaba_verified_paket_template.sql` dosyasını açın
2. **TÜM İÇERİĞİNİ** kopyalayın (1820 satır)
3. Supabase SQL Editor'a yapıştırın

### Adım 3: Migration'ı Çalıştırma

1. **Run** butonuna tıklayın
2. Başarılı olursa "Success. No rows returned" mesajı göreceksiniz
3. Hata olursa hata mesajını kontrol edin

### Adım 4: Doğrulama

1. Sol menüden **Table Editor** seçin
2. **projects** tablosunu açın
3. `is_template = true` filtresi uygulayın
4. "Alibaba Verified Paket Kurulumu ve Yönetimi" projesini görmelisiniz
5. **sub_projects** tablosunu açın
6. 10 alt proje görmelisiniz
7. **tasks** tablosunu açın
8. ~50 görev görmelisiniz

---

## 📋 OLUŞTURULAN VERİ YAPISI

### Ana Proje

- **ID:** `00000000-0000-0000-0000-000000000001`
- **İsim:** Alibaba Verified Paket Kurulumu ve Yönetimi
- **Durum:** `todo`
- **Öncelik:** `high`
- **Şablon:** `true`

### Alt Projeler (10 adet)

1. **Ön Hazırlık ve Dokümantasyon** (5 görev)
2. **Hesap Oluşturma ve Temel Kurulum** (3 görev)
3. **Alibaba Verified Paket Başvurusu ve Onay** (4 görev)
4. **Mağaza Kurulumu ve Tasarım** (4 görev)
5. **Ürün Yönetimi** (4 görev)
6. **Reklam ve Pazarlama Yönetimi** (6 görev)
7. **Müşteri İlişkileri Yönetimi** (5 görev)
8. **Sipariş ve Lojistik Yönetimi** (7 görev)
9. **Performans Analizi ve İyileştirme** (6 görev)
10. **Eğitim ve Sürekli Gelişim** (3 görev)

**Toplam Görev Sayısı:** ~47 görev

---

## ✅ KONTROL LİSTESİ

### Migration Öncesi

- [ ] Migration dosyası hazır (`029_alibaba_verified_paket_template.sql`)
- [ ] Dosya içeriği kontrol edildi
- [ ] Supabase Dashboard'a erişim var

### Migration Sonrası

- [ ] Migration başarıyla çalıştırıldı
- [ ] Ana proje oluşturuldu (`projects` tablosunda)
- [ ] 10 alt proje oluşturuldu (`sub_projects` tablosunda)
- [ ] ~50 görev oluşturuldu (`tasks` tablosunda)
- [ ] Proje şablonu listesinde görünüyor (`/dashboard/project-templates`)

### Sistem Entegrasyonu

- [ ] Şablon listesinde görünüyor
- [ ] Şablondan proje oluşturma çalışıyor
- [ ] Alt projeler ve görevler kopyalanıyor

---

## 🔍 DOĞRULAMA SORGULARI

### Ana Projeyi Kontrol Et

```sql
SELECT id, name, is_template, description
FROM projects
WHERE id = '00000000-0000-0000-0000-000000000001';
```

### Alt Projeleri Kontrol Et

```sql
SELECT id, name, order_index, description
FROM sub_projects
WHERE project_id = '00000000-0000-0000-0000-000000000001'
ORDER BY order_index;
```

### Görevleri Kontrol Et

```sql
SELECT
  sp.name AS sub_project_name,
  t.title,
  t.priority,
  t.order_index
FROM tasks t
JOIN sub_projects sp ON t.sub_project_id = sp.id
WHERE sp.project_id = '00000000-0000-0000-0000-000000000001'
ORDER BY sp.order_index, t.order_index;
```

### Görev Sayısını Kontrol Et

```sql
SELECT
  sp.name AS sub_project_name,
  COUNT(t.id) AS task_count
FROM sub_projects sp
LEFT JOIN tasks t ON t.sub_project_id = sp.id
WHERE sp.project_id = '00000000-0000-0000-0000-000000000001'
GROUP BY sp.id, sp.name, sp.order_index
ORDER BY sp.order_index;
```

---

## ⚠️ ÖNEMLİ NOTLAR

1. **UUID'ler Sabit:** Migration dosyasında tüm UUID'ler sabit olarak tanımlanmıştır. Bu, şablonun her zaman aynı ID'ye sahip olmasını sağlar.

2. **Şablon Durumu:** Ana proje `is_template = true` olarak işaretlenmiştir. Bu sayede şablon listesinde görünecektir.

3. **Bağımlılıklar:** Alt projeler ve görevler arasında `order_index` ile sıralama yapılmıştır. Bu sıralama, görevlerin hangi sırayla yapılması gerektiğini gösterir.

4. **Açıklamalar:** Her alt proje ve görev için detaylı açıklamalar (description) eklenmiştir. Bu açıklamalar, danışman dilinden yazılmıştır ve iş akışını anlatır.

---

## 🎯 SONRAKİ ADIMLAR

1. **Migration'ı Uygula:** Supabase Dashboard SQL Editor'dan migration'ı çalıştır
2. **Doğrula:** Veritabanında şablonun oluşturulduğunu kontrol et
3. **Test Et:** Şablondan yeni bir proje oluştur ve çalıştığını doğrula
4. **Kullan:** Firmalara Alibaba Verified Paket projesi oluştururken bu şablonu kullan

---

**Hazırlayan:** Danışman Ekibi  
**Tarih:** Ocak 2025  
**Versiyon:** 1.0  
**Durum:** ✅ Migration Hazır - Uygulanacak
