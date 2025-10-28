# Presentation Layer

Bu katman kullanıcı arayüzünden sorumludur.

## İçerik
- `components/ui/atoms`: Temel UI bileşenleri (Button, Input, etc.)
- `components/ui/molecules`: Bileşik UI bileşenleri (FormField, Card, etc.)
- `components/ui/organisms`: Karmaşık UI bileşenleri (Header, Sidebar, etc.)
- `components/ui/templates`: Sayfa şablonları (DashboardLayout, etc.)
- `components/features`: Özellik bazlı bileşenler (programs, companies, etc.)
- `components/shared`: Paylaşılan bileşenler (ErrorBoundary, etc.)
- `app`: Next.js App Router sayfaları
- `lib`: UI utilities

## Kurallar
- Bu katman sadece Application katmanına bağımlıdır
- Business logic içermez
- Sadece UI logic içerir
- React component'leri burada yer alır

## Atomic Design Pattern

```
Atoms → Molecules → Organisms → Templates → Pages
```

### Atoms (Temel Bileşenler)
- Button, Input, Badge, Avatar, Icon, Label, etc.
- En küçük UI bileşenleri
- Tek başlarına anlamlı

### Molecules (Bileşik Yapılar)
- FormField (Label + Input + Error)
- Card (Header + Body + Footer)
- SearchBar (Input + Button)
- Atom'ların kombinasyonu

### Organisms (Karmaşık Yapılar)
- Header (Logo + Navigation + UserMenu)
- Sidebar (Navigation + User + Settings)
- DataTable (Header + Body + Pagination)
- Molecule'lerin kombinasyonu

### Templates (Sayfa Şablonları)
- DashboardLayout (Sidebar + Header + Content)
- AuthLayout (Centered + Card)
- PublicLayout (Header + Content + Footer)
- Sayfa yapıları

## Kullanım

```typescript
import { Button } from '@/presentation/components/ui/atoms/button';
import { Card } from '@/presentation/components/ui/atoms/card';
import { ProgramForm } from '@/presentation/components/features/programs/ProgramForm';
```

