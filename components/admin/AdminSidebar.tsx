'use client';
import Link from 'next/link';
import { useState } from 'react';
interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  activeMenuItem?: string;
  onMenuItemClick?: (item: string) => void;
}
interface MenuItem {
  id: string;
  title: string;
  icon: string;
  href?: string;
  hasSubMenu?: boolean;
  subItems?: SubMenuItem[];
}
interface SubMenuItem {
  id: string;
  title: string;
  href: string;
}
const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Ana Panel',
    icon: 'ri-dashboard-line',
    href: '/admin',
  },
  {
    id: 'projects',
    title: 'Proje Yönetimi',
    icon: 'ri-folder-line',
    href: '/admin/proje-yonetimi',
  },
  {
    id: 'companies',
    title: 'Firma Yönetimi',
    icon: 'ri-building-line',
    href: '/admin/firma-yonetimi',
  },
  {
    id: 'consultants',
    title: 'Danışman Yönetimi',
    icon: 'ri-user-line',
    href: '/admin/danisman-yonetimi',
  },
  {
    id: 'education',
    title: 'Eğitim Yönetimi',
    icon: 'ri-graduation-cap-line',
    href: '/admin/egitim-yonetimi',
  },
  {
    id: 'events',
    title: 'Etkinlik Yönetimi',
    icon: 'ri-calendar-line',
    href: '/admin/etkinlik-yonetimi',
  },
  {
    id: 'appointments',
    title: 'Randevu Talepleri',
    icon: 'ri-clipboard-list-line',
    href: '/admin/randevu-talepleri',
  },
  {
    id: 'reporting',
    title: 'Raporlama & Analiz',
    icon: 'ri-bar-chart-line',
    href: '/admin/raporlama-analiz',
  },
  {
    id: 'forum',
    title: 'Forum Yönetimi',
    icon: 'ri-message-square-line',
    href: '/admin/forum-yonetimi',
  },
  {
    id: 'news',
    title: 'Haberler Yönetimi',
    icon: 'ri-newspaper-line',
    href: '/admin/haberler-yonetimi',
  },
  {
    id: 'career',
    title: 'Kariyer Portalı',
    icon: 'ri-briefcase-line',
    href: '/admin/kariyer-portali',
  },
  {
    id: 'settings',
    title: 'Sistem Ayarları',
    icon: 'ri-settings-3-line',
    href: '/admin/sistem-ayarlari',
  },
];
export default function AdminSidebar({
  collapsed = false,
  onToggle,
  activeMenuItem = 'dashboard',
  onMenuItemClick,
}: AdminSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };
  const handleMenuItemClick = (item: MenuItem) => {
    if (onMenuItemClick) {
      onMenuItemClick(item.id);
    }
    if (item.hasSubMenu) {
      toggleExpanded(item.id);
    }
  };
  const isExpanded = (itemId: string) => expandedItems.includes(itemId);
  const isActive = (itemId: string) => activeMenuItem === itemId;
  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-30 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className='flex items-center justify-between h-16 px-4 border-b border-gray-100'>
        {!collapsed && (
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
              <i className='ri-admin-line text-white text-lg'></i>
            </div>
            <span className='text-lg font-semibold text-gray-900'>Admin</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors'
        >
          <i
            className={`ri-menu-line text-gray-600 transition-transform duration-200 ${
              collapsed ? 'rotate-180' : ''
            }`}
          ></i>
        </button>
      </div>
      {/* Navigation */}
      <nav className='flex-1 overflow-y-auto py-4'>
        <div className='px-3 space-y-1'>
          {menuItems.map(item => (
            <div key={item.id}>
              {/* Main Menu Item */}
              <div className='relative'>
                {item.href ? (
                  <Link href={item.href}>
                    <button
                      onClick={() => handleMenuItemClick(item)}
                      className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
                        isActive(item.id)
                          ? 'bg-blue-100 text-blue-900 font-semibold'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <div className='w-6 h-6 flex items-center justify-center flex-shrink-0'>
                        <i className={`${item.icon} text-lg`}></i>
                      </div>
                      {!collapsed && (
                        <span className='ml-3 truncate'>{item.title}</span>
                      )}
                      {item.hasSubMenu && !collapsed && (
                        <div className='ml-auto w-4 h-4 flex items-center justify-center'>
                          <i
                            className={`ri-arrow-right-s-line text-sm transition-transform duration-200 ${
                              isExpanded(item.id) ? 'rotate-90' : ''
                            }`}
                          ></i>
                        </div>
                      )}
                    </button>
                  </Link>
                ) : (
                  <button
                    onClick={() => handleMenuItemClick(item)}
                    className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
                      isActive(item.id)
                        ? 'bg-blue-100 text-blue-900 font-semibold'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className='w-6 h-6 flex items-center justify-center flex-shrink-0'>
                      <i className={`${item.icon} text-lg`}></i>
                    </div>
                    {!collapsed && (
                      <span className='ml-3 truncate'>{item.title}</span>
                    )}
                    {item.hasSubMenu && !collapsed && (
                      <div className='ml-auto w-4 h-4 flex items-center justify-center'>
                        <i
                          className={`ri-arrow-right-s-line text-sm transition-transform duration-200 ${
                            isExpanded(item.id) ? 'rotate-90' : ''
                          }`}
                        ></i>
                      </div>
                    )}
                  </button>
                )}
              </div>
              {/* Sub Menu Items */}
              {item.hasSubMenu &&
                item.subItems &&
                isExpanded(item.id) &&
                !collapsed && (
                  <div className='ml-6 mt-1 space-y-1'>
                    {item.subItems.map(subItem => (
                      <Link key={subItem.id} href={subItem.href}>
                        <button
                          onClick={() => onMenuItemClick?.(subItem.id)}
                          className={`w-full flex items-center pl-9 pr-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                            isActive(subItem.id)
                              ? 'bg-blue-50 text-blue-800 font-medium'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                          }`}
                        >
                          <div className='w-2 h-2 bg-current rounded-full mr-3 opacity-60'></div>
                          {subItem.title}
                        </button>
                      </Link>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      </nav>
      {/* Footer */}
      {!collapsed && (
        <div className='p-4 border-t border-gray-100'>
          <div className='bg-gray-50 rounded-lg p-3'>
            <div className='flex items-center gap-2 mb-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full'></div>
              <span className='text-xs text-gray-600'>Sistem Aktif</span>
            </div>
            <p className='text-xs text-gray-500'>Son güncelleme: Bugün</p>
          </div>
        </div>
      )}
    </div>
  );
}
