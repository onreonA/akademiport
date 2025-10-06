'use client';

import {
  BarChart3,
  BookOpen,
  Building,
  Calendar,
  ChevronRight,
  ClipboardList,
  Layout,
  MessageSquare,
  Newspaper,
  Settings,
  User,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AnimatedSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AnimatedSidebar({
  collapsed,
  onToggle,
}: AnimatedSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      href: '/firma',
      icon: Layout,
      color: 'red',
    },
    {
      id: 'egitimlerim',
      title: 'Eğitimlerim',
      href: '/firma/egitimlerim',
      icon: BookOpen,
      color: 'green',
    },
    {
      id: 'proje-yonetimi',
      title: 'Proje Yönetimim',
      href: '/firma/proje-yonetimi',
      icon: BarChart3,
      color: 'purple',
    },
    {
      id: 'etkinlikler',
      title: 'Etkinlikler',
      href: '/firma/etkinlikler',
      icon: Calendar,
      color: 'yellow',
    },
    {
      id: 'randevularim',
      title: 'Randevularım',
      href: '/firma/randevularim',
      icon: ClipboardList,
      color: 'emerald',
    },
    {
      id: 'haberler',
      title: 'Haberler',
      href: '/firma/haberler',
      icon: Newspaper,
      color: 'blue',
    },
    {
      id: 'forum',
      title: 'Forum',
      href: '/firma/forum',
      icon: MessageSquare,
      color: 'pink',
    },
    {
      id: 'ik-havuzu',
      title: 'İK Havuzu',
      href: '/firma/ik-havuzu',
      icon: UserCheck,
      color: 'cyan',
    },
    {
      id: 'raporlar',
      title: 'Değerlendirme Raporları',
      href: '/firma/raporlar',
      icon: BarChart3,
      color: 'violet',
    },
    {
      id: 'tarih-yonetimi',
      title: 'Tarih Yönetimi',
      href: '/firma/tarih-yonetimi',
      icon: Calendar,
      color: 'indigo',
    },
  ];

  const settingsItems = [
    {
      id: 'firma-yonetimi-settings',
      title: 'Firma Yönetimi',
      href: '/firma/firma-yonetimi',
      icon: Building,
      color: 'blue',
    },
    {
      id: 'kullanici-yonetimi',
      title: 'Kullanıcı Yönetimi',
      href: '/firma/kullanici-yonetimi',
      icon: Users,
      color: 'orange',
    },
    {
      id: 'profil',
      title: 'Profil Yönetimi',
      href: '/firma/profil',
      icon: User,
      color: 'indigo',
    },
    {
      id: 'ayarlar',
      title: 'Genel Ayarlar',
      href: '/firma/ayarlar',
      icon: Settings,
      color: 'gray',
    },
  ];

  const getColorClasses = (color: string, isActive: boolean = false) => {
    const baseClasses = 'transition-all duration-200 transform hover:scale-105';

    if (isActive) {
      // Aktif durum için sabit renkler
      const activeColorMap: { [key: string]: string } = {
        red: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg border-l-4 border-red-400',
        green:
          'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg border-l-4 border-emerald-400',
        purple:
          'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg border-l-4 border-purple-400',
        yellow:
          'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg border-l-4 border-amber-400',
        emerald:
          'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg border-l-4 border-emerald-400',
        blue: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border-l-4 border-blue-400',
        pink: 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg border-l-4 border-pink-400',
        cyan: 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg border-l-4 border-cyan-400',
        violet:
          'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-lg border-l-4 border-violet-400',
        orange:
          'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg border-l-4 border-orange-400',
        indigo:
          'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg border-l-4 border-indigo-400',
        gray: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg border-l-4 border-gray-400',
      };
      return `${baseClasses} ${activeColorMap[color] || activeColorMap['gray']}`;
    } else {
      // Inactive durum için - gelişmiş hover effects
      return `${baseClasses} text-gray-700 border-l-4 border-transparent hover:bg-gray-50 hover:shadow-md hover:border-gray-300`;
    }
  };

  const getIconColorClasses = (color: string, isActive: boolean = false) => {
    if (isActive) {
      return 'text-white';
    } else {
      const iconColorMap: { [key: string]: string } = {
        red: 'text-gray-600 group-hover:text-red-600',
        green: 'text-gray-600 group-hover:text-emerald-600',
        purple: 'text-gray-600 group-hover:text-purple-600',
        yellow: 'text-gray-600 group-hover:text-amber-600',
        emerald: 'text-gray-600 group-hover:text-emerald-600',
        blue: 'text-gray-600 group-hover:text-blue-600',
        pink: 'text-gray-600 group-hover:text-pink-600',
        cyan: 'text-gray-600 group-hover:text-cyan-600',
        violet: 'text-gray-600 group-hover:text-violet-600',
        orange: 'text-gray-600 group-hover:text-orange-600',
        indigo: 'text-gray-600 group-hover:text-indigo-600',
        gray: 'text-gray-600 group-hover:text-gray-600',
      };
      return iconColorMap[color] || iconColorMap['gray'];
    }
  };

  return (
    <div
      className={`transition-all duration-300 ease-in-out min-h-full ${collapsed ? 'w-16' : 'w-52'}`}
    >
      <nav className='p-2 space-y-1 pt-4'>
        {/* Ana Menü Öğeleri */}
        {menuItems.map(item => {
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
                    <div className='flex items-center justify-center mr-3'>
                      <div
                        className={`transition-all duration-200 ${getIconColorClasses(item.color, isActive)}`}
                      >
                        <item.icon className='w-5 h-5' />
                      </div>
                    </div>
                    <div className='flex-1 flex items-center justify-between'>
                      <span
                        className={`truncate transition-all duration-200 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}
                      >
                        {item.title}
                      </span>
                      <div
                        className={`flex items-center space-x-2 transition-all duration-200 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}
                      >
                        <ChevronRight
                          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Alt Menü */}
                  {isExpanded && !collapsed && (
                    <div className='ml-6 mt-1 space-y-1'>
                      {item.subItems?.map((subItem, index) => (
                        <Link
                          key={index}
                          href={subItem.href}
                          className='block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200'
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link href={item.href}>
                  <div
                    className={`group relative flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${getColorClasses(item.color, isActive)}`}
                  >
                    <div className='flex items-center justify-center mr-3'>
                      <div
                        className={`transition-all duration-200 ${getIconColorClasses(item.color, isActive)}`}
                      >
                        <item.icon className='w-5 h-5' />
                      </div>
                    </div>
                    <div className='flex-1 flex items-center justify-between'>
                      <span
                        className={`truncate transition-all duration-200 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}
                      >
                        {item.title}
                      </span>
                      <div className='flex items-center space-x-2'></div>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          );
        })}

        {/* Ayarlar Bölümü */}
        {!collapsed && (
          <div className='my-4 border-t border-gray-200'>
            <div className='px-3 py-2'>
              <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                AYARLAR
              </h3>
            </div>
          </div>
        )}

        {/* Ayarlar Menü Öğeleri */}
        {settingsItems.map(item => {
          const isActive = pathname === item.href;

          return (
            <Link key={item.id} href={item.href}>
              <div
                className={`group relative flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${getColorClasses(item.color, isActive)}`}
              >
                <div className='flex items-center justify-center mr-3'>
                  <div
                    className={`transition-all duration-200 ${getIconColorClasses(item.color, isActive)}`}
                  >
                    <item.icon className='w-5 h-5' />
                  </div>
                </div>
                <div className='flex-1 flex items-center justify-between'>
                  <span
                    className={`truncate transition-all duration-200 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}
                  >
                    {item.title}
                  </span>
                  <div className='flex items-center space-x-2'></div>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
