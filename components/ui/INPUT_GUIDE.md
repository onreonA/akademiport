# 📝 Input Component Kullanım Kılavuzu

**Versiyon:** 1.0.0  
**Son Güncelleme:** 2025-10-11

---

## 🎯 Genel Bakış

`Input` component'i, form input'ları için tam özellikli, token-based bir component'tir.

### **Özellikler:**
- ✅ 4 variant (default, filled, outlined, ghost)
- ✅ 3 size (sm, md, lg)
- ✅ Icon support (left/right)
- ✅ Validation states (error, success)
- ✅ Loading state
- ✅ Password toggle
- ✅ Character count
- ✅ Helper text
- ✅ Design token integration
- ✅ Fully accessible

---

## 🚀 Temel Kullanım

### **1. Basit Input:**
```tsx
import Input from '@/components/ui/Input';

<Input 
  label="Email" 
  placeholder="email@example.com"
  type="email"
/>
```

### **2. Required Input:**
```tsx
<Input 
  label="Ad Soyad" 
  placeholder="Adınızı giriniz"
  required
/>
```

### **3. With Helper Text:**
```tsx
<Input 
  label="Website"
  placeholder="https://example.com"
  helperText="Lütfen tam URL girin (https:// ile başlayan)"
/>
```

---

## 🎨 Variants

### **Default (Varsayılan):**
```tsx
<Input 
  label="Email"
  variant="default"
  placeholder="Default variant"
/>
```

### **Filled:**
```tsx
<Input 
  label="Arama"
  variant="filled"
  placeholder="Filled variant"
/>
```

### **Outlined:**
```tsx
<Input 
  label="Username"
  variant="outlined"
  placeholder="Outlined variant"
/>
```

### **Ghost:**
```tsx
<Input 
  label="Şifre"
  variant="ghost"
  placeholder="Ghost variant"
/>
```

---

## 📏 Sizes

### **Small:**
```tsx
<Input size="sm" label="Small" placeholder="Small input" />
```

### **Medium (Default):**
```tsx
<Input size="md" label="Medium" placeholder="Medium input" />
```

### **Large:**
```tsx
<Input size="lg" label="Large" placeholder="Large input" />
```

---

## ✅ Validation States

### **Error State:**
```tsx
<Input 
  label="Email"
  value={email}
  error="Geçerli bir email adresi giriniz"
/>
```

### **Success State:**
```tsx
<Input 
  label="Email"
  value={email}
  success="Email adresi geçerli"
/>
```

### **With Form Validation:**
```tsx
const [email, setEmail] = useState('');
const [error, setError] = useState('');

const validateEmail = (value: string) => {
  if (!value) {
    setError('Email gerekli');
  } else if (!/\S+@\S+\.\S+/.test(value)) {
    setError('Geçersiz email formatı');
  } else {
    setError('');
  }
};

<Input 
  label="Email"
  type="email"
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    validateEmail(e.target.value);
  }}
  error={error}
/>
```

---

## 🎨 Icons

### **Left Icon:**
```tsx
import { Mail } from 'lucide-react';

<Input 
  label="Email"
  leftIcon={Mail}
  placeholder="email@example.com"
/>
```

### **Right Icon:**
```tsx
import { Search } from 'lucide-react';

<Input 
  placeholder="Ara..."
  rightIcon={Search}
/>
```

### **Both Icons:**
```tsx
import { User, CheckCircle } from 'lucide-react';

<Input 
  label="Username"
  leftIcon={User}
  rightIcon={CheckCircle}
  value={username}
/>
```

---

## 🔐 Password Input

### **With Toggle:**
```tsx
<Input 
  type="password"
  label="Şifre"
  placeholder="En az 8 karakter"
  showPasswordToggle
/>
```

### **With Validation:**
```tsx
<Input 
  type="password"
  label="Yeni Şifre"
  placeholder="En az 8 karakter"
  showPasswordToggle
  error={passwordError}
  helperText="Şifre en az 8 karakter, 1 büyük harf ve 1 sayı içermelidir"
/>
```

---

## 🔄 Loading State

```tsx
const [loading, setLoading] = useState(false);

<Input 
  label="Email"
  value={email}
  loading={loading}
  disabled={loading}
/>
```

---

## 🔢 Character Count

### **With Max Length:**
```tsx
<Input 
  label="Bio"
  placeholder="Kendinizden bahsedin"
  maxLength={160}
  showCount
/>
```

### **Textarea Alternative:**
```tsx
<Input 
  label="Tweet"
  placeholder="Ne düşünüyorsun?"
  maxLength={280}
  showCount
/>
```

---

## 🎯 Real-World Örnekler

### **1. Login Form:**
```tsx
import { Mail, Lock } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  return (
    <form>
      <Input 
        label="Email"
        type="email"
        leftIcon={Mail}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
      />

      <Input 
        label="Şifre"
        type="password"
        leftIcon={Lock}
        showPasswordToggle
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        required
      />
    </form>
  );
}
```

---

### **2. Registration Form:**
```tsx
import { User, Mail, Lock, Phone } from 'lucide-react';

function RegisterForm() {
  return (
    <form>
      <Input 
        label="Ad Soyad"
        leftIcon={User}
        placeholder="John Doe"
        required
      />

      <Input 
        label="Email"
        type="email"
        leftIcon={Mail}
        placeholder="john@example.com"
        required
      />

      <Input 
        label="Telefon"
        type="tel"
        leftIcon={Phone}
        placeholder="+90 555 123 4567"
        helperText="Telefon numaranızı başında +90 ile girin"
      />

      <Input 
        label="Şifre"
        type="password"
        leftIcon={Lock}
        showPasswordToggle
        helperText="En az 8 karakter, 1 büyük harf, 1 sayı"
        maxLength={32}
        required
      />
    </form>
  );
}
```

---

### **3. Search Input:**
```tsx
import { Search } from 'lucide-react';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (value: string) => {
    setQuery(value);
    setLoading(true);
    
    // Perform search
    await searchAPI(value);
    
    setLoading(false);
  };

  return (
    <Input 
      placeholder="Ara..."
      leftIcon={Search}
      value={query}
      onChange={(e) => handleSearch(e.target.value)}
      loading={loading}
      variant="filled"
      size="lg"
    />
  );
}
```

---

### **4. Profile Edit Form:**
```tsx
import { User, Mail, Phone, MapPin, Briefcase } from 'lucide-react';

function ProfileEditForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    bio: '',
  });

  return (
    <form>
      <Input 
        label="Ad Soyad"
        leftIcon={User}
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />

      <Input 
        label="Email"
        type="email"
        leftIcon={Mail}
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        disabled
        helperText="Email değiştirilemez"
      />

      <Input 
        label="Telefon"
        type="tel"
        leftIcon={Phone}
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
      />

      <Input 
        label="Şehir"
        leftIcon={MapPin}
        value={formData.city}
        onChange={(e) => setFormData({...formData, city: e.target.value})}
      />

      <Input 
        label="Bio"
        leftIcon={Briefcase}
        value={formData.bio}
        onChange={(e) => setFormData({...formData, bio: e.target.value})}
        maxLength={160}
        showCount
        helperText="Kısa bir biyografi yazın"
      />
    </form>
  );
}
```

---

## 🎨 Styling Customization

### **Custom Container Class:**
```tsx
<Input 
  label="Email"
  containerClassName="mb-6"
/>
```

### **Custom Input Class:**
```tsx
<Input 
  label="Email"
  className="font-mono"
/>
```

---

## ♿ Accessibility

Input component otomatik olarak accessibility özelliklerini sağlar:

- ✅ `aria-invalid` - Error state'de otomatik eklenir
- ✅ `aria-describedby` - Helper text/error için
- ✅ `aria-required` - Required prop için
- ✅ Keyboard navigation support
- ✅ Screen reader compatible

---

## 📋 Props API

| Prop | Type | Default | Açıklama |
|------|------|---------|----------|
| `label` | string | - | Input etiketi |
| `description` | string | - | Etiket altında açıklama |
| `error` | string | - | Hata mesajı |
| `success` | string | - | Başarı mesajı |
| `leftIcon` | LucideIcon | - | Sol icon |
| `rightIcon` | LucideIcon | - | Sağ icon |
| `loading` | boolean | false | Loading state |
| `size` | 'sm' \| 'md' \| 'lg' | 'md' | Input boyutu |
| `variant` | 'default' \| 'filled' \| 'outlined' \| 'ghost' | 'default' | Input stili |
| `showPasswordToggle` | boolean | false | Şifre göster/gizle |
| `helperText` | string | - | Yardımcı metin |
| `maxLength` | number | - | Max karakter sayısı |
| `showCount` | boolean | false | Karakter sayacı göster |
| `containerClassName` | string | - | Container class |
| ...rest | InputHTMLAttributes | - | Standart input props |

---

## 💡 Best Practices

### **✅ DO:**
```tsx
// Clear, descriptive labels
<Input label="Email Adresi" />

// Helpful error messages
<Input error="Email formatı hatalı" />

// Use icons for clarity
<Input leftIcon={Mail} />

// Show loading state
<Input loading={isSubmitting} />
```

### **❌ DON'T:**
```tsx
// Vague labels
<Input label="Input 1" />

// Generic errors
<Input error="Hata!" />

// Too many icons
<Input leftIcon={Icon1} rightIcon={Icon2} loading />

// Disable without reason
<Input disabled />
```

---

## 🔄 Migration Guide

### **Eski Inline Input'tan:**
```tsx
// ❌ ÖNCE
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Email
  </label>
  <input
    type="email"
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    placeholder="email@example.com"
  />
  {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
</div>

// ✅ SONRA
<Input 
  label="Email"
  type="email"
  placeholder="email@example.com"
  error={error}
/>
```

---

## 🎊 Sonuç

Input component, tüm form ihtiyaçlarınız için güçlü, esnek ve tutarlı bir çözüm sunar!

**Sonraki Adımlar:**
- Select Component
- Textarea Component
- Checkbox & Radio Components

---

**Son Güncelleme:** 2025-10-11  
**Versiyon:** 1.0.0

