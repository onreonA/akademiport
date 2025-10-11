# Loading States Component'leri

Modern, tutarlı loading state'leri için kapsamlı component koleksiyonu.

---

## 📦 Component'ler

### 1. LoadingSpinner
Ana loading spinner component'i - genel kullanım için.

```tsx
import LoadingSpinner from '@/components/ui/LoadingSpinner';

<LoadingSpinner 
  size="md" 
  color="primary" 
  text="Yükleniyor..." 
  fullScreen={false}
/>
```

**Props:**
- `size`: `'xs' | 'sm' | 'md' | 'lg' | 'xl'` (default: `'md'`)
- `color`: `'primary' | 'secondary' | 'success' | 'danger' | 'white'` (default: `'primary'`)
- `text`: `string` (opsiyonel)
- `fullScreen`: `boolean` (default: `false`) - Tam ekran overlay
- `className`: `string` (opsiyonel)

---

### 2. InlineSpinner
Button'lar ve küçük alanlar için inline spinner.

```tsx
import { InlineSpinner } from '@/components/ui/LoadingSpinner';

<button disabled={loading}>
  {loading && <InlineSpinner size="sm" className="mr-2" />}
  Kaydet
</button>
```

**Props:**
- `size`: `'xs' | 'sm' | 'md'` (default: `'sm'`)
- `className`: `string` (opsiyonel)

---

### 3. SkeletonLoader
Text satırları için skeleton loader.

```tsx
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';

<SkeletonLoader lines={3} height="h-4" />
```

**Props:**
- `lines`: `number` (default: `3`)
- `height`: `string` (default: `'h-4'`)
- `className`: `string` (opsiyonel)

---

### 4. CardSkeleton
Card component'leri için skeleton loader.

```tsx
import { CardSkeleton } from '@/components/ui/LoadingSpinner';

{loading ? <CardSkeleton count={3} /> : <ActualCards />}
```

**Props:**
- `count`: `number` (default: `1`) - Kaç tane skeleton gösterilecek

---

### 5. TableSkeleton
Tablo skeleton loader.

```tsx
import { TableSkeleton } from '@/components/ui/LoadingSpinner';

{loading ? <TableSkeleton rows={5} /> : <ActualTable />}
```

**Props:**
- `rows`: `number` (default: `5`) - Kaç satır skeleton gösterilecek

---

### 6. ChartSkeleton
Chart skeleton loader.

```tsx
import { ChartSkeleton } from '@/components/ui/LoadingSpinner';

{loading ? <ChartSkeleton /> : <ActualChart />}
```

---

### 7. PageLoading
Full page loading state.

```tsx
import { PageLoading } from '@/components/ui/LoadingSpinner';

if (loading) return <PageLoading text="Veriler yükleniyor..." />;
```

**Props:**
- `text`: `string` (default: `'Yükleniyor...'`)

---

### 8. SectionLoading
Sayfa bölümü için loading state.

```tsx
import { SectionLoading } from '@/components/ui/LoadingSpinner';

{loading ? (
  <SectionLoading text="Grafik yükleniyor..." height="h-96" />
) : (
  <Chart />
)}
```

**Props:**
- `text`: `string` (default: `'Yükleniyor...'`)
- `height`: `string` (default: `'h-64'`)

---

## 🎯 Kullanım Örnekleri

### Örnek 1: Page Loading
```tsx
'use client';

import { useState, useEffect } from 'react';
import { PageLoading } from '@/components/ui/LoadingSpinner';

export default function MyPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <PageLoading text="Sayfa yükleniyor..." />;

  return <div>{/* Your content */}</div>;
}
```

---

### Örnek 2: Button Loading
```tsx
'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { InlineSpinner } from '@/components/ui/LoadingSpinner';

export default function SaveButton() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await saveData();
    setSaving(false);
  };

  return (
    <Button onClick={handleSave} disabled={saving}>
      {saving && <InlineSpinner size="sm" className="mr-2" />}
      {saving ? 'Kaydediliyor...' : 'Kaydet'}
    </Button>
  );
}
```

---

### Örnek 3: Card Grid Loading
```tsx
'use client';

import { useState, useEffect } from 'react';
import { CardSkeleton } from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';

export default function CardGrid() {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    fetchCards();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-6">
        <CardSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {cards.map(card => (
        <Card key={card.id}>{/* Card content */}</Card>
      ))}
    </div>
  );
}
```

---

### Örnek 4: Table Loading
```tsx
'use client';

import { useState, useEffect } from 'react';
import { TableSkeleton } from '@/components/ui/LoadingSpinner';

export default function DataTable() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  if (loading) return <TableSkeleton rows={10} />;

  return (
    <table>{/* Your table */}</table>
  );
}
```

---

### Örnek 5: Section Loading
```tsx
'use client';

import { SectionLoading } from '@/components/ui/LoadingSpinner';

export default function Dashboard() {
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      {statsLoading ? (
        <SectionLoading text="İstatistikler yükleniyor..." height="h-32" />
      ) : (
        <StatsCards />
      )}

      {/* Chart Section */}
      {chartLoading ? (
        <SectionLoading text="Grafik yükleniyor..." height="h-96" />
      ) : (
        <Chart />
      )}
    </div>
  );
}
```

---

### Örnek 6: Full Screen Loading
```tsx
'use client';

import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ModalWithLoading() {
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async () => {
    setProcessing(true);
    await processData();
    setProcessing(false);
  };

  return (
    <>
      {processing && (
        <LoadingSpinner 
          size="lg" 
          text="İşlem devam ediyor..." 
          fullScreen={true}
        />
      )}
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
      </form>
    </>
  );
}
```

---

## ✅ Best Practices

### 1. **Doğru Component Seçimi**
```tsx
// ✅ DOĞRU - Her durum için uygun component
<PageLoading />              // Full page loading
<SectionLoading />           // Section loading
<CardSkeleton />             // Card grids
<TableSkeleton />            // Tables
<InlineSpinner />            // Buttons

// ❌ YANLIŞ - Her yerde generic spinner
<LoadingSpinner />           // Too generic
```

---

### 2. **Loading Text**
```tsx
// ✅ DOĞRU - Açıklayıcı loading text
<PageLoading text="Projeler yükleniyor..." />
<SectionLoading text="Grafik hazırlanıyor..." />

// ❌ YANLIŞ - Generic text
<PageLoading text="Lütfen bekleyin..." />
<SectionLoading text="Yükleniyor..." />
```

---

### 3. **Skeleton Count**
```tsx
// ✅ DOĞRU - Gerçek data sayısına yakın
<CardSkeleton count={6} />  // 6 card gösterilecekse
<TableSkeleton rows={10} /> // 10 satır gösterilecekse

// ❌ YANLIŞ - Sabit sayı
<CardSkeleton count={1} />  // Her zaman 1
```

---

### 4. **Loading State Hierarchy**
```tsx
// ✅ DOĞRU - Early return pattern
if (pageLoading) return <PageLoading />;
if (sectionLoading) return <SectionLoading />;
return <Content />;

// ❌ YANLIŞ - Nested conditions
{pageLoading ? (
  <PageLoading />
) : sectionLoading ? (
  <SectionLoading />
) : (
  <Content />
)}
```

---

## 🎨 Styling Guidelines

### Size Guidelines
- `xs` (12px): Icon replacement
- `sm` (16px): Inline text, buttons
- `md` (32px): Section loading
- `lg` (48px): Page loading
- `xl` (64px): Full screen loading

### Color Guidelines
- `primary`: Default, genel kullanım
- `secondary`: Alt öncelikli işlemler
- `success`: Başarılı işlemler
- `danger`: Kritik işlemler
- `white`: Dark background üzerinde

---

## 🚨 Hatırlatmalar

1. ✅ **Loading state'i her zaman kullan** - API çağrıları için
2. ✅ **Uygun skeleton kullan** - Content type'a göre
3. ✅ **Açıklayıcı text ekle** - Kullanıcı ne bekliyor?
4. ✅ **Full screen'i dikkatli kullan** - Sadece kritik işlemler için
5. ✅ **Button disabled state** - Loading sırasında disable et

---

## 🔄 Migration Guide

### Eski Kullanım → Yeni Kullanım

```tsx
// ❌ ESKI
<div className="flex justify-center">
  <div className="animate-spin">Loading...</div>
</div>

// ✅ YENİ
<LoadingSpinner size="md" text="Yükleniyor..." />
```

```tsx
// ❌ ESKI
{loading && <span>Loading...</span>}

// ✅ YENİ
{loading && <InlineSpinner size="sm" />}
```

```tsx
// ❌ ESKI
<div className="h-64 flex items-center justify-center">
  Loading...
</div>

// ✅ YENİ
<SectionLoading height="h-64" text="Yükleniyor..." />
```

---

## 📚 Related Documentation
- [Button Component](./Button.tsx)
- [Card Component](./Card.tsx)
- [Error Handling](./ERROR_HANDLING.md)

