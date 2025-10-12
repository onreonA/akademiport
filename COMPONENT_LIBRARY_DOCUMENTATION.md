# 🎨 Akademi Port UI Component Library

## 📋 Genel Bakış

Akademi Port platformu için geliştirilmiş modern, tutarlı ve yeniden kullanılabilir UI component kütüphanesi. Tüm component'ler TypeScript ile yazılmış, Tailwind CSS ile stillendirilmiş ve design token'lar ile tutarlılık sağlanmıştır.

## 🚀 Kurulum ve Kullanım

### Import
```tsx
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
// ... diğer component'ler
```

### Design Tokens
```tsx
import { cn, color, spacing, typography } from '@/lib/design-tokens';
```

## 📦 Component'ler

### 1. Button Component

**Dosya:** `components/ui/Button.tsx`

Modern, çok amaçlı buton component'i. 8 farklı variant, 3 boyut ve icon desteği.

#### Props
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg';
  icon?: string | React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}
```

#### Kullanım Örnekleri
```tsx
// Primary button with icon
<Button variant='primary' icon='ri-add-line'>
  Yeni Ekle
</Button>

// Secondary button with loading
<Button variant='secondary' loading={isLoading}>
  Kaydet
</Button>

// Ghost button with custom icon
<Button variant='ghost' icon={<CustomIcon />}>
  İncele
</Button>
```

### 2. Card Component

**Dosya:** `components/ui/Card.tsx`

Esnek kart component'i. 3 farklı variant ve responsive tasarım.

#### Props
```tsx
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined';
  children: React.ReactNode;
  className?: string;
}
```

#### Kullanım Örnekleri
```tsx
// Default card
<Card>
  <h3>Başlık</h3>
  <p>İçerik</p>
</Card>

// Elevated card with custom styling
<Card variant='elevated' className='hover:shadow-lg'>
  <h3>Gölgeli Kart</h3>
  <p>Daha belirgin görünüm</p>
</Card>
```

### 3. Modal Component

**Dosya:** `components/ui/Modal.tsx`

Modern modal component'i. ESC tuşu, dış tıklama ve animasyon desteği.

#### Props
```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}
```

#### Kullanım Örnekleri
```tsx
// Basic modal
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title='Başlık'
  size='md'
>
  <p>Modal içeriği</p>
  <ModalFooter>
    <Button variant='secondary' onClick={onClose}>Kapat</Button>
    <Button variant='primary'>Kaydet</Button>
  </ModalFooter>
</Modal>
```

### 4. Input Component

**Dosya:** `components/ui/Input.tsx`

Gelişmiş input component'i. Validation, icon, loading state desteği.

#### Props
```tsx
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  icon?: string | React.ReactNode;
  error?: string;
  loading?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}
```

#### Kullanım Örnekleri
```tsx
// Basic input
<Input
  type='text'
  placeholder='Adınızı girin'
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

// Input with icon and validation
<Input
  type='email'
  icon='ri-mail-line'
  error={emailError}
  placeholder='email@example.com'
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### 5. Select Component

**Dosya:** `components/ui/Select.tsx`

Modern select component'i. Multiple selection ve custom styling desteği.

#### Props
```tsx
interface SelectProps {
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  error?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}
```

#### Kullanım Örnekleri
```tsx
// Basic select
<Select value={role} onChange={(e) => setRole(e.target.value)}>
  <option value=''>Rol seçin</option>
  <option value='admin'>Admin</option>
  <option value='user'>Kullanıcı</option>
</Select>
```

### 6. Textarea Component

**Dosya:** `components/ui/Textarea.tsx`

Gelişmiş textarea component'i. Auto-resize ve validation desteği.

#### Props
```tsx
interface TextareaProps {
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  error?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}
```

#### Kullanım Örnekleri
```tsx
// Basic textarea
<Textarea
  placeholder='Mesajınızı yazın...'
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  rows={4}
/>

// Textarea with validation
<Textarea
  error={descriptionError}
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  required
/>
```

### 7. Badge Component

**Dosya:** `components/ui/Badge.tsx`

Çok amaçlı badge component'i. 6 farklı variant ve 3 boyut.

#### Props
```tsx
interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}
```

#### Kullanım Örnekleri
```tsx
// Status badges
<Badge variant='success'>Aktif</Badge>
<Badge variant='warning'>Beklemede</Badge>
<Badge variant='error'>Hata</Badge>

// Custom badge
<Badge variant='info' size='lg'>
  Yeni Özellik
</Badge>
```

### 8. StatusBadge Component

**Dosya:** `components/ui/StatusBadge.tsx`

Durum odaklı badge component'i. Predefined status'lar ve otomatik renklendirme.

#### Props
```tsx
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'in-progress' | 'on-hold' | 'approved' | 'rejected';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
}
```

#### Kullanım Örnekleri
```tsx
// Status badges
<StatusBadge status='active'>Aktif</StatusBadge>
<StatusBadge status='pending'>Beklemede</StatusBadge>
<StatusBadge status='completed'>Tamamlandı</StatusBadge>

// Custom text with status
<StatusBadge status='in-progress'>İşlem Devam Ediyor</StatusBadge>
```

### 9. StatsCard Component

**Dosya:** `components/ui/StatsCard.tsx`

İstatistik kartı component'i. Icon, trend ve progress desteği.

#### Props
```tsx
interface StatsCardProps {
  icon?: LucideIcon | string;
  title?: string;
  label?: string; // Alias for title
  value: string | number;
  variant?: 'default' | 'gradient' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'accent';
  iconColor?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}
```

#### Kullanım Örnekleri
```tsx
// Basic stats card
<StatsCard
  icon='ri-user-line'
  title='Toplam Kullanıcı'
  value='1,234'
  variant='gradient'
  iconColor='primary'
/>

// Stats card with trend
<StatsCard
  icon='ri-chart-line'
  title='Büyüme'
  value='12.5%'
  variant='success'
  trend={{ value: 8, isPositive: true }}
/>
```

## 🎨 Design Tokens

### Renkler
```tsx
// Primary colors
color.primary[50]   // #eff6ff
color.primary[500]  // #3b82f6
color.primary[900]  // #1e3a8a

// Status colors
color.success       // #10b981
color.warning       // #f59e0b
color.error         // #ef4444
```

### Spacing
```tsx
spacing.xs    // 0.25rem (4px)
spacing.sm    // 0.5rem (8px)
spacing.md    // 1rem (16px)
spacing.lg    // 1.5rem (24px)
spacing.xl    // 2rem (32px)
```

### Typography
```tsx
typography.heading.h1  // text-4xl font-bold
typography.body.base   // text-base leading-relaxed
typography.caption     // text-sm text-gray-600
```

## 🔧 Utility Functions

### cn (Class Name)
```tsx
import { cn } from '@/lib/design-tokens';

// Conditional classes
cn(
  'base-class',
  isActive && 'active-class',
  variant === 'primary' && 'primary-class'
)
```

### Design Token Helpers
```tsx
import { color, spacing, typography } from '@/lib/design-tokens';

// Color helper
color('primary', 500)     // #3b82f6
color('success')          // #10b981

// Spacing helper
spacing('md')             // 1rem
spacing('lg')             // 1.5rem

// Typography helper
typography('heading', 'h1')  // text-4xl font-bold
```

## 📱 Responsive Design

Tüm component'ler mobile-first yaklaşımı ile tasarlanmıştır:

```tsx
// Responsive grid
<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>

// Responsive text
<h1 className='text-2xl md:text-3xl lg:text-4xl font-bold'>

// Responsive spacing
<div className='p-4 md:p-6 lg:p-8'>
```

## ♿ Accessibility

Tüm component'ler accessibility standartlarına uygun olarak geliştirilmiştir:

- **ARIA labels** ve **roles**
- **Keyboard navigation** desteği
- **Screen reader** uyumluluğu
- **Focus management**
- **Color contrast** uyumluluğu

## 🧪 Testing

Component'ler test edilmiştir:

```tsx
// Example test
import { render, screen } from '@testing-library/react';
import Button from '@/components/ui/Button';

test('renders button with correct text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

## 📚 Showcase

Component'leri test etmek için showcase sayfasını ziyaret edin:
`/firma/component-showcase`

## 🔄 Migration Guide

### Eski Component'lerden Yeni Component'lere Geçiş

#### Button Migration
```tsx
// Eski
<button className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded'>
  Click me
</button>

// Yeni
<Button variant='primary'>Click me</Button>
```

#### Input Migration
```tsx
// Eski
<input 
  type='text' 
  className='w-full px-3 py-2 border border-gray-300 rounded-lg'
  value={value}
  onChange={onChange}
/>

// Yeni
<Input
  type='text'
  value={value}
  onChange={onChange}
  className='w-full'
/>
```

## 🚀 Performance

- **Tree-shaking** desteği
- **Lazy loading** için hazır
- **Bundle size** optimize edilmiş
- **Re-render** minimize edilmiş

## 📝 Best Practices

1. **Consistent Props**: Tüm component'lerde tutarlı prop isimleri
2. **TypeScript**: Strict typing kullanımı
3. **Accessibility**: ARIA attributes ve keyboard navigation
4. **Responsive**: Mobile-first design approach
5. **Performance**: Memoization ve optimization
6. **Documentation**: Comprehensive prop documentation

## 🔮 Roadmap

- [ ] **DataTable** component
- [ ] **Chart** components
- [ ] **DatePicker** component
- [ ] **FileUpload** component
- [ ] **Toast** notification system
- [ ] **Dark mode** support
- [ ] **Animation** library integration

## 📞 Support

Component library ile ilgili sorularınız için:
- **Documentation**: Bu dosya
- **Showcase**: `/firma/component-showcase`
- **Issues**: GitHub issues
- **Examples**: Component showcase sayfası

---

**Son güncelleme:** 2025-01-09  
**Versiyon:** 4.0.0  
**Maintainer:** Akademi Port Development Team
