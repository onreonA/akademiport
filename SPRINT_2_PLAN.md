# 🚀 SPRINT 2: Component Library Expansion

**Başlangıç:** 2025-10-11  
**Hedef Süre:** 12-16 saat  
**Öncelik:** 🟡 High Priority

---

## 🎯 Sprint 2 Hedefleri

### **Ana Hedef:**
Yaygın kullanılan, tekrar eden component pattern'lerini merkezi, yeniden kullanılabilir component'lere dönüştürmek.

### **Beklenen Kazanımlar:**
- ✅ **~3,500 satır kod** azaltma
- ✅ **%100 tutarlılık** sağlama
- ✅ **Bakım kolaylığı** artırma
- ✅ **Developer experience** iyileştirme

---

## 📋 Sprint 2 Görevleri

### **FAZE 1: Form Components (4 saat)**

#### **1.1 Input Component (1.5 saat)**
**Mevcut Durum:** 67 dosyada inline input kullanımı

```tsx
// ❌ Şu an: Her yerde farklı input stili
<input 
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2"
  placeholder="Email"
/>

// ✅ Hedef: Reusable Input component
<Input
  label="Email"
  placeholder="Email giriniz"
  error={errors.email}
  required
/>
```

**Özellikler:**
- Label support
- Error message display
- Icon support (left/right)
- Validation states
- Disabled state
- Loading state
- Size variants (sm, md, lg)
- Design token integration

**Dosyalar:**
- `components/ui/Input.tsx`
- `components/ui/INPUT_GUIDE.md`

---

#### **1.2 Select Component (1 saat)**
**Mevcut Durum:** 45 dosyada inline select kullanımı

```tsx
// ❌ Şu an: Hardcoded select
<select className="border rounded-lg px-4 py-2">
  <option value="">Seçiniz</option>
  <option value="1">Option 1</option>
</select>

// ✅ Hedef: Reusable Select
<Select
  label="Kategori"
  options={categories}
  value={selectedCategory}
  onChange={setSelectedCategory}
  placeholder="Kategori seçiniz"
/>
```

**Özellikler:**
- Options array support
- Multi-select variant
- Search functionality
- Custom option rendering
- Loading state
- Design token integration

---

#### **1.3 Textarea Component (30 dk)**
```tsx
// ✅ Hedef
<Textarea
  label="Açıklama"
  rows={5}
  maxLength={500}
  showCount
  error={errors.description}
/>
```

---

#### **1.4 Checkbox & Radio Components (1 saat)**
```tsx
// ✅ Hedef
<Checkbox
  label="Şartları kabul ediyorum"
  checked={accepted}
  onChange={setAccepted}
/>

<Radio
  options={[
    { value: 'option1', label: 'Seçenek 1' },
    { value: 'option2', label: 'Seçenek 2' },
  ]}
  value={selected}
  onChange={setSelected}
/>
```

---

### **FAZE 2: Badge & Tag Components (2 saat)**

#### **2.1 Badge Component (1 saat)**
**Mevcut Durum:** 89 dosyada inline badge kullanımı

```tsx
// ❌ Şu an: Her yerde farklı badge stili
<span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
  Aktif
</span>

// ✅ Hedef: Reusable Badge
<Badge variant="success">Aktif</Badge>
<Badge variant="warning" size="sm">Beklemede</Badge>
<Badge variant="error" dot>Kırmızı</Badge>
```

**Özellikler:**
- 6 variants (success, error, warning, info, primary, secondary)
- 3 sizes (sm, md, lg)
- Dot indicator
- Icon support
- Removable variant (with X button)
- Design token integration

**Impact:**
- 89 dosyada ~300 inline badge
- ~500 satır kod azaltma

---

#### **2.2 Tag Component (1 saat)**
```tsx
// ✅ Hedef: Interaktif tag'ler
<Tag onRemove={() => removeTag(id)}>
  React
</Tag>

<TagGroup>
  {tags.map(tag => (
    <Tag key={tag.id} onRemove={() => removeTag(tag.id)}>
      {tag.name}
    </Tag>
  ))}
</TagGroup>
```

---

### **FAZE 3: Stats & Info Cards (3 saat)**

#### **3.1 StatsCard Component (1.5 saat)**
**Mevcut Durum:** 67 dosyada tekrar eden stats card pattern'i

```tsx
// ❌ Şu an: Her dashboard'da farklı stats card
<div className="bg-white rounded-xl shadow-sm p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-600">Toplam Proje</p>
      <h3 className="text-2xl font-bold text-gray-900">247</h3>
    </div>
    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
      <i className="ri-folder-line text-blue-600"></i>
    </div>
  </div>
  <div className="mt-4 flex items-center text-sm">
    <span className="text-green-600">+12%</span>
    <span className="text-gray-500 ml-2">Bu ay</span>
  </div>
</div>

// ✅ Hedef: Reusable StatsCard
<StatsCard
  title="Toplam Proje"
  value={247}
  icon={Folder}
  trend={{ value: 12, direction: 'up', label: 'Bu ay' }}
  variant="primary"
/>
```

**Özellikler:**
- Icon support (Lucide)
- Trend indicator (up/down/neutral)
- Multiple variants
- Loading state
- Click handler
- Design token integration

**Impact:**
- 67 dosyada ~200 stats card
- ~1,000 satır kod azaltma

---

#### **3.2 InfoCard Component (1 saat)**
```tsx
// ✅ Hedef: Bilgi kartları
<InfoCard
  type="info"
  title="Bilgi"
  message="Bu işlem geri alınamaz"
  dismissible
/>

<InfoCard type="warning" icon={AlertTriangle}>
  <p>Dikkat: Profil bilgilerinizi güncelleyin</p>
</InfoCard>
```

---

#### **3.3 ProgressCard Component (30 dk)**
```tsx
// ✅ Hedef: İlerleme kartları
<ProgressCard
  title="Proje İlerlemesi"
  progress={75}
  total={100}
  subtitle="3/4 tamamlandı"
  variant="success"
/>
```

---

### **FAZE 4: Navigation Components (2 saat)**

#### **4.1 Tabs Component (1 saat)**
**Mevcut Durum:** 34 dosyada inline tabs kullanımı

```tsx
// ❌ Şu an: Her yerde farklı tabs
<div className="border-b border-gray-200">
  <nav className="flex space-x-8">
    <button className={activeTab === 'tab1' ? 'border-b-2 border-blue-500' : ''}>
      Tab 1
    </button>
  </nav>
</div>

// ✅ Hedef: Reusable Tabs
<Tabs value={activeTab} onChange={setActiveTab}>
  <TabList>
    <Tab value="overview">Genel Bakış</Tab>
    <Tab value="details">Detaylar</Tab>
    <Tab value="settings">Ayarlar</Tab>
  </TabList>
  <TabPanel value="overview">Content 1</TabPanel>
  <TabPanel value="details">Content 2</TabPanel>
  <TabPanel value="settings">Content 3</TabPanel>
</Tabs>
```

---

#### **4.2 Breadcrumb Component (30 dk)**
```tsx
// ✅ Hedef
<Breadcrumb>
  <BreadcrumbItem href="/firma">Ana Sayfa</BreadcrumbItem>
  <BreadcrumbItem href="/firma/projeler">Projeler</BreadcrumbItem>
  <BreadcrumbItem>Proje Detay</BreadcrumbItem>
</Breadcrumb>
```

---

#### **4.3 Pagination Component (30 dk)**
```tsx
// ✅ Hedef
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  showFirstLast
/>
```

---

### **FAZE 5: Feedback Components (2 saat)**

#### **5.1 Alert Component (1 saat)**
```tsx
// ✅ Hedef
<Alert variant="success" dismissible>
  İşlem başarıyla tamamlandı!
</Alert>

<Alert variant="error" icon={AlertCircle} action={{ label: "Tekrar Dene", onClick: retry }}>
  Bir hata oluştu. Lütfen tekrar deneyin.
</Alert>
```

---

#### **5.2 Toast System Enhancement (1 saat)**
Mevcut Toast component'ini geliştir:
- Queue management
- Auto-dismiss timing
- Position variants
- Animation improvements
- Design token integration

---

### **FAZE 6: Utility Components (1 saat)**

#### **6.1 Avatar Component (30 dk)**
```tsx
// ✅ Hedef
<Avatar src={user.avatar} alt={user.name} size="md" />
<Avatar fallback="AB" status="online" />
<AvatarGroup max={3} users={users} />
```

---

#### **6.2 Tooltip Component (30 dk)**
```tsx
// ✅ Hedef
<Tooltip content="Bu bir bilgi mesajıdır">
  <Button>Hover me</Button>
</Tooltip>
```

---

## 📊 Sprint 2 Tahmini İmpact

### **Kod Kalitesi:**
| Metrik | Önce | Sonra | Kazanç |
|--------|------|-------|--------|
| **Inline Components** | ~1,200 | ~100 | -%90 |
| **Kod Tekrarı** | ~3,500 satır | ~500 satır | -3,000 satır |
| **Component Sayısı** | 50+ | 70+ | +20 reusable |
| **Tutarlılık** | %60 | %95 | +%35 |

### **Geliştirici Deneyimi:**
```tsx
// ❌ ÖNCE: 15 satır, hardcoded
<div className="w-full">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Email
  </label>
  <input
    type="email"
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    placeholder="Email giriniz"
  />
  {error && (
    <p className="mt-1 text-sm text-red-600">{error}</p>
  )}
</div>

// ✅ SONRA: 1 satır, token-based
<Input label="Email" placeholder="Email giriniz" error={error} />
```

---

## 🎯 Sprint 2 Öncelik Sırası

### **Critical (Hemen Başla):**
1. 🔴 **Form Components** - En çok kullanılan, %80 sayfa etkilenir
2. 🔴 **Badge Component** - 89 dosyada 300+ kullanım
3. 🔴 **StatsCard** - 67 dosyada 200+ kullanım

### **High Priority:**
4. 🟡 **Tabs Component** - 34 dosyada kullanım
5. 🟡 **Alert Component** - Kullanıcı deneyimi için kritik

### **Medium Priority:**
6. 🟢 **Avatar, Tooltip** - Nice-to-have
7. 🟢 **Breadcrumb, Pagination** - UX iyileştirme

---

## ✅ Sprint 2 Checklist

### **Her Component İçin:**
- [ ] TypeScript interface tanımla
- [ ] Design token'ları kullan
- [ ] Variants oluştur (size, color, type)
- [ ] Error states ekle
- [ ] Loading states ekle
- [ ] Accessibility (ARIA) ekle
- [ ] Dokümantasyon yaz
- [ ] Örnek kullanım kodu ekle
- [ ] Lint ve build kontrol
- [ ] Test et
- [ ] Commit yap

### **Sprint Sonunda:**
- [ ] Tüm component'ler oluşturuldu
- [ ] Pilot sayfalarda test edildi
- [ ] Dokümantasyon tamamlandı
- [ ] README.md güncellendi
- [ ] Version dosyaları güncellendi
- [ ] GitHub'a push edildi

---

## 🚀 Başlangıç Stratejisi

### **Önerilen Sıra:**

**Gün 1 (4 saat):**
1. Input Component (1.5h)
2. Select Component (1h)
3. Textarea Component (0.5h)
4. Checkbox/Radio (1h)

**Gün 2 (4 saat):**
5. Badge Component (1h)
6. Tag Component (1h)
7. StatsCard Component (1.5h)
8. InfoCard Component (0.5h)

**Gün 3 (4 saat):**
9. Tabs Component (1h)
10. Alert Component (1h)
11. Avatar Component (0.5h)
12. Tooltip Component (0.5h)
13. Dokümantasyon & Test (1h)

---

## 🎊 Sprint 2 Başarı Kriterleri

### **Teknik:**
- ✅ 15+ yeni component oluşturuldu
- ✅ ~3,000 satır kod azaltıldı
- ✅ %95 tutarlılık sağlandı
- ✅ Tüm component'ler token-based

### **Kullanıcı Deneyimi:**
- ✅ Tutarlı form deneyimi
- ✅ Tutarlı feedback sistemleri
- ✅ Modern, animasyonlu component'ler
- ✅ Accessible component'ler

### **Geliştirici Deneyimi:**
- ✅ Kolay kullanım (1 satır)
- ✅ İyi dokümante edilmiş
- ✅ Type-safe
- ✅ Örneklerle desteklenmiş

---

**Hazır mısın?** 🚀 Hangi component'le başlamak istersin?

**Önerim:** **Input Component** ile başlayalım - en yaygın kullanılan ve en çok impact yaratacak olan! 💪

