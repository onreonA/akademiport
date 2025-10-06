# Header ve Sidebar Kodları - Git Revert Sonrası Yeniden Uygulama

## 📅 Tarih: 2024-01-27

## 🎯 Amaç: Git revert sonrası header/sidebar'ı yeniden uygulamak

---

## 📁 1. MINIMAL HEADER COMPONENT

### Dosya: `components/MinimalHeader.tsx`

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User
} from 'lucide-react';

interface MinimalHeaderProps {
  onSidebarToggle: () => void;
}

export default function MinimalHeader({ onSidebarToggle }: MinimalHeaderProps) {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle Button */}
          <button
            onClick={onSidebarToggle}
            className="hidden md:block p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Header Title */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">Ana Panel</h1>
            <p className="text-sm text-gray-500">Firma yönetim merkezi</p>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {/* Search Button */}
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                4
              </span>
            </button>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Firma Adı</p>
                <p className="text-xs text-gray-500">admin@firma.com</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <Link
                  href="/firma/profil"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Profil Ayarları
                </Link>
                <Link
                  href="/firma/ayarlar"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Genel Ayarlar
                </Link>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
```

---

## 📁 2. ANIMATED SIDEBAR COMPONENT

### Dosya: `components/AnimatedSidebar.tsx`

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building,
  BookOpen,
  BarChart3,
  Calendar,
  ClipboardList,
  Newspaper,
  MessageSquare,
  UserCheck,
  Users,
  User,
  Settings,
  ChevronRight
} from 'lucide-react';

interface AnimatedSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AnimatedSidebar({ collapsed, onToggle }: AnimatedSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const menuItems = [
    {
      id: 'firma-yonetimi',
      title: 'Firma Yönetimi',
      href: '/firma/firma-yonetimi',
      icon: Building,
      color: 'red'
    },
    {
      id: 'egitimlerim',
      title: 'Eğitimlerim',
      href: '/firma/egitimlerim',
      icon: BookOpen,
      color: 'green',
      hasSubmenu: true,
      subItems: [
        { title: 'Aktif Eğitimler', href: '/firma/egitimlerim/aktif' },
        { title: 'Tamamlanan Eğitimler', href: '/firma/egitimlerim/tamamlanan' },
        { title: 'Sertifikalarım', href: '/firma/egitimlerim/sertifikalar' }
      ]
    },
    {
      id: 'proje-yonetimi',
      title: 'Proje Yönetimim',
      href: '/firma/proje-yonetimi',
      icon: BarChart3,
      color: 'purple'
    },
    {
      id: 'etkinlikler',
      title: 'Etkinlikler',
      href: '/firma/etkinlikler',
      icon: Calendar,
      color: 'yellow'
    },
    {
      id: 'randevularim',
      title: 'Randevularım',
      href: '/firma/randevularim',
      icon: ClipboardList,
      color: 'emerald'
    },
    {
      id: 'haberler',
      title: 'Haberler',
      href: '/firma/haberler',
      icon: Newspaper,
      color: 'blue'
    },
    {
      id: 'forum',
      title: 'Forum',
      href: '/firma/forum',
      icon: MessageSquare,
      color: 'pink'
    },
    {
      id: 'ik-havuzu',
      title: 'İK Havuzu',
      href: '/firma/ik-havuzu',
      icon: UserCheck,
      color: 'cyan'
    },
    {
      id: 'raporlama-analiz',
      title: 'Raporlarım',
      href: '/firma/raporlama-analiz',
      icon: BarChart3,
      color: 'violet'
    }
  ];

  const settingsItems = [
    {
      id: 'firma-yonetimi-settings',
      title: 'Firma Yönetimi',
      href: '/firma/firma-yonetimi',
      icon: Building,
      color: 'blue'
    },
    {
      id: 'kullanici-yonetimi',
      title: 'Kullanıcı Yönetimi',
      href: '/firma/kullanici-yonetimi',
      icon: Users,
      color: 'orange'
    },
    {
      id: 'profil',
      title: 'Profil Yönetimi',
      href: '/firma/profil',
      icon: User,
      color: 'indigo'
    },
    {
      id: 'ayarlar',
      title: 'Genel Ayarlar',
      href: '/firma/ayarlar',
      icon: Settings,
      color: 'gray'
    }
  ];

  const getColorClasses = (color: string, isActive: boolean = false) => {
    const baseClasses = "transition-all duration-200";
    const hoverClasses = "hover:bg-gradient-to-r hover:from-${color}-50 hover:to-${color}-100 hover:text-${color}-700 hover:border-${color}-400";
    const activeClasses = isActive ? `bg-gradient-to-r from-${color}-500 to-${color}-600 text-white shadow-lg border-l-4 border-${color}-400` : `text-gray-700 border-l-4 border-transparent`;

    return `${baseClasses} ${hoverClasses} ${activeClasses}`;
  };

  const getIconColorClasses = (color: string, isActive: boolean = false) => {
    return isActive ? "text-white" : `text-gray-600 group-hover:text-${color}-600`;
  };

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ease-in-out min-h-screen ${collapsed ? 'w-16' : 'w-52'} hidden md:block`}>
      <nav className="p-2 space-y-1 pt-4">
        {/* Ana Menü Öğeleri */}
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const isExpanded = expandedItems.includes(item.id);

          return (
            <div key={item.id}>
              {item.hasSubmenu ? (
                <div>
                  <div
                    className={`group relative flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${getColorClasses(item.color, isActive)}`}
                    onClick={() => toggleExpanded(item.id)}
                  >
                    <div className="flex items-center justify-center mr-3">
                      <div className={`transition-all duration-200 ${getIconColorClasses(item.color, isActive)}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="truncate">{item.title}</span>
                      <div className="flex items-center space-x-2">
                        <ChevronRight
                          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Alt Menü */}
                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.subItems?.map((subItem, index) => (
                        <Link
                          key={index}
                          href={subItem.href}
                          className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200"
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link href={item.href}>
                  <div className={`group relative flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${getColorClasses(item.color, isActive)}`}>
                    <div className="flex items-center justify-center mr-3">
                      <div className={`transition-all duration-200 ${getIconColorClasses(item.color, isActive)}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="truncate">{item.title}</span>
                      <div className="flex items-center space-x-2"></div>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          );
        })}

        {/* Ayarlar Bölümü */}
        <div className="my-4 border-t border-gray-200">
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">AYARLAR</h3>
          </div>
        </div>

        {/* Ayarlar Menü Öğeleri */}
        {settingsItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link key={item.id} href={item.href}>
              <div className={`group relative flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${getColorClasses(item.color, isActive)}`}>
                <div className="flex items-center justify-center mr-3">
                  <div className={`transition-all duration-200 ${getIconColorClasses(item.color, isActive)}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="truncate">{item.title}</span>
                  <div className="flex items-center space-x-2"></div>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
```

---

## 📁 3. UYGULAMA ADIMLARI

### Git Revert Sonrası Yeniden Uygulama:

1. **Component'leri Oluştur:**

   ```bash
   # MinimalHeader component'ini oluştur
   mkdir -p components
   # Yukarıdaki MinimalHeader kodunu components/MinimalHeader.tsx'e kopyala

   # AnimatedSidebar component'ini oluştur
   # Yukarıdaki AnimatedSidebar kodunu components/AnimatedSidebar.tsx'e kopyala
   ```

2. **Sayfalara Entegrasyon:**

   ```typescript
   // Her sayfaya eklenecek import'lar
   import MinimalHeader from '@/components/MinimalHeader';
   import AnimatedSidebar from '@/components/AnimatedSidebar';

   // Her sayfanın return kısmına eklenecek yapı
   return (
     <div className="min-h-screen bg-gray-50">
       <MinimalHeader onSidebarToggle={() => {}} />
       <div className="flex">
         <AnimatedSidebar collapsed={false} onToggle={() => {}} />

         {/* Main Content */}
         <div className="flex-1">
           <main className="p-6">
             <div className="max-w-7xl mx-auto">
               {/* Sayfa içeriği buraya */}
             </div>
           </main>
         </div>
       </div>
     </div>
   );
   ```

3. **Loading State Güncelleme:**
   ```typescript
   if (loading) {
     return (
       <div className="min-h-screen bg-gray-50">
         <MinimalHeader onSidebarToggle={() => {}} />
         <div className="flex">
           <AnimatedSidebar collapsed={false} onToggle={() => {}} />
           <div className="flex-1">
             <main className="p-6">
               <div className="max-w-7xl mx-auto">
                 {/* Loading animasyonu */}
               </div>
             </main>
           </div>
         </div>
       </div>
     );
   }
   ```

---

## 📝 4. ÖNEMLİ NOTLAR

### Renk Sınıfları:

- **red:** Firma Yönetimi
- **green:** Eğitimlerim
- **purple:** Proje Yönetimim
- **yellow:** Etkinlikler
- **emerald:** Randevularım
- **blue:** Haberler
- **pink:** Forum
- **cyan:** İK Havuzu
- **violet:** Raporlarım

### Responsive Özellikler:

- Sidebar mobilde gizlenir (`hidden md:block`)
- Header'da mobil menü butonu var
- Collapse/expand animasyonları

### Menü Yapısı:

- Ana menü öğeleri
- Alt menüler (Eğitimlerim için)
- Ayarlar bölümü
- Aktif sayfa vurgulaması

---

## ✅ 5. TEST ADIMLARI

1. **Component'lerin Oluşturulması:**
   - MinimalHeader.tsx dosyası oluşturuldu mu?
   - AnimatedSidebar.tsx dosyası oluşturuldu mu?

2. **Sayfa Entegrasyonu:**
   - Import'lar eklendi mi?
   - Layout yapısı güncellendi mi?
   - Loading state güncellendi mi?

3. **Fonksiyonalite Testi:**
   - Menü linkleri çalışıyor mu?
   - Aktif sayfa vurgulanıyor mu?
   - Responsive tasarım çalışıyor mu?

4. **API Entegrasyonu:**
   - Sayfa içerikleri yükleniyor mu?
   - API çağrıları çalışıyor mu?
   - Hata durumları yönetiliyor mu?

---

## 🎯 SONUÇ

Bu dosya, git revert sonrası header ve sidebar'ı hızlıca yeniden uygulamak için gerekli tüm kodları içerir. Sadece bu kodları kopyalayıp yapıştırarak modern tasarımı geri getirebilirsiniz.
