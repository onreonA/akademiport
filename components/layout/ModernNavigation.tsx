'use client';
import Link from 'next/link';
import { useState } from 'react';
export default function ModernNavigation() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const handleMouseEnter = (menu: string) => {
    setActiveDropdown(menu);
  };
  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };
  return (
    <nav className='bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl'>
        <div className='flex justify-between items-center h-20'>
          {/* Modern Logo */}
          <div className='flex items-center'>
            <div className='flex items-center space-x-3'>
              <div className='w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center'>
                <i className='ri-global-line text-white text-2xl w-7 h-7 flex items-center justify-center'></i>
              </div>
              <div>
                <span className="font-['Inter'] font-black text-xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent tracking-tight">
                  AKADEMİ PORT
                </span>
              </div>
            </div>
          </div>
          {/* Modern Navigation Menu */}
          <div className='hidden lg:flex items-center space-x-1'>
            <Link
              href='/'
              className='px-3 py-2 text-gray-800 hover:text-blue-900 font-medium text-sm transition-all duration-300 rounded-lg hover:bg-blue-50 cursor-pointer whitespace-nowrap'
            >
              Anasayfa
            </Link>
            {/* Program Hakkında - Basit Link */}
            <Link
              href='/program-hakkinda'
              className='px-3 py-2 text-gray-800 hover:text-blue-900 font-medium text-sm transition-all duration-300 rounded-lg hover:bg-blue-50 cursor-pointer whitespace-nowrap'
            >
              Program Hakkında
            </Link>
            {/* Destekler - Basit Link */}
            <Link
              href='/destekler'
              className='px-3 py-2 text-gray-800 hover:text-blue-900 font-medium text-sm transition-all duration-300 rounded-lg hover:bg-blue-50 cursor-pointer whitespace-nowrap'
            >
              Destekler
            </Link>
            {/* Platform Özellikleri - Basit Link */}
            <Link
              href='/platform-ozellikleri'
              className='px-3 py-2 text-gray-800 hover:text-blue-900 font-medium text-sm transition-all duration-300 rounded-lg hover:bg-blue-50 cursor-pointer whitespace-nowrap'
            >
              Platform Özellikleri
            </Link>
            <Link
              href='/basari-hikayeleri'
              className='px-3 py-2 text-gray-800 hover:text-blue-900 font-medium text-sm transition-all duration-300 rounded-lg hover:bg-blue-50 cursor-pointer whitespace-nowrap'
            >
              Başarı Hikayeleri
            </Link>
            <Link
              href='/sss'
              className='px-3 py-2 text-gray-800 hover:text-blue-900 font-medium text-sm transition-all duration-300 rounded-lg hover:bg-blue-50 cursor-pointer whitespace-nowrap'
            >
              SSS
            </Link>
            <Link
              href='/iletisim-basvuru'
              className='px-3 py-2 text-gray-800 hover:text-blue-900 font-medium text-sm transition-all duration-300 rounded-lg hover:bg-blue-50 cursor-pointer whitespace-nowrap'
            >
              İletişim & Başvuru
            </Link>
            <Link
              href='/kariyer'
              className='px-3 py-2 text-gray-800 hover:text-blue-900 font-medium text-sm transition-all duration-300 rounded-lg hover:bg-blue-50 cursor-pointer whitespace-nowrap'
            >
              Kariyer
            </Link>
          </div>
          {/* Modern CTA Button */}
          <div className='flex items-center space-x-4'>
            <Link
              href='/giris'
              className='bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white w-12 h-12 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center'
              title='Giriş Yap'
            >
              <i className='ri-login-circle-line w-6 h-6 flex items-center justify-center'></i>
            </Link>
          </div>
          {/* Mobile Menu Button */}
          <div className='lg:hidden'>
            <button className='p-2 rounded-lg text-gray-700 hover:bg-gray-100'>
              <i className='ri-menu-line text-2xl w-6 h-6 flex items-center justify-center'></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
