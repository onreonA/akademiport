'use client';
import Link from 'next/link';
import { useState } from 'react';
interface Company {
  id: string;
  name: string;
  sector: string;
  city: string;
  consultant: string;
  registrationDate: string;
}
interface EducationProgress {
  setId: string;
  setName: string;
  totalVideos: number;
  watchedVideos: number;
  watchedPercentage: number;
  lastActivity: string;
  completedVideos: CompletedVideo[];
}
interface CompletedVideo {
  id: string;
  title: string;
  watchedAt: string;
  watchedPercentage: number;
  isCompleted: boolean;
}
const MenuItem = ({
  icon,
  title,
  isActive,
  onClick,
  hasSubMenu,
  isExpanded,
  href,
  sidebarCollapsed,
}: {
  icon: string;
  title: string;
  isActive?: boolean;
  onClick: () => void;
  hasSubMenu?: boolean;
  isExpanded?: boolean;
  href?: string;
  sidebarCollapsed?: boolean;
}) => {
  const content = (
    <button
      onClick={onClick}
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
      {hasSubMenu && !sidebarCollapsed && (
        <div className='ml-auto w-4 h-4 flex items-center justify-center'>
          <i
            className={`ri-arrow-right-s-line text-sm transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
          ></i>
        </div>
      )}
    </button>
  );
  if (href && !hasSubMenu) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
};
const SubMenuItem = ({
  title,
  isActive,
  onClick,
  href,
}: {
  title: string;
  isActive?: boolean;
  onClick: () => void;
  href?: string;
}) => {
  const content = (
    <button
      onClick={onClick}
      className={`w-full flex items-center pl-9 pr-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-blue-50 text-blue-800 font-medium'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
      }`}
    >
      <div className='w-2 h-2 bg-current rounded-full mr-3 opacity-60'></div>
      {title}
    </button>
  );
  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
};
const CompanyCard = ({
  company,
  onClick,
}: {
  company: Company;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 cursor-pointer'
  >
    <div className='flex items-start justify-between mb-4'>
      <div className='flex-1'>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          {company.name}
        </h3>
        <div className='space-y-1'>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <i className='ri-building-line text-blue-500'></i>
            <span>{company.sector}</span>
          </div>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <i className='ri-map-pin-line text-green-500'></i>
            <span>{company.city}</span>
          </div>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <i className='ri-user-line text-orange-500'></i>
            <span>{company.consultant}</span>
          </div>
        </div>
      </div>
      <i className='ri-arrow-right-s-line text-gray-400'></i>
    </div>
    <div className='text-xs text-gray-500'>
      Kayıt Tarihi:{' '}
      {new Date(company.registrationDate).toLocaleDateString('tr-TR')}
    </div>
  </div>
);
const EducationProgressCard = ({
  progress,
  onMarkCompleted,
}: {
  progress: EducationProgress;
  onMarkCompleted: (setId: string, videoId: string) => void;
}) => {
  const [showVideos, setShowVideos] = useState(false);
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
      <div className='flex justify-between items-start mb-4'>
        <div>
          <h3 className='font-semibold text-gray-900 mb-2'>
            {progress.setName}
          </h3>
          <div className='flex items-center gap-4 text-sm text-gray-600'>
            <span>
              {progress.watchedVideos}/{progress.totalVideos} video izlendi
            </span>
            <span className='text-blue-600'>{progress.watchedPercentage}%</span>
          </div>
        </div>
        <button
          onClick={() => setShowVideos(!showVideos)}
          className='text-blue-600 hover:text-blue-800 cursor-pointer'
        >
          <i
            className={`ri-${showVideos ? 'arrow-up' : 'arrow-down'}-s-line`}
          ></i>
        </button>
      </div>
      {/* Progress Bar */}
      <div className='w-full bg-gray-200 rounded-full h-3 mb-4'>
        <div
          className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(progress.watchedPercentage)}`}
          style={{ width: `${progress.watchedPercentage}%` }}
        ></div>
      </div>
      <div className='text-xs text-gray-500 mb-4'>
        Son Aktivite:{' '}
        {new Date(progress.lastActivity).toLocaleDateString('tr-TR')}
      </div>
      {/* Video Details */}
      {showVideos && (
        <div className='border-t border-gray-100 pt-4 space-y-3'>
          <h4 className='font-medium text-gray-900 text-sm'>
            Video Detayları:
          </h4>
          {progress.completedVideos.map(video => (
            <div
              key={video.id}
              className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
            >
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      video.isCompleted ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                  ></div>
                  <span className='text-sm font-medium text-gray-900'>
                    {video.title}
                  </span>
                </div>
                <div className='text-xs text-gray-500 mt-1'>
                  {video.isCompleted
                    ? `Tamamlandı - ${new Date(video.watchedAt).toLocaleDateString('tr-TR')}`
                    : `%${video.watchedPercentage} izlendi`}
                </div>
              </div>
              {!video.isCompleted && (
                <button
                  onClick={() => onMarkCompleted(progress.setId, video.id)}
                  className='text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded cursor-pointer'
                >
                  Tamamlandı İşaretle
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default function CompanyEducationTracking() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('company-tracking');
  const [educationExpanded, setEducationExpanded] = useState(true);
  const [projeExpanded, setProjeExpanded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [companies] = useState<Company[]>([
    {
      id: '1',
      name: 'Tekno Elektronik A.Ş.',
      sector: 'Elektronik',
      city: 'İstanbul',
      consultant: 'Ahmet Yılmaz',
      registrationDate: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      name: 'Global Tekstil Ltd.',
      sector: 'Tekstil',
      city: 'Bursa',
      consultant: 'Ayşe Kaya',
      registrationDate: '2024-01-20T14:15:00Z',
    },
    {
      id: '3',
      name: 'Makina Sanayi A.Ş.',
      sector: 'Makina',
      city: 'İzmir',
      consultant: 'Mehmet Demir',
      registrationDate: '2024-02-01T09:45:00Z',
    },
    {
      id: '4',
      name: 'İhracat Gıda Ltd.',
      sector: 'Gıda',
      city: 'Ankara',
      consultant: 'Fatma Özkan',
      registrationDate: '2024-02-10T16:20:00Z',
    },
    {
      id: '5',
      name: 'Otomotiv Parts A.Ş.',
      sector: 'Otomotiv',
      city: 'Kocaeli',
      consultant: 'Ali Şahin',
      registrationDate: '2024-02-15T11:00:00Z',
    },
  ]);
  const [educationProgress, setEducationProgress] = useState<
    Record<string, EducationProgress[]>
  >({
    '1': [
      {
        setId: '1',
        setName: 'E-İhracat Temelleri',
        totalVideos: 8,
        watchedVideos: 6,
        watchedPercentage: 75,
        lastActivity: '2024-02-20T14:30:00Z',
        completedVideos: [
          {
            id: '1',
            title: 'E-İhracat Nedir?',
            watchedAt: '2024-02-15T10:30:00Z',
            watchedPercentage: 100,
            isCompleted: true,
          },
          {
            id: '2',
            title: 'Dijital Belgeler',
            watchedAt: '2024-02-16T14:15:00Z',
            watchedPercentage: 100,
            isCompleted: true,
          },
          {
            id: '3',
            title: 'Platform Seçimi',
            watchedAt: '2024-02-20T09:45:00Z',
            watchedPercentage: 65,
            isCompleted: false,
          },
        ],
      },
      {
        setId: '2',
        setName: 'B2B Pazarlama Stratejileri',
        totalVideos: 12,
        watchedVideos: 3,
        watchedPercentage: 25,
        lastActivity: '2024-02-18T16:20:00Z',
        completedVideos: [
          {
            id: '4',
            title: 'B2B Pazarlama Temelleri',
            watchedAt: '2024-02-18T16:20:00Z',
            watchedPercentage: 100,
            isCompleted: true,
          },
        ],
      },
    ],
    '2': [
      {
        setId: '1',
        setName: 'E-İhracat Temelleri',
        totalVideos: 8,
        watchedVideos: 8,
        watchedPercentage: 100,
        lastActivity: '2024-02-19T11:00:00Z',
        completedVideos: [
          {
            id: '1',
            title: 'E-İhracat Nedir?',
            watchedAt: '2024-02-10T10:30:00Z',
            watchedPercentage: 100,
            isCompleted: true,
          },
          {
            id: '2',
            title: 'Dijital Belgeler',
            watchedAt: '2024-02-12T14:15:00Z',
            watchedPercentage: 100,
            isCompleted: true,
          },
        ],
      },
    ],
    '3': [
      {
        setId: '3',
        setName: 'Platform Entegrasyonu',
        totalVideos: 6,
        watchedVideos: 4,
        watchedPercentage: 67,
        lastActivity: '2024-02-21T13:45:00Z',
        completedVideos: [
          {
            id: '6',
            title: 'API Entegrasyonu',
            watchedAt: '2024-02-21T13:45:00Z',
            watchedPercentage: 85,
            isCompleted: false,
          },
        ],
      },
    ],
  });
  const notifications = [
    {
      id: 1,
      type: 'info',
      message: '3 firma eğitimi tamamladı',
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
  const filteredCompanies = companies.filter(company => {
    const matchesSearch =
      !searchQuery ||
      company.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = !selectedSector || company.sector === selectedSector;
    const matchesCity = !selectedCity || company.city === selectedCity;
    return matchesSearch && matchesSector && matchesCity;
  });
  const handleMarkCompleted = (
    companyId: string,
    setId: string,
    videoId: string
  ) => {
    setEducationProgress(prev => ({
      ...prev,
      [companyId]:
        prev[companyId]?.map(progress =>
          progress.setId === setId
            ? {
                ...progress,
                completedVideos: progress.completedVideos.map(video =>
                  video.id === videoId
                    ? {
                        ...video,
                        isCompleted: true,
                        watchedPercentage: 100,
                        watchedAt: new Date().toISOString(),
                      }
                    : video
                ),
                watchedVideos:
                  progress.watchedVideos +
                  (progress.completedVideos.find(v => v.id === videoId)
                    ?.isCompleted
                    ? 0
                    : 1),
                watchedPercentage: Math.round(
                  ((progress.watchedVideos +
                    (progress.completedVideos.find(v => v.id === videoId)
                      ?.isCompleted
                      ? 0
                      : 1)) /
                    progress.totalVideos) *
                    100
                ),
              }
            : progress
        ) || [],
    }));
  };
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSector('');
    setSelectedCity('');
  };
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Modern Header - Full Width */}
      <header className='bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            {/* Left Section */}
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
                    Admin Panel
                  </span>
                </div>
              </Link>
              {/* Breadcrumb Navigation */}
              <nav className='hidden md:flex items-center text-sm text-gray-500'>
                {selectedCompany ? (
                  <>
                    <Link
                      href='/admin'
                      className='hover:text-blue-600 cursor-pointer'
                    >
                      Ana Panel
                    </Link>
                    <i className='ri-arrow-right-s-line mx-1'></i>
                    <button
                      onClick={() => setSelectedCompany(null)}
                      className='hover:text-blue-600 cursor-pointer'
                    >
                      Firma Takip
                    </button>
                    <i className='ri-arrow-right-s-line mx-1'></i>
                    <span className='text-gray-900 font-medium'>
                      {selectedCompany.name}
                    </span>
                  </>
                ) : (
                  <>
                    <Link
                      href='/admin'
                      className='hover:text-blue-600 cursor-pointer'
                    >
                      Ana Panel
                    </Link>
                    <i className='ri-arrow-right-s-line mx-1'></i>
                    <span className='text-gray-900 font-medium'>
                      Firma Eğitim Takibi
                    </span>
                  </>
                )}
              </nav>
            </div>
            {/* Right Section - Modern Actions */}
            <div className='flex items-center gap-3'>
              {/* Quick Search */}
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
              {/* Quick Actions */}
              <div className='flex items-center gap-2'>
                <Link href='/admin/firma-yonetimi'>
                  <button
                    className='w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer'
                    title='Yeni Firma Ekle'
                  >
                    <i className='ri-building-add-line text-lg'></i>
                  </button>
                </Link>
                <Link href='/admin/danisman-yonetimi'>
                  <button
                    className='w-9 h-9 flex items-center justify-center rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors cursor-pointer'
                    title='Danışman Yönetimi'
                  >
                    <i className='ri-user-star-line text-lg'></i>
                  </button>
                </Link>
                <Link href='/admin/raporlama-analiz'>
                  <button
                    className='w-9 h-9 flex items-center justify-center rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors cursor-pointer'
                    title='Raporlama'
                  >
                    <i className='ri-file-chart-line text-lg'></i>
                  </button>
                </Link>
              </div>
              <div className='w-px h-6 bg-gray-300'></div>
              {/* Notifications */}
              <div className='relative'>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className='w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer relative'
                >
                  <i className='ri-notification-3-line text-gray-600 text-xl'></i>
                  {unreadNotifications > 0 && (
                    <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center'>
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className='absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50'>
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
                                    : notification.type === 'success'
                                      ? 'bg-green-500'
                                      : 'bg-red-500'
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
                    <div className='p-3 text-center border-t border-gray-100'>
                      <button className='text-sm text-blue-600 hover:text-blue-800'>
                        Tüm bildirimleri gör
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {/* User Menu */}
              <div className='relative'>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className='flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer'
                >
                  <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center'>
                    <span className='text-white text-sm font-medium'>AD</span>
                  </div>
                  <i className='ri-arrow-down-s-line text-gray-500 text-sm'></i>
                </button>
                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className='absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50'>
                    <div className='p-4 border-b border-gray-100'>
                      <p className='font-medium text-gray-900'>Admin User</p>
                      <p className='text-sm text-gray-500'>
                        admin@ihracatakademi.com
                      </p>
                    </div>
                    <div className='py-2'>
                      <button className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2'>
                        <i className='ri-user-line text-gray-400'></i>
                        Profil Ayarları
                      </button>
                      <button className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2'>
                        <i className='ri-settings-3-line text-gray-400'></i>
                        Sistem Ayarları
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
      {/* Enhanced Sidebar */}
      <div
        className={`bg-white shadow-lg transition-all duration-300 ease-in-out fixed left-0 top-16 h-full z-30 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
      >
        <div className='h-full overflow-y-auto'>
          {/* Navigation Menu */}
          <nav className='p-2 space-y-1'>
            {/* Dashboard */}
            <MenuItem
              icon='ri-dashboard-3-line'
              title='Ana Panel'
              isActive={activeMenuItem === 'dashboard'}
              onClick={() => setActiveMenuItem('dashboard')}
              href='/admin'
              sidebarCollapsed={sidebarCollapsed}
            />
            {/* Firma Yönetimi */}
            <MenuItem
              icon='ri-building-line'
              title='Firma Yönetimi'
              isActive={activeMenuItem === 'company-management'}
              onClick={() => setActiveMenuItem('company-management')}
              href='/admin/firma-yonetimi'
              sidebarCollapsed={sidebarCollapsed}
            />
            {/* Danışman Yönetimi */}
            <MenuItem
              icon='ri-user-star-line'
              title='Danışman Yönetimi'
              isActive={activeMenuItem === 'consultant-management'}
              onClick={() => setActiveMenuItem('consultant-management')}
              href='/admin/danisman-yonetimi'
              sidebarCollapsed={sidebarCollapsed}
            />
            {/* Proje Yönetimi */}
            <MenuItem
              icon='ri-folder-line'
              title='Proje Yönetimi'
              isActive={activeMenuItem === 'projects'}
              onClick={() => {
                setActiveMenuItem('projects');
                setProjeExpanded(!projeExpanded);
              }}
              hasSubMenu={true}
              isExpanded={projeExpanded}
              sidebarCollapsed={sidebarCollapsed}
            />
            {/* Proje Alt Menüleri */}
            {projeExpanded && !sidebarCollapsed && (
              <div className='ml-2 space-y-1'>
                <SubMenuItem
                  title='Tüm Projeler'
                  isActive={activeMenuItem === 'all-projects'}
                  onClick={() => setActiveMenuItem('all-projects')}
                  href='/admin/proje-yonetimi'
                />
              </div>
            )}
            {/* Eğitim Yönetimi */}
            <MenuItem
              icon='ri-graduation-cap-line'
              title='Eğitim Yönetimi'
              isActive={activeMenuItem === 'education'}
              onClick={() => {
                setActiveMenuItem('education');
                setEducationExpanded(!educationExpanded);
              }}
              hasSubMenu={true}
              isExpanded={educationExpanded}
              sidebarCollapsed={sidebarCollapsed}
            />
            {/* Eğitim Alt Menüleri */}
            {educationExpanded && !sidebarCollapsed && (
              <div className='ml-2 space-y-1'>
                <SubMenuItem
                  title='Videolar'
                  isActive={activeMenuItem === 'education-videos'}
                  onClick={() => setActiveMenuItem('education-videos')}
                  href='/admin/egitim-yonetimi/videolar'
                />
                <SubMenuItem
                  title='Eğitim Setleri'
                  isActive={activeMenuItem === 'education-sets'}
                  onClick={() => setActiveMenuItem('education-sets')}
                  href='/admin/egitim-yonetimi/setler'
                />
                <SubMenuItem
                  title='Firma Takip'
                  isActive={activeMenuItem === 'company-tracking'}
                  onClick={() => setActiveMenuItem('company-tracking')}
                />
                <SubMenuItem
                  title='Dökümanlar'
                  isActive={activeMenuItem === 'education-docs'}
                  onClick={() => setActiveMenuItem('education-docs')}
                  href='/admin/egitim-yonetimi/dokumanlar'
                />
              </div>
            )}
            {/* Etkinlik Yönetimi */}
            <MenuItem
              icon='ri-calendar-event-line'
              title='Etkinlik Yönetimi'
              isActive={activeMenuItem === 'events'}
              onClick={() => setActiveMenuItem('events')}
              href='/admin/etkinlik-yonetimi'
              sidebarCollapsed={sidebarCollapsed}
            />
            {/* Forum Yönetimi */}
            <MenuItem
              icon='ri-chat-3-line'
              title='Forum Yönetimi'
              isActive={activeMenuItem === 'forum'}
              onClick={() => setActiveMenuItem('forum')}
              href='/admin/forum-yonetimi'
              sidebarCollapsed={sidebarCollapsed}
            />
            {/* Haber Yönetimi */}
            <MenuItem
              icon='ri-newspaper-line'
              title='Haber Yönetimi'
              isActive={activeMenuItem === 'news'}
              onClick={() => setActiveMenuItem('news')}
              href='/admin/haberler-yonetimi'
              sidebarCollapsed={sidebarCollapsed}
            />
            {/* Kariyer Portalı */}
            <MenuItem
              icon='ri-briefcase-line'
              title='Kariyer Portalı'
              isActive={activeMenuItem === 'career'}
              onClick={() => setActiveMenuItem('career')}
              href='/admin/kariyer-portali'
              sidebarCollapsed={sidebarCollapsed}
            />
            {/* Randevu Talepleri */}
            <MenuItem
              icon='ri-calendar-check-line'
              title='Randevu Talepleri'
              isActive={activeMenuItem === 'appointments'}
              onClick={() => setActiveMenuItem('appointments')}
              href='/admin/randevu-talepleri'
              sidebarCollapsed={sidebarCollapsed}
            />
            {/* Raporlama ve Analiz */}
            <MenuItem
              icon='ri-bar-chart-box-line'
              title='Raporlama ve Analiz'
              isActive={activeMenuItem === 'reporting'}
              onClick={() => setActiveMenuItem('reporting')}
              href='/admin/raporlama-analiz'
              sidebarCollapsed={sidebarCollapsed}
            />
            {!sidebarCollapsed && (
              <>
                <div className='my-4 border-t border-gray-200'></div>
                {/* Sistem Bölümü */}
                <div className='px-3 py-2'>
                  <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Sistem
                  </p>
                </div>
                <MenuItem
                  icon='ri-settings-3-line'
                  title='Sistem Ayarları'
                  isActive={activeMenuItem === 'settings'}
                  onClick={() => setActiveMenuItem('settings')}
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-shield-check-line'
                  title='Güvenlik'
                  isActive={activeMenuItem === 'security'}
                  onClick={() => setActiveMenuItem('security')}
                  sidebarCollapsed={sidebarCollapsed}
                />
                <MenuItem
                  icon='ri-history-line'
                  title='İşlem Geçmişi'
                  isActive={activeMenuItem === 'logs'}
                  onClick={() => setActiveMenuItem('logs')}
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
      {/* Click Outside Handlers */}
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
      {/* Main Content */}
      <div
        className={`transition-all duration-300 pt-20 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}
      >
        {!selectedCompany ? (
          <>
            {/* Page Header */}
            <div className='mb-8'>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                Firma Eğitim Takibi
              </h2>
              <p className='text-gray-600'>
                Firmaların eğitim ilerleme durumlarını takip edin
              </p>
            </div>
            {/* Filters */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Firma Filtrele
                </h3>
                <button
                  onClick={clearFilters}
                  className='text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer'
                >
                  Filtreleri Temizle
                </button>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Firma Ara
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
                      <i className='ri-search-line text-gray-400 text-sm'></i>
                    </div>
                    <input
                      type='text'
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder='Firma adı ara...'
                      className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Sektör
                  </label>
                  <select
                    value={selectedSector}
                    onChange={e => setSelectedSector(e.target.value)}
                    className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                  >
                    <option value=''>Tüm Sektörler</option>
                    <option value='Elektronik'>Elektronik</option>
                    <option value='Tekstil'>Tekstil</option>
                    <option value='Makina'>Makina</option>
                    <option value='Gıda'>Gıda</option>
                    <option value='Otomotiv'>Otomotiv</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Şehir
                  </label>
                  <select
                    value={selectedCity}
                    onChange={e => setSelectedCity(e.target.value)}
                    className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
                  >
                    <option value=''>Tüm Şehirler</option>
                    <option value='İstanbul'>İstanbul</option>
                    <option value='Ankara'>Ankara</option>
                    <option value='İzmir'>İzmir</option>
                    <option value='Bursa'>Bursa</option>
                    <option value='Kocaeli'>Kocaeli</option>
                  </select>
                </div>
              </div>
              <div className='text-sm text-gray-600 mt-4'>
                <span className='font-medium'>{filteredCompanies.length}</span>{' '}
                firma bulundu
              </div>
            </div>
            {/* Companies Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredCompanies.map(company => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onClick={() => setSelectedCompany(company)}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Company Detail Header */}
            <div className='bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white p-6 mb-8'>
              <div className='flex justify-between items-start'>
                <div>
                  <h2 className='text-2xl font-bold mb-2'>
                    {selectedCompany.name}
                  </h2>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-blue-100'>
                    <div>
                      <div className='text-sm opacity-80'>Sektör</div>
                      <div className='font-medium'>
                        {selectedCompany.sector}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm opacity-80'>Şehir</div>
                      <div className='font-medium'>{selectedCompany.city}</div>
                    </div>
                    <div>
                      <div className='text-sm opacity-80'>Danışman</div>
                      <div className='font-medium'>
                        {selectedCompany.consultant}
                      </div>
                    </div>
                    <div>
                      <div className='text-sm opacity-80'>Kayıt Tarihi</div>
                      <div className='font-medium'>
                        {new Date(
                          selectedCompany.registrationDate
                        ).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCompany(null)}
                  className='bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg cursor-pointer'
                >
                  Geri Dön
                </button>
              </div>
            </div>
            {/* Education Progress */}
            <div>
              <h3 className='text-xl font-bold text-gray-900 mb-6'>
                📚 Eğitim İlerleme Durumu
              </h3>
              {educationProgress[selectedCompany.id] &&
              educationProgress[selectedCompany.id].length > 0 ? (
                <div className='space-y-6'>
                  {educationProgress[selectedCompany.id].map(progress => (
                    <EducationProgressCard
                      key={progress.setId}
                      progress={progress}
                      onMarkCompleted={(setId, videoId) =>
                        handleMarkCompleted(selectedCompany.id, setId, videoId)
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className='text-center py-12'>
                  <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <i className='ri-book-open-line text-2xl text-gray-400'></i>
                  </div>
                  <h4 className='text-lg font-medium text-gray-900 mb-2'>
                    Henüz Eğitim Başlamamış
                  </h4>
                  <p className='text-gray-500'>
                    Bu firma henüz hiçbir eğitim setine erişim sağlamamış
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
