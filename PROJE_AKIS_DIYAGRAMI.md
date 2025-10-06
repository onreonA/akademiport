# 🔄 PROJE AKIŞ DİYAGRAMI

## 📊 SİSTEM MİMARİSİ

```
🏗️ PROJE YÖNETİMİ SİSTEMİ
│
├── 👨‍💼 ADMIN PANELİ
│   ├── 📋 Proje Oluşturma
│   ├── 🏢 Çoklu Firma Atama (20 firma)
│   ├── 📊 İlerleme Takibi
│   └── 📈 Raporlama
│
├── 👥 FİRMA PANELİ
│   ├── 👀 Atanmış Projeleri Görüntüleme
│   ├── ✅ Görev Tamamlama
│   ├── 💬 Danışmana Soru Sorma
│   └── 📊 Kendi İlerlemesini Takip Etme
│
└── 👨‍💼 DANIŞMAN PANELİ
    ├── 🔍 Görev İnceleme
    ├── ✅ Onay/Red İşlemleri
    ├── 📝 Rapor Yazma
    └── 💬 Firma İletişimi
```

---

## 🔄 WORKFLOW AKIŞI

### 1️⃣ PROJE OLUŞTURMA SÜRECİ

```
📋 Admin Proje Oluşturur
    ↓
🏗️ Alt Projeler Tanımlar
    ↓
📝 Görevler Belirler
    ↓
🏢 20 Firmaya Eş Zamanlı Atar
    ↓
📧 Bildirim Gönderilir
```

### 2️⃣ FİRMA ÇALIŞMA SÜRECİ

```
📧 Firma Bildirim Alır
    ↓
👀 Atanmış Projeleri Görüntüler
    ↓
📋 Alt Proje Seçer
    ↓
✅ Görevleri Tamamlar
    ↓
💬 Danışmana Soru Sorar (Gerekirse)
    ↓
📊 İlerlemesini Takip Eder
```

### 3️⃣ DANIŞMAN ONAY SÜRECİ

```
🔔 Görev Tamamlama Bildirimi Alır
    ↓
🔍 Görevi İnceler
    ↓
✅ Onaylar / ❌ Reddeder
    ↓
💬 Geri Bildirim Verir
    ↓
📝 Alt Proje Tamamlandığında Rapor Yazır
    ↓
📊 İlerleme Günceller
```

---

## 🎯 VERİ AKIŞI

### DATABASE İLİŞKİLERİ

```
projects (1) ←→ (N) project_company_assignments
projects (1) ←→ (N) sub_projects
sub_projects (1) ←→ (N) tasks
sub_projects (1) ←→ (N) sub_project_company_assignments
tasks (1) ←→ (N) task_company_assignments
```

### API AKIŞI

```
Admin API'leri:
├── POST /api/admin/project-assignments
├── POST /api/admin/sub-project-assignments
├── POST /api/admin/task-assignments
└── GET /api/admin/progress-tracking

Firma API'leri:
├── GET /api/firma/assigned-projects
├── POST /api/firma/tasks/[id]/complete
├── POST /api/firma/tasks/[id]/comment
└── GET /api/firma/progress-summary

Danışman API'leri:
├── POST /api/admin/tasks/[id]/approve
├── POST /api/admin/tasks/[id]/reject
├── POST /api/admin/sub-projects/[id]/complete
└── GET /api/admin/task-approvals
```

---

## 📊 İLERLEME TAKİP SİSTEMİ

### FİRMA BAZLI İLERLEME

```
Her Firma İçin:
├── 📈 Genel İlerleme Yüzdesi
├── ✅ Tamamlanan Görevler
├── 🔄 Devam Eden Görevler
├── ⏰ Geciken Görevler
└── 📊 Alt Proje Bazlı İlerleme
```

### ADMIN DASHBOARD

```
Admin Görüntüler:
├── 🏢 Tüm Firmaların İlerlemesi
├── 📊 Proje Bazlı İstatistikler
├── ⚠️ Geciken Görevler
├── 📈 Performans Metrikleri
└── 📝 Danışman Raporları
```

---

## 🔔 BİLDİRİM SİSTEMİ

### BİLDİRİM TİPLERİ

```
📧 Proje Atama Bildirimi
├── Firma admin'e gönderilir
├── Proje detayları içerir
└── Başlangıç tarihi belirtilir

🔔 Görev Tamamlama Bildirimi
├── Danışmana gönderilir
├── Görev detayları içerir
└── İnceleme linki verir

💬 Yorum Bildirimi
├── İlgili tarafa gönderilir
├── Yorum içeriği gösterilir
└── Yanıt linki verir

📝 Rapor Bildirimi
├── Firma admin'e gönderilir
├── Rapor özeti içerir
└── Detay linki verir
```

---

## 🎯 BAŞARI KRİTERLERİ

### FONKSİYONEL KRİTERLER

- ✅ 20 firma eş zamanlı proje atama
- ✅ Her firma kendi ilerlemesini görebilir
- ✅ Görev tamamlama danışman onayı gerektirir
- ✅ Alt proje tamamlandığında rapor yazılır
- ✅ Gerçek zamanlı ilerleme güncellemesi

### TEKNİK KRİTERLER

- ✅ API response time < 200ms
- ✅ Frontend load time < 2s
- ✅ Database query optimization
- ✅ Mobile responsiveness
- ✅ System uptime > 99%

### KULLANICI DENEYİMİ KRİTERLERİ

- ✅ Intuitive navigation
- ✅ Clear progress indicators
- ✅ Responsive design
- ✅ Comprehensive error handling
- ✅ Real-time notifications

---

## 🚨 SORUN GİDERME

### YAYGIN SORUNLAR

```
❌ Proje Görünmüyor
├── Çözüm: project_company_assignments kontrolü
├── Çözüm: Firma kullanıcı yetkisi kontrolü
└── Çözüm: Cache temizleme

❌ Görev Tamamlanamıyor
├── Çözüm: task_company_assignments kontrolü
├── Çözüm: Görev durumu kontrolü
└── Çözüm: Yetki kontrolü

❌ Bildirim Gelmiyor
├── Çözüm: Notification sistemi kontrolü
├── Çözüm: Email servisi kontrolü
└── Çözüm: Database trigger kontrolü
```

---

## 📈 PERFORMANS OPTİMİZASYONU

### DATABASE OPTİMİZASYONU

```
📊 İndeksler:
├── project_company_assignments (project_id, company_id)
├── sub_project_company_assignments (sub_project_id, company_id)
├── task_company_assignments (task_id, company_id)
└── notifications (user_id, created_at)

🔄 Query Optimization:
├── JOIN optimizasyonu
├── N+1 query problem çözümü
└── Pagination implementasyonu
```

### FRONTEND OPTİMİZASYONU

```
⚡ Performance:
├── Lazy loading
├── Code splitting
├── Image optimization
└── Bundle size optimization

📱 Mobile Optimization:
├── Responsive design
├── Touch-friendly interface
├── Offline capability
└── Progressive Web App features
```

---

**Son Güncelleme:** 2025-01-22
**Versiyon:** 1.0
**Durum:** Geliştirme Aşamasında
