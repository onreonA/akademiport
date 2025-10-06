'use client';

import { Bell, ChevronDown, Menu, Search, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuthStore } from '@/lib/stores/auth-store';

interface MinimalHeaderProps {
  onSidebarToggle: () => void;
}

export default function MinimalHeader({ onSidebarToggle }: MinimalHeaderProps) {
  const { user, signOut } = useAuthStore();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    // Çıkış yap butonuna basıldı
    signOut();
    setIsProfileOpen(false);
    router.push('/giris');
    // Redirect yapıldı
  };

  return (
    <header className='bg-white shadow-lg border-b border-gray-200 px-3 py-2 fixed top-0 left-0 right-0 z-50'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          {/* Sidebar Toggle Button */}
          <button
            onClick={onSidebarToggle}
            className='hidden md:block px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200'
          >
            <Menu className='w-5 h-5 text-gray-600' />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={onSidebarToggle}
            className='md:hidden px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200'
          >
            <Menu className='w-5 h-5 text-gray-600' />
          </button>

          {/* Header Title */}
          <div>
            <h1 className='text-lg font-semibold text-gray-900'>Ana Panel</h1>
            <p className='text-xs text-gray-500'>Firma yönetim merkezi</p>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className='flex items-center space-x-3'>
          {/* Search Button */}
          <button className='p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200'>
            <Search className='w-5 h-5 text-gray-600' />
          </button>

          {/* Notifications */}
          <div className='relative'>
            <button className='p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 relative'>
              <Bell className='w-5 h-5 text-gray-600' />
              <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center'>
                4
              </span>
            </button>
          </div>

          {/* Profile Dropdown */}
          <div className='relative'>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className='flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200'
            >
              <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center'>
                <User className='w-4 h-4 text-white' />
              </div>
              <div className='text-left'>
                <p className='text-sm font-medium text-gray-900'>
                  {user?.full_name ? user.full_name.split(' ')[0] : 'Firma'}
                </p>
                <p className='text-xs text-gray-500'>
                  {user?.email || 'admin@firma.com'}
                </p>
              </div>
              <ChevronDown className='w-4 h-4 text-gray-600' />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50'>
                <Link
                  href='/firma/profil'
                  className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                  onClick={() => setIsProfileOpen(false)}
                >
                  Profil Ayarları
                </Link>
                <Link
                  href='/firma/ayarlar'
                  className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                  onClick={() => setIsProfileOpen(false)}
                >
                  Genel Ayarlar
                </Link>
                <hr className='my-1' />
                <button
                  onClick={handleLogout}
                  className='block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100'
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
