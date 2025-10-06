'use client';

import { useState } from 'react';
import {
  RiAlertLine,
  RiArrowDownLine,
  RiArrowUpLine,
  RiBarChartLine,
  RiCheckLine,
  RiCpuLine,
  RiServerLine as RiDiskLine,
  RiDownloadLine,
  RiEyeLine,
  RiFileLine,
  RiFolderLine,
  RiServerLine as RiMemoryLine,
  RiRefreshLine,
  RiRocketLine,
  RiServerLine,
  RiSettingsLine,
  RiShieldLine,
  RiCheckLine as RiTargetLine,
  RiTimeLine,
  RiUserLine,
  RiWalletLine,
  RiWifiLine,
} from 'react-icons/ri';

import FirmaLayout from '@/components/firma/FirmaLayout';

export default function DashboardTest() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: RiBarChartLine },
    { id: 'performance', label: 'Performans', icon: RiArrowUpLine },
    { id: 'analytics', label: 'Analitik', icon: RiEyeLine },
    { id: 'reports', label: 'Raporlar', icon: RiFileLine },
    { id: 'settings', label: 'Ayarlar', icon: RiSettingsLine },
  ];

  // Ana Dashboard İstatistikleri
  const mainStats = [
    {
      id: 1,
      title: 'Toplam Projeler',
      value: '247',
      change: '+12%',
      changeType: 'positive',
      icon: RiFolderLine,
      color: 'blue',
      description: 'Bu ay yeni projeler',
      trend: 'up',
      bgGradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      id: 2,
      title: 'Aktif Kullanıcılar',
      value: '1,847',
      change: '+8.2%',
      changeType: 'positive',
      icon: RiUserLine,
      color: 'green',
      description: 'Son 30 gün içinde',
      trend: 'up',
      bgGradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      id: 3,
      title: 'Tamamlanan Görevler',
      value: '3,429',
      change: '+15.3%',
      changeType: 'positive',
      icon: RiCheckLine,
      color: 'purple',
      description: 'Bu hafta tamamlanan',
      trend: 'up',
      bgGradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      id: 4,
      title: 'Toplam Gelir',
      value: '₺2.4M',
      change: '+23.1%',
      changeType: 'positive',
      icon: RiWalletLine,
      color: 'orange',
      description: 'Bu ay toplam gelir',
      trend: 'up',
      bgGradient: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  // Performans İstatistikleri
  const performanceStats = [
    {
      id: 1,
      title: 'CPU Kullanımı',
      value: '68%',
      change: '-5%',
      changeType: 'negative',
      icon: RiCpuLine,
      color: 'red',
      description: 'Ortalama CPU kullanımı',
      trend: 'down',
      bgGradient: 'from-red-500 to-red-600',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      id: 2,
      title: 'Bellek Kullanımı',
      value: '4.2GB',
      change: '+12%',
      changeType: 'positive',
      icon: RiMemoryLine,
      color: 'yellow',
      description: 'Toplam RAM kullanımı',
      trend: 'up',
      bgGradient: 'from-yellow-500 to-yellow-600',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      id: 3,
      title: 'Disk Alanı',
      value: '847GB',
      change: '+3.2%',
      changeType: 'positive',
      icon: RiDiskLine,
      color: 'indigo',
      description: 'Kullanılan disk alanı',
      trend: 'up',
      bgGradient: 'from-indigo-500 to-indigo-600',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      id: 4,
      title: 'Ağ Trafiği',
      value: '2.1TB',
      change: '+18.7%',
      changeType: 'positive',
      icon: RiWifiLine,
      color: 'teal',
      description: 'Bu ay ağ trafiği',
      trend: 'up',
      bgGradient: 'from-teal-500 to-teal-600',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
    },
  ];

  // Analitik İstatistikleri
  const analyticsStats = [
    {
      id: 1,
      title: 'Sayfa Görüntülemeleri',
      value: '89.2K',
      change: '+24.5%',
      changeType: 'positive',
      icon: RiEyeLine,
      color: 'pink',
      description: 'Son 7 gün içinde',
      trend: 'up',
      bgGradient: 'from-pink-500 to-pink-600',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
    },
    {
      id: 2,
      title: 'Dönüşüm Oranı',
      value: '3.8%',
      change: '+0.4%',
      changeType: 'positive',
      icon: RiTargetLine,
      color: 'cyan',
      description: 'Ortalama dönüşüm',
      trend: 'up',
      bgGradient: 'from-cyan-500 to-cyan-600',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
    },
    {
      id: 3,
      title: 'Ortalama Oturum',
      value: '4m 32s',
      change: '+12s',
      changeType: 'positive',
      icon: RiTimeLine,
      color: 'emerald',
      description: 'Kullanıcı oturum süresi',
      trend: 'up',
      bgGradient: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      id: 4,
      title: 'Yeni Ziyaretçiler',
      value: '67.3%',
      change: '-2.1%',
      changeType: 'negative',
      icon: RiUserLine,
      color: 'rose',
      description: 'Yeni kullanıcı oranı',
      trend: 'down',
      bgGradient: 'from-rose-500 to-rose-600',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
    },
  ];

  // Rapor İstatistikleri
  const reportStats = [
    {
      id: 1,
      title: 'Haftalık Rapor',
      value: '15',
      change: '+3',
      changeType: 'positive',
      icon: RiFileLine,
      color: 'violet',
      description: 'Bu hafta oluşturulan',
      trend: 'up',
      bgGradient: 'from-violet-500 to-violet-600',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
    },
    {
      id: 2,
      title: 'Excel Dışa Aktarma',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: RiDownloadLine,
      color: 'lime',
      description: 'Bu ay dışa aktarılan',
      trend: 'up',
      bgGradient: 'from-lime-500 to-lime-600',
      iconBg: 'bg-lime-100',
      iconColor: 'text-lime-600',
    },
    {
      id: 3,
      title: 'PDF Raporları',
      value: '23',
      change: '+7',
      changeType: 'positive',
      icon: RiFileLine,
      color: 'amber',
      description: 'Toplam PDF raporu',
      trend: 'up',
      bgGradient: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      id: 4,
      title: 'Otomatik Raporlar',
      value: '12',
      change: '+1',
      changeType: 'positive',
      icon: RiRefreshLine,
      color: 'sky',
      description: 'Aktif otomatik raporlar',
      trend: 'up',
      bgGradient: 'from-sky-500 to-sky-600',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
    },
  ];

  // Ayarlar İstatistikleri
  const settingsStats = [
    {
      id: 1,
      title: 'Aktif Kullanıcılar',
      value: '1,247',
      change: '+89',
      changeType: 'positive',
      icon: RiUserLine,
      color: 'blue',
      description: 'Sistemde aktif kullanıcı',
      trend: 'up',
      bgGradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      id: 2,
      title: 'Sistem Durumu',
      value: '99.9%',
      change: '+0.1%',
      changeType: 'positive',
      icon: RiShieldLine,
      color: 'green',
      description: 'Sistem uptime oranı',
      trend: 'up',
      bgGradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      id: 3,
      title: 'Güvenlik Taraması',
      value: 'Aktif',
      change: 'Son: 2h önce',
      changeType: 'neutral',
      icon: RiShieldLine,
      color: 'purple',
      description: 'Otomatik güvenlik taraması',
      trend: 'neutral',
      bgGradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      id: 4,
      title: 'Yedekleme',
      value: 'Başarılı',
      change: 'Son: 1g önce',
      changeType: 'positive',
      icon: RiServerLine,
      color: 'orange',
      description: 'Son yedekleme durumu',
      trend: 'up',
      bgGradient: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  const getCurrentStats = () => {
    switch (activeTab) {
      case 'overview':
        return mainStats;
      case 'performance':
        return performanceStats;
      case 'analytics':
        return analyticsStats;
      case 'reports':
        return reportStats;
      case 'settings':
        return settingsStats;
      default:
        return mainStats;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <RiArrowUpLine className='w-4 h-4 text-green-500' />;
      case 'down':
        return <RiArrowDownLine className='w-4 h-4 text-red-500' />;
      default:
        return <RiBarChartLine className='w-4 h-4 text-gray-500' />;
    }
  };

  return (
    <FirmaLayout
      title='Dashboard Test Merkezi'
      description='Zengin istatistik kartları ve dashboard tasarımları'
      showHeader={false}
    >
      <div className='space-y-6'>
        {/* Modern Page Header */}
        <div className='mb-6'>
          <div className='mb-3'>
            <nav className='flex items-center space-x-2 text-sm text-gray-500'>
              <span className='hover:text-gray-700 cursor-pointer'>
                Ana Sayfa
              </span>
              <i className='ri-arrow-right-s-line text-xs'></i>
              <span className='text-gray-900 font-medium'>Dashboard Test</span>
            </nav>
          </div>
          <div className='mb-3'>
            <h1 className='text-xl md:text-2xl font-bold text-gray-900 tracking-tight'>
              DASHBOARD TEST MERKEZİ
            </h1>
          </div>
          <div className='mb-4'>
            <p className='text-sm text-gray-600 font-medium leading-relaxed'>
              Zengin istatistik kartları ve dashboard tasarımları
            </p>
          </div>
          <div className='w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full'></div>
        </div>

        {/* Info Card */}
        <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 mb-8'>
          <div className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                  İstatistik Kategorileri
                </h2>
                <p className='text-gray-600'>
                  Farklı dashboard tasarımları ve istatistik kartları
                </p>
              </div>
              <div className='flex items-center space-x-2 text-sm text-gray-500'>
                <RiBarChartLine className='w-4 h-4' />
                <span>{getCurrentStats().length} kart</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className='bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 mb-8 overflow-hidden'>
          <div className='flex overflow-x-auto'>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-6 py-4 font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <tab.icon className='mr-2 w-5 h-5' />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {getCurrentStats().map(stat => (
            <div
              key={stat.id}
              className='group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden cursor-pointer'
            >
              {/* Header with Gradient */}
              <div
                className={`bg-gradient-to-r ${stat.bgGradient} p-4 text-white relative`}
              >
                <div className='absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8'></div>
                <div className='absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full translate-y-6 -translate-x-6'></div>

                <div className='relative z-10'>
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center space-x-3'>
                      <div
                        className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center`}
                      >
                        <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                      </div>
                      <div>
                        <h3 className='text-sm font-medium text-white/90 group-hover:text-white transition-colors'>
                          {stat.title}
                        </h3>
                        <p className='text-white/70 text-xs'>
                          {stat.description}
                        </p>
                      </div>
                    </div>

                    <div className='flex flex-col items-end space-y-1'>
                      <div className='flex items-center space-x-1'>
                        {getTrendIcon(stat.trend)}
                        <span
                          className={`text-xs font-medium ${
                            stat.changeType === 'positive'
                              ? 'text-green-200'
                              : stat.changeType === 'negative'
                                ? 'text-red-200'
                                : 'text-white/80'
                          }`}
                        >
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className='p-6'>
                {/* Main Value */}
                <div className='mb-4'>
                  <div className='text-3xl font-bold text-gray-900 mb-1'>
                    {stat.value}
                  </div>
                  <div className='text-sm text-gray-600'>
                    {stat.description}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className='mb-4'>
                  <div className='flex items-center justify-between text-sm mb-2'>
                    <span className='text-gray-600 font-medium'>İlerleme</span>
                    <span className='font-bold text-gray-900'>
                      {typeof stat.value === 'string' &&
                      stat.value.includes('%')
                        ? stat.value
                        : '85%'}
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${stat.bgGradient} transition-all duration-500 shadow-sm`}
                      style={{
                        width:
                          typeof stat.value === 'string' &&
                          stat.value.includes('%')
                            ? stat.value
                            : '85%',
                      }}
                    ></div>
                  </div>
                </div>

                {/* Action Button */}
                <button className='w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 py-2 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md transform hover:scale-105'>
                  <RiEyeLine className='w-4 h-4' />
                  Detayları Görüntüle
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info Cards */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Quick Actions */}
          <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6'>
            <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center gap-2'>
              <RiRocketLine className='w-5 h-5 text-blue-600' />
              Hızlı İşlemler
            </h3>
            <div className='grid grid-cols-2 gap-3'>
              <button className='bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg transition-colors flex items-center gap-2'>
                <RiBarChartLine className='w-4 h-4' />
                <span className='text-sm font-medium'>Rapor Oluştur</span>
              </button>
              <button className='bg-green-50 hover:bg-green-100 text-green-700 p-3 rounded-lg transition-colors flex items-center gap-2'>
                <RiDownloadLine className='w-4 h-4' />
                <span className='text-sm font-medium'>Dışa Aktar</span>
              </button>
              <button className='bg-purple-50 hover:bg-purple-100 text-purple-700 p-3 rounded-lg transition-colors flex items-center gap-2'>
                <RiSettingsLine className='w-4 h-4' />
                <span className='text-sm font-medium'>Ayarlar</span>
              </button>
              <button className='bg-orange-50 hover:bg-orange-100 text-orange-700 p-3 rounded-lg transition-colors flex items-center gap-2'>
                <RiRefreshLine className='w-4 h-4' />
                <span className='text-sm font-medium'>Yenile</span>
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6'>
            <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center gap-2'>
              <RiShieldLine className='w-5 h-5 text-green-600' />
              Sistem Durumu
            </h3>
            <div className='space-y-3'>
              <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <RiCheckLine className='w-4 h-4 text-green-600' />
                  <span className='text-sm font-medium text-green-800'>
                    Veritabanı
                  </span>
                </div>
                <span className='text-xs text-green-600 font-medium'>
                  Çevrimiçi
                </span>
              </div>
              <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <RiCheckLine className='w-4 h-4 text-green-600' />
                  <span className='text-sm font-medium text-green-800'>
                    API Servisleri
                  </span>
                </div>
                <span className='text-xs text-green-600 font-medium'>
                  Aktif
                </span>
              </div>
              <div className='flex items-center justify-between p-3 bg-yellow-50 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <RiAlertLine className='w-4 h-4 text-yellow-600' />
                  <span className='text-sm font-medium text-yellow-800'>
                    Yedekleme
                  </span>
                </div>
                <span className='text-xs text-yellow-600 font-medium'>
                  Beklemede
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
}
