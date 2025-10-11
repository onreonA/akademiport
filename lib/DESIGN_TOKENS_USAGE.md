# 🎨 Design Tokens Kullanım Kılavuzu

Bu dokümantasyon, `lib/design-tokens.ts` dosyasındaki helper fonksiyonların nasıl kullanılacağını gösterir.

---

## 📦 Import

```tsx
import { tokens, cn, color, spacing, typography, shadow, radius } from '@/lib/design-tokens';
```

---

## 🎯 Pre-composed Tokens (Önerilen)

### **Button Variants**

```tsx
// ✅ İyi - Pre-composed token kullanımı
<button className={tokens.button.primary}>Kaydet</button>
<button className={tokens.button.secondary}>İptal</button>
<button className={tokens.button.success}>Onayla</button>
<button className={tokens.button.danger}>Sil</button>
<button className={tokens.button.ghost}>İptal</button>

// ❌ Kötü - Hardcoded
<button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
  Kaydet
</button>
```

### **Card Variants**

```tsx
// ✅ İyi
<div className={tokens.card.base}>Normal Card</div>
<div className={tokens.card.elevated}>Elevated Card</div>
<div className={tokens.card.flat}>Flat Card</div>
<div className={tokens.card.glass}>Glass Card</div>

// ❌ Kötü
<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
  Normal Card
</div>
```

### **Input Variants**

```tsx
// ✅ İyi
<input type="text" className={tokens.input.base} />
<input type="text" className={tokens.input.error} />

// ❌ Kötü
<input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
```

### **Typography Variants**

```tsx
// ✅ İyi
<h1 className={tokens.typography.heading1}>Ana Başlık</h1>
<h2 className={tokens.typography.heading2}>Alt Başlık</h2>
<p className={tokens.typography.body}>Paragraf</p>
<span className={tokens.typography.caption}>Küçük Yazı</span>

// ❌ Kötü
<h1 className="text-4xl md:text-5xl font-bold text-gray-900">Ana Başlık</h1>
```

### **Badge Variants**

```tsx
// ✅ İyi
<span className={tokens.badge.primary}>Aktif</span>
<span className={tokens.badge.success}>Başarılı</span>
<span className={tokens.badge.warning}>Bekliyor</span>
<span className={tokens.badge.danger}>Hata</span>

// ❌ Kötü
<span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
  Aktif
</span>
```

### **Layout Helpers**

```tsx
// ✅ İyi - Container
<div className={tokens.layout.container}>
  {/* İçerik */}
</div>

// ✅ İyi - Section
<section className={tokens.layout.section}>
  {/* İçerik */}
</section>

// ✅ İyi - Grid
<div className={tokens.layout.grid.cols3}>
  {/* 3 kolonlu grid */}
</div>

// ❌ Kötü
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* İçerik */}
</div>
```

---

## 🔧 Helper Functions

### **cn() - Class Name Merger**

Tailwind class'larını birleştirirken çakışmaları önler:

```tsx
import { cn } from '@/lib/design-tokens';

// ✅ İyi - Çakışma yok
const buttonClass = cn(
  tokens.button.primary,
  isLoading && 'opacity-50 cursor-not-allowed',
  className // props'tan gelen ek class'lar
);

<button className={buttonClass}>Kaydet</button>

// ❌ Kötü - Çakışma olabilir
<button className={`${tokens.button.primary} ${isLoading ? 'opacity-50' : ''}`}>
  Kaydet
</button>
```

### **color() - Dynamic Colors**

```tsx
import { color } from '@/lib/design-tokens';

// ✅ İyi - Dynamic color
<div className={color('primary', 600, 'bg')}>
  {/* bg-blue-600 */}
</div>

<p className={color('success', 700, 'text')}>
  {/* text-green-700 */}
</p>

<div className={color('error', 500, 'border')}>
  {/* border-red-500 */}
</div>

// Palette options: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
// Shade options: 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
// Type options: 'bg' | 'text' | 'border'
```

### **spacing() - Dynamic Spacing**

```tsx
import { spacing } from '@/lib/design-tokens';

// ✅ İyi - Dynamic spacing
<div className={spacing(4, 'p')}>
  {/* p-4 */}
</div>

<div className={spacing(6, 'm', 'x')}>
  {/* mx-6 */}
</div>

<div className={spacing(8, 'gap')}>
  {/* gap-8 */}
</div>

// Size options: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 56 | 64
// Type options: 'p' | 'm' | 'gap' | 'space-x' | 'space-y'
// Side options: 't' | 'r' | 'b' | 'l' | 'x' | 'y'
```

### **typography() - Typography Styles**

```tsx
import { typography } from '@/lib/design-tokens';

// ✅ İyi
<h1 className={typography('heading1')}>Ana Başlık</h1>
<p className={typography('body')}>Normal metin</p>

// Variant options: 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'body' | 'bodyLarge' | 'bodySmall' | 'caption'
```

### **shadow() - Shadow Styles**

```tsx
import { shadow } from '@/lib/design-tokens';

// ✅ İyi
<div className={shadow('lg')}>
  {/* shadow-lg */}
</div>

// Size options: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'none'
```

### **radius() - Border Radius**

```tsx
import { radius } from '@/lib/design-tokens';

// ✅ İyi
<div className={radius('lg')}>
  {/* rounded-lg */}
</div>

// Size options: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
```

---

## 🎨 Combining Tokens

### **Custom Component Example**

```tsx
import { cn, tokens, color, spacing } from '@/lib/design-tokens';

interface CustomCardProps {
  variant?: 'success' | 'warning' | 'error';
  children: React.ReactNode;
  className?: string;
}

export function CustomCard({ variant, children, className }: CustomCardProps) {
  return (
    <div
      className={cn(
        tokens.card.base,
        variant && color(variant, 100, 'bg'),
        variant && color(variant, 700, 'border'),
        className
      )}
    >
      {children}
    </div>
  );
}

// Kullanım:
<CustomCard variant="success">Başarılı işlem!</CustomCard>
<CustomCard variant="error">Hata oluştu!</CustomCard>
```

### **Button with Custom Styles**

```tsx
import { cn, tokens } from '@/lib/design-tokens';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export function Button({ variant = 'primary', size = 'md', children, className }: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-6 py-2 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  return (
    <button
      className={cn(
        tokens.button[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </button>
  );
}
```

---

## 📋 Migration Checklist

### **Before (Hardcoded):**
```tsx
<button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg">
  Kaydet
</button>

<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
  <h2 className="text-2xl font-bold text-gray-900 mb-4">Başlık</h2>
  <p className="text-gray-600 leading-relaxed">İçerik</p>
</div>
```

### **After (Design Tokens):**
```tsx
<button className={tokens.button.primary}>
  Kaydet
</button>

<div className={tokens.card.base}>
  <h2 className={tokens.typography.heading3}>Başlık</h2>
  <p className={tokens.typography.body}>İçerik</p>
</div>
```

---

## 🎯 Best Practices

### ✅ **DO:**
- Pre-composed token'ları kullan (`tokens.button.primary`)
- Custom kombinasyonlar için `cn()` kullan
- Component prop'larında dynamic değerler için helper fonksiyonları kullan
- Tutarlılık için token'ları tercih et

### ❌ **DON'T:**
- Hardcoded Tailwind class'ları kullanma
- Inline style kullanma (`style={{ ... }}`)
- Token'sız yeni component oluşturma
- Tutarsız renk/spacing değerleri kullanma

---

## 🔍 Examples in Real Components

### **Modal Component:**
```tsx
import { cn, tokens } from '@/lib/design-tokens';

export function Modal({ isOpen, children }: ModalProps) {
  return (
    <div className={cn(
      'fixed inset-0 z-50',
      'flex items-center justify-center',
      'bg-black bg-opacity-50',
      isOpen ? 'block' : 'hidden'
    )}>
      <div className={tokens.card.elevated}>
        {children}
      </div>
    </div>
  );
}
```

### **Dashboard Card:**
```tsx
import { tokens } from '@/lib/design-tokens';

export function DashboardCard({ title, value, icon }: DashboardCardProps) {
  return (
    <div className={tokens.card.base}>
      <div className="flex items-center justify-between">
        <div>
          <p className={tokens.typography.bodySmall}>{title}</p>
          <h3 className={tokens.typography.heading2}>{value}</h3>
        </div>
        <div className={tokens.badge.primary}>
          {icon}
        </div>
      </div>
    </div>
  );
}
```

---

## 📚 Resources

- **Design System:** `lib/design-system.ts`
- **Design Tokens:** `lib/design-tokens.ts`
- **Test Page:** `/firma/test-design`
- **Analysis Report:** `DESIGN_TOKENS_ANALYSIS.md`

---

## 🆘 Need Help?

Eğer token'ları nasıl kullanacağınızı bilmiyorsanız:

1. `lib/DESIGN_TOKENS_USAGE.md` (bu dosyayı) okuyun
2. `/firma/test-design` sayfasını ziyaret edin
3. Mevcut component'lerde (`Button.tsx`, `Modal.tsx`, `Card.tsx`) örneklere bakın
4. `DESIGN_TOKENS_ANALYSIS.md` dosyasında migration stratejisini inceleyin

