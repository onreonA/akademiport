'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import GlobalSearch from '@/components/ui/GlobalSearch';
import { useAuthStore } from '@/lib/stores/auth-store';

interface FirmaHeaderProps {
  currentPage?: string;
  currentTime?: Date;
  onSearch?: (query: string) => void;
  onNotificationsClick?: () => void;
  onUserMenuClick?: () => void;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  unreadNotifications?: number;
  onNewAppointmentClick?: () => void;
  signOut?: () => void;
}

export default function FirmaHeader({
  currentPage = 'Firma Paneli',
  currentTime: propCurrentTime,
  onSearch,
  onNotificationsClick,
  onUserMenuClick,
  showNotifications: propShowNotifications = false,
  showUserMenu: propShowUserMenu = false,
  unreadNotifications: propUnreadNotifications = 0,
  onNewAppointmentClick,
  signOut,
}: FirmaHeaderProps) {
  const { user } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(propCurrentTime || new Date());
  const [showNotifications, setShowNotifications] = useState(
    propShowNotifications
  );
  const [showUserMenu, setShowUserMenu] = useState(propShowUserMenu);
  const [unreadNotifications] = useState(propUnreadNotifications);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className='bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40'>
      <div className='px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center py-3'>
          <div className='flex items-center gap-6'>
            <Link href='/' className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg'>
                <i className='ri-global-line text-white text-lg w-5 h-5 flex items-center justify-center'></i>
              </div>
              <div className='flex flex-col'>
                <span className="font-['Pacifico'] text-xl text-blue-900 leading-tight">
                  İhracat Akademi
                </span>
                <span className='text-xs text-gray-500 font-medium'>
                  Firma Paneli
                </span>
              </div>
            </Link>

            <nav className='hidden md:flex items-center text-sm text-gray-500'>
              <Link
                href='/firma'
                className='hover:text-blue-600 cursor-pointer'
              >
                Firma Paneli
              </Link>
              <i className='ri-arrow-right-s-line mx-1'></i>
              <span className='text-gray-900 font-medium'>{currentPage}</span>
            </nav>
          </div>

          <div className='flex items-center gap-3'>
            <div className='hidden lg:flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg'>
              <i className='ri-time-line text-gray-400 text-sm'></i>
              <span
                className='text-sm text-gray-600 font-mono'
                suppressHydrationWarning={true}
              >
                {currentTime.toLocaleTimeString('tr-TR')}
              </span>
            </div>

            <div className='hidden lg:flex'>
              <GlobalSearch
                placeholder='Hızlı arama...'
                className='w-64'
                maxResults={8}
              />
            </div>

            <div className='flex items-center gap-2'>
              <Link href='/firma/egitimlerim/videolar'>
                <button
                  className='w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer'
                  title='Eğitimlerim'
                >
                  <i className='ri-graduation-cap-line text-lg'></i>
                </button>
              </Link>

              <Link href='/firma/egitimlerim/dokumanlar'>
                <button
                  className='w-9 h-9 flex items-center justify-center rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors cursor-pointer'
                  title='Dökümanlarım'
                >
                  <i className='ri-file-text-line text-lg'></i>
                </button>
              </Link>

              <Link href='/firma/raporlama-analiz'>
                <button
                  className='w-9 h-9 flex items-center justify-center rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors cursor-pointer'
                  title='Raporlarım'
                >
                  <i className='ri-bar-chart-line text-lg'></i>
                </button>
              </Link>
            </div>

            <div className='w-px h-6 bg-gray-300'></div>

            <div className='relative'>
              <button
                onClick={e => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                }}
                className='w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer relative'
              >
                <i className='ri-notification-3-line text-gray-600 text-xl'></i>
                {unreadNotifications > 0 && (
                  <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center'>
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className='absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50'
                  onClick={e => e.stopPropagation()}
                >
                  <div className='p-4 border-b border-gray-100'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-gray-900'>
                        Bildirimler
                      </h3>
                      <span className='text-xs text-gray-500'>
                        {unreadNotifications} okunmamış
                      </span>
                    </div>
                  </div>
                  <div className='max-h-64 overflow-y-auto'>
                    <div className='p-4 border-b border-gray-100'>
                      <div className='flex items-start gap-3'>
                        <div className='w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0'></div>
                        <div className='flex-1'>
                          <p className='text-sm font-medium text-gray-900'>
                            Yeni eğitim modülü eklendi
                          </p>
                          <p className='text-xs text-gray-500 mt-1'>
                            İhracat Finansmanı modülü kullanıma açıldı
                          </p>
                          <p className='text-xs text-gray-400 mt-1'>
                            2 saat önce
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className='p-4 border-b border-gray-100'>
                      <div className='flex items-start gap-3'>
                        <div className='w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0'></div>
                        <div className='flex-1'>
                          <p className='text-sm font-medium text-gray-900'>
                            SWOT analizi tamamlanmadı
                          </p>
                          <p className='text-xs text-gray-500 mt-1'>
                            Firma SWOT analizinizi tamamlayınız
                          </p>
                          <p className='text-xs text-gray-400 mt-1'>
                            1 gün önce
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='p-3 border-t border-gray-100'>
                    <button className='w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium'>
                      Tüm bildirimleri görüntüle
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className='relative'>
              <button
                onClick={e => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
                className='flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer'
              >
                <div className='w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium'>
                  {(
                    (user as any)?.companyData?.authorizedPerson?.charAt(0) ||
                    (user as any)?.companyData?.name?.charAt(0) ||
                    'Y'
                  ).toUpperCase()}
                </div>
                <div className='hidden lg:flex flex-col items-start'>
                  <span className='text-sm font-medium text-gray-900'>
                    {(user as any)?.companyData?.authorizedPerson ||
                      'Yetkili Kişi'}
                  </span>
                  <span className='text-xs text-gray-500'>
                    {(user as any)?.companyData?.name || 'Firma Adı'}
                  </span>
                </div>
                <i className='ri-arrow-down-s-line text-gray-400 text-sm'></i>
              </button>

              {showUserMenu && (
                <div
                  className='absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50'
                  onClick={e => e.stopPropagation()}
                >
                  <div className='p-4 border-b border-gray-100'>
                    <p className='font-medium text-gray-900'>
                      {(user as any)?.companyData?.authorizedPerson ||
                        'Yetkili Kişi'}
                    </p>
                    <p className='text-sm text-gray-500'>
                      {(user as any)?.companyData?.name || 'Firma Adı'}
                    </p>
                  </div>
                  <div className='py-2'>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                      }}
                      className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2'
                    >
                      <i className='ri-user-line text-gray-400'></i>
                      Profil Bilgileri
                    </button>
                    <button
                      onClick={() => {
                        window.location.href = '/firma/ayarlar';
                      }}
                      className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2'
                    >
                      <i className='ri-settings-3-line text-gray-400'></i>
                      Hesap Ayarları
                    </button>
                    <hr className='my-2 border-gray-100' />
                    <button
                      onClick={() => {
                        if (signOut) {
                          signOut();
                        }
                      }}
                      className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2'
                    >
                      <i className='ri-logout-box-line text-red-400'></i>
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {showNotifications && (
        <div
          className='fixed inset-0 z-30'
          onClick={() => setShowNotifications(false)}
        ></div>
      )}

      {showUserMenu && (
        <div
          className='fixed inset-0 z-30'
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </header>
  );
}
