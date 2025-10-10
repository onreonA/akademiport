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
    <header className='bg-white/80 backdrop-blur-xl shadow-xl border-b border-white/20 px-4 py-2 fixed top-0 left-0 right-0 z-50'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          {/* Modern Sidebar Toggle Button */}
          <button
            onClick={onSidebarToggle}
            className='hidden md:block px-3 py-2 rounded-xl hover:bg-white/60 transition-all duration-200'
          >
            <Menu className='w-5 h-5 text-gray-600' />
          </button>

          {/* Modern Mobile Menu Button */}
          <button
            onClick={onSidebarToggle}
            className='md:hidden px-3 py-2 rounded-xl hover:bg-white/60 transition-all duration-200'
          >
            <Menu className='w-5 h-5 text-gray-600' />
          </button>

          {/* Modern Logo + Title */}
          <div className='flex items-center space-x-3'>
            <div className='w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg'>
              <i className='ri-global-line text-white text-lg'></i>
            </div>
            <div>
              <h1 className='text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'>
                AKADEMİ PORT
              </h1>
              <p className='text-xs text-gray-500'>Firma Paneli</p>
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className='flex items-center space-x-3'>
          {/* Modern Search Bar */}
          <div className='relative hidden md:block'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input 
              className='w-64 pl-10 pr-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-500 shadow-sm'
              placeholder='Hızlı arama...'
            />
          </div>

          {/* Mobile Search Button */}
          <button className='md:hidden p-2 rounded-xl hover:bg-white/60 transition-all duration-200'>
            <Search className='w-5 h-5 text-gray-600' />
          </button>

          {/* Enhanced Notifications */}
          <div className='relative'>
            <button className='p-2 rounded-xl hover:bg-white/60 transition-all duration-200 relative'>
              <Bell className='w-5 h-5 text-gray-600' />
              <span className='absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg'>
                4
              </span>
            </button>
          </div>

          {/* Modern Profile Section */}
          <div className='relative'>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className='flex items-center space-x-3 p-2 rounded-xl hover:bg-white/60 transition-all duration-200'
            >
              <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg'>
                <User className='w-4 h-4 text-white' />
              </div>
              <div className='text-left hidden sm:block'>
                <p className='text-sm font-semibold text-gray-900'>
                  {user?.full_name ? user.full_name.split(' ')[0] : 'Firma'}
                </p>
                <p className='text-xs text-gray-500'>
                  {user?.email || 'admin@firma.com'}
                </p>
              </div>
              <ChevronDown className='w-4 h-4 text-gray-500' />
            </button>

            {/* Modern Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className='absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 py-2 z-50'>
                <Link
                  href='/firma/profil'
                  className='block px-4 py-2 text-sm text-gray-700 hover:bg-white/60 rounded-lg mx-2 transition-all duration-200'
                  onClick={() => setIsProfileOpen(false)}
                >
                  Profil Ayarları
                </Link>
                <Link
                  href='/firma/ayarlar'
                  className='block px-4 py-2 text-sm text-gray-700 hover:bg-white/60 rounded-lg mx-2 transition-all duration-200'
                  onClick={() => setIsProfileOpen(false)}
                >
                  Genel Ayarlar
                </Link>
                <hr className='my-1 border-white/20' />
                <button
                  onClick={handleLogout}
                  className='block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-white/60 rounded-lg mx-2 transition-all duration-200'
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
