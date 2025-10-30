# 🎨 Layout System Documentation

## Genel Bakış

Akademi Port projesi için modern, responsive ve rol-bazlı dashboard layout sistemi.

## 📁 Dosya Yapısı

```
src/
├── 1-presentation/
│   └── components/
│       └── features/
│           └── layout/
│               ├── DashboardLayout.tsx      # Ana layout wrapper
│               ├── AppHeader.tsx            # Header component
│               ├── AppSidebar.tsx           # Desktop sidebar
│               ├── MobileSidebar.tsx        # Mobile overlay sidebar
│               ├── BottomNavigation.tsx     # Mobile bottom nav
│               ├── Breadcrumbs.tsx          # Breadcrumb navigation
│               ├── UserMenu.tsx             # User dropdown menu
│               ├── SidebarMenuItem.tsx      # Menu item component
│               ├── CommandPalette.tsx       # Cmd+K quick navigation
│               ├── QuickActionsFAB.tsx      # Floating action button
│               └── index.ts                 # Exports
├── 5-shared/
│   ├── contexts/
│   │   └── SidebarContext.tsx              # Sidebar state management
│   ├── constants/
│   │   └── navigation.ts                   # Role-based menu config
│   └── hooks/
│       └── useRecentPages.ts               # Recent pages tracker
└── app/
    ├── dashboard/
    │   └── layout.tsx                      # Master Admin layout
    ├── consultant-dashboard/
    │   └── layout.tsx                      # Consultant layout
    └── company-dashboard/
        └── layout.tsx                      # Company layout
```

## 🎯 Özellikler

### ✅ Temel Özellikler

1. **Collapsible Sidebar**
   - Açılıp kapanabilen sidebar (64px ↔ 256px)
   - localStorage'da state persistence
   - 5.5 saniye sonra otomatik kapanma
   - Smooth transitions (300ms)

2. **Role-Based Navigation**
   - Master Admin: Programlar, Firmalar, Kullanıcılar, Raporlar
   - Consultant: Dashboard, Programlarım, Firmalar, Görevler, Eğitimler
   - Company Admin: Dashboard, Kullanıcılar, Projeler, Eğitimler, Ayarlar
   - Company User: Dashboard, Projelerim, Eğitimlerim

3. **Responsive Design**
   - Desktop: Collapsible sidebar
   - Tablet: Collapsible sidebar
   - Mobile: Overlay sidebar + Bottom navigation

4. **Sub-menus**
   - Açılır kapanır alt menüler
   - Active route detection
   - Icon + text kombinasyonu

### 🎁 Bonus Özellikler

1. **Command Palette (⌘K / Ctrl+K)**
   - Spotlight-style hızlı navigasyon
   - Son ziyaretler
   - Tüm menü itemlerine erişim
   - Fuzzy search

2. **Recent Pages**
   - Son 5 ziyaret edilen sayfa
   - localStorage persistence
   - Sidebar'da gösterim

3. **Notifications**
   - Header'da bildirim ikonu
   - Badge ile sayı gösterimi
   - (Backend entegrasyonu bekleniyor)

4. **Quick Actions FAB**
   - Floating Action Button
   - Hızlı yeni kayıt oluşturma
   - Role-based actions
   - Smooth animations

5. **Breadcrumbs**
   - Dinamik breadcrumb navigation
   - Current path tracking
   - Clickable navigation

6. **Dark Mode**
   - Light/Dark tema desteği
   - System preference detection
   - Smooth transitions

## 🚀 Kullanım

### Layout Entegrasyonu

```tsx
// app/dashboard/layout.tsx
import { DashboardLayout } from '@/presentation/components/features/layout';

export default function MasterAdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
```

### Custom Navigation

```tsx
// src/5-shared/constants/navigation.ts
export const CUSTOM_NAVIGATION: NavigationConfig = {
  main: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    // ... more items
  ],
  bottom: [
    {
      id: 'settings',
      label: 'Ayarlar',
      icon: Settings,
      href: '/settings',
    },
  ],
};
```

## 📱 Responsive Breakpoints

```css
Mobile:  < 768px   → Overlay sidebar + Bottom nav
Tablet:  768-1024px → Collapsible sidebar
Desktop: > 1024px   → Expanded sidebar (default)
```

## 🎨 Design Tokens

### Sidebar

- **Collapsed Width:** 64px (4rem)
- **Expanded Width:** 256px (16rem)
- **Transition:** 300ms ease-in-out

### Header

- **Height:** 56px (3.5rem)
- **Z-Index:** 50

### Sidebar

- **Z-Index:** 40

### Mobile Overlay

- **Z-Index:** 30

### Content

- **Z-Index:** 10

## 🔧 Konfigürasyon

### Auto-Collapse Timer

```tsx
// src/5-shared/contexts/SidebarContext.tsx
const timer = setTimeout(() => {
  setIsCollapsed(true);
}, 5500); // 5.5 seconds
```

### Recent Pages Limit

```tsx
// src/5-shared/hooks/useRecentPages.ts
const MAX_RECENT_PAGES = 5;
```

### Bottom Nav Items

```tsx
// src/1-presentation/components/features/layout/BottomNavigation.tsx
const bottomNavItems = navigation.main.slice(0, 4); // First 4 items
```

## 🎯 Keyboard Shortcuts

- **⌘K / Ctrl+K:** Command Palette açma/kapama
- **Esc:** Command Palette kapatma

## 🔐 Role-Based Access

```tsx
import { getNavigationByRole } from '@/shared/constants/navigation';
import { UserRole } from '@/domain/enums/UserRole';

const navigation = getNavigationByRole(UserRole.MASTER_ADMIN);
```

## 📊 State Management

### Sidebar State

```tsx
import { useSidebar } from '@/shared/contexts/SidebarContext';

const {
  isCollapsed,
  isMobileOpen,
  toggleSidebar,
  collapseSidebar,
  expandSidebar,
  toggleMobileSidebar,
  closeMobileSidebar,
} = useSidebar();
```

### Recent Pages

```tsx
import { useRecentPages } from '@/shared/hooks/useRecentPages';

const recentPages = useRecentPages();
// Returns: RecentPage[] = [{ path, title, timestamp }]
```

## 🎨 Theming

Layout sistemi Tailwind CSS ve `next-themes` kullanır:

- Light mode: `bg-background`, `text-foreground`
- Dark mode: `dark:bg-background`, `dark:text-foreground`
- Accent colors: `bg-accent`, `text-accent-foreground`

## 🧪 Testing

```bash
# Development server
npm run dev

# Type check
npx tsc --noEmit

# Linter
npm run lint
```

## 📝 TODO

- [ ] Notifications backend entegrasyonu
- [ ] User avatar upload
- [ ] Settings sayfası
- [ ] Profile sayfası
- [ ] Keyboard navigation (Tab, Arrow keys)
- [ ] Accessibility audit (ARIA labels)
- [ ] Animation preferences (prefers-reduced-motion)

## 🐛 Known Issues

- CompanyForm'da TypeScript hataları (layout sistemiyle ilgili değil)
- Notification count şu an mock data

## 📚 Dependencies

- `next`: ^16.0.1
- `next-themes`: ^0.4.4
- `lucide-react`: ^0.468.0
- `@radix-ui/react-*`: Various
- `tailwindcss`: ^3.4.1

## 🤝 Contributing

Layout sistemine katkıda bulunmak için:

1. Feature branch oluştur
2. Değişiklikleri yap
3. Type check ve lint çalıştır
4. PR oluştur

## 📄 License

MIT

---

**Son Güncelleme:** 29 Ekim 2025
**Versiyon:** 1.0.0
**Yazar:** AI Assistant + Ömer Ünsal
