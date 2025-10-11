# 📝 Form Components Kılavuzu

**Sprint 2 - FAZE 1: Form Components** için kapsamlı kullanım kılavuzu.

## 📋 İçindekiler

1. [Input Component](#input-component)
2. [Select Component](#select-component)
3. [Textarea Component](#textarea-component)
4. [Checkbox Component](#checkbox-component)
5. [Radio & RadioGroup Components](#radio--radiogroup-components)
6. [Migration Guide](#migration-guide)

---

## 🔤 Input Component

### Temel Kullanım

```tsx
import Input from '@/components/ui/Input';

// Basit input
<Input label="Email" placeholder="email@example.com" type="email" />

// Şifre input (toggle ile)
<Input label="Şifre" type="password" showPasswordToggle />

// Validation ile
<Input 
  label="Kullanıcı Adı" 
  leftIcon={User}
  error={errors.username}
/>
```

### Özellikler

| Prop | Tip | Default | Açıklama |
|------|-----|---------|----------|
| `label` | `string` | - | Input label'ı |
| `description` | `string` | - | Açıklama metni |
| `error` | `string` | - | Hata mesajı |
| `success` | `string` | - | Başarı mesajı |
| `leftIcon` | `LucideIcon` | - | Sol ikonu |
| `rightIcon` | `LucideIcon` | - | Sağ ikonu |
| `showPasswordToggle` | `boolean` | `false` | Şifre göster/gizle |
| `showCount` | `boolean` | `false` | Karakter sayacı |
| `maxLength` | `number` | - | Maksimum karakter |
| `variant` | `'default' \| 'filled' \| 'outlined' \| 'ghost'` | `'default'` | Görünüm tipi |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Boyut |

### Variants

#### Default
```tsx
<Input variant="default" label="Default Input" />
```
- Beyaz arka plan
- Gri border
- Odaklanmada mavi border + ring

#### Filled
```tsx
<Input variant="filled" label="Filled Input" />
```
- Açık gri arka plan
- Border yok
- Odaklanmada beyaz + mavi border

#### Outlined
```tsx
<Input variant="outlined" label="Outlined Input" />
```
- Şeffaf arka plan
- Kalın border
- Odaklanmada mavi border

#### Ghost
```tsx
<Input variant="ghost" label="Ghost Input" />
```
- Şeffaf arka plan
- Border yok
- Hover'da açık gri arka plan

### İkonlar

```tsx
import { Mail, User, Lock, Search } from 'lucide-react';

// Sol ikon
<Input leftIcon={Mail} placeholder="Email" />

// Sağ ikon
<Input rightIcon={Search} placeholder="Ara..." />

// Her ikisi
<Input leftIcon={User} rightIcon={Check} />
```

### Validation States

```tsx
// Error
<Input 
  label="Email"
  error="Geçersiz email adresi"
  leftIcon={Mail}
/>

// Success
<Input 
  label="Username"
  success="Kullanıcı adı müsait!"
  leftIcon={User}
/>
```

### Karakter Sayacı

```tsx
<Input 
  label="Bio"
  maxLength={160}
  showCount
  placeholder="Kendiniz hakkında..."
/>
```

**Renk Değişimi:**
- Normal: Gri (`text-gray-500`)
- %90+: Turuncu (`text-orange-500`)
- %100: Kırmızı + bold (`text-red-500 font-semibold`)

---

## 📋 Select Component

### Temel Kullanım

```tsx
import Select from '@/components/ui/Select';

// String array
<Select 
  label="Kategori" 
  options={['Teknoloji', 'Tasarım', 'Marketing']}
/>

// Object array
<Select 
  label="Şehir"
  options={[
    { value: 'ist', label: 'İstanbul' },
    { value: 'ank', label: 'Ankara' },
    { value: 'izm', label: 'İzmir', disabled: true }
  ]}
/>
```

### Özellikler

| Prop | Tip | Default | Açıklama |
|------|-----|---------|----------|
| `label` | `string` | - | Select label'ı |
| `description` | `string` | - | Açıklama metni |
| `options` | `SelectOption[] \| string[]` | **required** | Seçenekler |
| `placeholder` | `string` | `'Seçiniz...'` | Placeholder |
| `error` | `string` | - | Hata mesajı |
| `success` | `string` | - | Başarı mesajı |
| `leftIcon` | `LucideIcon` | - | Sol ikonu |
| `variant` | `'default' \| 'filled' \| 'outlined'` | `'default'` | Görünüm tipi |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Boyut |
| `helperText` | `string` | - | Yardımcı metin |

### SelectOption Interface

```tsx
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
```

### Örnek Kullanımlar

#### Form İçinde

```tsx
const [status, setStatus] = useState('');

<Select 
  label="Proje Durumu"
  options={[
    { value: 'active', label: 'Aktif' },
    { value: 'pending', label: 'Beklemede' },
    { value: 'completed', label: 'Tamamlandı' }
  ]}
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  error={errors.status}
  required
/>
```

#### Dinamik Seçenekler

```tsx
const categories = ['A', 'B', 'C']; // API'den gelen

<Select 
  label="Kategori"
  options={categories}
  placeholder="Bir kategori seçin"
/>
```

---

## 📝 Textarea Component

### Temel Kullanım

```tsx
import Textarea from '@/components/ui/Textarea';

// Basit textarea
<Textarea 
  label="Açıklama" 
  placeholder="Açıklama girin..."
/>

// Auto-resize
<Textarea 
  label="Mesaj"
  autoResize
  minRows={3}
  maxRows={10}
/>

// Karakter sayacı
<Textarea 
  label="Bio"
  maxLength={500}
  showCount
/>
```

### Özellikler

| Prop | Tip | Default | Açıklama |
|------|-----|---------|----------|
| `label` | `string` | - | Textarea label'ı |
| `description` | `string` | - | Açıklama metni |
| `error` | `string` | - | Hata mesajı |
| `success` | `string` | - | Başarı mesajı |
| `icon` | `LucideIcon` | - | Sağ üst ikon |
| `showCount` | `boolean` | `false` | Karakter sayacı |
| `maxLength` | `number` | - | Maksimum karakter |
| `autoResize` | `boolean` | `false` | Otomatik yükseklik |
| `minRows` | `number` | `3` | Minimum satır |
| `maxRows` | `number` | `10` | Maksimum satır |
| `variant` | `'default' \| 'filled' \| 'outlined'` | `'default'` | Görünüm tipi |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Boyut |
| `helperText` | `string` | - | Yardımcı metin |

### Auto-Resize

```tsx
<Textarea 
  label="Yorumunuz"
  autoResize
  minRows={2}
  maxRows={8}
  placeholder="Düşüncelerinizi paylaşın..."
/>
```

**Nasıl Çalışır?**
- Kullanıcı yazdıkça otomatik yükseklik artar
- `minRows` minimum yüksekliği belirler
- `maxRows` maksimum yüksekliği belirler
- Maksimuma ulaşınca scroll çubuğu görünür

### Karakter Sayacı

```tsx
<Textarea 
  label="Ürün Açıklaması"
  maxLength={1000}
  showCount
/>
```

**Renk Değişimi:**
- Normal: Gri (`text-gray-500`)
- %90+: Turuncu (`text-orange-500`)
- %100: Kırmızı + bold (`text-red-500 font-semibold`)

---

## ☑️ Checkbox Component

### Temel Kullanım

```tsx
import Checkbox from '@/components/ui/Checkbox';

// Basit checkbox
<Checkbox label="Kabul ediyorum" />

// Açıklama ile
<Checkbox 
  label="Koşulları kabul et"
  description="Kullanım şartlarını okudum ve kabul ediyorum"
/>

// Validation ile
<Checkbox 
  label="Gerekli alan"
  error="Bu alanı işaretlemelisiniz"
  required
/>
```

### Özellikler

| Prop | Tip | Default | Açıklama |
|------|-----|---------|----------|
| `label` | `string` | - | Checkbox label'ı |
| `description` | `string` | - | Açıklama metni |
| `error` | `string` | - | Hata mesajı |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Boyut |
| `indeterminate` | `boolean` | `false` | Belirsiz durum |

### Indeterminate State

"Tümünü seç" gibi durumlarda kullanılır:

```tsx
const [selectedAll, setSelectedAll] = useState(false);
const [selectedItems, setSelectedItems] = useState<string[]>([]);

const allSelected = selectedItems.length === items.length;
const someSelected = selectedItems.length > 0 && !allSelected;

<Checkbox 
  label="Tümünü Seç"
  checked={allSelected}
  indeterminate={someSelected}
  onChange={() => {
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(i => i.id));
    }
  }}
/>
```

### Form Kullanımı

```tsx
const [agreed, setAgreed] = useState(false);

<Checkbox 
  label="Koşulları kabul ediyorum"
  description="Lütfen devam etmek için kabul edin"
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
  error={!agreed && submitted ? 'Bu alan zorunludur' : undefined}
/>
```

---

## 🔘 Radio & RadioGroup Components

### Radio Component

Tekil radio butonu:

```tsx
import Radio from '@/components/ui/Radio';

<Radio label="Seçenek 1" name="option" value="1" />
<Radio label="Seçenek 2" name="option" value="2" />
```

### RadioGroup Component (Önerilen)

Grup halinde radio butonları:

```tsx
import RadioGroup from '@/components/ui/RadioGroup';

const [plan, setPlan] = useState('free');

<RadioGroup 
  name="plan"
  label="Planınızı Seçin"
  description="İhtiyaçlarınıza uygun planı seçin"
  options={[
    { value: 'free', label: 'Ücretsiz', description: 'Temel özellikler' },
    { value: 'pro', label: 'Pro', description: '$29/ay - Tüm özellikler' },
    { value: 'enterprise', label: 'Kurumsal', description: 'Özel fiyatlandırma' }
  ]}
  value={plan}
  onChange={setPlan}
  required
/>
```

### RadioGroup Özellikler

| Prop | Tip | Default | Açıklama |
|------|-----|---------|----------|
| `label` | `string` | - | Grup label'ı |
| `description` | `string` | - | Grup açıklaması |
| `options` | `RadioOption[]` | **required** | Seçenekler |
| `value` | `string` | - | Seçili değer |
| `onChange` | `(value: string) => void` | - | Değişim callback'i |
| `name` | `string` | **required** | Radio group name |
| `error` | `string` | - | Hata mesajı |
| `required` | `boolean` | `false` | Zorunlu alan |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Boyut |
| `layout` | `'vertical' \| 'horizontal'` | `'vertical'` | Düzen |

### RadioOption Interface

```tsx
interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}
```

### Layout: Horizontal

```tsx
<RadioGroup 
  name="status"
  label="Durum"
  options={[
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'İnaktif' }
  ]}
  layout="horizontal"
  value={status}
  onChange={setStatus}
/>
```

---

## 🔄 Migration Guide

### Before (Inline Input)

```tsx
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Email
  </label>
  <input
    type="email"
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    placeholder="email@example.com"
  />
  {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
</div>
```

### After (Input Component)

```tsx
<Input 
  label="Email"
  type="email"
  placeholder="email@example.com"
  error={error}
  leftIcon={Mail}
/>
```

**Kazanç:**
- 9 satır → 6 satır ✅
- Design token otomatik ✅
- Accessibility built-in ✅
- Icon support ✅

---

### Before (Inline Select)

```tsx
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Kategori
  </label>
  <select
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
  >
    <option value="">Seçiniz...</option>
    <option value="a">Option A</option>
    <option value="b">Option B</option>
  </select>
</div>
```

### After (Select Component)

```tsx
<Select 
  label="Kategori"
  options={[
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' }
  ]}
  placeholder="Seçiniz..."
/>
```

**Kazanç:**
- 12 satır → 7 satır ✅
- Array-based options ✅
- Built-in chevron icon ✅

---

### Before (Inline Checkbox)

```tsx
<div className="flex items-start gap-2">
  <input 
    type="checkbox"
    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded"
  />
  <div>
    <label className="text-sm font-medium text-gray-700">
      Kabul ediyorum
    </label>
    <p className="text-xs text-gray-500">Koşulları okudum</p>
  </div>
</div>
```

### After (Checkbox Component)

```tsx
<Checkbox 
  label="Kabul ediyorum"
  description="Koşulları okudum"
/>
```

**Kazanç:**
- 10 satır → 4 satır ✅
- Custom styling ✅
- Smooth animations ✅

---

## 📊 Impact Summary

### Kod Azaltma

| Component | Dosya Sayısı | Tahmini Satır |
|-----------|--------------|---------------|
| Input | 67 | ~500 |
| Select | 45 | ~300 |
| Textarea | 38 | ~250 |
| Checkbox | 29 | ~150 |
| Radio | 18 | ~100 |
| **TOPLAM** | **197** | **~1,300** |

### Kazançlar

✅ **1,300+ satır kod azaltma**
✅ **%100 design token consistency**
✅ **Built-in accessibility**
✅ **Uniform validation states**
✅ **Icon support everywhere**
✅ **Responsive by default**
✅ **Type-safe props**

---

## 🎯 Next Steps

1. ✅ **FAZE 1 Complete** - Form Components
2. ⏳ **FAZE 2** - Badge & Tag Components
3. ⏳ **FAZE 3** - Stats & Info Cards
4. ⏳ **FAZE 4** - Navigation Components
5. ⏳ **FAZE 5** - Feedback Components
6. ⏳ **FAZE 6** - Utility Components

---

## 🐛 Troubleshooting

### Input icon görünmüyor

```tsx
// ❌ Yanlış
import { Mail } from 'lucide-react';
<Input leftIcon="Mail" />

// ✅ Doğru
import { Mail } from 'lucide-react';
<Input leftIcon={Mail} />
```

### Select placeholder görünmüyor

```tsx
// ❌ Yanlış
<Select options={[...]} value="" />

// ✅ Doğru
<Select options={[...]} value={undefined} />
// veya
<Select options={[...]} defaultValue="" />
```

### Textarea auto-resize çalışmıyor

```tsx
// ❌ Yanlış
<Textarea autoResize value={text} />

// ✅ Doğru
const textareaRef = useRef<HTMLTextAreaElement>(null);
<Textarea ref={textareaRef} autoResize value={text} />
```

---

**Son Güncelleme:** 2025-10-11
**Sprint:** Sprint 2 - FAZE 1
**Durum:** ✅ COMPLETE

