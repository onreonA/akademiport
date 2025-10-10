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
      notifications: 0,
    },
    {
      id: 'egitimlerim',
      title: 'Eğitimlerim',
      href: '/firma/egitimlerim',
      icon: BookOpen,
      color: 'green',
      notifications: 3,
    },
    {
      id: 'proje-yonetimi',
      title: 'Proje Yönetimim',
      href: '/firma/proje-yonetimi',
      icon: BarChart3,
      color: 'purple',
      notifications: 1,
    },
    {
      id: 'etkinlikler',
      title: 'Etkinlikler',
      href: '/firma/etkinlikler',
      icon: Calendar,
      color: 'yellow',
      notifications: 0,
    },
    {
      id: 'randevularim',
      title: 'Randevularım',
      href: '/firma/randevularim',
      icon: ClipboardList,
      color: 'emerald',
      notifications: 2,
    },
    {
      id: 'haberler',
      title: 'Haberler',
      href: '/firma/haberler',
      icon: Newspaper,
      color: 'blue',
      notifications: 0,
    },
    {
      id: 'forum',
      title: 'Forum',
      href: '/firma/forum',
      icon: MessageSquare,
      color: 'pink',
      notifications: 5,
    },
    {
      id: 'ik-havuzu',
      title: 'İK Havuzu',
      href: '/firma/ik-havuzu',
      icon: UserCheck,
      color: 'cyan',
      notifications: 0,
    },
    {
      id: 'raporlar',
      title: 'Değerlendirme',
      href: '/firma/raporlar',
      icon: BarChart3,
      color: 'violet',
      notifications: 0,
    },
    {
      id: 'tarih-yonetimi',
      title: 'Tarih Yönetimi',
      href: '/firma/tarih-yonetimi',
      icon: Calendar,
      color: 'indigo',
      notifications: 0,
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
    const baseClasses =
      'transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg';

    if (isActive) {
      // Aktif durum için modern gradient renkler
      const activeColorMap: { [key: string]: string } = {
        red: 'bg-gradient-to-r from-red-500 via-red-600 to-pink-600 text-white shadow-lg border-l-4 border-red-400 rounded-lg',
        green:
          'bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 text-white shadow-xl border-l-4 border-emerald-400 rounded-lg',
        purple:
          'bg-gradient-to-r from-purple-500 via-violet-600 to-purple-700 text-white shadow-xl border-l-4 border-purple-400 rounded-lg',
        yellow:
          'bg-gradient-to-r from-amber-500 via-yellow-600 to-orange-500 text-white shadow-xl border-l-4 border-amber-400 rounded-lg',
        emerald:
          'bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 text-white shadow-xl border-l-4 border-emerald-400 rounded-lg',
        blue: 'bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600 text-white shadow-xl border-l-4 border-blue-400 rounded-lg',
        pink: 'bg-gradient-to-r from-pink-500 via-rose-600 to-pink-700 text-white shadow-xl border-l-4 border-pink-400 rounded-lg',
        cyan: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white shadow-xl border-l-4 border-cyan-400 rounded-lg',
        violet:
          'bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-600 text-white shadow-xl border-l-4 border-violet-400 rounded-lg',
        orange:
          'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-xl border-l-4 border-orange-400 rounded-lg',
        indigo:
          'bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600 text-white shadow-xl border-l-4 border-indigo-400 rounded-lg',
        gray: 'bg-gradient-to-r from-gray-500 via-gray-600 to-slate-600 text-white shadow-xl border-l-4 border-gray-400 rounded-lg',
      };
      return `${baseClasses} ${activeColorMap[color] || activeColorMap['gray']}`;
    } else {
      // Inactive durum için - modern glassmorphism hover effects
      return `${baseClasses} text-gray-700 border-l-4 border-transparent hover:bg-white/40 hover:backdrop-blur-sm hover:shadow-md hover:border-gray-300 rounded-lg`;
    }
  };

  const getIconClasses = (color: string, isActive: boolean = false) => {
    if (isActive) {
      return 'text-white';
    } else {
      const iconColorMap: { [key: string]: string } = {
        red: 'text-red-600 border border-red-200',
        green: 'text-emerald-600 border border-emerald-200',
        purple: 'text-purple-600 border border-purple-200',
        yellow: 'text-amber-600 border border-amber-200',
        emerald: 'text-emerald-600 border border-emerald-200',
        blue: 'text-blue-600 border border-blue-200',
        pink: 'text-pink-600 border border-pink-200',
        cyan: 'text-cyan-600 border border-cyan-200',
        violet: 'text-violet-600 border border-violet-200',
        orange: 'text-orange-600 border border-orange-200',
        indigo: 'text-indigo-600 border border-indigo-200',
        gray: 'text-gray-600 border border-gray-200',
      };
      
      // Collapsed durumda tek tip gri renk
      const collapsedStyle = collapsed ? 'text-gray-600 border border-gray-200' : iconColorMap[color] || iconColorMap['gray'];
      
      return `w-7 h-7 rounded-lg flex items-center justify-start pl-1 transition-all duration-300 hover:scale-105 bg-white/40 hover:bg-white/60 ${collapsedStyle}`;
    }
  };

  return (
    <div
      className={`transition-all duration-300 ease-in-out min-h-full ${collapsed ? 'w-16' : 'w-52'} bg-white/60 backdrop-blur-sm border-r border-white/30`}
    >
      <nav className='p-2 space-y-0.5 pt-4'>
        {/* Ana Menü Öğeleri */}
        {menuItems.map(item => {
          const isActive = pathname === item.href;
          const isExpanded = expandedItems.includes(item.id);

          return (
            <div key={item.id}>
              {item.hasSubmenu ? (
                <div>
                  <div
                    className={`group relative flex items-center px-2 py-2 text-sm font-medium cursor-pointer ${getColorClasses(item.color, isActive)}`}
                    onClick={() => toggleExpanded(item.id)}
                  >
                    <div className='flex items-center justify-start mr-2 relative'>
                      <div className={getIconClasses(item.color, isActive)}>
                        <item.icon className='w-5 h-5' />
                      </div>
                      {item.notifications > 0 && collapsed && (
                        <span className='absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold'>
                          {item.notifications > 9 ? '9+' : item.notifications}
                        </span>
                      )}
                    </div>
                    <div className='flex-1 flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <span
                          className={`truncate transition-all duration-200 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}
                        >
                          {item.title}
                        </span>
                        {item.notifications > 0 && !collapsed && (
                          <span className='w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold'>
                            {item.notifications > 9 ? '9+' : item.notifications}
                          </span>
                        )}
                      </div>
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
                          className='block px-2 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200'
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
                    className={`group relative flex items-center px-2 py-2 text-sm font-medium cursor-pointer ${getColorClasses(item.color, isActive)}`}
                  >
                    <div className='flex items-center justify-start mr-2 relative'>
                      <div className={getIconClasses(item.color, isActive)}>
                        <item.icon className='w-5 h-5' />
                      </div>
                      {item.notifications > 0 && collapsed && (
                        <span className='absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold'>
                          {item.notifications > 9 ? '9+' : item.notifications}
                        </span>
                      )}
                    </div>
                    <div className='flex-1 flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <span
                          className={`truncate transition-all duration-200 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}
                        >
                          {item.title}
                        </span>
                        {item.notifications > 0 && !collapsed && (
                          <span className='w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold'>
                            {item.notifications > 9 ? '9+' : item.notifications}
                          </span>
                        )}
                      </div>
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
          <div className='my-4 border-t border-white/20'>
            <div className='px-2 py-2'>
              <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent'>
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
                className={`group relative flex items-center px-2 py-2 text-sm font-medium cursor-pointer ${getColorClasses(item.color, isActive)}`}
              >
                <div className='flex items-center justify-center mr-2'>
                  <div className={getIconClasses(item.color, isActive)}>
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
