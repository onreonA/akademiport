# 🧪 Test Senaryosu: Proje Oluşturma ve Görev Yönetimi

## Senaryo Özeti

Consultant hesabıyla:

1. Yeni bir ana proje oluşturma
2. Bu projeye alt proje ekleme
3. Alt projeye 2 görev ekleme

---

## 📋 Ön Hazırlık

### Giriş Bilgileri

- **Email:** `consultant@akademiport.com`
- **Şifre:** (Supabase'de kayıtlı şifre)
- **Rol:** Consultant
- **User ID:** `708300a1-7467-4f70-b7f1-490918a4ae02`

### Gerekli Veriler

- En az 1 şirket sistemde kayıtlı olmalı
- Consultant bu şirkete erişim yetkisine sahip olmalı

---

## 🎬 Test Adımları

### ADIM 1: Giriş Yapma

**URL:** `http://localhost:3000/login`

**İşlemler:**

1. Tarayıcıda `http://localhost:3000` adresine git
2. Eğer login sayfasına yönlendirilmediysen, sağ üstten "Sign Out" yap
3. Login sayfasında email ve şifre gir
4. "Sign In" butonuna tıkla

**Beklenen Sonuç:**

- ✅ Consultant Dashboard'a yönlendirildin
- ✅ URL: `http://localhost:3000/consultant-dashboard`
- ✅ Sağ üstte kullanıcı adın görünüyor

**Ekran Görüntüsü Noktaları:**

- Dashboard ana sayfası
- Program kartları
- Quick stats

---

### ADIM 2: Yeni Proje Sayfasına Gitme

**İşlemler:**

1. Sol menüden **"Projects"** linkine tıkla
2. Sağ üstteki **"New Project"** butonuna tıkla

**Alternatif:**

- Direkt URL'ye git: `http://localhost:3000/consultant-dashboard/projects/new`

**Beklenen Sonuç:**

- ✅ Yeni proje oluşturma formu açıldı
- ✅ Form alanları görünüyor:
  - Company (dropdown)
  - Project Name
  - Description
  - Status
  - Priority
  - Start Date
  - End Date
  - Template (optional)

**Ekran Görüntüsü Noktaları:**

- Form başlığı: "Create New Project"
- Tüm form alanları

---

### ADIM 3: Proje Bilgilerini Doldurma

**Form Verileri:**

```
Company: [Dropdown'dan bir şirket seç]
  → Örnek: "ABC Teknoloji A.Ş."

Project Name: "E-İhracat Dijital Dönüşüm Projesi"

Description:
"Şirketin e-ihracat süreçlerinin dijitalleştirilmesi ve optimizasyonu.
Bu proje kapsamında:
- E-ticaret platformu entegrasyonu
- Ödeme sistemleri kurulumu
- Lojistik süreç otomasyonu
- Dijital pazarlama stratejileri
gerçekleştirilecektir."

Status: "Planning" (Planlanıyor)

Priority: "High" (Yüksek)

Start Date: "2025-02-01"

End Date: "2025-06-30"

Template: [Boş bırak - from scratch]
```

**İşlemler:**

1. Company dropdown'ını aç ve bir şirket seç
2. Project Name alanına proje adını yaz
3. Description alanına açıklamayı yaz
4. Status'ü "Planning" olarak seç
5. Priority'yi "High" olarak seç
6. Start Date'i seç (takvim açılır)
7. End Date'i seç
8. Template'i boş bırak (from scratch)
9. **"Create Project"** butonuna tıkla

**Beklenen Sonuç:**

- ✅ "Project created successfully!" toast mesajı göründü
- ✅ Proje detay sayfasına yönlendirildin
- ✅ URL: `http://localhost:3000/consultant-dashboard/projects/[project-id]`
- ✅ Proje bilgileri ekranda görünüyor
- ✅ Progress: 0%
- ✅ Status: Planning
- ✅ Sub-projects tab'ı boş

**Ekran Görüntüsü Noktaları:**

- Toast notification
- Proje detay sayfası
- Proje başlığı ve bilgileri
- Sub-projects tab (empty state)

**Not:** Project ID'yi kaydet (URL'den):

```
Project ID: [UUID buraya yazılacak]
Örnek: 550e8400-e29b-41d4-a716-446655440000
```

---

### ADIM 4: Alt Proje Oluşturma

**Mevcut Sayfa:** Proje detay sayfası

**İşlemler:**

1. **"Sub-Projects"** tab'ına tıkla
2. **"New Sub-Project"** butonuna tıkla

**Alternatif:**

- Direkt URL: `http://localhost:3000/consultant-dashboard/projects/[project-id]/sub-projects/new`

**Form Verileri:**

```
Sub-Project Name: "E-Ticaret Platform Entegrasyonu"

Description:
"Şirketin mevcut sistemlerinin e-ticaret platformlarıyla entegre edilmesi.
- Amazon, eBay, Etsy entegrasyonları
- Ürün senkronizasyonu
- Stok yönetimi
- Sipariş takibi"

Status: "Todo" (Yapılacak)
```

**İşlemler:**

1. Sub-Project Name alanına adı yaz
2. Description alanına açıklamayı yaz
3. Status'ü "Todo" olarak seç
4. **"Create Sub-Project"** butonuna tıkla

**Beklenen Sonuç:**

- ✅ "Sub-project created successfully!" toast mesajı
- ✅ Proje detay sayfasına geri döndün
- ✅ Sub-Projects tab'ında yeni alt proje görünüyor
- ✅ Alt proje kartında:
  - İsim: "E-Ticaret Platform Entegrasyonu"
  - Status badge: "Yapılacak"
  - Progress bar: 0%
  - Edit butonu

**Ekran Görüntüsü Noktaları:**

- Sub-project kartı
- Status badge
- Progress bar
- Edit butonu

**Not:** Sub-Project ID'yi kaydet:

```
Sub-Project ID: [UUID buraya yazılacak]
```

---

### ADIM 5: İlk Görev Oluşturma

**Mevcut Sayfa:** Proje detay sayfası

**İşlemler:**

1. Alt proje kartının üzerine tıkla (veya Edit butonuna tıkla)
2. Alt proje detay/düzenleme sayfasına git
3. **"Tasks"** tab'ına tıkla (eğer varsa)
4. **"New Task"** butonuna tıkla

**Alternatif:**

- Tasks sayfasından: `http://localhost:3000/consultant-dashboard/tasks/new`
- Sub-project seçerek görev oluştur

**Form Verileri - Görev 1:**

```
Task Title: "Amazon Seller Central API Entegrasyonu"

Description:
"Amazon Seller Central API'sini kullanarak ürün ve sipariş senkronizasyonu kurulumu.

Gereksinimler:
- API credentials alınması
- OAuth 2.0 authentication kurulumu
- Product listing API entegrasyonu
- Order management API entegrasyonu
- Test ve doğrulama"

Assigned To: [Şirket kullanıcısı seç - dropdown]

Status: "Todo"

Priority: "High"

Due Date: "2025-02-15"
```

**İşlemler:**

1. Task Title alanına başlığı yaz
2. Description alanına detaylı açıklamayı yaz
3. Assigned To dropdown'ından bir şirket kullanıcısı seç
4. Status'ü "Todo" olarak seç
5. Priority'yi "High" olarak seç
6. Due Date'i seç (2 hafta sonra)
7. **"Create Task"** butonuna tıkla

**Beklenen Sonuç:**

- ✅ "Task created successfully!" toast mesajı
- ✅ Görev listesine geri döndün
- ✅ Yeni görev listede görünüyor
- ✅ Görev kartında:
  - Başlık
  - Atanan kişi
  - Durum badge
  - Öncelik badge
  - Bitiş tarihi

**Ekran Görüntüsü Noktaları:**

- Task kartı
- Status ve priority badges
- Assigned user
- Due date

**Not:** Task 1 ID'yi kaydet:

```
Task 1 ID: [UUID buraya yazılacak]
```

---

### ADIM 6: İkinci Görev Oluşturma

**Mevcut Sayfa:** Görev listesi veya proje detay

**İşlemler:**

1. Tekrar **"New Task"** butonuna tıkla

**Form Verileri - Görev 2:**

```
Task Title: "eBay API Entegrasyonu ve Test"

Description:
"eBay Developer Program üzerinden API entegrasyonu kurulumu ve test süreçleri.

Gereksinimler:
- eBay Developer hesabı oluşturma
- API keys alma
- Sandbox environment kurulumu
- Product listing testi
- Order flow testi
- Production'a geçiş hazırlığı"

Assigned To: [Şirket kullanıcısı seç - aynı veya farklı]

Status: "Todo"

Priority: "Medium"

Due Date: "2025-02-28"
```

**İşlemler:**

1. Task Title alanına başlığı yaz
2. Description alanına detaylı açıklamayı yaz
3. Assigned To dropdown'ından kullanıcı seç
4. Status'ü "Todo" olarak seç
5. Priority'yi "Medium" olarak seç
6. Due Date'i seç (1 ay sonra)
7. **"Create Task"** butonuna tıkla

**Beklenen Sonuç:**

- ✅ "Task created successfully!" toast mesajı
- ✅ İki görev listede görünüyor
- ✅ Görevler sıralı şekilde:
  - Task 1: Amazon entegrasyonu (High priority)
  - Task 2: eBay entegrasyonu (Medium priority)

**Ekran Görüntüsü Noktaları:**

- İki görev kartı yan yana veya alt alta
- Farklı priority renkleri
- Her ikisinin de "Todo" durumunda olması

**Not:** Task 2 ID'yi kaydet:

```
Task 2 ID: [UUID buraya yazılacak]
```

---

## ✅ Doğrulama ve Kontroller

### Proje Detay Sayfasında Kontrol

**URL:** `http://localhost:3000/consultant-dashboard/projects/[project-id]`

**Kontrol Edilecekler:**

1. **Overview Tab:**
   - ✅ Proje adı: "E-İhracat Dijital Dönüşüm Projesi"
   - ✅ Status: Planning
   - ✅ Priority: High
   - ✅ Progress: 0% (henüz görev tamamlanmadı)
   - ✅ Tarih aralığı: 01 Feb 2025 - 30 Jun 2025

2. **Sub-Projects Tab:**
   - ✅ 1 alt proje görünüyor
   - ✅ Alt proje adı: "E-Ticaret Platform Entegrasyonu"
   - ✅ Status: Todo
   - ✅ Progress: 0%

3. **Tasks Tab (eğer varsa):**
   - ✅ 2 görev görünüyor
   - ✅ Her ikisi de "Todo" durumunda
   - ✅ Görev 1: High priority
   - ✅ Görev 2: Medium priority

### Database Kontrolü (Opsiyonel)

Supabase Dashboard'da kontrol:

```sql
-- Proje kontrolü
SELECT id, name, status, priority, progress
FROM projects
WHERE name = 'E-İhracat Dijital Dönüşüm Projesi';

-- Alt proje kontrolü
SELECT id, name, status, progress, project_id
FROM sub_projects
WHERE name = 'E-Ticaret Platform Entegrasyonu';

-- Görev kontrolü
SELECT id, title, status, priority, assigned_to, due_date
FROM tasks
WHERE title IN ('Amazon Seller Central API Entegrasyonu', 'eBay API Entegrasyonu ve Test');
```

---

## 📊 Beklenen Sonuç Özeti

### Oluşturulan Veriler

**1 Proje:**

- ✅ E-İhracat Dijital Dönüşüm Projesi
- ✅ Status: Planning
- ✅ Priority: High
- ✅ Duration: 5 ay (Feb - Jun 2025)

**1 Alt Proje:**

- ✅ E-Ticaret Platform Entegrasyonu
- ✅ Status: Todo
- ✅ Parent: Ana proje

**2 Görev:**

- ✅ Amazon Seller Central API Entegrasyonu (High, Due: 15 Feb)
- ✅ eBay API Entegrasyonu ve Test (Medium, Due: 28 Feb)
- ✅ Her ikisi de atanmış
- ✅ Her ikisi de Todo durumunda

### İlişkiler

```
Proje (E-İhracat Dijital Dönüşüm)
  └── Alt Proje (E-Ticaret Platform Entegrasyonu)
       ├── Görev 1 (Amazon API)
       └── Görev 2 (eBay API)
```

---

## 🎯 Bonus: Sonraki Adımlar (Test Genişletme)

### Görev Tamamlama Workflow'u Test Et

1. **Company User Olarak Giriş:**
   - Logout yap
   - Company user ile giriş yap
   - Atanan görevleri gör

2. **Görev Tamamlama:**
   - Görev 1'i aç
   - "Mark as Complete" butonuna tıkla
   - Completion notes ekle
   - Submit

3. **Consultant Onayı:**
   - Consultant olarak giriş yap
   - "Tasks" > "Review" sayfasına git
   - Tamamlanan görevi gör
   - "Approve" veya "Reject" yap

4. **Progress Tracking:**
   - Proje detay sayfasına dön
   - Progress bar'ın güncellendiğini gör
   - Alt proje progress'inin arttığını gör

---

## 🐛 Olası Sorunlar ve Çözümler

### Sorun 1: Şirket Dropdown'ı Boş

**Çözüm:**

- Admin olarak giriş yap
- En az 1 şirket oluştur
- Şirketi programa ata
- Consultant'ı programa ata

### Sorun 2: Assigned To Dropdown'ı Boş

**Çözüm:**

- Seçilen şirkette en az 1 company user olmalı
- Admin'den company user oluşturmasını iste

### Sorun 3: Form Submit Hatası

**Çözüm:**

- Browser console'u aç (F12)
- Network tab'ında API response'u kontrol et
- Error message'ı oku
- Gerekli alanların dolu olduğundan emin ol

### Sorun 4: Toast Notification Görünmüyor

**Çözüm:**

- Sayfayı yenile
- Browser cache'i temizle
- Sonner kütüphanesinin yüklendiğini kontrol et

---

## 📸 Ekran Görüntüleri Listesi

Test sırasında alınacak ekran görüntüleri:

1. ✅ Login sayfası
2. ✅ Consultant Dashboard (ana sayfa)
3. ✅ New Project form (boş)
4. ✅ New Project form (dolu)
5. ✅ Project created toast
6. ✅ Project detail page (overview)
7. ✅ Sub-projects tab (empty state)
8. ✅ New Sub-Project form
9. ✅ Sub-project created toast
10. ✅ Sub-projects tab (with 1 sub-project)
11. ✅ New Task form (Task 1)
12. ✅ Task 1 created toast
13. ✅ New Task form (Task 2)
14. ✅ Task 2 created toast
15. ✅ Tasks list (with 2 tasks)
16. ✅ Project detail final state (all tabs)

---

## ✅ Test Tamamlandı Checklist

- [ ] Consultant olarak giriş yapıldı
- [ ] Yeni proje oluşturuldu
- [ ] Proje detayları doğru kaydedildi
- [ ] Alt proje oluşturuldu
- [ ] Alt proje ana projeye bağlandı
- [ ] İlk görev oluşturuldu
- [ ] İkinci görev oluşturuldu
- [ ] Görevler alt projeye bağlandı
- [ ] Görevler kullanıcılara atandı
- [ ] Tüm veriler database'e kaydedildi
- [ ] Progress tracking çalışıyor
- [ ] UI responsive ve kullanılabilir
- [ ] Toast notifications çalışıyor
- [ ] Navigation sorunsuz

---

**Test Tarihi:** [Tarih buraya yazılacak]  
**Test Eden:** [İsim buraya yazılacak]  
**Test Durumu:** [PASS / FAIL]  
**Notlar:** [Ek notlar buraya yazılacak]

---

🎉 **Test Senaryosu Tamamlandı!**

Bu senaryo, Akademi Port proje yönetim sisteminin temel workflow'unu test eder.
