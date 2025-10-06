'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import NotificationBell from '@/components/notifications/NotificationBell';
import GlobalSearch from '@/components/ui/GlobalSearch';
interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  showNotifications?: boolean;
}

interface MenuItem {
  icon: string;
  title: string;
  href?: string;
  active: boolean;
  description?: string;
  hasSubMenu?: boolean;
  subItems?: MenuItem[];
}
export default function AdminLayout({
  children,
  title,
  description,
  showNotifications = true,
}: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([
    'Proje Yönetimi',
  ]);
  const pathname = usePathname();

  const toggleMenuExpansion = (menuTitle: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuTitle)
        ? prev.filter(item => item !== menuTitle)
        : [...prev, menuTitle]
    );
  };

  const isMenuExpanded = (menuTitle: string) =>
    expandedMenus.includes(menuTitle);

  const menuItems: MenuItem[] = [
    {
      icon: 'ri-dashboard-line',
      title: 'Ana Panel',
      href: '/admin',
      active: pathname === '/admin',
      description: 'Dashboard ve genel istatistikler',
    },
    {
      icon: 'ri-folder-line',
      title: 'Proje Yönetimi',
      href: '/admin/proje-yonetimi',
      active:
        pathname.startsWith('/admin/proje-yonetimi') ||
        pathname.startsWith('/admin/gorev-onaylari') ||
        pathname.startsWith('/admin/analytics') ||
        pathname.startsWith('/admin/tarih-yonetimi') ||
        pathname.startsWith('/admin/raporlama') ||
        pathname.startsWith('/admin/alt-proje-raporlari'),
      hasSubMenu: true,
      subItems: [
        {
          icon: 'ri-folder-line',
          title: 'Projeler',
          href: '/admin/proje-yonetimi',
          active: pathname.startsWith('/admin/proje-yonetimi'),
          description: 'Proje oluşturma, takip ve yönetimi',
        },
        {
          icon: 'ri-task-line',
          title: 'Görev Onayları',
          href: '/admin/gorev-onaylari',
          active: pathname.startsWith('/admin/gorev-onaylari'),
          description: 'Firma görevlerini onaylama ve yönetimi',
        },
        {
          icon: 'ri-bar-chart-line',
          title: 'Analytics',
          href: '/admin/analytics',
          active: pathname.startsWith('/admin/analytics'),
          description: 'Atama analitikleri ve performans raporları',
        },
        {
          icon: 'ri-calendar-check-line',
          title: 'Tarih Yönetimi',
          href: '/admin/tarih-yonetimi',
          active: pathname.startsWith('/admin/tarih-yonetimi'),
          description: 'Proje ve görev tarihlerini yönetin',
        },
        {
          icon: 'ri-file-chart-line',
          title: 'Raporlama',
          href: '/admin/raporlama',
          active: pathname.startsWith('/admin/raporlama'),
          description: 'Tarih uyumluluk ve performans raporları',
        },
        {
          icon: 'ri-file-text-line',
          title: 'Alt Proje Raporları',
          href: '/admin/alt-proje-raporlari',
          active: pathname.startsWith('/admin/alt-proje-raporlari'),
          description: 'Danışman değerlendirme raporları',
        },
      ],
    },
    {
      icon: 'ri-building-line',
      title: 'Firma Yönetimi',
      href: '/admin/firma-yonetimi',
      active:
        pathname.startsWith('/admin/firma-yonetimi') ||
        pathname.startsWith('/admin/firma-kullanici-yonetimi'),
      hasSubMenu: true,
      subItems: [
        {
          icon: 'ri-building-line',
          title: 'Firmalar',
          href: '/admin/firma-yonetimi',
          active:
            pathname.startsWith('/admin/firma-yonetimi') &&
            !pathname.startsWith('/admin/firma-kullanici-yonetimi'),
          description: 'Firma hesapları, bilgileri ve yönetimi',
        },
        {
          icon: 'ri-user-settings-line',
          title: 'Kullanıcı Yönetimi',
          href: '/admin/firma-kullanici-yonetimi',
          active: pathname.startsWith('/admin/firma-kullanici-yonetimi'),
          description: 'Firma kullanıcı hesapları oluşturma ve yönetimi',
        },
      ],
    },
    {
      icon: 'ri-user-line',
      title: 'Danışman Yönetimi',
      href: '/admin/danisman-yonetimi',
      active: pathname.startsWith('/admin/danisman-yonetimi'),
      description: 'Danışman profilleri, atamaları ve yönetimi',
    },
    {
      icon: 'ri-graduation-cap-line',
      title: 'Eğitim Yönetimi',
      href: '/admin/egitim-yonetimi',
      active: pathname.startsWith('/admin/egitim-yonetimi'),
      description: 'Video, doküman, eğitim seti yönetimi',
    },
    {
      icon: 'ri-calendar-line',
      title: 'Etkinlik Yönetimi',
      href: '/admin/etkinlik-yonetimi',
      active: pathname.startsWith('/admin/etkinlik-yonetimi'),
      description: 'Etkinlik oluşturma, düzenleme ve yönetimi',
    },
    {
      icon: 'ri-clipboard-list-line',
      title: 'Randevu Talepleri',
      href: '/admin/randevu-talepleri',
      active: pathname.startsWith('/admin/randevu-talepleri'),
      description: 'Randevu onayları, redleri ve yönetimi',
    },
    {
      icon: 'ri-file-text-line',
      title: 'Alt Proje Değerlendirme',
      href: '/admin/alt-proje-degerlendirme',
      active: pathname.startsWith('/admin/alt-proje-degerlendirme'),
      description: 'Alt proje tamamlama raporları ve değerlendirmeleri',
    },
    {
      icon: 'ri-bar-chart-line',
      title: 'Raporlama & Analiz',
      href: '/admin/raporlama-analiz',
      active: pathname.startsWith('/admin/raporlama-analiz'),
      description: 'Genel raporlar, istatistikler ve analizler',
    },
    {
      icon: 'ri-message-square-line',
      title: 'Forum Yönetimi',
      href: '/admin/forum-yonetimi',
      active:
        pathname.startsWith('/admin/forum-yonetimi') ||
        pathname.startsWith('/admin/forum-istatistikleri'),
      description: 'Forum moderasyonu, istatistikler ve yönetimi',
    },
    {
      icon: 'ri-newspaper-line',
      title: 'Haberler Yönetimi',
      href: '/admin/haberler-yonetimi',
      active: pathname.startsWith('/admin/haberler-yonetimi'),
      description: 'Haber içerikleri, düzenleme ve yayınlama',
    },
    {
      icon: 'ri-briefcase-line',
      title: 'Kariyer Portalı',
      href: '/admin/kariyer-portali',
      active: pathname.startsWith('/admin/kariyer-portali'),
      description: 'İş ilanları, başvurular ve kariyer yönetimi',
    },
  ];
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden'
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        {/* Logo */}
        <div className='flex items-center justify-between h-16 px-4 border-b border-gray-200'>
          {!sidebarCollapsed && (
            <div className='flex items-center'>
              <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                <i className='ri-building-line text-white text-lg'></i>
              </div>
              <span className='ml-3 text-lg font-semibold text-gray-900'>
                İhracat Akademi
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className='p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors'
          >
            <i
              className={`ri-${sidebarCollapsed ? 'menu-unfold' : 'menu-fold'}-line text-lg`}
            ></i>
          </button>
        </div>
        {/* Navigation Menu */}
        <nav className='flex-1 px-3 py-4 space-y-1 overflow-y-auto'>
          {menuItems.map((item, index) => (
            <div key={index} className='relative group'>
              {item.hasSubMenu ? (
                <>
                  {/* Main Menu Item with Submenu */}
                  <button
                    onClick={() => toggleMenuExpansion(item.title)}
                    className={`
                      w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200
                      ${
                        item.active
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <div className='flex items-center'>
                      <div
                        className={`
                        w-6 h-6 flex items-center justify-center flex-shrink-0
                        ${item.active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                      `}
                      >
                        <i className={`${item.icon} text-lg`}></i>
                      </div>
                      {!sidebarCollapsed && (
                        <span className='ml-3 truncate font-medium'>
                          {item.title}
                        </span>
                      )}
                    </div>
                    {!sidebarCollapsed && (
                      <div className='w-4 h-4 flex items-center justify-center'>
                        <i
                          className={`ri-arrow-right-s-line text-sm transition-transform duration-200 ${
                            isMenuExpanded(item.title) ? 'rotate-90' : ''
                          }`}
                        ></i>
                      </div>
                    )}
                  </button>

                  {/* Submenu Items */}
                  {!sidebarCollapsed &&
                    isMenuExpanded(item.title) &&
                    item.subItems && (
                      <div className='ml-6 mt-1 space-y-1'>
                        {item.subItems.map((subItem, subIndex) => (
                          <Link key={subIndex} href={subItem.href!}>
                            <div
                              className={`
                            flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-sm
                            ${
                              subItem.active
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }
                          `}
                            >
                              <div
                                className={`
                              w-4 h-4 flex items-center justify-center flex-shrink-0
                              ${subItem.active ? 'text-blue-600' : 'text-gray-400'}
                            `}
                              >
                                <i className={`${subItem.icon} text-sm`}></i>
                              </div>
                              <span className='ml-3 truncate'>
                                {subItem.title}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                </>
              ) : (
                /* Regular Menu Item */
                <Link href={item.href!}>
                  <div
                    className={`
                      flex items-center px-3 py-3 rounded-xl transition-all duration-200
                      ${
                        item.active
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <div
                      className={`
                      w-6 h-6 flex items-center justify-center flex-shrink-0
                      ${item.active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                    `}
                    >
                      <i className={`${item.icon} text-lg`}></i>
                    </div>
                    {!sidebarCollapsed && (
                      <span className='ml-3 truncate font-medium'>
                        {item.title}
                      </span>
                    )}
                  </div>
                </Link>
              )}
              {/* Hover Tooltip for collapsed sidebar */}
              {sidebarCollapsed && !item.hasSubMenu && (
                <div className='absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50'>
                  {item.title}
                  {item.description && (
                    <div className='text-xs text-gray-300 mt-1 max-w-xs'>
                      {item.description}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>
        {/* User Profile */}
        <div className='p-3 border-t border-gray-200'>
          <div className='flex items-center'>
            <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center'>
              <span className='text-white font-semibold text-sm'>AD</span>
            </div>
            {!sidebarCollapsed && (
              <div className='ml-3 flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900 truncate'>
                  Admin
                </p>
                <p className='text-xs text-gray-500 truncate'>
                  admin@ihracatakademi.com
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div
        className={`
        transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
      `}
      >
        {/* Header */}
        <header className='bg-white border-b border-gray-200 sticky top-0 z-30'>
          <div className='flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16'>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className='lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            >
              <i className='ri-menu-line text-xl'></i>
            </button>
            {/* Header Actions - Right Aligned */}
            <div className='flex items-center space-x-4 ml-auto'>
              {/* Search */}
              <div className='hidden sm:block'>
                <GlobalSearch
                  placeholder='Hızlı arama...'
                  className='w-64'
                  maxResults={8}
                />
              </div>
              {/* Notifications */}
              {showNotifications && (
                <NotificationBell userEmail='admin@ihracatakademi.com' />
              )}
              {/* User Menu */}
              <div className='relative'>
                <button className='flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors'>
                  <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center'>
                    <span className='text-white font-semibold text-sm'>AD</span>
                  </div>
                  <span className='hidden sm:block text-sm font-medium text-gray-700'>
                    Admin
                  </span>
                  <i className='ri-arrow-down-s-line text-gray-400'></i>
                </button>
              </div>
            </div>
          </div>
        </header>
        {/* Page Content */}
        <main className='p-4 sm:p-6 lg:p-8'>
          {/* Page Content */}
          {children}
        </main>
      </div>
    </div>
  );
}
