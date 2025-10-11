# 📭 EmptyState Component Kullanım Kılavuzu

**Versiyon:** 1.0.0  
**Son Güncelleme:** 2025-10-11

---

## 📖 İçindekiler

1. [Giriş](#giriş)
2. [Temel Kullanım](#temel-kullanım)
3. [Preset Tipler](#preset-tipler)
4. [Özelleştirme](#özelleştirme)
5. [Örnekler](#örnekler)
6. [Best Practices](#best-practices)
7. [API Referansı](#api-referansı)

---

## 🎯 Giriş

`EmptyState` component'i, kullanıcıya veri olmadığı durumları göstermek için tasarlanmış modern, token-based bir component'tir.

### **Özellikler:**
- ✅ 23 hazır preset tip
- ✅ Design token entegrasyonu
- ✅ Responsive tasarım
- ✅ Animation desteği
- ✅ TypeScript desteği
- ✅ Özelleştirilebilir

---

## 🚀 Temel Kullanım

### **1. Basit Kullanım (Preset):**

```tsx
import EmptyState from '@/components/ui/EmptyState';

// En basit kullanım
<EmptyState type="no-projects" />
```

### **2. Action Button ile:**

```tsx
<EmptyState 
  type="no-projects"
  action={{
    label: "Yeni Proje Oluştur",
    onClick: () => setShowModal(true)
  }}
/>
```

### **3. Custom Override:**

```tsx
<EmptyState 
  type="no-results"
  title="Özel Başlık"
  description="Özel açıklama metni"
/>
```

---

## 📋 Preset Tipler

### **Data States (Veri Durumları)**

| Tip | Kullanım | Icon | Renk |
|-----|----------|------|------|
| `no-data` | Genel veri yok | Database | Secondary |
| `no-results` | Arama sonucu yok | SearchX | Warning |
| `no-items` | Liste boş | Inbox | Secondary |

**Örnek:**
```tsx
// Arama sonucu bulunamadı
<EmptyState 
  type="no-results"
  action={{
    label: "Filtreleri Temizle",
    onClick: clearFilters
  }}
/>
```

---

### **Entity States (Varlık Durumları)**

| Tip | Kullanım | Icon | Renk |
|-----|----------|------|------|
| `no-projects` | Proje yok | FolderX | Primary |
| `no-sub-projects` | Alt proje yok | FileX | Success |
| `no-tasks` | Görev yok | CheckSquare | Info |
| `no-users` | Kullanıcı yok | Users | Primary |
| `no-companies` | Firma yok | Building2 | Primary |
| `no-applications` | Başvuru yok | FileX | Secondary |
| `no-news` | Haber yok | Newspaper | Info |
| `no-documents` | Döküman yok | FileX | Secondary |
| `no-videos` | Video yok | Video | Error |
| `no-messages` | Mesaj yok | MessageSquare | Primary |
| `no-notifications` | Bildirim yok | Bell | Secondary |
| `no-assignments` | Atama yok | Users | Secondary |

**Örnek:**
```tsx
// Admin panel - Firma listesi boş
{companies.length === 0 && (
  <EmptyState 
    type="no-companies"
    action={{
      label: "Yeni Firma Ekle",
      onClick: () => setShowAddModal(true)
    }}
  />
)}
```

---

### **State States (Durum Durumları)**

| Tip | Kullanım | Icon | Renk |
|-----|----------|------|------|
| `locked` | Kilitli içerik | Lock | Warning |
| `locked-projects` | Kilitli projeler | Lock | Warning |
| `unauthorized` | Yetkisiz erişim | ShieldAlert | Error |
| `coming-soon` | Yakında | Clock | Info |
| `maintenance` | Bakım modu | Settings | Warning |

**Örnek:**
```tsx
// Yetkisiz erişim
{!hasPermission && (
  <EmptyState 
    type="unauthorized"
    action={{
      label: "Ana Sayfaya Dön",
      onClick: () => router.push('/firma')
    }}
  />
)}
```

---

### **Action States (Aksiyon Durumları)**

| Tip | Kullanım | Icon | Renk |
|-----|----------|------|------|
| `create-first` | İlk öğe oluştur | Plus | Primary |
| `import-data` | Veri içe aktar | Upload | Primary |
| `setup-required` | Kurulum gerek | Settings | Warning |
| `empty-inbox` | Tüm işler tamam | Inbox | Success |

**Örnek:**
```tsx
// İlk proje oluşturma
{projects.length === 0 && (
  <EmptyState 
    type="create-first"
    title="İlk Projenizi Oluşturun"
    description="Başlamak için yeni bir proje oluşturun."
    action={{
      label: "Proje Oluştur",
      onClick: createProject
    }}
  />
)}
```

---

## 🎨 Özelleştirme

### **1. Size (Boyut)**

```tsx
// Küçük boyut
<EmptyState type="no-data" size="sm" />

// Orta boyut (default)
<EmptyState type="no-data" size="md" />

// Büyük boyut
<EmptyState type="no-data" size="lg" />
```

### **2. Variant (Stil)**

```tsx
// Base
<EmptyState type="no-data" variant="base" />

// Elevated (gölgeli)
<EmptyState type="no-data" variant="elevated" />

// Flat (düz)
<EmptyState type="no-data" variant="flat" />

// Glass (cam efekti)
<EmptyState type="no-data" variant="glass" />
```

### **3. Color (Renk)**

```tsx
<EmptyState 
  type="custom"
  title="Özel Mesaj"
  color="success"  // primary, secondary, success, warning, error, info
/>
```

### **4. Custom Icon**

```tsx
import { Rocket } from 'lucide-react';

<EmptyState 
  type="custom"
  icon={Rocket}
  title="Başlamaya Hazır mısınız?"
  description="İlk projenizi oluşturun!"
/>
```

### **5. Help Text**

```tsx
<EmptyState 
  type="no-projects"
  helpText={[
    "Danışmanınızla iletişime geçin",
    "Proje atama talebinde bulunun",
    "Sistem yöneticisine başvurun"
  ]}
/>
```

---

## 💡 Örnekler

### **Örnek 1: Arama Sonuçları Sayfası**

```tsx
'use client';
import { useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div>
      {/* Search Input */}
      <input 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Results */}
      {searchResults.length === 0 ? (
        <EmptyState 
          type="no-results"
          action={{
            label: "Aramayı Temizle",
            onClick: clearSearch
          }}
        />
      ) : (
        // Render results
      )}
    </div>
  );
}
```

---

### **Örnek 2: Admin Panel - Firma Yönetimi**

```tsx
'use client';
import { useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';

export default function CompanyManagement() {
  const [companies, setCompanies] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1>Firma Yönetimi</h1>
        <Button onClick={() => setShowAddModal(true)}>
          Yeni Firma Ekle
        </Button>
      </div>

      {companies.length === 0 ? (
        <EmptyState 
          type="no-companies"
          size="lg"
          variant="elevated"
          action={{
            label: "İlk Firmayı Ekle",
            onClick: () => setShowAddModal(true)
          }}
        />
      ) : (
        // Render companies table
      )}
    </div>
  );
}
```

---

### **Örnek 3: Firma Panel - Proje Listesi**

```tsx
'use client';
import { useEffect, useState } from 'react';
import EmptyState, { LoadingEmptyState } from '@/components/ui/EmptyState';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingEmptyState message="Projeler yükleniyor..." />;
  }

  if (error) {
    return (
      <EmptyState 
        type="custom"
        title="Hata Oluştu"
        description={error}
        color="error"
        action={{
          label: "Tekrar Dene",
          onClick: fetchProjects
        }}
      />
    );
  }

  if (projects.length === 0) {
    return (
      <EmptyState 
        type="no-projects"
        helpText={[
          "Danışmanınızla iletişime geçin",
          "Proje atama talebinde bulunun"
        ]}
      />
    );
  }

  return (
    // Render projects
  );
}
```

---

### **Örnek 4: Tüm İşler Tamamlandı**

```tsx
{pendingTasks.length === 0 && (
  <EmptyState 
    type="empty-inbox"
    size="lg"
    variant="glass"
  />
)}
```

---

## ✅ Best Practices

### **1. Doğru Preset'i Seç**
```tsx
// ✅ GOOD: Spesifik preset
<EmptyState type="no-projects" />

// ❌ BAD: Generic custom
<EmptyState 
  type="custom"
  title="Proje Bulunamadı"
  description="..."
/>
```

### **2. Action Button Ekle**
```tsx
// ✅ GOOD: Kullanıcıya aksiyon imkanı sun
<EmptyState 
  type="no-companies"
  action={{
    label: "Yeni Firma Ekle",
    onClick: openAddModal
  }}
/>

// ❌ BAD: Kullanıcı ne yapacağını bilemiyor
<EmptyState type="no-companies" />
```

### **3. Uygun Size Kullan**
```tsx
// ✅ GOOD: Modal içinde küçük
<Modal>
  <EmptyState type="no-data" size="sm" />
</Modal>

// ✅ GOOD: Ana sayfa için büyük
<main>
  <EmptyState type="no-projects" size="lg" />
</main>
```

### **4. Loading State'i Unutma**
```tsx
// ✅ GOOD
if (loading) return <LoadingEmptyState />;
if (error) return <EmptyState type="custom" title="Hata" />;
if (data.length === 0) return <EmptyState type="no-data" />;

// ❌ BAD
if (data.length === 0) return <EmptyState type="no-data" />;
```

---

## 📚 API Referansı

### **EmptyState Props**

```tsx
interface EmptyStateProps {
  // Preset type
  type?: EmptyStateType | 'custom';
  
  // Custom overrides
  title?: string;
  description?: string;
  icon?: LucideIcon;
  
  // Styling
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'base' | 'elevated' | 'flat' | 'glass';
  
  // Action
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  };
  
  // Help text
  helpText?: string[];
  
  // Animation
  animated?: boolean;
  
  // Additional
  className?: string;
}
```

### **CompactEmptyState Props**

```tsx
interface CompactEmptyStateProps {
  message: string;
  icon?: LucideIcon;
  className?: string;
}
```

### **LoadingEmptyState Props**

```tsx
interface LoadingEmptyStateProps {
  message?: string;
  className?: string;
}
```

---

## 🎓 Migration Guide

### **Eski EmptyStateCard'dan Migration:**

```tsx
// ❌ ÖNCE (Eski)
import EmptyStateCard from '@/components/ui/EmptyStateCard';

<EmptyStateCard
  type="no-projects"
  title="Proje Atanmamış"
  description="Danışmanınızla iletişime geçin"
  actionText="İletişim"
  onAction={contactConsultant}
/>

// ✅ SONRA (Yeni)
import EmptyState from '@/components/ui/EmptyState';

<EmptyState
  type="no-projects"
  action={{
    label: "Danışmanla İletişim",
    onClick: contactConsultant
  }}
/>
```

---

## 🆘 Yardım

### **Sorun Giderme:**

**S: Icon görünmüyor?**  
C: Lucide React icon'ları kullanın: `import { FolderX } from 'lucide-react'`

**S: Animation çalışmıyor?**  
C: `globals.css` dosyasında animation tanımlarını kontrol edin.

**S: Özel renk nasıl eklerim?**  
C: `lib/empty-state-configs.ts` dosyasına yeni color theme ekleyin.

**S: Yeni preset type nasıl eklerim?**  
C: `lib/empty-state-configs.ts` dosyasında `emptyStateConfigs` objesine ekleyin.

---

## 📞 Destek

**Dokümantasyon:** `components/ui/EMPTY_STATES_GUIDE.md`  
**Kaynak Kod:** `components/ui/EmptyState.tsx`  
**Config:** `lib/empty-state-configs.ts`

---

**Son Güncelleme:** 2025-10-11  
**Versiyon:** 1.0.0

