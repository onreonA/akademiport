'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import CompanyProjectManagement from './CompanyProjectManagement';
const MenuItem = ({
  icon,
  title,
  isActive,
  onClick,
  href,
  sidebarCollapsed,
}: {
  icon: string;
  title: string;
  isActive?: boolean;
  onClick: () => void;
  href?: string;
  sidebarCollapsed?: boolean;
}) => {
  const router = useRouter();
  const handleClick = () => {
    onClick();
    if (href) {
      router.push(href);
    }
  };
  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
        isActive
          ? 'bg-blue-100 text-blue-900 font-semibold'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <div className='w-6 h-6 flex items-center justify-center flex-shrink-0'>
        <i className={`${icon} text-lg`}></i>
      </div>
      {!sidebarCollapsed && <span className='ml-3 truncate'>{title}</span>}
    </button>
  );
};
export default function ProjectsPageClient() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('projects');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest('.notification-dropdown') &&
        !target.closest('.notification-button')
      ) {
        setShowNotifications(false);
      }
      if (
        !target.closest('.user-menu-dropdown') &&
        !target.closest('.user-menu-button')
      ) {
        setShowUserMenu(false);
      }
    };
    if (mounted) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [mounted]);
  const notifications = [
    {
      id: 1,
      type: 'info',
      message: 'Yeni proje eklendi',
      time: '5 dk önce',
      unread: true,
    },
    {
      id: 2,
      type: 'success',
      message: 'Proje görevi tamamlandı',
      time: '20 dk önce',
      unread: true,
    },
    {
      id: 3,
      type: 'warning',
      message: 'Proje teslim tarihi yaklaşıyor',
      time: '1 saat önce',
      unread: false,
    },
  ];
  const unreadNotifications = notifications.filter(n => n.unread).length;
  const handleMenuItemClick = (menuItem: string) => {
    setActiveMenuItem(menuItem);
  };
  if (!mounted) {
    return null;
  }
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center gap-6'>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer'
              >
                <i
                  className={`ri-menu-line text-lg text-gray-600 transition-transform duration-200`}
                ></i>
              </button>
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
                <span className='text-gray-900 font-medium'>Projelerim</span>
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
              <div className='hidden lg:flex relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
                  <i className='ri-search-line text-gray-400 text-sm'></i>
                </div>
                <input
                  type='text'
                  placeholder='Hızlı arama...'
                  className='w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                />
              </div>
              <div className='flex items-center gap-2'>
                <button
                  className='w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer'
                  title='Eğitimlerim'
                >
                  <i className='ri-graduation-cap-line text-lg'></i>
                </button>
                <button
                  className='w-9 h-9 flex items-center justify-center rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors cursor-pointer'
                  title='Dökümanlarım'
                >
                  <i className='ri-file-text-line text-lg'></i>
                </button>
                <button
                  className='w-9 h-9 flex items-center justify-center rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors cursor-pointer'
                  title='Raporlarım'
                >
                  <i className='ri-bar-chart-line text-lg'></i>
                </button>
              </div>
              <div className='w-px h-6 bg-gray-300'></div>
              <div className='relative'>
                <button
                  className='notification-button w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer relative'
                  onClick={e => {
                    e.stopPropagation();
                    setShowNotifications(!showNotifications);
                  }}
                >
                  <i className='ri-notification-3-line text-gray-600 text-xl'></i>
                  {unreadNotifications > 0 && (
                    <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center'>
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className='notification-dropdown absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50'>
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
                      {notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 ${notification.unread ? 'bg-blue-50' : ''}`}
                        >
                          <div className='flex items-start gap-3'>
                            <div
                              className={`w-2 h-2 rounded-full mt-2 ${
                                notification.type === 'info'
                                  ? 'bg-blue-500'
                                  : notification.type === 'warning'
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                              }`}
                            ></div>
                            <div className='flex-1'>
                              <p className='text-sm text-gray-900'>
                                {notification.message}
                              </p>
                              <p className='text-xs text-gray-500 mt-1'>
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className='relative'>
                <button
                  className='user-menu-button flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer'
                  onClick={e => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                >
                  <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center'>
                    <span className='text-white text-sm font-medium'>AY</span>
                  </div>
                  <i className='ri-arrow-down-s-line text-gray-500 text-sm'></i>
                </button>
                {showUserMenu && (
                  <div className='user-menu-dropdown absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50'>
                    <div className='p-4 border-b border-gray-100'>
                      <p className='font-medium text-gray-900'>Ahmet Yılmaz</p>
                      <p className='text-sm text-gray-500'>
                        Tekno Elektronik A.Ş.
                      </p>
                    </div>
                    <div className='py-2'>
                      <button className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2'>
                        <i className='ri-user-line text-gray-400'></i>
                        Profil Bilgileri
                      </button>
                      <button className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2'>
                        <i className='ri-settings-3-line text-gray-400'></i>
                        Hesap Ayarları
                      </button>
                      <button className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2'>
                        <i className='ri-question-line text-gray-400'></i>
                        Yardım & Destek
                      </button>
                      <hr className='my-2 border-gray-100' />
                      <button className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2'>
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
      </header>
      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg transition-all duration-300 fixed left-0 top-16 h-full z-30 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
      >
        <div className='h-full overflow-y-auto'>
          <nav className='p-2 space-y-1'>
            <MenuItem
              icon='ri-dashboard-3-line'
              title='Ana Panel'
              isActive={activeMenuItem === 'dashboard'}
              onClick={() => handleMenuItemClick('dashboard')}
              href='/firma'
              sidebarCollapsed={sidebarCollapsed}
            />
            {sidebarCollapsed ? (
              <>
                <div className='my-4 border-t border-gray-200 mx-2'></div>
                <MenuItem
                  icon='ri-play-circle-line'
                  title='Videolar'
                  isActive={activeMenuItem === 'education-videos'}
                  onClick={() => handleMenuItemClick('education-videos')}
                  href='/firma/egitimlerim/videolar'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-file-text-line'
                  title='Dökümanlar'
                  isActive={activeMenuItem === 'education-documents'}
                  onClick={() => handleMenuItemClick('education-documents')}
                  href='/firma/egitimlerim/dokumanlar'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <div className='my-4 border-t border-gray-200 mx-2'></div>
                <MenuItem
                  icon='ri-folder-3-line'
                  title='Projelerim'
                  isActive={true}
                  onClick={() => handleMenuItemClick('projects')}
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-calendar-check-line'
                  title='Randevularım'
                  isActive={activeMenuItem === 'appointments'}
                  onClick={() => handleMenuItemClick('appointments')}
                  href='/firma/randevularim'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-calendar-event-line'
                  title='Etkinlikler'
                  isActive={activeMenuItem === 'events'}
                  onClick={() => handleMenuItemClick('events')}
                  href='/firma/etkinlikler'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-chat-3-line'
                  title='Forum'
                  isActive={activeMenuItem === 'forum'}
                  onClick={() => handleMenuItemClick('forum')}
                  href='/firma/forum'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-newspaper-line'
                  title='Haberler'
                  isActive={activeMenuItem === 'news'}
                  onClick={() => handleMenuItemClick('news')}
                  href='/firma/haberler'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-team-line'
                  title='İK Havuzu'
                  isActive={activeMenuItem === 'hr-pool'}
                  onClick={() => handleMenuItemClick('hr-pool')}
                  href='/firma/ik-havuzu'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-bar-chart-line'
                  title='Raporlama ve Analiz'
                  isActive={activeMenuItem === 'reports-analysis'}
                  onClick={() => handleMenuItemClick('reports-analysis')}
                  href='/firma/raporlama-analiz'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-building-line'
                  title='Firma Yönetimi'
                  isActive={activeMenuItem === 'company-management'}
                  onClick={() => handleMenuItemClick('company-management')}
                  href='/firma/firma-yonetimi'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <div className='my-4 border-t border-gray-200 mx-2'></div>
                <MenuItem
                  icon='ri-settings-3-line'
                  title='Genel Ayarlar'
                  isActive={activeMenuItem === 'general-settings'}
                  onClick={() => handleMenuItemClick('general-settings')}
                  href='/firma/ayarlar'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-user-settings-line'
                  title='Kullanıcı Yönetimi'
                  isActive={activeMenuItem === 'user-management'}
                  onClick={() => handleMenuItemClick('user-management')}
                  href='/firma/ayarlar'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-notification-3-line'
                  title='Bildirim Tercihleri'
                  isActive={activeMenuItem === 'notification-settings'}
                  onClick={() => handleMenuItemClick('notification-settings')}
                  href='/firma/ayarlar'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-shield-keyhole-line'
                  title='Şifre ve Güvenlik'
                  isActive={activeMenuItem === 'security-settings'}
                  onClick={() => handleMenuItemClick('security-settings')}
                  href='/firma/ayarlar'
                  sidebarCollapsed={sidebarCollapsed}
                />
              </>
            ) : (
              <>
                <div className='my-4 border-t border-gray-200'></div>
                <div className='px-3 py-2'>
                  <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Eğitimlerim
                  </p>
                </div>
                <MenuItem
                  icon='ri-play-circle-line'
                  title='Videolar'
                  isActive={activeMenuItem === 'education-videos'}
                  onClick={() => handleMenuItemClick('education-videos')}
                  href='/firma/egitimlerim/videolar'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-file-text-line'
                  title='Dökümanlar'
                  isActive={activeMenuItem === 'education-documents'}
                  onClick={() => handleMenuItemClick('education-documents')}
                  href='/firma/egitimlerim/dokumanlar'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <div className='my-4 border-t border-gray-200'></div>
                <MenuItem
                  icon='ri-folder-3-line'
                  title='Projelerim'
                  isActive={true}
                  onClick={() => handleMenuItemClick('projects')}
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-calendar-check-line'
                  title='Randevularım'
                  isActive={activeMenuItem === 'appointments'}
                  onClick={() => handleMenuItemClick('appointments')}
                  href='/firma/randevularim'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-calendar-event-line'
                  title='Etkinlikler'
                  isActive={activeMenuItem === 'events'}
                  onClick={() => handleMenuItemClick('events')}
                  href='/firma/etkinlikler'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-chat-3-line'
                  title='Forum'
                  isActive={activeMenuItem === 'forum'}
                  onClick={() => handleMenuItemClick('forum')}
                  href='/firma/forum'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-newspaper-line'
                  title='Haberler'
                  isActive={activeMenuItem === 'news'}
                  onClick={() => handleMenuItemClick('news')}
                  href='/firma/haberler'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-team-line'
                  title='İK Havuzu'
                  isActive={activeMenuItem === 'hr-pool'}
                  onClick={() => handleMenuItemClick('hr-pool')}
                  href='/firma/ik-havuzu'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-bar-chart-line'
                  title='Raporlama ve Analiz'
                  isActive={activeMenuItem === 'reports-analysis'}
                  onClick={() => handleMenuItemClick('reports-analysis')}
                  href='/firma/raporlama-analiz'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-building-line'
                  title='Firma Yönetimi'
                  isActive={activeMenuItem === 'company-management'}
                  onClick={() => handleMenuItemClick('company-management')}
                  href='/firma/firma-yonetimi'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <div className='my-4 border-t border-gray-200'></div>
                <div className='px-3 py-2'>
                  <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Firma Ayarları
                  </p>
                </div>
                <MenuItem
                  icon='ri-settings-3-line'
                  title='Genel Ayarlar'
                  isActive={activeMenuItem === 'general-settings'}
                  onClick={() => handleMenuItemClick('general-settings')}
                  href='/firma/ayarlar'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-user-settings-line'
                  title='Kullanıcı Yönetimi'
                  isActive={activeMenuItem === 'user-management'}
                  onClick={() => handleMenuItemClick('user-management')}
                  href='/firma/ayarlar'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-notification-3-line'
                  title='Bildirim Tercihleri'
                  isActive={activeMenuItem === 'notification-settings'}
                  onClick={() => handleMenuItemClick('notification-settings')}
                  href='/firma/ayarlar'
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-shield-keyhole-line'
                  title='Şifre ve Güvenlik'
                  isActive={activeMenuItem === 'security-settings'}
                  onClick={() => handleMenuItemClick('security-settings')}
                  href='/firma/ayarlar'
                  sidebarCollapsed={sidebarCollapsed}
                />
              </>
            )}
          </nav>
        </div>
      </div>
      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden'
          onClick={() => setSidebarCollapsed(true)}
        ></div>
      )}
      {/* Main Content */}
      <div
        className={`transition-all duration-300 pt-20 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}
      >
        <CompanyProjectManagement />
      </div>
    </div>
  );
}
