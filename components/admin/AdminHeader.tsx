'use client';
import Link from 'next/link';
import { useState } from 'react';

import NotificationBell from '@/components/notifications/NotificationBell';
interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  showTimer?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  onSignOut?: () => void;
}
export default function AdminHeader({
  title = 'Admin Paneli',
  subtitle,
  showTimer = true,
  showSearch = true,
  searchPlaceholder = 'Hızlı arama...',
  onSearch,
  showNotifications = true,
  showUserMenu = true,
  onSignOut,
}: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotificationsDropdown, setShowNotificationsDropdown] =
    useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [timer, setTimer] = useState('00:00:00');
  // Timer effect
  useState(() => {
    if (showTimer) {
      const interval = setInterval(() => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        setTimer(`${hours}:${minutes}:${seconds}`);
      }, 1000);
      return () => clearInterval(interval);
    }
  });
  const notifications = [
    {
      id: 1,
      type: 'info',
      message: '8 yeni randevu talebi var',
      time: '2 dk önce',
      unread: true,
    },
    {
      id: 2,
      type: 'warning',
      message: 'Sistem bakımı planlandı',
      time: '15 dk önce',
      unread: true,
    },
    {
      id: 3,
      type: 'success',
      message: 'Aylık rapor hazırlandı',
      time: '1 saat önce',
      unread: false,
    },
    {
      id: 4,
      type: 'error',
      message: 'API bağlantı hatası düzeltildi',
      time: '3 saat önce',
      unread: false,
    },
  ];
  const unreadNotifications = notifications.filter(n => n.unread).length;
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };
  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    }
  };
  return (
    <header className='fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40'>
      <div className='flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16'>
        {/* Left side - Logo and Title */}
        <div className='flex items-center gap-4'>
          <Link href='/admin' className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
              <i className='ri-admin-line text-white text-lg'></i>
            </div>
            <span className='text-xl font-bold text-gray-900'>
              İhracat Akademi
            </span>
          </Link>
          {subtitle && (
            <div className='hidden md:flex items-center gap-2 text-gray-500'>
              <i className='ri-arrow-right-s-line'></i>
              <span className='text-sm'>{subtitle}</span>
            </div>
          )}
        </div>
        {/* Center - Search */}
        {showSearch && (
          <div className='flex-1 max-w-md mx-4'>
            <form onSubmit={handleSearch} className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <i className='ri-search-line text-gray-400 text-sm'></i>
              </div>
              <input
                type='text'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
              />
            </form>
          </div>
        )}
        {/* Right side - Timer, Notifications, User Menu */}
        <div className='flex items-center gap-4'>
          {/* Timer */}
          {showTimer && (
            <div className='hidden sm:flex items-center gap-2 text-gray-600 text-sm font-mono'>
              <i className='ri-time-line'></i>
              <span>{timer}</span>
            </div>
          )}
          {/* Notifications */}
          {showNotifications && (
            <NotificationBell userEmail='admin@ihracatakademi.com' />
          )}
          {/* User Menu */}
          {showUserMenu && (
            <div className='relative'>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors'
              >
                <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center'>
                  <span className='text-white text-sm font-medium'>A</span>
                </div>
                <div className='hidden sm:block text-left'>
                  <p className='text-sm font-medium text-gray-900'>Admin</p>
                  <p className='text-xs text-gray-500'>
                    admin@ihracatakademi.com
                  </p>
                </div>
                <i className='ri-arrow-down-s-line text-gray-400'></i>
              </button>
              {showUserDropdown && (
                <div className='absolute right-0 top-12 w-48 bg-white shadow-lg rounded-lg border border-gray-200 py-2 z-50'>
                  <Link
                    href='/admin/profil'
                    className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
                  >
                    <i className='ri-user-line mr-2'></i>
                    Profil Bilgileri
                  </Link>
                  <Link
                    href='/admin/ayarlar'
                    className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
                  >
                    <i className='ri-settings-3-line mr-2'></i>
                    Hesap Ayarları
                  </Link>
                  <div className='border-t border-gray-100 my-1'></div>
                  <button
                    onClick={handleSignOut}
                    className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50'
                  >
                    <i className='ri-logout-box-r-line mr-2'></i>
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Click outside handlers */}
      {showNotificationsDropdown && (
        <div
          className='fixed inset-0 z-30'
          onClick={() => setShowNotificationsDropdown(false)}
        ></div>
      )}
      {showUserDropdown && (
        <div
          className='fixed inset-0 z-30'
          onClick={() => setShowUserDropdown(false)}
        ></div>
      )}
    </header>
  );
}
